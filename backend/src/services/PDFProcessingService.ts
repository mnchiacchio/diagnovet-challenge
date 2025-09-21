// Servicio para procesar PDFs veterinarios
// Extrae texto directamente del PDF y procesa imágenes con OCR

import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import { logger } from '../utils/Logger';

export class PDFProcessingService {
  // Procesar PDF completo (texto + imágenes)
  async processPDF(fileUrl: string): Promise<{
    success: boolean;
    text: string;
    error?: string;
  }> {
    try {
      logger.debug(`Procesando PDF: ${fileUrl}`);
      
      // Verificar si es una URL de Cloudinary o un archivo local
      const isCloudinaryUrl = fileUrl.includes('cloudinary.com') || fileUrl.includes('res.cloudinary.com');
      
      if (!isCloudinaryUrl) {
        // Para archivos locales, verificar que existe
        if (!fs.existsSync(fileUrl)) {
          throw new Error('Archivo PDF no encontrado');
        }
      } else {
        logger.debug('Procesando PDF desde Cloudinary URL');
        // Para URLs de Cloudinary, verificar que es un PDF
        if (!fileUrl.toLowerCase().includes('.pdf') && !fileUrl.includes('/raw/')) {
          logger.warn('URL de Cloudinary no parece ser un PDF');
        }
      }
      
      // Extraer texto del PDF
      const extractedText = await this.extractTextFromPDF(fileUrl);
      logger.info(`PDF procesado exitosamente. Texto extraído: ${extractedText.length} caracteres`);
      
      return {
        success: true,
        text: extractedText
      };

    } catch (error) {
      logger.error('Error al procesar PDF:', error);
      return {
        success: false,
        text: '',
        error: error instanceof Error ? error.message : 'Error desconocido al procesar PDF'
      };
    }
  }

  // Extraer texto directamente del PDF (sin OCR)
  private async extractTextFromPDF(fileUrl: string): Promise<string> {
    try {
      logger.debug('Extrayendo texto del PDF desde URL:', fileUrl);

      // Obtener el buffer del PDF desde la URL
      const response = await fetch(fileUrl);
      if (!response.ok) {
        logger.error('Error al descargar PDF:', response.statusText);
        throw new Error(`Error al descargar PDF: ${response.statusText}`);
      }
      
      const pdfBuffer = await response.arrayBuffer();
      logger.debug(`PDF descargado: ${pdfBuffer.byteLength} bytes`);
      
      // Procesar el PDF y extraer texto
      const data = await pdfParse(Buffer.from(pdfBuffer));
      
      // Verificar que se extrajo texto
      if (!data.text || data.text.trim().length === 0) {
        logger.warn('No se encontró texto en el PDF');
        return 'No se pudo extraer texto del PDF';
      }

      logger.debug(`Texto extraído exitosamente (${data.text.length} caracteres)`);
      return data.text;

    } catch (error) {
      logger.error('Error al extraer texto del PDF:', error);
      
      // Si es un error de pdf-parse, retornar texto simulado como fallback
      if (error instanceof Error && error.message.includes('pdf-parse')) {
        logger.warn('Usando fallback: texto simulado');
      }
      
      throw new Error(`Error al procesar el texto del PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }



  // Método para validar si un archivo es PDF
  isPDFFile(fileUrl: string): boolean {
    // Para URLs, verificar extensión en la URL
    if (fileUrl.includes('cloudinary.com') || fileUrl.includes('res.cloudinary.com')) {
      return fileUrl.toLowerCase().includes('.pdf') || fileUrl.toLowerCase().includes('pdf');
    }
    
    // Para archivos locales, usar path
    const ext = path.extname(fileUrl).toLowerCase();
    return ext === '.pdf';
  }

  // Método para obtener información del archivo
  getFileInfo(fileUrl: string): { size: number; name: string; extension: string } {
    const isCloudinaryUrl = fileUrl.includes('cloudinary.com') || fileUrl.includes('res.cloudinary.com');
    
    if (isCloudinaryUrl) {
      // Para URLs de Cloudinary, extraer nombre de la URL
      const urlParts = fileUrl.split('/');
      const filename = urlParts[urlParts.length - 1].split('.')[0];
      
      return {
        size: 0, // No disponible para URLs
        name: filename,
        extension: '.pdf'
      };
    }
    
    // Para archivos locales
    const stats = fs.statSync(fileUrl);
    const name = path.basename(fileUrl);
    const extension = path.extname(fileUrl);
    
    return {
      size: stats.size,
      name: name,
      extension: extension
    };
  }
}
