import { Request, Response } from 'express';
import { ReportService } from '../services/ReportService';
import { CreateReportDto, UpdateReportDto } from '../models/ReportDto';
import { ReportQueryParams } from '../types/prisma';
import { logger } from '@backend/utils/Logger';

export class ReportController {
  private reportService = new ReportService();

  // Obtener todos los reportes con paginación y filtros
  async getAllReports(req: Request, res: Response) {
    try {
      logger.info('Obteniendo todos los reportes');
      const queryParams: ReportQueryParams = req.query as ReportQueryParams;
      
      // Validar y convertir query parameters
      const validatedParams = this.reportService.validateQueryParams(queryParams);
      
      const reports = await this.reportService.getAllReports(validatedParams);

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      
      res.status(500).json({
        success: false,
        error: 'Error al obtener los reportes',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener un reporte por ID
  getReportById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const report = await this.reportService.getReportById(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Reporte no encontrado'
        });
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error al obtener reporte:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener el reporte'
      });
    }
  }

  // Descargar archivo PDF original del reporte
  downloadReport = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const report = await this.reportService.getReportById(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Reporte no encontrado'
        });
      }

      // Si es una URL de Cloudinary, redirigir
      if (report.fileUrl.includes('cloudinary.com') || report.fileUrl.includes('res.cloudinary.com')) {
        return res.redirect(report.fileUrl);
      }

      // Para archivos locales, enviar el archivo
      res.download(report.fileUrl, report.filename);
      
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      res.status(500).json({
        success: false,
        error: 'Error al descargar el archivo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Crear un nuevo reporte
  createReport = async (req: Request, res: Response) => {
    try {
      const reportData: CreateReportDto = req.body;
      const report = await this.reportService.createReport(reportData);

      res.status(201).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error al crear reporte:', error);
      res.status(400).json({
        success: false,
        error: 'Error al crear el reporte'
      });
    }
  }

  // Actualizar un reporte
  updateReport = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: UpdateReportDto = req.body;
      
      const report = await this.reportService.updateReport(id, updateData);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Reporte no encontrado'
        });
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
      res.status(400).json({
        success: false,
        error: 'Error al actualizar el reporte'
      });
    }
  }

  // Eliminar un reporte
  deleteReport = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await this.reportService.deleteReport(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Reporte no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Reporte eliminado correctamente',
        data: { id: deleted.id }
      });
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar el reporte'
      });
    }
  }

  // Buscar reportes
  searchReports = async (req: Request, res: Response) => {
    try {
      const { query } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const reports = await this.reportService.searchReports(query, {
        page: Number(page),
        limit: Number(limit)
      });

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Error al buscar reportes:', error);
      res.status(500).json({
        success: false,
        error: 'Error al buscar reportes'
      });
    }
  }

  // Obtener estadísticas
  getStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.reportService.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas'
      });
    }
  }
}
