# Módulo Financiero - Campo360 Manager

## Descripción

El módulo financiero es un sistema completo de gestión financiera diseñado específicamente para operaciones agrícolas. Permite el control detallado de ingresos, gastos, presupuestos y análisis de rentabilidad.

## Características Principales

### 📊 Gestión de Transacciones
- Registro de ingresos y gastos
- Categorización automática
- Métodos de pago múltiples
- Estados de pago (pendiente, pagado, vencido)
- Etiquetas personalizables
- Notas y referencias

### 💰 Presupuestos
- Presupuestos anuales, estacionales y por proyecto
- Control de variación (planificado vs real)
- Alertas de sobregasto
- Análisis de desviaciones
- Presupuestos por finca y cultivo

### 📈 Reportes y Análisis
- Análisis de ganancias y pérdidas
- Flujo de caja con proyecciones
- ROI por cultivo y finca
- Análisis de márgenes de beneficio
- Reportes por categorías
- Tendencias mensuales

### 👥 Gestión de Clientes y Proveedores
- Base de datos de clientes
- Términos de pago personalizados
- Historial de transacciones
- Saldos pendientes
- Análisis de rentabilidad por cliente

## Estructura del Código

### Tipos de Datos (`financial-types.ts`)
```typescript
// Principales interfaces
- Transaction: Transacciones financieras
- Budget: Presupuestos y control de gastos
- Customer: Gestión de clientes
- ProfitLossData: Datos de análisis P&L
- CashFlowData: Información de flujo de caja
- ROIAnalysis: Análisis de retorno de inversión
```

### Servicio Principal (`financialService.ts`)
```typescript
class FinancialService {
  // Gestión de transacciones
  createTransaction()
  updateTransaction()
  deleteTransaction()
  getTransactions()

  // Gestión de presupuestos
  createBudget()
  updateBudget()
  getBudgets()

  // Reportes y análisis
  generateProfitLossReport()
  generateCashFlowReport()
  calculateROIByCrop()

  // Clientes y proveedores
  createCustomer()
  updateCustomer()
  getCustomers()
}
```

### Interfaz de Usuario (`FinancialPage.tsx`)
- Dashboard financiero con métricas clave
- Pestañas para transacciones, presupuestos y reportes
- Visualización de datos con tablas y tarjetas
- Responsive design para móviles y desktop

## Instalación y Configuración

### Prerrequisitos
- Firebase configurado con Firestore
- React 18+ con TypeScript
- React Router para navegación

### Configuración de Firebase
```javascript
// firebase.ts
export const db = getFirestore(app);
```

### Importación del Servicio
```typescript
import { financialService } from '@/services';
```

## Uso Básico

### Crear una Transacción
```typescript
const transaction = await financialService.createTransaction('userId', {
  type: 'income',
  category: 'Venta de Cosecha',
  amount: 15000,
  currency: 'EUR',
  description: 'Venta de maíz - Temporada 2024',
  date: new Date(),
  paymentMethod: 'Transferencia',
  paymentStatus: 'paid'
});
```

### Crear un Presupuesto
```typescript
const budget = await financialService.createBudget('userId', {
  name: 'Presupuesto Anual 2024',
  type: 'annual',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  totalBudget: 50000,
  currency: 'EUR'
});
```

### Generar Reporte P&L
```typescript
const report = await financialService.generateProfitLossReport(
  'userId',
  {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    type: 'yearly'
  }
);
```

## Características Avanzadas

### Análisis de ROI por Cultivo
- Cálculo automático de retorno de inversión
- Análisis de período de recuperación
- Comparación entre cultivos
- Métricas de rentabilidad

### Proyecciones de Flujo de Caja
- Predicciones basadas en datos históricos
- Análisis de tendencias estacionales
- Alertas de flujo de caja negativo
- Planificación financiera a largo plazo

### Categorización Inteligente
- Categorías predefinidas para agricultura
- Sistema de etiquetas flexible
- Filtros avanzados para reportes
- Agrupación automática por tipo de actividad

## Integración con Otros Módulos

### Cultivos
- Análisis de rentabilidad por cultivo
- Costos de producción detallados
- ROI específico por variedad

### Fincas
- Rentabilidad por ubicación
- Análisis comparativo entre propiedades
- Distribución de costos por finca

### Inventario
- Valoración de stock
- Costos de materiales
- Análisis de rotación

## Seguridad y Privacidad

- Datos encriptados en tránsito y reposo
- Autenticación Firebase
- Reglas de seguridad Firestore
- Acceso basado en roles de usuario

## Próximas Características

