import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import reportRoutes from './routes/reports';
import uploadRoutes from './routes/upload';
import systemRoutes from './routes/system';

// Importar middlewares
import { errorHandlerMiddleware, notFoundMiddleware } from './middleware/errorHandler';
import { validateConfig } from './config';

// Cargar variables de entorno
dotenv.config();

// Validar configuración
try {
  validateConfig();
  console.log('✅ Configuración validada correctamente');
} catch (error) {
  console.error('❌ Error en configuración:', error);
  process.exit(1);
}

const app = express();
const PORT = parseInt(process.env.PORT || process.env.API_PORT || '5000', 10);

// Inicializar Prisma
export const prisma = new PrismaClient();

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Parsear JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rutas de la API
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/system', systemRoutes);

// Ruta de salud
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'diagnoVET API está funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DATABASE_URL ? 'Conectada' : 'No configurada'}`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
