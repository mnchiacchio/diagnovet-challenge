# 🐾 diagnoVET - Sistema de Gestión de Reportes Veterinarios

Una aplicación web moderna que utiliza inteligencia artificial para procesar, extraer y gestionar reportes de estudios veterinarios de manera eficiente.

## 📋 Descripción

diagnoVET es una solución completa que permite a los veterinarios subir reportes de estudios médicos (radiografías, ecografías, análisis, etc.) y extraer automáticamente información clave como datos del paciente, diagnóstico, recomendaciones y más, utilizando inteligencia artificial.

## ✨ Características Principales

- **📤 Carga de Archivos**: Subida de múltiples reportes en formato PDF
- **🤖 Extracción Inteligente**: Procesamiento automático con IA para extraer datos estructurados
- **📊 Gestión de Datos**: Extracción automática de información del paciente, veterinario, diagnósticos y recomendaciones
- **💾 Almacenamiento Seguro**: Base de datos PostgreSQL con Prisma ORM
- **🎨 Interfaz Moderna**: UI responsive con React 19 y Tailwind CSS
- **🔍 Búsqueda y Filtrado**: Sistema de búsqueda y filtros avanzados

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos utilitarios
- **Shadcn/ui** - Componentes de UI

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos (Neon)

### IA y Procesamiento
- **pdf-parse** - Extracción de texto de PDFs
- **OpenRouter.ai** - Modelos de IA (Llama 3.3)
- **Cloudinary** - Almacenamiento de archivos PDF

### Herramientas de Desarrollo
- **Concurrently** - Ejecución paralela de scripts
- **Zod** - Validación de esquemas (fuente única de verdad para tipos)
- **React Hook Form** - Manejo de formularios


## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta en Neon (PostgreSQL)
- Cuenta en Cloudinary
- Cuenta en OpenRouter.ai (para IA)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/diagnovet-challenge.git
cd diagnovet-challenge
```

### 2. Instalar dependencias
```bash
npm run install:all
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables en .env
DATABASE_URL="postgresql://..."
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
OPENROUTER_API_KEY="tu_openrouter_key"
OPENROUTER_MODEL="meta-llama/llama-3.3-8b-instruct:free"
LLM_PROVIDER="openrouter"
```

### 4. Configurar base de datos
```bash
# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate
```

### 5. Ejecutar en desarrollo
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev

# O ejecutar por separado
npm run dev:frontend  # Puerto 3000
npm run dev:backend   # Puerto 5000
```

### 6. Acceder a la aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1
- **Base de datos**: Configurada en Neon (PostgreSQL)

## 📁 Estructura del Proyecto

```
diagnovet-challenge/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── assets/          # Recursos estáticos
│   │   │   └── images/      # Imágenes del proyecto
│   │   ├── components/       # Componentes personalizados
│   │   │   ├── ui/          # Componentes Shadcn/ui
│   │   │   └── forms/       # Componentes de formularios modulares
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # Llamadas a API
│   │   ├── shared/          # Tipos, validadores y utilidades compartidas
│   │   │   ├── types/       # Tipos TypeScript derivados de validadores
│   │   │   ├── utils/       # Funciones utilitarias
│   │   │   ├── constants/   # Constantes compartidas
│   │   │   └── validators/  # Esquemas Zod (fuente única de verdad)
│   │   ├── utils/           # Funciones auxiliares
│   │   └── lib/             # Configuraciones
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/                  # API Node.js + Express
│   ├── src/
│   │   ├── controllers/     # Manejadores de rutas
│   │   ├── services/        # Lógica de negocio
│   │   ├── interfaces/      # Interfaces para servicios LLM
│   │   ├── factories/       # Factory pattern para servicios
│   │   ├── models/          # Entidades del dominio
│   │   ├── middleware/      # Middleware de Express
│   │   ├── routes/          # Rutas de API
│   │   ├── utils/           # Funciones auxiliares
│   │   └── config/          # Configuración de la app
│   ├── prisma/
│   │   └── schema.prisma    # Esquema de base de datos
│   ├── package.json
│   ├── railway.json         # Configuración de Railway
│   └── tsconfig.json
├── .cursor/
│   └── rules/
│       └── .cursorrules     # Reglas de Cursor AI
├── package.json             # Configuración del monorepo
├── tsconfig.json            # Configuración TypeScript raíz
├── env.example              # Variables de entorno de ejemplo
├── LICENSE                  # Licencia MIT
└── README.md
```

