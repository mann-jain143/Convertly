import { Router } from 'express';
import { convert, getFormats } from '../controllers/convertController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/formats', getFormats);
router.post('/convert', upload.single('file'), convert);

export default router;
