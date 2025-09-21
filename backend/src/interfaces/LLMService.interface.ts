// Interface para servicios de LLM - permite intercambiar proveedores fácilmente
export interface LLMExtractionResult {
  success: boolean;
  data: VeterinaryData | null;
  confidence: number;
  error?: string;
}

export interface VeterinaryData {
  patient: {
    name: string | null;
    species: string | null;
    breed: string | null;
    age: string | null;
    weight: string | null;
    owner: string | null;
  };
  veterinarian: {
    name: string | null;
    license: string | null;
    title: string | null;
    clinic: string | null;
    contact: string | null;
    referredBy: string | null;
  };
  study: {
    type: string | null;
    date: string | null;
    technique: string | null;
    bodyRegion: string | null;
    equipment: string | null;
    incidences: string[];
    echoData: Record<string, any>;
  };
  findings: string | null;
  diagnosis: string | null;
  differentials: string[];
  recommendations: string[];
  measurements: Record<string, any>;
  confidence: number;
}

export interface LLMConnectionTest {
  success: boolean;
  error?: string;
  details?: any;
}

export interface LLMAvailableModels {
  success: boolean;
  models?: string[];
  error?: string;
}

export interface ILLMService {
  extractVeterinaryData(text: string): Promise<LLMExtractionResult>;
  testConnection(): Promise<LLMConnectionTest>;
  getAvailableModels(): Promise<LLMAvailableModels>;
}
