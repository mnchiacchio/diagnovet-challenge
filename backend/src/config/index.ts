// Configuración centralizada de la aplicación
export const config = {
  // Configuración del servidor
  server: {
    port: process.env.API_PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // Configuración de base de datos
  database: {
    url: process.env.DATABASE_URL || ''
  },

  // Configuración de Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },

  // Configuración de LLM
  llm: {
    provider: process.env.LLM_PROVIDER || 'openrouter',
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-8b-instruct:free'
    }
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug')
  }
};

// Validación de configuración requerida
export const validateConfig = () => {
  const required = [
    { key: 'DATABASE_URL', value: config.database.url },
    { key: 'CLOUDINARY_CLOUD_NAME', value: config.cloudinary.cloudName },
    { key: 'CLOUDINARY_API_KEY', value: config.cloudinary.apiKey },
    { key: 'CLOUDINARY_API_SECRET', value: config.cloudinary.apiSecret },
    { key: 'OPENROUTER_API_KEY', value: config.llm.openrouter.apiKey }
  ];

  const missing = required.filter(item => !item.value);

  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.map(m => m.key).join(', ')}`);
  }
};
