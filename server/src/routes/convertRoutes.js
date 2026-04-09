import { Router } from 'express';
import { convert, download, getFormats, uploadFiles } from '../controllers/convertController.js';
import { uploadMany } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/formats', getFormats);
router.post('/upload', uploadMany, uploadFiles);
router.post('/convert', convert);
router.get('/download/:outputId', download);

export default router;
