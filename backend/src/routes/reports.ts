import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const router = Router();
const reportController = new ReportController();

// Obtener todos los reportes
router.get('/', (req, res) => reportController.getAllReports(req, res));

// Obtener un reporte por ID
router.get('/:id', (req, res) => reportController.getReportById(req, res));

// Descargar archivo PDF original del reporte
router.get('/:id/download', (req, res) => reportController.downloadReport(req, res));

// Crear un nuevo reporte
router.post('/', (req, res) => reportController.createReport(req, res));

// Actualizar un reporte
router.put('/:id', (req, res) => reportController.updateReport(req, res));

// Eliminar un reporte
router.delete('/:id', (req, res) => reportController.deleteReport(req, res));

// Buscar reportes
router.get('/search/:query', (req, res) => reportController.searchReports(req, res));

// Obtener estadísticas
router.get('/stats/overview', (req, res) => reportController.getStats(req, res));

export default router;
