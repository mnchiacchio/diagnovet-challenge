import multer from 'multer';
import { Request } from 'express';

// Configuración de multer para subida de archivos
const storage = multer.memoryStorage();

// Filtros de archivos permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos de archivo permitidos
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP) y PDFs.'));
  }
};

// Configuración de multer
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
    files: 10 // Máximo 10 archivos por request
  }
});

// Middleware para manejar errores de multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 10MB por archivo.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Demasiados archivos. Máximo 10 archivos por request.'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Campo de archivo inesperado.'
      });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
};
