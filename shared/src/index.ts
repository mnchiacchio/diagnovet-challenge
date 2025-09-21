// Exportar todos los tipos, validadores y utilidades compartidas
// Single source of truth: Los tipos se derivan de los validadores Zod

// Validadores Zod (fuente única de verdad)
export * from './validators/reportValidators';

// Tipos derivados de los validadores + tipos adicionales para API
export * from './types/VeterinaryReport';

// Constantes
export * from './constants/apiEndpoints';

// Utilidades
export * from './utils/formatDate';
