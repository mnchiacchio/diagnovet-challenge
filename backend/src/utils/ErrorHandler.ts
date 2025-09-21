// Servicio centralizado para manejo de errores
import { logger } from './Logger';

export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  FILE_PROCESSING = 'FILE_PROCESSING_ERROR',
  LLM = 'LLM_ERROR',
  UPLOAD = 'UPLOAD_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED_ERROR',
  INTERNAL = 'INTERNAL_ERROR'
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorHandler {
  public static handle(error: Error): AppError {
    logger.error('Error capturado:', error);

    if (error instanceof AppError) {
      return error;
    }

    // Mapear errores conocidos
    if (error.message.includes('no encontrado') || error.message.includes('not found')) {
      return new AppError(error.message, ErrorType.NOT_FOUND, 404);
    }

    if (error.message.includes('no autorizado') || error.message.includes('unauthorized')) {
      return new AppError(error.message, ErrorType.UNAUTHORIZED, 401);
    }

    if (error.message.includes('validation') || error.message.includes('inválido')) {
      return new AppError(error.message, ErrorType.VALIDATION, 400);
    }

    if (error.message.includes('database') || error.message.includes('prisma')) {
      return new AppError('Error de base de datos', ErrorType.DATABASE, 500);
    }

    if (error.message.includes('cloudinary') || error.message.includes('upload')) {
      return new AppError('Error al procesar archivo', ErrorType.FILE_PROCESSING, 500);
    }

    if (error.message.includes('openrouter') || error.message.includes('llm')) {
      return new AppError('Error en servicio de IA', ErrorType.LLM, 500);
    }

    // Error interno genérico
    return new AppError('Error interno del servidor', ErrorType.INTERNAL, 500);
  }

  public static async handleAsync<T>(
    operation: () => Promise<T>,
    errorType: ErrorType = ErrorType.INTERNAL,
    customMessage?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : new AppError(
            customMessage || (error instanceof Error ? error.message : 'Error desconocido'),
            errorType
          );
      
      logger.error(`Error en operación async: ${appError.message}`, appError);
      throw appError;
    }
  }
}
