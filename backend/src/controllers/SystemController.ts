import { Request, Response } from 'express';
import { ILLMService } from '../interfaces/LLMService.interface';
import { LLMServiceFactory } from '../factories/LLMServiceFactory';
import { logger } from '../utils/Logger';

export class SystemController {
  private llmService: ILLMService;

  constructor() {
    this.llmService = LLMServiceFactory.createService();
  }

  // Verificar configuración de variables de entorno
  checkConfig = async (req: Request, res: Response) => {
    try {
      const config = {
        llmProvider: process.env.LLM_PROVIDER || 'openrouter',
        openRouterApiKey: process.env.OPENROUTER_API_KEY ? '✅ Configurada' : '❌ No configurada',
        openRouterModel: process.env.OPENROUTER_MODEL,
        databaseUrl: process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada',
        cloudinaryConfig: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurada' : '❌ No configurada',
          apiKey: process.env.CLOUDINARY_API_KEY ? '✅ Configurada' : '❌ No configurada',
          apiSecret: process.env.CLOUDINARY_API_SECRET ? '✅ Configurada' : '❌ No configurada'
        },
        nodeEnv: process.env.NODE_ENV || 'development',
        apiPort: process.env.API_PORT || '5000'
      };

      res.json({
        success: true,
        message: 'Configuración del servidor',
        data: config
      });
    } catch (error) {
      logger.error('Error al verificar configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error al verificar configuración'
      });
    }
  }

  // Probar conexión con servicios LLM
  testLLM = async (req: Request, res: Response) => {
    try {
      const provider = process.env.LLM_PROVIDER || 'openrouter';
      const model = process.env.OPENROUTER_MODEL;
      
      logger.debug(`Probando conexión con ${provider}... model: ${model}`);
      
      const testResult = await this.llmService.testConnection();
      
      if (testResult.success) {
        res.json({
          success: true,
          message: `Conexión con ${provider} exitosa`,
          data: {
            provider,
            model,
            status: 'connected',
            details: testResult.details
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: testResult.error || `Error al conectar con ${provider}`,
          data: {
            provider,
            model,
            status: 'disconnected',
            details: testResult.details
          }
        });
      }
    } catch (error) {
      logger.error('Error al probar LLM:', error);
      res.status(500).json({
        success: false,
        error: 'Error al probar la conexión con el servicio LLM',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener modelos disponibles
  getAvailableModels = async (req: Request, res: Response) => {
    try {
      const modelsResult = await this.llmService.getAvailableModels();
      
      res.json({
        success: true,
        message: 'Modelos disponibles',
        data: modelsResult
      });
    } catch (error) {
      logger.error('Error al obtener modelos disponibles:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener modelos disponibles',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener información del sistema
  getSystemInfo = async (req: Request, res: Response) => {
    try {
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Información del sistema',
        data: systemInfo
      });
    } catch (error) {
      logger.error('Error al obtener información del sistema:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener información del sistema'
      });
    }
  }
}