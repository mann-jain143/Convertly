import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import convertRoutes from './routes/convertRoutes.js';
import { CLIENT_URL, OUTPUT_DIR, PORT, UPLOAD_DIR } from './config.js';
import { ensureDir } from './utils/fileUtils.js';
import { startCleanupCron } from './services/cleanupService.js';
import { logger } from './services/logger.js';

dotenv.config();

ensureDir(UPLOAD_DIR);
ensureDir(OUTPUT_DIR);
startCleanupCron();

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
app.use((req, _res, next) => {
  logger.info('Incoming request', { method: req.method, path: req.path });
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'convertly-api' }));
app.use('/api', convertRoutes);

app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File exceeds 100MB limit.' });
  return res.status(400).json({ error: err.message || 'Bad request' });
});

app.listen(PORT, () => {
  logger.info('Convertly API running', { url: `http://localhost:${PORT}` });
});
