# Configuración de API Meteorológica - Campo360 Manager

## 🌤️ Integración con OpenWeatherMap

Este documento explica cómo configurar la integración meteorológica en Campo360 Manager.

## 📋 Requisitos

1. **Cuenta gratuita en OpenWeatherMap**
   - Visita: https://openweathermap.org/api
   - Regístrate gratuitamente
   - Confirma tu email

2. **API Key**
   - Después del registro, ve a: https://home.openweathermap.org/api_keys
   - Copia tu API key
   - Nota: Puede tomar hasta 2 horas en activarse

## ⚙️ Configuración

### 1. Variables de Entorno

Agrega tu API key al archivo `.env.local`:

```bash
# Weather API Configuration
VITE_OPENWEATHER_API_KEY=tu_api_key_aquí
```

### 2. Características Incluidas

#### 🔹 Datos Meteorológicos Actuales
- Temperatura, humedad, viento
- Índice UV, presión atmosférica
- Descripción y iconos del clima
- Ubicación automática por GPS

#### 🔹 Datos Agrícolas Especializados
- **Temperatura del suelo** (estimada)
- **Evapotranspiración** (ET0 - Penman-Monteith simplificada)
- **Días grado** (Growing Degree Days)
- **Recomendaciones de riego** (ninguno, ligero, moderado, intenso)
- **Condiciones de siembra/cosecha** (pobre, regular, buena, excelente)
- **Riesgo de plagas y enfermedades** (bajo, medio, alto)

#### 🔹 Alertas Meteorológicas
- **Tipos**: Lluvia, heladas, sequía, viento, granizo, temperaturas extremas
- **Severidad**: Baja, media, alta, extrema
- **Recomendaciones automáticas** por tipo de alerta
- **Notificaciones push** configurables

#### 🔹 Pronóstico Extendido
- **7 días** de pronóstico detallado
- **Temperaturas máximas/mínimas**
- **Probabilidad de precipitación**
- **Condiciones por día**

## 🌍 Ubicaciones Soportadas

### Ciudades Predefinidas (El Salvador)
- San Salvador
- Santa Ana
- San Miguel
- Sonsonate
- Ahuachapán
- Usulután
- La Unión

### Búsqueda Global
- Cualquier ciudad del mundo
- Búsqueda por coordenadas GPS
- Geolocalización automática

## 🔔 Sistema de Notificaciones

### Configuración de Alertas
- **Críticas**: Alertas automáticas para condiciones extremas
- **Personalizables**: Umbral de severidad configurable
- **Horario**: Pronóstico diario a hora configurada
- **Push notifications**: Requiere permisos del navegador

### Tipos de Notificaciones
1. **Alertas críticas inmediatas**
2. **Pronóstico diario programado**
3. **Cambios significativos en condiciones**
4. **Recomendaciones agrícolas urgentes**

## 📱 Interfaz de Usuario

### Panel Principal
- Widget meteorológico en el dashboard
- Selector de ubicación integrado
- Actualización automática cada 30 minutos
- Botón de actualización manual

### Panel de Notificaciones
- Badge con contador de alertas no leídas
- Lista detallada de alertas activas
- Recomendaciones específicas por alerta
- Marcar como leídas individualmente

## ⚡ Rendimiento

### Optimizaciones Implementadas
- **Cache inteligente**: Evita llamadas innecesarias a la API
- **Datos mock**: Fallback automático en caso de error
- **Lazy loading**: Componentes se cargan bajo demanda
- **Debouncing**: Búsqueda de ubicaciones optimizada

### Límites de API Gratuita
- **1,000 llamadas/día** (plan gratuito)
- **60 llamadas/minuto**
- **Actualización cada 30 minutos** (configurable)

## 🔧 Personalización Avanzada

### Configurar Intervalo de Actualización
```typescript
const weatherHook = useWeatherNotifications({
  location: 'San Salvador',
  refreshInterval: 60, // minutos
  enableNotifications: true
});
```

### Cambiar Umbral de Alertas
```typescript
weatherHook.updateSettings({
  severityThreshold: 'high', // solo alertas altas y extremas
  enableDailyForecast: true,
  notificationTime: '06:00'
});
```

### Agregar Nuevas Ubicaciones
```typescript
// En LocationSelector.tsx
const customLocations = [
  { name: 'Mi Finca', country: 'SV', lat: 13.7, lon: -89.2 },
  // ... más ubicaciones
];
```

## 🛠️ Solución de Problemas

### Error: "API key inválida"
1. Verifica que el API key esté correcto en `.env.local`
2. Espera hasta 2 horas para activación
3. Revisa tu quota en OpenWeatherMap

### Error: "Ubicación no encontrada"
1. Verifica la ortografía del nombre de ciudad
2. Usa el formato: "Ciudad, Código de País"
3. Ejemplo: "San Salvador, SV"

### Notificaciones no funcionan
1. Acepta permisos de notificación en el navegador
2. Verifica configuración en Configuración > Notificaciones
3. Asegúrate que el sitio tenga permisos

### Datos desactualizados
1. Presiona el botón de actualización manual
2. Verifica conexión a internet
3. Revisa límites de API en OpenWeatherMap

## 📈 Métricas de Uso

### Monitoreo Incluido
- Número de llamadas a API por día
- Tiempo de respuesta promedio
- Tasa de error de llamadas
- Alertas enviadas por día

### Logs de Desarrollo
```javascript
// En consola del navegador
console.log('Weather API calls today:', localStorage.getItem('weatherApiCalls'));
console.log('Last weather update:', localStorage.getItem('lastWeatherUpdate'));
```

## 🔮 Futuras Mejoras

### Próximas Características
1. **Mapas meteorológicos** interactivos
2. **Histórico climático** para análisis de tendencias
3. **Predicciones ML** basadas en patrones locales
4. **Integración IoT** con sensores de campo
5. **Alertas por SMS** para áreas sin internet

### Integraciones Planeadas
- **Radares de lluvia** en tiempo real
- **Imágenes satelitales** de cultivos
- **Estaciones meteorológicas** locales
- **Modelos agrícolas** avanzados

## 📞 Soporte

### Recursos
- **Documentación OpenWeatherMap**: https://openweathermap.org/api
- **Guías de uso**: https://openweathermap.org/guide
- **Estado del servicio**: https://status.openweathermap.org/

### Contacto
- Reporta problemas en el repositorio de GitHub
- Sugiere mejoras en las Issues
- Contribuye con Pull Requests

---

**Nota**: Esta integración meteorológica está diseñada específicamente para aplicaciones agrícolas, proporcionando datos relevantes para la toma de decisiones en el campo.
