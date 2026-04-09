import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { OUTPUT_DIR } from '../config.js';
import { ext } from '../utils/fileUtils.js';
import { logger } from './logger.js';

const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'avif'];
const mediaFormats = ['mp4', 'mov', 'avi', 'mkv', 'mp3', 'wav', 'aac', 'ogg', 'flac'];
const libreOfficeFormats = ['pdf', 'doc', 'docx', 'pptx', 'odp', 'xlsx', 'ods', 'csv', 'odt', 'rtf', 'txt', 'html'];

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, (error, stdout, stderr) => {
      if (error) {
        logger.error('Command failed', { cmd, args, stderr: stderr || stdout || error.message });
        reject(new Error(stderr || stdout || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

async function convertImage(inputPath, targetFormat, outPath) {
  const normalized = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
  await sharp(inputPath).toFormat(normalized).toFile(outPath);
}

function convertMedia(inputPath, targetFormat, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat(targetFormat)
      .on('end', resolve)
      .on('error', reject)
      .save(outPath);
  });
}

async function convertWithPandoc(inputPath, targetFormat, outPath) {
  await runCommand('pandoc', [inputPath, '-o', outPath, '--standalone']);
}

async function convertWithLibreOffice(inputPath, targetFormat, outPath) {
  await runCommand('soffice', ['--headless', '--convert-to', targetFormat, '--outdir', OUTPUT_DIR, inputPath]);
  const expectedPath = path.join(OUTPUT_DIR, `${path.basename(inputPath, path.extname(inputPath))}.${targetFormat}`);
  if (!fs.existsSync(expectedPath)) throw new Error('LibreOffice output file was not generated.');
  fs.renameSync(expectedPath, outPath);
}

function isPandocDocFormat(inputExt, targetFormat) {
  const textFormats = ['txt', 'md', 'docx', 'html', 'rtf', 'odt', 'pdf'];
  return textFormats.includes(inputExt) && textFormats.includes(targetFormat);
}

export async function convertFile(inputPath, targetFormat) {
  const inputExt = ext(inputPath);
  const outputPath = path.join(OUTPUT_DIR, `${uuidv4()}.${targetFormat}`);

  logger.info('Starting conversion', { inputExt, targetFormat, inputPath });

  if (imageFormats.includes(inputExt) && imageFormats.includes(targetFormat)) {
    await convertImage(inputPath, targetFormat, outputPath);
  } else if (mediaFormats.includes(inputExt) && mediaFormats.includes(targetFormat)) {
    await convertMedia(inputPath, targetFormat, outputPath);
  } else if (inputExt === 'pdf' && targetFormat === 'docx') {
    await convertWithLibreOffice(inputPath, targetFormat, outputPath);
  } else if (['doc', 'docx'].includes(inputExt) && ['pdf', 'docx'].includes(targetFormat)) {
    await convertWithLibreOffice(inputPath, targetFormat, outputPath);
  } else if (isPandocDocFormat(inputExt, targetFormat)) {
    try {
      await convertWithPandoc(inputPath, targetFormat, outputPath);
    } catch (error) {
      logger.warn('Pandoc failed, trying LibreOffice fallback', { inputExt, targetFormat, error: error.message });
      if (libreOfficeFormats.includes(inputExt) && libreOfficeFormats.includes(targetFormat)) {
        await convertWithLibreOffice(inputPath, targetFormat, outputPath);
      } else {
        throw error;
      }
    }
  } else if (libreOfficeFormats.includes(inputExt) && libreOfficeFormats.includes(targetFormat)) {
    await convertWithLibreOffice(inputPath, targetFormat, outputPath);
  } else {
    throw new Error(`No conversion engine for ${inputExt} → ${targetFormat}.`);
  }

  if (!fs.existsSync(outputPath)) throw new Error('Converted file was not generated.');
  logger.info('Conversion complete', { outputPath, targetFormat });
  return outputPath;
}