- [x] Funcionalidades offline avanzadas
- [x] Sincronización automática
- [x] Cache inteligente con Service Workers
- [x] Backup y restauración de datos
- [x] Indicadores de estado de sincronización
- [ ] Exportación a PDF de reportes
- [ ] Integración con sistemas contables
- [ ] API para aplicaciones móviles
- [ ] Análisis predictivo con IA
- [ ] Sincronización bancaria
- [ ] Facturación automática
- [ ] Multi-moneda avanzado

## Funcionalidades Offline Implementadas

### 🔄 Sincronización Automática
- Detección automática de estado online/offline
- Cola de sincronización para operaciones pendientes
- Sincronización automática al recuperar conexión
- Reintentos automáticos con backoff exponencial
- Manejo de errores y operaciones fallidas

### 💾 Almacenamiento Local
- Persistencia automática en localStorage
- Combinación inteligente de datos online y offline
- Detección de duplicados en sincronización
- Identificadores temporales para operaciones offline

### ⚙️ Service Worker
- Cache automático de recursos estáticos
- Cache inteligente de API con estrategia Network First
- Funcionalidad offline completa sin conexión
- Sincronización en segundo plano
- Actualizaciones automáticas de cache

### 📊 Indicadores de Estado
- Indicador visual de estado de conexión
- Contador de operaciones pendientes
- Alertas de sincronización
- Información detallada en tooltips
- Notificaciones de estado

### 🛠️ Herramientas de Gestión
- Panel de configuración offline completo
- Exportación/importación de datos de respaldo
- Limpieza de cache y datos locales
- Estadísticas de uso de almacenamiento
- Sincronización manual forzada

### 🔧 Componentes Disponibles

#### `OfflineService`
```typescript
// Servicio principal para gestión offline
const offlineService = new OfflineService();

// Verificar estado
offlineService.isOnline()
offlineService.getSyncStats()

// Gestión de datos
offlineService.saveTransactionOffline(transaction, 'CREATE', userId)
offlineService.getOfflineTransactions()

// Sincronización
offlineService.syncPendingData()
offlineService.addSyncListener(callback)
```

#### `useOfflineData` Hook
```typescript
// Hook para componentes React
const { 
  isOnline, 
  syncStats, 
  isSyncing, 
  syncData 
} = useOfflineData({
  autoSync: true,
  onSyncComplete: () => console.log('Sincronizado'),
  onSyncError: (error) => console.error(error)
});
```

#### `SyncStatus` Componente
```jsx
// Indicador de estado de sincronización
<SyncStatus className="ml-4" />
```

#### `OfflineBanner` Componente
```jsx
// Banner informativo para modo offline
<OfflineBanner className="mb-4" />
```

#### `OfflineSettings` Componente
```jsx
// Panel completo de configuración
<OfflineSettings 
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
/>
```

### 📱 Experiencia de Usuario

#### Modo Online
- Datos sincronizados en tiempo real
- Indicador verde de conexión
- Actualización automática de información

#### Modo Offline
- Funcionalidad completa sin conexión
- Banner informativo amarillo
- Datos guardados localmente
- Indicador rojo de sin conexión

#### Transición Online ↔ Offline
- Detección automática de cambios
- Sincronización transparente
- Notificaciones de estado
- Sin pérdida de datos

### 🔒 Seguridad y Privacidad

#### Datos Locales
- Encriptación opcional en localStorage
- Limpieza automática de datos sensibles
- Expiración configurable de cache
- Validación de integridad

#### Sincronización
- Autenticación requerida para sincronizar
- Validación de permisos en servidor
- Detección de conflictos de datos
- Logs de auditoría

### 📈 Monitoreo y Debugging

#### Estadísticas Disponibles
- Número de operaciones pendientes
- Tamaño de almacenamiento local
- Tiempo de última sincronización
- Operaciones fallidas

#### Herramientas de Debug
- Logs detallados en consola
- Exportación de datos para análisis
- Simulación de estados offline
- Métricas de rendimiento

### 🚀 Optimizaciones

#### Rendimiento
- Cache inteligente con TTL
- Compresión de datos locales
- Lazy loading de componentes
- Debounced sync operations

#### Red
- Retry con backoff exponencial
- Detección de calidad de conexión
- Priorización de operaciones críticas
- Batch de operaciones múltiples

## Soporte Técnico

Para soporte técnico o reportar bugs:
- Crear issue en el repositorio
- Documentar pasos para reproducir
- Incluir logs de error si aplica

## Licencia

Parte del sistema Campo360 Manager - Todos los derechos reservados.
