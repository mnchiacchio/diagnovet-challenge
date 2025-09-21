# 🚀 Plan de Despliegue - diagnoVET

Este documento contiene las instrucciones completas para desplegar la aplicación diagnoVET en producción.

## ⚠️ IMPORTANTE: Verificación Pre-Despliegue

**ANTES de comenzar el despliegue, ejecuta estos comandos para verificar que todo funciona:**

```bash
# Desde la raíz del proyecto
# 1. Instalar todas las dependencias
npm run install:all

# 2. Construir el paquete shared
cd shared && npm run build && cd ..

# 3. Verificar build del backend
cd backend && npm run build && cd ..

# 4. Verificar build del frontend
cd frontend && npm run build && cd ..

# Si todos los builds pasan, puedes continuar con el despliegue
```

## 📋 Prerrequisitos

### Cuentas Necesarias
- [Vercel](https://vercel.com/) - Frontend hosting
- [Railway](https://railway.app/) - Backend hosting
- [Neon](https://neon.tech/) - Base de datos PostgreSQL
- [Cloudinary](https://cloudinary.com/) - Almacenamiento de archivos
- [OpenRouter.ai](https://openrouter.ai/) - Servicios de IA

### Herramientas Locales
- Node.js 18+
- npm o yarn
- Git
- [Vercel CLI](https://vercel.com/cli)
- [Railway CLI](https://docs.railway.app/develop/cli)

## 🗄️ 1. Configuración de Base de Datos (Neon)

### Paso 1.1: Crear Base de Datos
1. Ir a [Neon Console](https://console.neon.tech/)
2. Crear un nuevo proyecto
3. Copiar la **Connection String** (DATABASE_URL)

### Paso 1.2: Configurar Variables de Entorno
```bash
# En tu archivo .env local (para testing)
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
```

### Paso 1.3: Ejecutar Migraciones
```bash
# Desde la raíz del proyecto
cd backend
npm run db:generate
npm run db:migrate
```

## ☁️ 2. Configuración de Cloudinary

### Paso 2.1: Crear Cuenta
1. Ir a [Cloudinary](https://cloudinary.com/)
2. Crear cuenta gratuita
3. Ir al Dashboard

### Paso 2.2: Obtener Credenciales
```bash
# En tu archivo .env local
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
```

### Paso 2.3: Configurar Folders
- Crear folder: `diagnovet/reports/pdfs`
- Configurar transformaciones para PDFs (resource_type: raw)

## 🤖 3. Configuración de OpenRouter.ai

### Paso 3.1: Crear Cuenta
1. Ir a [OpenRouter.ai](https://openrouter.ai/)
2. Crear cuenta
3. Obtener API Key

### Paso 3.2: Configurar Variables
```bash
# En tu archivo .env local
OPENROUTER_API_KEY="tu_openrouter_key"
OPENROUTER_MODEL="meta-llama/llama-3.3-8b-instruct:free"
LLM_PROVIDER="openrouter"
```

## 🖥️ 4. Despliegue del Backend (Railway)

### Paso 4.1: Preparar el Backend
```bash
# Desde la raíz del proyecto
cd backend

# Instalar dependencias
npm install

# Verificar que compile (backend es independiente)
npm run build
```

### Paso 4.2: Configurar Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login en Railway
railway login

# Crear nuevo proyecto
railway new

# Conectar con el proyecto
railway link
```

### Paso 4.3: Configurar Variables de Entorno en Railway
```bash
# Configurar variables de entorno
railway variables set DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
railway variables set CLOUDINARY_CLOUD_NAME="tu_cloud_name"
railway variables set CLOUDINARY_API_KEY="tu_api_key"
railway variables set CLOUDINARY_API_SECRET="tu_api_secret"
railway variables set OPENROUTER_API_KEY="tu_openrouter_key"
railway variables set OPENROUTER_MODEL="meta-llama/llama-3.3-8b-instruct:free"
railway variables set LLM_PROVIDER="openrouter"
railway variables set NODE_ENV="production"
railway variables set API_PORT="5000"

# IMPORTANTE: Configurar build command para Railway
railway variables set RAILWAY_BUILD_COMMAND="cd backend && npm install && npm run build"
railway variables set RAILWAY_START_COMMAND="cd backend && npm start"
```

### Paso 4.4: Desplegar Backend
```bash
# Desplegar
railway up

# Ver logs
railway logs

# Obtener URL del backend
railway domain
```

### Paso 4.5: Verificar Despliegue
```bash
# Probar endpoints
curl https://tu-backend.railway.app/api/v1/health
curl https://tu-backend.railway.app/api/v1/system/config
```

## 🌐 5. Despliegue del Frontend (Vercel)

### Paso 5.1: Preparar el Frontend
```bash
# Desde la raíz del proyecto
cd frontend

# Instalar dependencias (incluye shared package)
npm install

# Construir el paquete shared primero
cd ../shared
npm run build
cd ../frontend

# Verificar que compile
npm run build
```

### Paso 5.2: Configurar Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login en Vercel
vercel login

# Inicializar proyecto
vercel
```

### Paso 5.3: Configurar Variables de Entorno en Vercel
```bash
# Configurar variables de entorno
vercel env add VITE_API_URL
# Ingresar: https://tu-backend.railway.app/api/v1

vercel env add VITE_APP_NAME
# Ingresar: diagnoVET

vercel env add VITE_APP_VERSION
# Ingresar: 1.0.0
```

### Paso 5.4: Desplegar Frontend
```bash
# Desplegar a producción
vercel --prod

# Obtener URL del frontend
vercel ls
```

### Paso 5.5: Configurar Dominio Personalizado (Opcional)
```bash
# Agregar dominio personalizado
vercel domains add tu-dominio.com

# Configurar DNS
# A record: @ -> 76.76.19.61
# CNAME: www -> cname.vercel-dns.com
```

## 🔧 6. Configuración Post-Despliegue

### Paso 6.1: Configurar CORS
```bash
# En Railway, agregar variable
railway variables set CORS_ORIGIN="https://tu-frontend.vercel.app"
```

### Paso 6.2: Configurar Base de Datos en Producción
```bash
# Ejecutar migraciones en producción
railway run npx prisma db push

# Generar cliente de Prisma
railway run npx prisma generate
```

### Paso 6.3: Verificar Funcionalidad Completa
1. **Frontend**: https://tu-frontend.vercel.app
2. **Backend Health**: https://tu-backend.railway.app/api/v1/health
3. **Config Check**: https://tu-backend.railway.app/api/v1/system/config
4. **Test LLM**: https://tu-backend.railway.app/api/v1/system/test/llm

## 📊 7. Monitoreo y Mantenimiento

### Paso 7.1: Configurar Monitoreo
- **Railway**: Dashboard automático con métricas
- **Vercel**: Analytics automático
- **Cloudinary**: Dashboard con uso de almacenamiento

### Paso 7.2: Logs y Debugging
```bash
# Ver logs del backend
railway logs

# Ver logs del frontend
vercel logs

# Debugging específico
railway run npx prisma studio
```

### Paso 7.3: Actualizaciones
```bash
# Actualizar backend
git push origin main
railway up

# Actualizar frontend
git push origin main
vercel --prod
```

## 🔒 8. Seguridad y Mejores Prácticas

### Paso 8.1: Configurar HTTPS
- **Vercel**: HTTPS automático
- **Railway**: HTTPS automático
- **Cloudinary**: HTTPS por defecto

### Paso 8.2: Variables Sensibles
- Nunca committear archivos `.env`
- Usar variables de entorno de la plataforma
- Rotar API keys regularmente

### Paso 8.3: Backup y Recuperación
- **Base de datos**: Neon tiene backup automático
- **Archivos**: Cloudinary tiene redundancia
- **Código**: Git como fuente de verdad

## 🚨 9. Solución de Problemas Comunes

### Problema: Error de CORS
```bash
# Verificar CORS_ORIGIN en Railway
railway variables get CORS_ORIGIN
```

### Problema: Error de Base de Datos
```bash
# Verificar conexión
railway run npx prisma db push
```

### Problema: Error de Cloudinary
```bash
# Verificar variables
railway variables get CLOUDINARY_CLOUD_NAME
```

### Problema: Error de OpenRouter
```bash
# Verificar API key
railway run curl https://tu-backend.railway.app/api/v1/system/test/llm
```

## 📞 10. Contacto y Soporte

- **Documentación**: Este archivo
- **Issues**: GitHub Issues
- **Logs**: Railway y Vercel dashboards
- **Base de datos**: Neon console

---

## ✅ Checklist de Despliegue

- [ ] Base de datos configurada (Neon)
- [ ] Cloudinary configurado
- [ ] OpenRouter.ai configurado
- [ ] Backend desplegado (Railway)
- [ ] Frontend desplegado (Vercel)
- [ ] Variables de entorno configuradas
- [ ] CORS configurado
- [ ] Migraciones ejecutadas
- [ ] Endpoints funcionando
- [ ] Aplicación completa funcionando

**¡Despliegue completado! 🎉**
