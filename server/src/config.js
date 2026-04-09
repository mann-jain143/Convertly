import path from 'path';

export const PORT = process.env.PORT || 8080;
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 100);
export const UPLOAD_DIR = path.resolve('tmp/uploads');
export const OUTPUT_DIR = path.resolve('tmp/outputs');
export const RETENTION_MS = 10 * 60 * 1000;
