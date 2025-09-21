import { Router } from 'express';
import { SystemController } from '../controllers/SystemController';

const router = Router();
const systemController = new SystemController();

// Verificar configuración del sistema
router.get('/config', systemController.checkConfig);

// Probar conexión con servicios externos
router.get('/test/llm', systemController.testLLM);

// Obtener modelos disponibles
router.get('/models/available', systemController.getAvailableModels);

// Obtener información del sistema
router.get('/info', systemController.getSystemInfo);

export default router;
