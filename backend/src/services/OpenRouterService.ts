// Servicio para procesar texto con OpenRouter.ai
// Especializado en extracción de datos de reportes veterinarios

import { ILLMService, LLMExtractionResult, LLMConnectionTest, LLMAvailableModels, VeterinaryData } from '../interfaces/LLMService.interface';
import { logger } from '../utils/Logger';

export class OpenRouterService implements ILLMService {
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private token = process.env.OPENROUTER_API_KEY;
  private model = process.env.OPENROUTER_MODEL;

  // Extraer datos estructurados de un reporte veterinario
  async extractVeterinaryData(text: string): Promise<LLMExtractionResult> {
    try {
      logger.debug('Enviando texto a OpenRouter para extracción de datos');
      
      if (!this.token) {
        throw new Error('OPENROUTER_API_KEY no configurada');
      }

      const prompt = this.buildPrompt(text);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000', // Opcional: para tracking
          'X-Title': 'DiagnoVET', // Opcional: nombre de la app
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en extracción de datos de reportes veterinarios. Extrae la información de forma precisa y estructurada en formato JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.1,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en API de OpenRouter: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result || !result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error('Respuesta inválida de OpenRouter');
      }

      const generatedText = result.choices[0].message.content;
      const extractedData = this.parseLLMResponse(generatedText);
      
      logger.info('Datos extraídos exitosamente por OpenRouter');
      
      return {
        success: true,
        data: extractedData,
        confidence: 90 // Alta confianza para modelos de OpenRouter
      };

    } catch (error) {
      logger.error('Error en OpenRouter:', error);
      return {
        success: false,
        data: null,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Construir prompt optimizado para extracción de datos veterinarios
  private buildPrompt(text: string): string {
    return `Analiza el siguiente reporte veterinario y extrae la información estructurada en formato JSON.

NOTA SOBRE FECHAS: En Argentina se usa formato DD/MM/YYYY. Si ves "07/08/2025" significa 7 de agosto de 2025 (no 8 de julio).

REPORTE:
${text}

Extrae estos campos en formato JSON válido:
{
  "patient": {
    "name": "string or null",
    "species": "string or null",
    "breed": "string or null", 
    "age": "string or null",
    "weight": "string or null",
    "owner": "string or null"
  },
  "veterinarian": {
    "name": "string or null",
    "license": "string or null",
    "title": "string or null",
    "clinic": "string or null",
    "contact": "string or null",
    "referredBy": "string or null"
  },
  "study": {
    "type": "string or null",
    "date": "string in format DD/MM/YYYY (ej: 07/08/2025)",
    "technique": "string or null",
    "bodyRegion": "string or null",
    "equipment": "string or null",
    "incidences": ["array of strings"],
    "echoData": {}
  },
  "findings": "string or null",
  "diagnosis": "string or null",
  "differentials": ["array of strings"],
  "recommendations": ["array of strings"],
  "measurements": {},
  "confidence": "Number between 0 and 100, 0 is the lowest confidence and 100 is the highest confidence"
}

IMPORTANTE: 
- Responde ÚNICAMENTE con el JSON válido, sin texto adicional.
- Para las fechas, usa formato DD/MM/YYYY (formato argentino). Ejemplo: 07/08/2025 = 7 de agosto de 2025.
- Si la fecha aparece como "07/08/2025" en el PDF, significa 7 de agosto de 2025, NO 8 de julio.`;
  }

  // Parsear respuesta del LLM y validar JSON
  private parseLLMResponse(response: string): VeterinaryData {
    try {
      logger.debug('Procesando respuesta del LLM');
      
      // Limpiar la respuesta del LLM
      let cleanResponse = response.trim();
      
      // Remover texto adicional que pueda venir antes o después del JSON
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
      }

      // Parsear JSON
      const parsed = JSON.parse(cleanResponse);
      
      // Validar estructura básica
      this.validateStructure(parsed);
      
      // Procesar fechas en formato argentino (dd/MM/YYYY)
      if (parsed.study && parsed.study.date) {
        parsed.study.date = this.parseArgentineDate(parsed.study.date);
      }
      
      logger.debug('JSON parseado exitosamente');
      
      return parsed as VeterinaryData;
    } catch (error) {
      logger.error('Error al parsear respuesta del LLM:', error);
      
      // Fallback: retornar estructura vacía
      return this.getEmptyStructure();
    }
  }

  // Parsear fecha en formato argentino (dd/MM/YYYY) - retorna string ISO sin problemas de zona horaria
  private parseArgentineDate(dateString: string): string {
    try {
      logger.debug('Parseando fecha argentina:', dateString);
      
      // Remover espacios y caracteres extra
      const cleanDate = dateString.trim();
      
      // Verificar si ya está en formato ISO
      if (cleanDate.includes('-') && cleanDate.length === 10) {
        return cleanDate;
      }
      
      // Intentar parsear como dd/MM/yyyy
      const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = cleanDate.match(dateRegex);
      
      if (match) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        
        const isoDate = `${year}-${month}-${day}`;
        logger.debug('Fecha convertida a ISO:', isoDate);
        return isoDate;
      }
      
      logger.warn('No se pudo parsear la fecha:', cleanDate);
      return cleanDate; // Retornar tal como está si no se puede parsear
      
    } catch (error) {
      logger.error('Error al parsear fecha:', error);
      return dateString; // Retornar original si hay error
    }
  }

