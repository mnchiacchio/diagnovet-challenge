import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { uploadMiddleware, handleUploadError } from '../middleware/upload';

const router = Router();
const uploadController = new UploadController();

// Subir archivos
router.post('/', uploadMiddleware.array('files', 10), handleUploadError, uploadController.uploadFiles);

// Procesar archivo con IA
router.post('/process/:id', uploadController.processFile);

// Obtener estado de procesamiento
router.get('/status/:id', uploadController.getProcessingStatus);

export default router;
