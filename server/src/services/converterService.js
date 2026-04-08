import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { OUTPUT_DIR } from '../config.js';
import { ext } from '../utils/fileUtils.js';

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || stdout || error.message));
      else resolve(stdout);
    });
  });
}

async function convertImage(inputPath, targetFormat, outPath) {
  if (targetFormat === 'jpg') targetFormat = 'jpeg';
  await sharp(inputPath).toFormat(targetFormat).toFile(outPath);
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

async function convertWithLibreOffice(inputPath, outDir) {
  await runCommand('libreoffice', ['--headless', '--convert-to', 'pdf', '--outdir', outDir, inputPath]);
}

async function convertWithPandoc(inputPath, targetFormat, outPath) {
  await runCommand('pandoc', [inputPath, '-o', outPath, '--standalone']);
  if (targetFormat === 'pdf' && !fs.existsSync(outPath)) {
    await runCommand('pandoc', [inputPath, '-t', 'pdf', '-o', outPath]);
  }
}

export async function convertFile(inputPath, targetFormat) {
  const inputExt = ext(inputPath);
  const id = uuidv4();
  const outputPath = path.join(OUTPUT_DIR, `${id}.${targetFormat}`);

  if (['jpg', 'jpeg', 'png', 'webp'].includes(inputExt)) {
    await convertImage(inputPath, targetFormat, outputPath);
  } else if (['mp4', 'mov', 'mp3', 'wav'].includes(inputExt)) {
    await convertMedia(inputPath, targetFormat, outputPath);
  } else if (['docx', 'pptx', 'xlsx'].includes(inputExt) && targetFormat === 'pdf') {
    await convertWithLibreOffice(inputPath, OUTPUT_DIR);
    const converted = path.join(OUTPUT_DIR, `${path.basename(inputPath, path.extname(inputPath))}.pdf`);
    fs.renameSync(converted, outputPath);
  } else {
    await convertWithPandoc(inputPath, targetFormat, outputPath);
  }

  if (!fs.existsSync(outputPath)) throw new Error('Converted file was not generated.');
  return outputPath;
}
