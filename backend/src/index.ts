import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import reportRoutes from './routes/reports';
import uploadRoutes from './routes/upload';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

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

// Ruta de salud
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'diagnoVET API está funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
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
