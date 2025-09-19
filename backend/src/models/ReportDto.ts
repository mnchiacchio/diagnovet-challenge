import { z } from 'zod';

// Esquema de validación para crear un reporte
export const CreateReportSchema = z.object({
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
  
  // Datos del paciente
  patient: z.object({
    name: z.string().min(1, 'El nombre del paciente es requerido'),
    species: z.string().min(1, 'La especie es requerida'),
    breed: z.string().optional(),
    age: z.string().optional(),
    weight: z.string().optional(),
    owner: z.string().min(1, 'El propietario es requerido')
  }),
  
  // Datos del veterinario
  veterinarian: z.object({
    name: z.string().min(1, 'El nombre del veterinario es requerido'),
    license: z.string().optional(),
    title: z.string().optional(),
    clinic: z.string().optional(),
    contact: z.string().optional(),
    referredBy: z.string().optional()
  }),
  
  // Datos del estudio
  study: z.object({
    type: z.string().min(1, 'El tipo de estudio es requerido'),
    date: z.string().datetime('Fecha inválida'),
    technique: z.string().optional(),
    bodyRegion: z.string().optional(),
    incidences: z.array(z.string()).default([]),
    equipment: z.string().optional(),
    echoData: z.any().optional()
  })
});

// Esquema de validación para actualizar un reporte
export const UpdateReportSchema = z.object({
  findings: z.string().optional(),
  diagnosis: z.string().optional(),
  differentials: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  measurements: z.any().optional(),
  images: z.array(z.string()).optional(),
  extractedText: z.string().optional(),
  status: z.enum(['PROCESSING', 'COMPLETED', 'ERROR', 'NEEDS_REVIEW']).optional(),
  confidence: z.number().min(0).max(100).optional(),
  
  // Datos del paciente
  patient: z.object({
    name: z.string().optional(),
    species: z.string().optional(),
    breed: z.string().optional(),
    age: z.string().optional(),
    weight: z.string().optional(),
    owner: z.string().optional()
  }).optional(),
  
  // Datos del veterinario
  veterinarian: z.object({
    name: z.string().optional(),
    license: z.string().optional(),
    title: z.string().optional(),
    clinic: z.string().optional(),
    contact: z.string().optional(),
    referredBy: z.string().optional()
  }).optional(),
  
  // Datos del estudio
  study: z.object({
    type: z.string().optional(),
    date: z.string().datetime().optional(),
    technique: z.string().optional(),
    bodyRegion: z.string().optional(),
    incidences: z.array(z.string()).optional(),
    equipment: z.string().optional(),
    echoData: z.any().optional()
  }).optional()
});

// Tipos TypeScript derivados de los esquemas Zod
export type CreateReportDto = z.infer<typeof CreateReportSchema>;
export type UpdateReportDto = z.infer<typeof UpdateReportSchema>;

// Esquema de validación para búsqueda
export const SearchQuerySchema = z.object({
  query: z.string().min(1, 'La consulta de búsqueda es requerida'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
