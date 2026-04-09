import fs from 'fs';
import mime from 'mime-types';
import path from 'path';
import { convertFile } from '../services/converterService.js';
import { FORMAT_CATALOG, TOTAL_FORMATS } from '../services/formatCatalog.js';
import { scheduleCleanup } from '../services/cleanupService.js';
import { ext, removeFileSafe } from '../utils/fileUtils.js';
import { getToolStatus } from '../services/systemCheckService.js';
import { logger } from '../services/logger.js';
import { deleteOutput, deleteUpload, getOutput, getUpload, saveOutput, saveUpload } from '../services/storageService.js';
import { enqueueJob, waitForJob } from '../services/queueService.js';

function detectInputType(file) {
  const extension = ext(file.path || file.originalName || file.originalname || '');
  const mimeBased = mime.extension(file.mimeType || file.mimetype || '') || extension;
  return (mimeBased || extension || '').toLowerCase();
}

function getFormatOptions(sourceExt) {
  return FORMAT_CATALOG[sourceExt] || [];
}

export async function getFormats(_req, res) {
  const tools = await getToolStatus();
  const warnings = [];
  if (!tools.pandoc) warnings.push('Pandoc is not installed. Some text/document conversions may fail.');
  if (!tools.libreoffice) warnings.push('LibreOffice (soffice) is not installed. PDF/Office conversions may fail.');
  if (!tools.ffmpeg) warnings.push('FFmpeg is not installed. Audio/video conversions may fail.');

  return res.json({ totalFormats: TOTAL_FORMATS, formats: FORMAT_CATALOG, tools, warnings });
}

export function uploadFiles(req, res) {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'At least one file is required.' });

  const payload = files.map((file) => {
    const saved = saveUpload(file);
    const sourceExt = detectInputType(saved);
    return {
      id: saved.id,
      originalName: saved.originalName,
      size: saved.size,
      sourceExt,
      availableFormats: getFormatOptions(sourceExt),
    };
  });

  return res.status(201).json({ files: payload });
}

export async function convert(req, res) {
  const { items = [], globalTargetFormat = '' } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items[] is required.' });

  const queueJob = enqueueJob(async () => {
    const results = [];

    for (const item of items) {
      const uploaded = getUpload(item.fileId);
      if (!uploaded) {
        results.push({ fileId: item.fileId, status: 'failed', error: 'Uploaded file not found or expired.' });
        continue;
      }

      const sourceExt = detectInputType(uploaded);
      const targetFormat = (item.targetFormat || globalTargetFormat || '').toLowerCase();
      const available = getFormatOptions(sourceExt);

      if (!targetFormat || !available.includes(targetFormat)) {
        results.push({
          fileId: item.fileId,
          originalName: uploaded.originalName,
          status: 'failed',
          error: `Conversion from ${sourceExt} to ${targetFormat || 'unknown'} is not supported.`,
        });
        continue;
      }

      try {
        const outputPath = await convertFile(uploaded.path, targetFormat);
        removeFileSafe(uploaded.path);
        deleteUpload(uploaded.id);

        const baseName = path.basename(uploaded.originalName, path.extname(uploaded.originalName));
        const downloadName = `${baseName}.${targetFormat}`;
        const savedOutput = saveOutput({
          path: outputPath,
          downloadName,
          mimeType: mime.lookup(outputPath) || 'application/octet-stream',
        });

        scheduleCleanup(outputPath);

        results.push({
          fileId: item.fileId,
          originalName: uploaded.originalName,
          sourceExt,
          targetFormat,
          status: 'completed',
          estimatedSeconds: Math.max(2, Math.round(uploaded.size / (1024 * 1024))),
          downloadUrl: `/api/download/${savedOutput.id}`,
        });
      } catch (error) {
        logger.error('Batch conversion item failed', { fileId: item.fileId, error: error.message });
        const msg = /not found|ENOENT|is not recognized/i.test(error.message)
          ? 'Required conversion tool is missing on server.'
          : error.message || 'Conversion failed.';
        results.push({ fileId: item.fileId, originalName: uploaded.originalName, status: 'failed', error: msg });
      }
    }

    return results;
  });

  try {
    const done = await waitForJob(queueJob.id);
    const successCount = done.results.filter((r) => r.status === 'completed').length;
    return res.json({ jobId: queueJob.id, status: done.status, successCount, results: done.results });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Batch conversion failed.' });
  }
}

export function download(req, res) {
  const output = getOutput(req.params.outputId);
  if (!output) return res.status(404).json({ error: 'Converted file not found or expired.' });

  if (!fs.existsSync(output.path)) {
    deleteOutput(output.id);
    return res.status(404).json({ error: 'Converted file not found on disk.' });
  }

  res.setHeader('Content-Type', output.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${output.downloadName}"`);
  const stream = fs.createReadStream(output.path);
  stream.pipe(res);
  stream.on('close', () => {
    removeFileSafe(output.path);
    deleteOutput(output.id);
  });
}
