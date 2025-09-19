// Tipos compartidos para el sistema diagnoVET

export interface Patient {
  id?: string;
  name: string;
  species: string;
  breed?: string;
  age?: string;
  weight?: string;
  owner: string;
}

export interface Veterinarian {
  id?: string;
  name: string;
  license?: string;
  title?: string;
  clinic?: string;
  contact?: string;
  referredBy?: string;
}

export interface Study {
  id?: string;
  type: string;
  date: string | Date;
  technique?: string;
  bodyRegion?: string;
  incidences: string[];
  equipment?: string;
  echoData?: any;
}

export interface VeterinaryReport {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Metadatos del archivo
  filename: string;
  fileUrl: string;
  uploadDate?: Date;
  
  // Estado del procesamiento
  status: ProcessingStatus;
  confidence?: number; // 0-100 Confianza del OCR/extracción

  // Contenido clínico
  findings?: string;
  diagnosis?: string;
  differentials: string[];
  recommendations: string[];
  measurements?: any;
  images: string[];

  // Texto completo extraído
  extractedText?: string;

  // Relaciones
  patient: Patient;
  veterinarian: Veterinarian;
  study: Study;
}

export enum ProcessingStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  NEEDS_REVIEW = 'NEEDS_REVIEW'
}

// Tipos para la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchFilters {
  page?: number;
  limit?: number;
  status?: ProcessingStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  species?: string;
  veterinarian?: string;
}

// Tipos para estadísticas
export interface ReportStats {
  totalReports: number;
  completedReports: number;
  processingReports: number;
  errorReports: number;
  needsReviewReports: number;
  totalPatients: number;
  totalVeterinarians: number;
  completionRate: number;
}

// Tipos para subida de archivos
export interface UploadResult {
  id?: string;
  filename: string;
  url: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  publicId?: string;
  error?: string;
}

export interface ProcessingResult {
  success: boolean;
  report?: VeterinaryReport;
  confidence?: number;
  extractedData?: any;
  error?: string;
}
