# Campo360 Manager 🌱

Sistema completo de gestión agrícola desarrollado con tecnologías modernas.

## 🚀 Tecnologías

### Backend
- **NestJS** - Framework Node.js para APIs robustas
- **Prisma ORM** - Manejo de base de datos type-safe
- **SQLite** - Base de datos ligera y eficiente
- **JWT** - Autenticación segura
- **TypeScript** - Tipado estático

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Build tool rápido y moderno
- **TypeScript** - Desarrollo type-safe
- **Tailwind CSS** - Framework de estilos utility-first
- **React Hook Form** - Manejo de formularios
- **React Query** - Gestión de estado del servidor

## 📦 Estructura del Proyecto

```
Campo360 Manager/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend React
├── packages/
│   └── lib/          # Librería compartida
└── docs/             # Documentación
```

## ⚡ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado)

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Samuelalas200/Agricultura.git
cd Agricultura

# Instalar dependencias
pnpm install

# Configurar variables de entorno
# Backend
cp apps/api/.env.example apps/api/.env
# Frontend
cp apps/web/.env.example apps/web/.env.local

# Configurar base de datos
cd apps/api
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed

# Volver al directorio raíz
cd ../..
```

## 🏃‍♂️ Ejecutar el Proyecto

```bash
# Ejecutar todo el proyecto (backend + frontend)
pnpm run dev
```

Esto iniciará:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5177
- **API Docs**: http://localhost:3001/api/docs

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm run dev          # Ejecutar todo en modo desarrollo
pnpm run build        # Compilar todo el proyecto
pnpm run start        # Ejecutar en producción

# Por aplicación específica
pnpm run dev:api      # Solo backend
pnpm run dev:web      # Solo frontend
```

## 🌟 Características Principales

### ✅ Gestión de Usuarios
- Registro y autenticación
- Perfiles de usuario
- Control de acceso

### ✅ Gestión de Granjas
- Crear y administrar granjas
- Información detallada de ubicación
- Gestión de parcelas

### ✅ Gestión de Cultivos
- Registro de diferentes tipos de cultivos
- Seguimiento de variedades
- Control de estado de cultivos

### ✅ Gestión de Tareas Agrícolas
- **Tipos de tareas**: Siembra, Riego, Fertilización, Control de plagas, Cosecha, etc.
- **Prioridades**: Baja, Media, Alta, Urgente
- **Estados**: Pendiente, En progreso, Completada, Cancelada
- **Asignación**: Tareas asignables a usuarios específicos
- **Programación**: Fechas y horarios de ejecución

### ✅ Dashboard Interactivo
- Estadísticas generales
- Resumen de tareas pendientes
- Estado de cultivos activos
- Métricas importantes

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación segura:

```
Usuario de prueba:
Email: admin@campo360.com
Password: 123456789
```

> **Nota**: Estas credenciales se crean automáticamente con el comando `pnpm prisma db seed`

## 🗄️ Base de Datos

### Modelo de Datos
- **Users**: Gestión de usuarios del sistema
- **Farms**: Información de granjas
- **Crops**: Datos de cultivos
- **Tasks**: Tareas agrícolas con todas sus propiedades

### Configuración de Prisma
```bash
# Ver esquema actual
pnpm prisma studio

# Aplicar cambios al esquema
pnpm prisma db push

# Poblar con datos de prueba
pnpm prisma db seed
```

## 🌐 API REST

La API está documentada con Swagger en: `http://localhost:3001/api/docs`

### Endpoints principales:
- **Auth**: `/auth/login`, `/auth/register`
- **Users**: `/users/profile`
- **Farms**: `/farms` (CRUD completo)
- **Crops**: `/crops` (CRUD completo)
- **Tasks**: `/tasks` (CRUD completo)

## 🎨 Interfaz de Usuario

- **Diseño responsivo** con Tailwind CSS
- **Navegación intuitiva** con sidebar y header
- **Formularios validados** con React Hook Form
- **Notificaciones toast** para feedback del usuario
- **Carga de datos optimizada** con React Query

## 🔧 Configuración del Entorno

### Variables de Entorno

**Backend (`apps/api/.env`)**:
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Configuration - ¡CAMBIAR EN PRODUCCIÓN!
JWT_SECRET="campo360-super-secret-jwt-key-2024-production-ready"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"

# CORS Configuration
CORS_ORIGIN="http://localhost:5177,http://localhost:5173"

# Security
BCRYPT_ROUNDS=12
```

**Frontend (`apps/web/.env.local`)**:
```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Application Configuration
VITE_APP_NAME="Campo360 Manager"
VITE_DEBUG=true
VITE_PWA_ENABLED=true
```

> **⚠️ Importante**: Nunca commitees archivos `.env` con datos sensibles. Usa los archivos `.env.example` como plantilla.

## 🚀 Despliegue

### Producción
```bash
# Compilar para producción
pnpm run build

# Ejecutar en producción
pnpm run start
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Samuel Alas** - [Samuelalas200](https://github.com/Samuelalas200)

---

⭐ ¡Dale una estrella al proyecto si te fue útil!
