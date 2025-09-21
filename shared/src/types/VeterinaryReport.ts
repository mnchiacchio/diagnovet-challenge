// Tipos derivados de los esquemas Zod - Single source of truth
import type {
  PatientSchema,
  VeterinarianSchema,
  StudySchema,
  ProcessingStatusSchema,
  VeterinaryReportSchema,
  CreateReportSchema,
  UpdateReportSchema,
  SearchFiltersSchema
} from '../validators/reportValidators';
import type { z } from 'zod';

// Tipos base derivados de los esquemas Zod
export type Patient = z.infer<typeof PatientSchema>;
export type Veterinarian = z.infer<typeof VeterinarianSchema>;
export type Study = z.infer<typeof StudySchema>;
export type ProcessingStatus = z.infer<typeof ProcessingStatusSchema>;
export type VeterinaryReport = z.infer<typeof VeterinaryReportSchema>;
export type CreateReport = z.infer<typeof CreateReportSchema>;
export type UpdateReport = z.infer<typeof UpdateReportSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

// Tipos extendidos para casos específicos del frontend
export interface VeterinaryReportWithTimestamps extends VeterinaryReport {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  uploadDate: Date;
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
  originalFilename?: string; // Nombre original del archivo antes de normalización
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
