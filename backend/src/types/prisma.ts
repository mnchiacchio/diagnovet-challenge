// Tipos generados por Prisma
import { Prisma, ProcessingStatus } from '@prisma/client';

// Re-exportar el enum de Prisma
export { ProcessingStatus };

// Tipos simplificados para evitar errores de Prisma
export type VeterinaryReportWithRelations = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  filename: string;
  fileUrl: string;
  uploadDate: Date;
  status: ProcessingStatus;
  confidence: number | null;
  findings: string | null;
  diagnosis: string | null;
  differentials: string[];
  recommendations: string[];
  measurements: any | null;
  images: string[];
  extractedText: string | null;
  patientId: string;
  veterinarianId: string;
  studyId: string;
  patient: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    age: string | null;
    weight: string | null;
    owner: string;
  };
  veterinarian: {
    id: string;
    name: string;
    license: string | null;
    title: string | null;
    clinic: string | null;
    contact: string | null;
    referredBy: string | null;
  };
  study: {
    id: string;
    type: string;
    date: Date;
    technique: string | null;
    bodyRegion: string | null;
    incidences: string[];
    equipment: string | null;
    echoData: any | null;
  };
};

// Tipos para crear entidades
export type CreateVeterinaryReportData = {
  filename: string;
  fileUrl: string;
  findings?: string;
  diagnosis?: string;
  differentials?: string[];
  recommendations?: string[];
  measurements?: any;
  images?: string[];
  extractedText?: string;
  patient: CreatePatientData;
  veterinarian: CreateVeterinarianData;
  study: CreateStudyData;
};

export type UpdateVeterinaryReportData = {
  findings?: string;
  diagnosis?: string;
  differentials?: string[];
  recommendations?: string[];
  measurements?: any;
  images?: string[];
  extractedText?: string;
  status?: ProcessingStatus;
  confidence?: number;
  patient?: Partial<CreatePatientData>;
  veterinarian?: Partial<CreateVeterinarianData>;
  study?: Partial<CreateStudyData>;
};

export type CreatePatientData = {
  name: string;
  species: string;
  breed?: string;
  age?: string;
  weight?: string;
  owner: string;
};

export type CreateVeterinarianData = {
  name: string;
  license?: string;
  title?: string;
  clinic?: string;
  contact?: string;
  referredBy?: string;
};

export type CreateStudyData = {
  type: string;
  date: string | Date;
  technique?: string;
  bodyRegion?: string;
  incidences?: string[];
  equipment?: string;
  echoData?: any;
};

// Tipos para filtros de búsqueda
export type ReportFilters = {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  species?: string;
  veterinarian?: string;
};

// Tipo para query parameters de Express
export type ReportQueryParams = {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  species?: string;
  veterinarian?: string;
};

// Tipo para respuesta paginada
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// Tipo para estadísticas
export type ReportStats = {
  totalReports: number;
  completedReports: number;
  processingReports: number;
  errorReports: number;
  needsReviewReports: number;
  totalPatients: number;
  totalVeterinarians: number;
  completionRate: number;
};
