import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { OUTPUT_DIR, UPLOAD_DIR, RETENTION_MS } from '../config.js';
import { deleteOutput, deleteUpload, listOutputs, listUploads } from './storageService.js';

export function scheduleCleanup(filePath, delayMs = RETENTION_MS) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }, delayMs);
}

function purgeDirOlderThan(dir, ttlMs) {
  if (!fs.existsSync(dir)) return;
  const now = Date.now();
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (now - stat.mtimeMs > ttlMs) fs.unlinkSync(filePath);
  }
}

function purgeStorageMaps(ttlMs) {
  const now = Date.now();
  for (const item of listUploads()) {
    if (now - item.createdAt > ttlMs) deleteUpload(item.id);
  }
  for (const item of listOutputs()) {
    if (now - item.createdAt > ttlMs) deleteOutput(item.id);
  }
}

export function startCleanupCron() {
  cron.schedule('*/1 * * * *', () => {
    purgeDirOlderThan(UPLOAD_DIR, RETENTION_MS);
    purgeDirOlderThan(OUTPUT_DIR, RETENTION_MS);
    purgeStorageMaps(RETENTION_MS);
  });
}
