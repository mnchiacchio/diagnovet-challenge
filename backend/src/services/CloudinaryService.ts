import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryConfig } from '../config/cloudinary';

export class CloudinaryService {
  constructor() {
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: CloudinaryConfig.cloudName,
      api_key: CloudinaryConfig.apiKey,
      api_secret: CloudinaryConfig.apiSecret
    });
  }

  // Subir archivo a Cloudinary
  async uploadFile(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'diagnovet/reports',
          public_id: `${Date.now()}_${file.originalname}`,
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  // Eliminar archivo de Cloudinary
  async deleteFile(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error al eliminar archivo de Cloudinary:', error);
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
