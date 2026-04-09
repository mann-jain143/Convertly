import { randomUUID } from 'crypto';

const uploads = new Map();
const outputs = new Map();

export function saveUpload(file) {
  const id = randomUUID();
  uploads.set(id, {
    id,
    originalName: file.originalname,
    path: file.path,
    mimeType: file.mimetype,
    size: file.size,
    createdAt: Date.now(),
  });
  return uploads.get(id);
}

export function getUpload(id) {
  return uploads.get(id);
}

export function deleteUpload(id) {
  uploads.delete(id);
}

export function saveOutput({ path, downloadName, mimeType }) {
  const id = randomUUID();
  outputs.set(id, { id, path, downloadName, mimeType, createdAt: Date.now() });
  return outputs.get(id);
}

export function getOutput(id) {
  return outputs.get(id);
}

export function deleteOutput(id) {
  outputs.delete(id);
}

export function listUploads() {
  return Array.from(uploads.values());
}

export function listOutputs() {
  return Array.from(outputs.values());
}
