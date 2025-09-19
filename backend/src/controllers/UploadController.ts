import { Request, Response } from 'express';
import { UploadService } from '../services/UploadService';
import { CloudinaryService } from '../services/CloudinaryService';

export class UploadController {
  private uploadService = new UploadService();
  private cloudinaryService = new CloudinaryService();

  // Subir archivos a Cloudinary
  async uploadFiles(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionaron archivos'
        });
      }

      const uploadResults = await this.uploadService.uploadFiles(files);
      
      res.json({
        success: true,
        data: uploadResults,
        message: `${uploadResults.length} archivo(s) subido(s) correctamente`
      });
    } catch (error) {
      console.error('Error al subir archivos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al subir los archivos'
      });
    }
  }

  // Procesar archivo con OCR y extracción de datos
  async processFile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await this.uploadService.processFile(id);
      
      res.json({
        success: true,
        data: result,
        message: 'Archivo procesado correctamente'
      });
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al procesar el archivo'
      });
    }
  }

  // Obtener estado de procesamiento
  async getProcessingStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const status = await this.uploadService.getProcessingStatus(id);
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error al obtener estado:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener el estado de procesamiento'
      });
    }
  }
}
