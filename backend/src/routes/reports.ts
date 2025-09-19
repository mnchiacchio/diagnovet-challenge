import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const router = Router();
const reportController = new ReportController();

// Obtener todos los reportes
router.get('/', reportController.getAllReports);

// Obtener un reporte por ID
router.get('/:id', reportController.getReportById);

// Crear un nuevo reporte
router.post('/', reportController.createReport);

// Actualizar un reporte
router.put('/:id', reportController.updateReport);

// Eliminar un reporte
router.delete('/:id', reportController.deleteReport);

// Buscar reportes
router.get('/search/:query', reportController.searchReports);

// Obtener estadísticas
router.get('/stats/overview', reportController.getStats);

export default router;
