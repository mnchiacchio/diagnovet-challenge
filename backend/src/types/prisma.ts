// Tipos generados por Prisma
import { Prisma } from '@prisma/client';

// Tipo base para VeterinaryReport con relaciones
export type VeterinaryReportWithRelations = Prisma.VeterinaryReportGetPayload<{
  include: {
    patient: true;
    veterinarian: true;
    study: true;
  };
}>;

// Tipo para crear un reporte
export type CreateVeterinaryReportData = Prisma.VeterinaryReportCreateInput;

// Tipo para actualizar un reporte
export type UpdateVeterinaryReportData = Prisma.VeterinaryReportUpdateInput;

// Tipo para crear un paciente
export type CreatePatientData = Prisma.PatientCreateInput;

// Tipo para crear un veterinario
export type CreateVeterinarianData = Prisma.VeterinarianCreateInput;

// Tipo para crear un estudio
export type CreateStudyData = Prisma.StudyCreateInput;

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
