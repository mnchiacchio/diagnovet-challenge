// Constantes para endpoints de la API

// Función para construir la URL base de la API
const getApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  // Verificar si la URL termina con /api/v1
  if (envUrl && !envUrl.endsWith('/api/v1')) {
    envUrl = `${envUrl}/api/v1`;
  }
  
  // Si la URL del entorno no incluye protocolo, agregarlo
  if (envUrl && !envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
    envUrl = `https://${envUrl}`;
  }
  
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback para desarrollo local
  return 'http://localhost:5000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Reportes
  REPORTS: {
    BASE: '/reports',
    BY_ID: (id: string) => `/reports/${id}`,
    DOWNLOAD: (id: string) => `/reports/${id}/download`,
    SEARCH: (query: string) => `/reports/search/${query}`,
    STATS: '/reports/stats/overview'
  },
  
  // Subida de archivos
  UPLOAD: {
    BASE: '/upload',
    PROCESS: (id: string) => `/upload/process/${id}`,
    STATUS: (id: string) => `/upload/status/${id}`
  },
  
  // Salud del sistema
  HEALTH: '/health'
} as const;

// Headers por defecto para las peticiones
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
} as const;

// Configuración de paginación por defecto
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10
} as const;

// Límites de archivos
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10,
  ALLOWED_TYPES: [
    'application/pdf'
  ]
} as const;
