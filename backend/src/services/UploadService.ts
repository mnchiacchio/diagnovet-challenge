import { CloudinaryService } from './CloudinaryService';
import { ReportService } from './ReportService';
import { PDFProcessingService } from './PDFProcessingService';
import { ILLMService } from '../interfaces/LLMService.interface';
import { LLMServiceFactory } from '../factories/LLMServiceFactory';
import { logger } from '../utils/Logger';

export class UploadService {
  private cloudinaryService = new CloudinaryService();
  private reportService = new ReportService();
  private pdfProcessingService = new PDFProcessingService();
  private llmService: ILLMService;

  constructor() {
    this.llmService = LLMServiceFactory.createService();
  }

  // Subir archivos y procesar automáticamente
  async uploadFiles(files: Express.Multer.File[]) {
    const uploadResults = [];

    for (const file of files) {
      try {
        // Subir archivo a Cloudinary primero
        logger.debug(`Subiendo archivo a Cloudinary: ${file.originalname}`);
        const cloudinaryResult = await this.cloudinaryService.uploadFile(file);
        
        if (!cloudinaryResult.success) {
          throw new Error(`Error al subir a Cloudinary: ${cloudinaryResult.error}`);
        }

        // Crear entrada en la base de datos con URL de Cloudinary
        const report = await this.reportService.createReport({
          filename: file.originalname, // El frontend ya envía el nombre normalizado
          fileUrl: cloudinaryResult.url || '', // URL real de Cloudinary
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
            date: new Date().toISOString(),
            incidences: []
          },
          differentials: [],
          recommendations: [],
          images: []
        });

        uploadResults.push({
          id: report.id,
          filename: file.originalname, // El frontend ya envía el nombre normalizado
          originalFilename: file.originalname,
          url: cloudinaryResult.url,
          status: 'uploaded',
          publicId: cloudinaryResult.publicId
        });

        // Procesar automáticamente en segundo plano
        this.processFileAsync(report.id, file.originalname, cloudinaryResult.url || '').catch(error => {
          logger.error(`Error al procesar archivo ${file.originalname} automáticamente:`, error);
        });

      } catch (error) {
        logger.error(`Error al subir archivo ${file.originalname}:`, error);
        uploadResults.push({
          filename: file.originalname,
          status: 'error',
          error: 'Error al subir el archivo'
        });
      }
    }

