import { Request, Response } from 'express';
import { ReportService } from '../services/ReportService';
import { CreateReportDto, UpdateReportDto } from '../models/ReportDto';

export class ReportController {
  private reportService = new ReportService();

  // Obtener todos los reportes con paginación y filtros
  async getAllReports(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      
      const reports = await this.reportService.getAllReports({
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        search: search as string
      });

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener los reportes'
      });
    }
  }

  // Obtener un reporte por ID
  async getReportById(req: Request, res: Response) {
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
      console.error('Error al obtener reporte:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener el reporte'
      });
    }
  }

  // Crear un nuevo reporte
  async createReport(req: Request, res: Response) {
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
  async updateReport(req: Request, res: Response) {
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
  async deleteReport(req: Request, res: Response) {
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
        message: 'Reporte eliminado correctamente'
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
  async searchReports(req: Request, res: Response) {
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
  async getStats(req: Request, res: Response) {
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
