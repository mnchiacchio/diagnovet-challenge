// Middleware de manejo de errores para Express
import { Request, Response, NextFunction } from 'express';
import { ErrorHandler, AppError } from '../utils/ErrorHandler';
import { logger } from '../utils/Logger';

export const errorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const appError = ErrorHandler.handle(error);

  // Log del error
  logger.error('Error en middleware:', {
    message: appError.message,
    type: appError.type,
    statusCode: appError.statusCode,
    stack: appError.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Respuesta al cliente
  const response = {
    success: false,
    error: appError.message,
    type: appError.type,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  // En desarrollo, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    (response as any).stack = appError.stack;
  }

  res.status(appError.statusCode).json(response);
};

// Middleware para rutas no encontradas
export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    `Ruta no encontrada: ${req.method} ${req.url}`,
    'NOT_FOUND_ERROR' as any,
    404
  );
  next(error);
};

// Wrapper para controladores async
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
