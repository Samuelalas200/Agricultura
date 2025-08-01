# Campo360 Manager 🌱

Sistema completo de gestión agrícola desarrollado con tecnologías modernas y cloud-native.

## 🚀 Tecnologías

### Backend (Cloud)
- **Firebase Auth** - Autenticación robusta y escalable
- **Firebase Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Analytics** - Métricas y análisis integrado

### Frontend
- **React 18** - Biblioteca de interfaz de usuario moderna
- **Vite** - Build tool rápido con HMR
- **TypeScript** - Desarrollo type-safe
- **Tailwind CSS** - Framework de estilos utility-first
- **React Hook Form** - Manejo de formularios performante
- **React Query** - Gestión de estado del servidor
- **PWA** - Progressive Web App con service workers

## 📦 Estructura del Proyecto

```
Campo360 Manager/
├── apps/
│   └── web/          # Frontend React + PWA
├── packages/
│   └── lib/          # Librería compartida de tipos
└── docs/             # Documentación
```

## ⚡ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado)
- Cuenta de Firebase (para configuración)

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Samuelalas200/Agricultura.git
cd Agricultura

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp apps/web/.env.example apps/web/.env.local

# Weather API Configuration
# Get your free API key from: https://openweathermap.org/api
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Editar .env.local con tus credenciales de Firebase
# Las credenciales por defecto son para desarrollo
```

## 🏃‍♂️ Ejecutar el Proyecto

```bash
# Ejecutar el proyecto
cd apps/web
pnpm run dev
```

Esto iniciará:
- **Frontend PWA**: http://localhost:5180/
- **Datos de prueba**: Se crean automáticamente al iniciar sesión

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm run dev          # Ejecutar aplicación web
pnpm run build        # Compilar para producción
pnpm run preview      # Vista previa de producción

# Testing (próximamente)
pnpm run test         # Ejecutar pruebas
pnpm run test:watch   # Pruebas en modo watch

# Utilidades
pnpm run lint         # Linter de código
pnpm run format       # Formatear código
```

## 🌟 Características Principales

### ✅ Gestión de Usuarios
- Registro y autenticación con Firebase Auth
- Perfiles de usuario integrados
- Sesiones persistentes

### ✅ Gestión de Granjas
- Crear y administrar granjas en la nube
- Información geográfica y de área
- Sincronización en tiempo real

### ✅ Gestión de Cultivos
- Registro de diferentes tipos de cultivos
- Seguimiento de variedades y estados
- Historial de cultivos por granja

### ✅ Gestión de Tareas Agrícolas
- **Tipos de tareas**: Riego, Fertilización, Control de plagas, Cosecha, etc.
- **Prioridades**: Baja, Media, Alta
- **Estados**: Pendiente, En progreso, Completada
- **Asignación**: Tareas organizadas por usuario
- **Programación**: Fechas de vencimiento y recordatorios

### ✅ Clima y Alertas Meteorológicas
- **Integración con OpenWeatherMap**: Datos meteorológicos en tiempo real
- **Alertas inteligentes**: Notificaciones automáticas por condiciones adversas
- **Datos agrícolas**: Evapotranspiración, días grado, recomendaciones de riego
- **Notificaciones push**: Alertas críticas y pronóstico diario
- **Múltiples ubicaciones**: Selector de ciudades con geolocalización
- **Información especializada**: Riesgo de plagas, condiciones de siembra/cosecha

### ✅ Dashboard Interactivo
- Estadísticas en tiempo real
- Resumen de tareas pendientes y completadas
- Estado actual de cultivos
- Métricas de rendimiento

### ✅ Progressive Web App (PWA)
- **Instalable**: Se puede instalar como app nativa
- **Offline**: Funciona sin conexión a internet
- **Responsive**: Optimizado para móvil y desktop
- **Notificaciones**: Push notifications (próximamente)

## 🔐 Autenticación

El sistema utiliza Firebase Auth para autenticación segura y escalable:

```bash
# Para probar la aplicación:
1. Registra una cuenta nueva, o
2. Usa las credenciales de prueba (si están disponibles)

# Datos de prueba se crean automáticamente:
- 3 granjas de ejemplo
- 6 cultivos variados
- 8 tareas con diferentes estados
```

> **Consola del navegador**: Ejecuta `createCampo360SampleData()` para generar datos de prueba

## 🗄️ Base de Datos

### Firebase Firestore
- **Real-time**: Actualizaciones en tiempo real
- **Offline-first**: Funciona sin conexión
- **Escalable**: Maneja cualquier cantidad de datos
- **Segura**: Reglas de seguridad integradas

### Colecciones principales:
- **users**: Perfiles de usuario (auto-gestionado por Firebase Auth)
- **farms**: Información de granjas por usuario
- **crops**: Datos de cultivos asociados a granjas  
- **tasks**: Tareas agrícolas con seguimiento de estado

### Datos de prueba
```javascript
// En la consola del navegador:
createCampo360SampleData()  // Crear datos de ejemplo
clearCampo360SampleData()   // Limpiar datos de ejemplo
```

## 🌐 Arquitectura Cloud-Native

### Firebase Services
- **Authentication**: Gestión completa de usuarios
- **Firestore**: Base de datos NoSQL en tiempo real
- **Analytics**: Métricas de uso integradas
- **Hosting**: Despliegue automático (próximamente)

### Beneficios de Firebase:
- ✅ **Escalabilidad automática**
- ✅ **Sin mantenimiento de servidores**
- ✅ **Sincronización en tiempo real**
- ✅ **Offline-first por defecto**
- ✅ **Seguridad enterprise-grade**

## 🎨 Interfaz de Usuario

- **Mobile-first**: Diseño responsivo optimizado para móviles
- **PWA nativa**: Instalable como aplicación nativa
- **Navegación intuitiva**: Sidebar colapsible con hamburger menu
- **Formularios inteligentes**: Validación en tiempo real con React Hook Form
- **Estados de carga**: Loading spinners y skeletons
- **Notificaciones**: Sistema de toast notifications
- **Offline-ready**: Funciona sin conexión a internet

### Características técnicas de UI:
- **Tailwind CSS**: Sistema de diseño consistente
- **Dark mode ready**: Preparado para modo oscuro
- **Accesibilidad**: Cumple estándares WCAG
- **Performance**: Optimizado para Core Web Vitals

## 🔧 Configuración del Entorno

### Variables de Entorno

**Frontend (`apps/web/.env.local`)**:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012

# Application Configuration
VITE_APP_NAME="Campo360 Manager"
VITE_DEBUG=true
VITE_PWA_ENABLED=true
```

> **⚠️ Importante**: 
> - Las credenciales incluidas son para desarrollo
> - Para producción, configura tu propio proyecto Firebase
> - Nunca commitees archivos `.env` con datos sensibles

## 🚀 Despliegue

### Desarrollo Local
```bash
cd apps/web
pnpm run dev
```

### Producción
```bash
# Compilar para producción
pnpm run build

# Vista previa local
pnpm run preview

# Despliegue en Firebase Hosting (próximamente)
firebase deploy
```

### PWA Installation
- La app se puede instalar como PWA nativa
- Funciona offline después de la primera carga
- Se actualiza automáticamente

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
