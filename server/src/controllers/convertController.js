import fs from 'fs';
import mime from 'mime-types';
import path from 'path';
import { convertFile } from '../services/converterService.js';
import { FORMAT_CATALOG, TOTAL_FORMATS } from '../services/formatCatalog.js';
import { scheduleCleanup } from '../services/cleanupService.js';
import { ext, removeFileSafe } from '../utils/fileUtils.js';
import { getToolStatus } from '../services/systemCheckService.js';
import { logger } from '../services/logger.js';

function detectInputType(file) {
  const extension = ext(file.path || file.originalname || '');
  const mimeBased = mime.extension(file.mimetype || '') || extension;
  return (mimeBased || extension || '').toLowerCase();
}

export async function getFormats(_req, res) {
  const tools = await getToolStatus();
  const warnings = [];
  if (!tools.pandoc) warnings.push('Pandoc is not installed. Some text/document conversions may fail.');
  if (!tools.libreoffice) warnings.push('LibreOffice (soffice) is not installed. PDF/Office conversions may fail.');
  if (!tools.ffmpeg) warnings.push('FFmpeg is not installed. Audio/video conversions may fail.');

  return res.json({
    totalFormats: TOTAL_FORMATS,
    formats: FORMAT_CATALOG,
    tools,
    warnings,
  });
}

export async function convert(req, res) {
  const inputPath = req.file?.path;
  const targetFormat = req.body.targetFormat?.toLowerCase();

  if (!inputPath || !targetFormat) {
    return res.status(400).json({ error: 'File and targetFormat are required.' });
  }

  const sourceExt = detectInputType(req.file);
  const available = FORMAT_CATALOG[sourceExt] || [];

  if (!available.length) {
    removeFileSafe(inputPath);
    return res.status(400).json({ error: `Unsupported source format: ${sourceExt}.` });
  }

  if (!available.includes(targetFormat)) {
    removeFileSafe(inputPath);
    return res.status(400).json({ error: `Conversion from ${sourceExt} to ${targetFormat} is not supported.` });
  }

  try {
    logger.info('API conversion request', {
      sourceExt,
      targetFormat,
      originalName: req.file.originalname,
      size: req.file.size,
    });

    const outputPath = await convertFile(inputPath, targetFormat);
    removeFileSafe(inputPath);
    scheduleCleanup(outputPath);

    const baseName = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const downloadName = `${baseName}.${targetFormat}`;
    res.setHeader('Content-Type', mime.lookup(outputPath) || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);
    stream.on('close', () => removeFileSafe(outputPath));
  } catch (error) {
    logger.error('Conversion failure', {
      error: error.message,
      sourceExt,
      targetFormat,
    });

    removeFileSafe(inputPath);
    const msg = /not found|ENOENT|is not recognized/i.test(error.message)
      ? 'Required conversion tool is missing on server.'
      : error.message || 'Conversion failed.';

    return res.status(500).json({ error: msg });
  }
}