  // Validar estructura básica del JSON
  private validateStructure(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Estructura inválida: debe ser un objeto');
    }
    
    // Validar campos principales
    if (!data.patient) data.patient = {};
    if (!data.veterinarian) data.veterinarian = {};
    if (!data.study) data.study = {};
    
    // Asegurar que los arrays existan
    if (!Array.isArray(data.differentials)) data.differentials = [];
    if (!Array.isArray(data.recommendations)) data.recommendations = [];
    if (!Array.isArray(data.study.incidences)) data.study.incidences = [];
  }

  // Retornar estructura vacía en caso de error
  private getEmptyStructure(): VeterinaryData {
    return {
      patient: { name: null, species: null, breed: null, age: null, weight: null, owner: null },
      veterinarian: { name: null, license: null, title: null, clinic: null, contact: null, referredBy: null },
      study: { type: null, date: null, technique: null, bodyRegion: null, equipment: null, incidences: [], echoData: {} },
      findings: null,
      diagnosis: null,
      differentials: [],
      recommendations: [],
      measurements: {},
      confidence: 0
    };
  }

  // Método para probar la conexión con OpenRouter
  async testConnection(): Promise<LLMConnectionTest> {
    try {
      logger.debug('Iniciando test de conexión con OpenRouter');
      
      // Verificar token
      if (!this.token) {
        return {
          success: false,
          error: 'OPENROUTER_API_KEY no configurada en variables de entorno'
        };
      }
      
      // Test simple con texto corto
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'DiagnoVET',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: 'Responde solo "OK" si puedes procesar este mensaje.'
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        })
      });

      logger.debug('Respuesta de OpenRouter:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Error en respuesta:', errorText);
        
        return {
          success: false,
          error: `Error HTTP ${response.status}: ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            errorBody: errorText,
            url: this.apiUrl
          }
        };
      }

      const result = await response.json();
      logger.info('Conexión con OpenRouter exitosa');
      
      return {
        success: true,
        details: {
          model: this.model,
          response: result,
          url: this.apiUrl
        }
      };
      
    } catch (error) {
      logger.error('Error en test de conexión:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: {
          error: error
        }
      };
    }
  }

  // Obtener modelos gratuitos disponibles
  async getAvailableModels(): Promise<LLMAvailableModels> {
    try {
      const freeModels = [
        'meta-llama/llama-3.3-8b-instruct:free', // Excelente para extracción de datos
        'google/gemma-3-27b-it:free', // Bueno para procesamiento de texto
      ];

      return {
        success: true,
        models: freeModels
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener modelos'
      };
    }
  }
}