    return uploadResults;
  }

  // Procesar archivo de forma asíncrona (no bloquea la respuesta)
  private async processFileAsync(reportId: string, filename: string, fileUrl: string) {
    try {
      logger.info(`Iniciando procesamiento automático para ${filename}`);
      
      // Pequeña pausa para asegurar que la respuesta de upload se envíe primero
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await this.processFile(reportId, fileUrl);
      logger.info(`Procesamiento completado para ${filename} con confianza: ${result.confidence}`);
      
    } catch (error) {
      logger.error(`Error en procesamiento automático para ${filename}:`, error);
    }
  }

  // Procesar archivo con PDF + LLM
  async processFile(reportId: string, fileUrl?: string) {
    try {
      logger.info(`Iniciando procesamiento para reporte: ${reportId}`);
      
      // Obtener el reporte
      const report = await this.reportService.getReportById(reportId);
      if (!report) {
        throw new Error('Reporte no encontrado');
      }

      // Usar la URL proporcionada o la del reporte
      const pdfUrl = fileUrl || report.fileUrl;

      // Actualizar estado a procesando
      await this.reportService.updateReport(reportId, {
        status: 'PROCESSING'
      });

      // Verificar que es un archivo PDF
      if (!this.pdfProcessingService.isPDFFile(pdfUrl)) {
        throw new Error('Solo se pueden procesar archivos PDF');
      }

      // Procesar PDF (extraer texto + imágenes)
      logger.debug('Procesando PDF');
      const pdfResult = await this.pdfProcessingService.processPDF(pdfUrl);
      
      if (!pdfResult.success) {
        throw new Error(`Error al procesar PDF: ${pdfResult.error}`);
      }

      // Enviar texto a LLM para extracción inteligente
      logger.debug('Enviando a LLM para extracción de datos');
      const llmResult = await this.llmService.extractVeterinaryData(pdfResult.text);
      
      if (!llmResult.success) {
        throw new Error(`Error en LLM: ${llmResult.error}`);
      }

      const extractedData = llmResult.data;

      if (!extractedData) {
        throw new Error('No se pudieron extraer datos del LLM');
      }

      // Actualizar el reporte con los datos extraídos por LLM
      logger.debug('Guardando datos extraídos en la base de datos');
      
      const updatedReport = await this.reportService.updateReport(reportId, {
        extractedText: pdfResult.text,
        findings: extractedData.findings || '',
        diagnosis: extractedData.diagnosis || '',
        differentials: extractedData.differentials || [],
        recommendations: extractedData.recommendations || [],
        measurements: extractedData.measurements || {},
        confidence: extractedData.confidence || 100,
        status: 'COMPLETED',
        patient: {
          name: this.extractSingleValue(extractedData.patient.name) || '',
          species: this.extractSingleValue(extractedData.patient.species) || '',
          breed: this.extractSingleValue(extractedData.patient.breed) || '',
          age: this.extractSingleValue(extractedData.patient.age) || '',
          weight: this.extractSingleValue(extractedData.patient.weight) || '',
          owner: this.extractSingleValue(extractedData.patient.owner) || ''
        },
        veterinarian: {
          name: this.extractSingleValue(extractedData.veterinarian.name) || '',
          license: this.extractSingleValue(extractedData.veterinarian.license) || '',
          title: this.extractSingleValue(extractedData.veterinarian.title) || '',
          clinic: this.extractSingleValue(extractedData.veterinarian.clinic) || '',
          contact: this.extractSingleValue(extractedData.veterinarian.contact) || '',
          referredBy: this.extractSingleValue(extractedData.veterinarian.referredBy) || ''
        },
        study: {
          type: this.extractSingleValue(extractedData.study?.type) || '',
          date: this.formatDateForPrisma(this.extractSingleValue(extractedData.study?.date)),
          technique: this.extractSingleValue(extractedData.study?.technique) || '',
          bodyRegion: this.extractSingleValue(extractedData.study?.bodyRegion) || '',
          incidences: Array.isArray(extractedData.study?.incidences) ? extractedData.study.incidences : [],
          equipment: this.extractSingleValue(extractedData.study?.equipment) || '',
          echoData: extractedData.study?.echoData || {}
        }
      });

      logger.info('Procesamiento completado exitosamente');
      logger.debug('Reporte actualizado:', {
        id: updatedReport.id,
        status: updatedReport.status,
        confidence: updatedReport.confidence
      });
      
      return {
        success: true,
        report: updatedReport,
        confidence: llmResult.confidence,
        extractedData,
        processingSteps: {
          pdfProcessing: pdfResult.success,
          llmExtraction: llmResult.success,
          dataSaved: true
        }
      };
    } catch (error) {
      // Logging mejorado para capturar información detallada del error
      const errorInfo = {
        reportId,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'UnknownError',
        type: typeof error,
        stringified: JSON.stringify(error, Object.getOwnPropertyNames(error))
      };
      
      logger.error('Error al procesar archivo:', errorInfo);
      
      try {
        // Actualizar estado a error
        await this.reportService.updateReport(reportId, {
          status: 'ERROR'
        });
      } catch (updateError) {
        logger.error('Error al actualizar estado del reporte a ERROR:', updateError);
      }

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

  // Extraer un solo valor de un campo que puede ser string o array
  private extractSingleValue(value: string | string[] | null | undefined): string | null {
    if (!value) {
      return null;
    }
    
    if (Array.isArray(value)) {
      // Si es un array, tomar el primer elemento no vacío
      const firstValue = value.find(item => item && item.trim() !== '');
      return firstValue || null;
    }
    
    return value;
  }

  // Formatear fecha string a ISO string para Prisma
  private formatDateForPrisma(dateString: string | null | undefined): string | undefined {
    if (!dateString || dateString.trim() === '') {
      return undefined;
    }

    try {
      // Si ya es una fecha ISO válida
      if (dateString.includes('-') && dateString.length === 10) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      // Si es formato DD/MM/YYYY (formato argentino)
      const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = dateString.trim().match(dateRegex);
      
      if (match) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        
        // Crear fecha en formato ISO (YYYY-MM-DD)
        const isoDate = `${year}-${month}-${day}`;
        const date = new Date(isoDate);
        
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      // Intentar parsear como fecha estándar
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }

      logger.warn('No se pudo parsear la fecha:', dateString);
      return undefined;
      
    } catch (error) {
      logger.error('Error al parsear fecha:', error);
      return undefined;
    }
  }

  // Obtener reporte por ID
  async getReportById(reportId: string) {
    return await this.reportService.getReportById(reportId);
  }
}
