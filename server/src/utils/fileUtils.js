import fs from 'fs';
import path from 'path';

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function ext(filePath) {
  return path.extname(filePath).replace('.', '').toLowerCase();
}

export function removeFileSafe(filePath) {
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
