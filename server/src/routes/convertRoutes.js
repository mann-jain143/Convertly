import { Router } from 'express';
import { convert, getSupportedFormats } from '../controllers/convertController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/formats/:sourceExt', getSupportedFormats);
router.post('/convert', upload.single('file'), convert);

export default router;
