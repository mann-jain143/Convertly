import fs from 'fs';
import mime from 'mime-types';
import path from 'path';
import { convertFile } from '../services/converterService.js';
import { FORMAT_MAP } from '../services/formatMap.js';
import { scheduleCleanup } from '../services/cleanupService.js';
import { ext, removeFileSafe } from '../utils/fileUtils.js';

export function getSupportedFormats(req, res) {
  const source = req.params.sourceExt.toLowerCase();
  const formats = FORMAT_MAP[source];
  if (!formats) return res.status(404).json({ error: 'Unsupported source format.' });
  return res.json({ source, formats });
}

export async function convert(req, res) {
  const inputPath = req.file?.path;
  const targetFormat = req.body.targetFormat?.toLowerCase();

  if (!inputPath || !targetFormat) return res.status(400).json({ error: 'File and targetFormat are required.' });

  const sourceExt = ext(inputPath);
  const available = FORMAT_MAP[sourceExt] || [];
  if (!available.includes(targetFormat)) {
    removeFileSafe(inputPath);
    return res.status(400).json({ error: `Conversion from ${sourceExt} to ${targetFormat} is not supported.` });
  }

  try {
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
    removeFileSafe(inputPath);
    return res.status(500).json({ error: error.message || 'Conversion failed.' });
  }
}
