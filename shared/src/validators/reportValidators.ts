import { z } from 'zod';

// Esquemas de validación compartidos para reportes veterinarios

export const PatientSchema = z.object({
  name: z.string().min(1, 'El nombre del paciente es requerido'),
  species: z.string().min(1, 'La especie es requerida'),
  breed: z.string().optional(),
  age: z.string().optional(),
  weight: z.string().optional(),
  owner: z.string().min(1, 'El propietario es requerido')
});

export const VeterinarianSchema = z.object({
  name: z.string().min(1, 'El nombre del veterinario es requerido'),
  license: z.string().optional(),
  title: z.string().optional(),
  clinic: z.string().optional(),
  contact: z.string().optional(),
  referredBy: z.string().optional()
});

export const StudySchema = z.object({
  type: z.string().min(1, 'El tipo de estudio es requerido'),
  date: z.string().datetime('Fecha inválida'),
  technique: z.string().optional(),
  bodyRegion: z.string().optional(),
  incidences: z.array(z.string()).default([]),
  equipment: z.string().optional(),
  echoData: z.any().optional()
});

export const ProcessingStatusSchema = z.enum([
  'PROCESSING',
  'COMPLETED', 
  'ERROR',
  'NEEDS_REVIEW'
]);

export const VeterinaryReportSchema = z.object({
  id: z.string().optional(),
  filename: z.string().min(1, 'El nombre del archivo es requerido'),
  fileUrl: z.string().url('URL del archivo inválida'),
  
  // Contenido clínico
  findings: z.string().optional(),
  diagnosis: z.string().optional(),
  differentials: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  measurements: z.any().optional(),
  images: z.array(z.string()).default([]),
  extractedText: z.string().optional(),
  
  // Estado del procesamiento
  status: ProcessingStatusSchema.default('PROCESSING'),
  confidence: z.number().min(0).max(100).optional(),
  
  // Relaciones
  patient: PatientSchema,
  veterinarian: VeterinarianSchema,
  study: StudySchema
});

export const CreateReportSchema = VeterinaryReportSchema.omit({
  id: true
});

export const UpdateReportSchema = VeterinaryReportSchema.partial().omit({
  id: true
});

export const SearchFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: ProcessingStatusSchema.optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  species: z.string().optional(),
  veterinarian: z.string().optional()
});

// Tipos TypeScript derivados de los esquemas Zod
export type Patient = z.infer<typeof PatientSchema>;
export type Veterinarian = z.infer<typeof VeterinarianSchema>;
export type Study = z.infer<typeof StudySchema>;
export type ProcessingStatus = z.infer<typeof ProcessingStatusSchema>;
export type VeterinaryReport = z.infer<typeof VeterinaryReportSchema>;
export type CreateReport = z.infer<typeof CreateReportSchema>;
export type UpdateReport = z.infer<typeof UpdateReportSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
