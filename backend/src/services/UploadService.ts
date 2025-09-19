import { CloudinaryService } from './CloudinaryService';
import { ReportService } from './ReportService';
import { OCRService } from './OCRService';
import { DataExtractionService } from './DataExtractionService';

export class UploadService {
  private cloudinaryService = new CloudinaryService();
  private reportService = new ReportService();
  private ocrService = new OCRService();
  private dataExtractionService = new DataExtractionService();

  // Subir archivos a Cloudinary
  async uploadFiles(files: Express.Multer.File[]) {
    const uploadResults = [];

    for (const file of files) {
      try {
        // Subir archivo a Cloudinary
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        
        // Crear entrada temporal en la base de datos
        const tempReport = await this.reportService.createReport({
          filename: file.originalname,
          fileUrl: uploadResult.secure_url,
          patient: {
            name: 'Pendiente de extracción',
            species: 'Pendiente de extracción',
            owner: 'Pendiente de extracción'
          },
          veterinarian: {
            name: 'Pendiente de extracción'
          },
          study: {
            type: 'Pendiente de extracción',
            date: new Date().toISOString()
          }
        });

        uploadResults.push({
          id: tempReport.id,
          filename: file.originalname,
          url: uploadResult.secure_url,
          status: 'uploaded',
          publicId: uploadResult.public_id
        });
      } catch (error) {
        console.error(`Error al subir archivo ${file.originalname}:`, error);
        uploadResults.push({
          filename: file.originalname,
          status: 'error',
          error: 'Error al subir el archivo'
        });
      }
    }

    return uploadResults;
  }

  // Procesar archivo con OCR y extracción de datos
  async processFile(reportId: string) {
    try {
      // Obtener el reporte
      const report = await this.reportService.getReportById(reportId);
      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      // Actualizar estado a procesando
      await this.reportService.updateReport(reportId, {
        status: 'PROCESSING'
      });

      // Realizar OCR
      const ocrResult = await this.ocrService.extractText(report.fileUrl);
      
      if (!ocrResult.success) {
        throw new Error('Error en el procesamiento OCR');
      }

      // Extraer datos estructurados
      const extractedData = await this.dataExtractionService.extractData(ocrResult.text);

      // Actualizar el reporte con los datos extraídos
      const updatedReport = await this.reportService.updateReport(reportId, {
        extractedText: ocrResult.text,
        findings: extractedData.findings,
        diagnosis: extractedData.diagnosis,
        differentials: extractedData.differentials,
        recommendations: extractedData.recommendations,
        measurements: extractedData.measurements,
        confidence: ocrResult.confidence,
        status: ocrResult.confidence > 80 ? 'COMPLETED' : 'NEEDS_REVIEW',
        patient: {
          name: extractedData.patient.name,
          species: extractedData.patient.species,
          breed: extractedData.patient.breed,
          age: extractedData.patient.age,
          weight: extractedData.patient.weight,
          owner: extractedData.patient.owner
        },
        veterinarian: {
          name: extractedData.veterinarian.name,
          license: extractedData.veterinarian.license,
          title: extractedData.veterinarian.title,
          clinic: extractedData.veterinarian.clinic,
          contact: extractedData.veterinarian.contact,
          referredBy: extractedData.veterinarian.referredBy
        },
        study: {
          type: extractedData.study.type,
          date: extractedData.study.date,
          technique: extractedData.study.technique,
          bodyRegion: extractedData.study.bodyRegion,
          incidences: extractedData.study.incidences,
          equipment: extractedData.study.equipment,
          echoData: extractedData.study.echoData
        }
      });

      return {
        success: true,
        report: updatedReport,
        confidence: ocrResult.confidence,
        extractedData
      };
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      
      // Actualizar estado a error
      await this.reportService.updateReport(reportId, {
        status: 'ERROR'
      });

      throw error;
    }
  }

  // Obtener estado de procesamiento
  async getProcessingStatus(reportId: string) {
    const report = await this.reportService.getReportById(reportId);
    
    if (!report) {
      throw new Error('Reporte no encontrado');
    }

    return {
      id: report.id,
      status: report.status,
      confidence: report.confidence,
      filename: report.filename,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    };
  }
}
