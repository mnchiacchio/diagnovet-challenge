import dotenv from 'dotenv';

dotenv.config();

export const CloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || ''
};

// Validar configuración de Cloudinary
export const validateCloudinaryConfig = () => {
  const required = ['cloudName', 'apiKey', 'apiSecret'];
  const missing = required.filter(key => !CloudinaryConfig[key as keyof typeof CloudinaryConfig]);
  
  if (missing.length > 0) {
    throw new Error(`Configuración de Cloudinary incompleta. Faltan: ${missing.join(', ')}`);
  }
  
  return true;
};