## 🔧 Scripts Disponibles

### Scripts Principales
```bash
npm run dev              # Ejecutar frontend y backend en desarrollo
npm run build           # Construir backend y frontend
npm run install:all     # Instalar todas las dependencias
```

### Scripts de Frontend
```bash
npm run dev:frontend    # Ejecutar solo frontend
npm run build:frontend  # Construir frontend
```

### Scripts de Backend
```bash
npm run dev:backend     # Ejecutar solo backend
npm run build:backend   # Construir backend (independiente)
```

### Scripts de Base de Datos
```bash
npm run db:generate     # Generar cliente de Prisma
npm run db:migrate      # Ejecutar migraciones
npm run db:push         # Sincronizar esquema con BD
```

## 🎯 Uso de la Aplicación

### 1. Cargar Reportes
- Arrastra y suelta archivos PDF
- Selecciona múltiples archivos simultáneamente
- Visualiza el progreso de carga

### 2. Procesamiento Automático
- Extracción de texto de PDFs
- IA analiza y estructura la información

### 3. Revisión y Edición
- Revisa datos extraídos automáticamente
- Edita información incorrecta
- Confirma reportes procesados
- Actualiza estado del procesamiento

### 4. Navegación y Búsqueda
- Lista de todos los reportes con paginación
- Búsqueda y filtros por múltiples criterios
- Vista detallada de cada reporte con descarga de PDF original

## 🔍 Extracción Inteligente con IA

La aplicación utiliza inteligencia artificial para extraer automáticamente información estructurada de reportes veterinarios:

### Datos Extraídos:
- **Paciente**: Nombre, especie, raza, edad, peso, propietario
- **Veterinario**: Nombre, matrícula, título, clínica, contacto
- **Estudio**: Tipo, fecha, técnica, región corporal, equipamiento
- **Clínico**: Hallazgos, diagnóstico, diagnósticos diferenciales, recomendaciones
- **Mediciones**: Peso, temperatura, frecuencia cardíaca, datos ecográficos


## 🚀 Despliegue

### Verificación Pre-Despliegue
```bash
# Verificar que todos los builds funcionan
npm run install:all
npm run build:backend
npm run build:frontend
```

### Frontend (Vercel)
```bash
# Configurar en Vercel
vercel --prod

# Variables de entorno necesarias:
VITE_API_URL=https://tu-api.railway.app
```

### Backend (Railway)
```bash
# Conectar con Railway
railway login
railway link

# Configurar variables de entorno
railway variables set DATABASE_URL="postgresql://..."
railway variables set CLOUDINARY_CLOUD_NAME="tu_cloud_name"
railway variables set CLOUDINARY_API_KEY="tu_api_key"
railway variables set CLOUDINARY_API_SECRET="tu_api_secret"
railway variables set OPENROUTER_API_KEY="tu_openrouter_key"
railway variables set OPENROUTER_MODEL="meta-llama/llama-3.3-8b-instruct:free"
railway variables set LLM_PROVIDER="openrouter"
railway variables set NODE_ENV="production"
railway variables set API_PORT="5000"

# Desplegar (usa railway.json para configuración automática)
railway up
```

> **Nota**: El archivo `railway.json` contiene la configuración optimizada de build y deploy para Railway.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Marcos Nicolás Chiacchio**
- GitHub: [@mnchiacchio](https://github.com/mnchiacchio)
- LinkedIn: [Marcos Chiacchio](https://linkedin.com/in/marcos-chiacchio)

## 🙏 Agradecimientos

- [OpenRouter.ai](https://openrouter.ai/) por los modelos de IA
- [Cloudinary](https://cloudinary.com/) por el almacenamiento de archivos
- [Shadcn/ui](https://ui.shadcn.com/) por los componentes de UI
- [Prisma](https://prisma.io/) por el ORM
- [Vercel](https://vercel.com/) y [Railway](https://railway.app/) por el hosting
- [Zod](https://zod.dev/) por la validación de esquemas y tipado automático

---

⭐ Si este proyecto te resulta útil, ¡no olvides darle una estrella!