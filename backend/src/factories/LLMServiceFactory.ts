// Factory para crear servicios de LLM - permite cambiar proveedores fácilmente
import { ILLMService } from '../interfaces/LLMService.interface';
import { OpenRouterService } from '../services/OpenRouterService';

export enum LLMProvider {
  OPENROUTER = 'openrouter',
  HUGGINGFACE = 'huggingface', // Para futuras implementaciones
}

export class LLMServiceFactory {
  private static instances: Map<LLMProvider, ILLMService> = new Map();

  public static createService(provider: LLMProvider = LLMProvider.OPENROUTER): ILLMService {
    if (this.instances.has(provider)) {
      return this.instances.get(provider)!;
    }

    let service: ILLMService;

    switch (provider) {
      case LLMProvider.OPENROUTER:
        service = new OpenRouterService();
        break;
      case LLMProvider.HUGGINGFACE:
        // TODO: Implementar HuggingFaceService cuando sea necesario
        throw new Error('HuggingFace provider not implemented yet');
      default:
        throw new Error(`Unknown LLM provider: ${provider}`);
    }

    this.instances.set(provider, service);
    return service;
  }

  public static getCurrentProvider(): LLMProvider {
    const provider = process.env.LLM_PROVIDER as LLMProvider;
    return provider && Object.values(LLMProvider).includes(provider) 
      ? provider 
      : LLMProvider.OPENROUTER;
  }
}
