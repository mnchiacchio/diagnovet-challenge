import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index';
import { logger } from '../utils/Logger';

// Interfaz para el resultado de upload de Cloudinary
interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  bytes: number;
  created_at: string;
}

export class CloudinaryService {
  constructor() {
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret
    });
  }

  // Subir archivo a Cloudinary (método principal)
  async uploadFile(file: Express.Multer.File): Promise<{
    success: boolean;
    url?: string;
    publicId?: string;
    error?: string;
  }> {
    // Detectar tipo de archivo
    const isPDF = file.originalname.toLowerCase().endsWith('.pdf');
    
    if (isPDF) {
      return this.uploadPDF(file);
    } else {
      return this.uploadImage(file);
    }
  }

  // Subir PDF a Cloudinary
  async uploadPDF(file: Express.Multer.File): Promise<{
    success: boolean;
    url?: string;
    publicId?: string;
    error?: string;
  }> {
    try {
      logger.debug(`Subiendo PDF a Cloudinary: ${file.originalname}`);
      
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw', // Para PDFs, usar 'raw' para mantener formato original
            folder: 'diagnovet/reports/pdfs',
            public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, '')}`, // Sin extensión en public_id
            // No aplicar transformaciones para mantener PDF original
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result as CloudinaryUploadResult);
            }
          }
        );

        uploadStream.end(file.buffer);
      });

      logger.debug(`PDF subido exitosamente: ${result.secure_url}`);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      logger.error('Error al subir PDF a Cloudinary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al subir PDF'
      };
    }
  }

  // Subir imagen a Cloudinary
  async uploadImage(file: Express.Multer.File): Promise<{
    success: boolean;
    url?: string;
    publicId?: string;
    error?: string;
  }> {
    try {
      logger.debug(`Subiendo imagen a Cloudinary: ${file.originalname}`);
      
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'diagnovet/reports/images',
            public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, '')}`,
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result as CloudinaryUploadResult);
            }
          }
        );

        uploadStream.end(file.buffer);
      });

      logger.debug(`Imagen subida exitosamente: ${result.secure_url}`);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      logger.error('Error al subir imagen a Cloudinary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al subir imagen'
      };
    }
  }

  // Eliminar archivo de Cloudinary
  async deleteFile(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      logger.error('Error al eliminar archivo de Cloudinary:', error);
      throw error;
    }
  }

  // Obtener URL de imagen optimizada
  getOptimizedImageUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}) {
    const { width, height, quality = 'auto', format = 'auto' } = options;
    
    return cloudinary.url(publicId, {
      width,
      height,
      quality,
      format,
      fetch_format: 'auto'
    });
  }
}
