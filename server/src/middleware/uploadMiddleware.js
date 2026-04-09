import multer from 'multer';
import path from 'path';
import { MAX_FILE_SIZE_MB, UPLOAD_DIR } from '../config.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const fileExtension = path.extname(file.originalname).replace('.', '').toLowerCase();
    if (!fileExtension) return cb(new Error('Invalid file extension.'));
    cb(null, true);
  },
});
