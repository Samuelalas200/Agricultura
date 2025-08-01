import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { weatherService, WeatherData as WeatherServiceData } from '../../services/weatherService';
import { LocationSelector } from '../weather/LocationSelector';

export function WeatherAlerts() {
  const [weather, setWeather] = useState<WeatherServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('San Salvador');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, [location, coordinates]);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: WeatherServiceData;
      if (coordinates) {
        data = await weatherService.getWeatherData(coordinates.lat, coordinates.lon);
      } else {
        data = await weatherService.getWeatherByCity(location);
      }
      
      setWeather(data);
    } catch (err) {
      console.error('Error loading weather data:', err);
      setError('No se pudo cargar la información meteorológica');
      // Usar datos mock en caso de error para que la app siga funcionando
      try {
        const mockData = await weatherService.getWeatherByCity('mock');
        setWeather(mockData);
      } catch {
        // Si incluso los datos mock fallan, usar datos hardcoded
        setWeather(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (newLocation: string, coords?: { lat: number; lon: number }) => {
    setLocation(newLocation);
    setCoordinates(coords || null);
  };

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, any> = {
      '01d': Sun, '01n': Sun,
      '02d': Cloud, '02n': Cloud,
      '03d': Cloud, '03n': Cloud,
      '04d': Cloud, '04n': Cloud,
      '09d': CloudRain, '09n': CloudRain,
      '10d': CloudRain, '10n': CloudRain,
      '11d': CloudRain, '11n': CloudRain,
      '13d': Cloud, '13n': Cloud,
      '50d': Cloud, '50n': Cloud,
    };
    
    const IconComponent = iconMap[iconCode] || Cloud;
    return <IconComponent className="w-8 h-8" />;
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'border-red-500 bg-red-50 text-red-800';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-blue-500 bg-blue-50 text-blue-800';
      default: return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rain': return <CloudRain className="w-5 h-5" />;
      case 'frost': return <Thermometer className="w-5 h-5" />;
      case 'wind': return <Wind className="w-5 h-5" />;
      case 'drought': return <Sun className="w-5 h-5" />;
      case 'hail': return <Cloud className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getConditionColor = (temp: number, humidity: number) => {
    if (temp > 35 || temp < 5) return 'text-red-600';
    if (humidity > 90 || humidity < 20) return 'text-orange-600';
    return 'text-green-600';
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIrrigationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'heavy': return 'text-blue-800 bg-blue-100';
      case 'moderate': return 'text-blue-600 bg-blue-50';
      case 'light': return 'text-green-600 bg-green-50';
      case 'none': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            Estado del Clima
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Cargando datos meteorológicos...</span>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            Estado del Clima
          </h3>
        </div>
        <div className="text-center py-8 text-red-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
          <button 
            onClick={loadWeatherData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            Estado del Clima
          </h3>
          <div className="flex items-center space-x-2">
            <LocationSelector
              currentLocation={location}
              onLocationChange={handleLocationChange}
              className="hidden sm:block"
            />
            <button 
              onClick={loadWeatherData}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <Cloud className="w-4 h-4 mr-1" />
          {weather.location}
        </div>
        <div className="sm:hidden mt-2">
          <LocationSelector
            currentLocation={location}
            onLocationChange={handleLocationChange}
          />
        </div>
      </div>

      {/* Condiciones actuales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            {getWeatherIcon(weather.icon)}
          </div>
          <p className={`text-2xl font-bold ${getConditionColor(weather.temperature, weather.humidity)}`}>
            {weather.temperature}°C
          </p>
          <p className="text-xs text-gray-600 capitalize">{weather.description}</p>
        </div>

        <div className="text-center">
          <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-lg font-semibold text-blue-600">{weather.humidity}%</p>
          <p className="text-xs text-gray-600">Humedad</p>
        </div>

        <div className="text-center">
          <Wind className="w-6 h-6 mx-auto mb-2 text-gray-500" />
          <p className="text-lg font-semibold text-gray-700">{weather.windSpeed} km/h</p>
          <p className="text-xs text-gray-600">Viento</p>
        </div>

        <div className="text-center">
          <Thermometer className="w-6 h-6 mx-auto mb-2 text-orange-500" />
          <p className="text-lg font-semibold text-orange-600">{weather.uvIndex}</p>
          <p className="text-xs text-gray-600">Índice UV</p>
        </div>
      </div>

      {/* Información meteorológica adicional */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center">
          <Cloud className="w-4 h-4 mr-2" />
          Datos Meteorológicos Detallados
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Presión Atmosférica</p>
            <p className="font-semibold">{weather.pressure} hPa</p>
            <p className="text-xs text-gray-500">
              {weather.pressure > 1013 ? '↗️ Alta' : weather.pressure < 1000 ? '↘️ Baja' : '→ Normal'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600">Visibilidad</p>
            <p className="font-semibold">{weather.visibility} km</p>
            <p className="text-xs text-gray-500">
              {weather.visibility > 10 ? '👁️ Excelente' : weather.visibility > 5 ? '😐 Buena' : '🌫️ Limitada'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600">Dirección del Viento</p>
            <p className="font-semibold">{weather.windDirection}°</p>
            <p className="text-xs text-gray-500">
              {weather.windDirection >= 315 || weather.windDirection < 45 ? '⬆️ Norte' :
               weather.windDirection >= 45 && weather.windDirection < 135 ? '➡️ Este' :
               weather.windDirection >= 135 && weather.windDirection < 225 ? '⬇️ Sur' : '⬅️ Oeste'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600">Nubosidad</p>
            <p className="font-semibold">{weather.cloudCover}%</p>
            <p className="text-xs text-gray-500">
              {weather.cloudCover < 25 ? '☀️ Despejado' : 
               weather.cloudCover < 50 ? '🌤️ Parcial' :
               weather.cloudCover < 75 ? '⛅ Nublado' : '☁️ Cubierto'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <p className="text-gray-600">Última actualización</p>
            <p className="font-semibold">{new Date(weather.timestamp).toLocaleString('es-ES')}</p>
          </div>
          
          <div>
            <p className="text-gray-600">Condiciones generales</p>
            <p className="font-semibold capitalize">
              {weather.cloudCover < 20 && weather.windSpeed < 15 ? '🌞 Excelente para campo' :
               weather.cloudCover < 50 && weather.windSpeed < 25 ? '🌤️ Buenas condiciones' :
               weather.humidity > 80 || weather.windSpeed > 30 ? '⚠️ Condiciones adversas' : '😐 Condiciones regulares'}
            </p>
          </div>
        </div>
      </div>

      {/* Datos agrícolas */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-800 mb-3 flex items-center">
          <Sun className="w-4 h-4 mr-2" />
          Información Agrícola Especializada
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-600">Temp. Suelo</p>
            <p className="font-semibold">{weather.agricultural.soilTemperature}°C</p>
            <p className="text-xs text-gray-500">
              {weather.agricultural.soilTemperature > 25 ? '🔥 Caliente' : 
               weather.agricultural.soilTemperature > 15 ? '🌡️ Óptima' : '❄️ Fría'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-600">Evapotranspiración</p>
            <p className="font-semibold">{weather.agricultural.evapotranspiration} mm</p>
            <p className="text-xs text-gray-500">ET0 diaria</p>
          </div>
          
          <div>
            <p className="text-gray-600">Días Grado</p>
            <p className="font-semibold">{Math.round(weather.agricultural.growingDegreeDays)}</p>
            <p className="text-xs text-gray-500">Base 10°C</p>
          </div>
          
          <div>
            <p className="text-gray-600">Riego</p>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getIrrigationColor(weather.agricultural.irrigationRecommendation)}`}>
              {weather.agricultural.irrigationRecommendation === 'none' ? 'No necesario' :
               weather.agricultural.irrigationRecommendation === 'light' ? 'Ligero' :
               weather.agricultural.irrigationRecommendation === 'moderate' ? 'Moderado' : 'Intenso'}
            </span>
          </div>
        </div>

        {/* Condiciones para actividades agrícolas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-white rounded border">
            <h5 className="font-medium text-gray-800 mb-2">🌱 Condiciones de Siembra</h5>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                weather.agricultural.plantingConditions === 'excellent' ? 'bg-green-100 text-green-800' :
                weather.agricultural.plantingConditions === 'good' ? 'bg-green-50 text-green-700' :
                weather.agricultural.plantingConditions === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {weather.agricultural.plantingConditions === 'excellent' ? 'Excelente' :
                 weather.agricultural.plantingConditions === 'good' ? 'Buena' :
                 weather.agricultural.plantingConditions === 'fair' ? 'Regular' : 'Pobre'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-white rounded border">
            <h5 className="font-medium text-gray-800 mb-2">🚜 Condiciones de Cosecha</h5>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                weather.agricultural.harvestConditions === 'excellent' ? 'bg-green-100 text-green-800' :
                weather.agricultural.harvestConditions === 'good' ? 'bg-green-50 text-green-700' :
                weather.agricultural.harvestConditions === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {weather.agricultural.harvestConditions === 'excellent' ? 'Excelente' :
                 weather.agricultural.harvestConditions === 'good' ? 'Buena' :
                 weather.agricultural.harvestConditions === 'fair' ? 'Regular' : 'Pobre'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">🐛 Riesgo de plagas:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskBadgeColor(weather.agricultural.pestRisk)}`}>
              {weather.agricultural.pestRisk === 'low' ? 'Bajo' : 
               weather.agricultural.pestRisk === 'medium' ? 'Medio' : 'Alto'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">🦠 Riesgo de enfermedades:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskBadgeColor(weather.agricultural.diseaseRisk)}`}>
              {weather.agricultural.diseaseRisk === 'low' ? 'Bajo' : 
               weather.agricultural.diseaseRisk === 'medium' ? 'Medio' : 'Alto'}
            </span>
          </div>
        </div>

        {/* Recomendaciones agrícolas automáticas */}
        <div className="mt-4 p-3 bg-emerald-50 rounded border border-emerald-200">
          <h5 className="font-medium text-emerald-800 mb-2">💡 Recomendaciones del día</h5>
          <ul className="text-xs text-emerald-700 space-y-1">
            {weather.agricultural.irrigationRecommendation === 'heavy' && (
              <li>• Riego intensivo recomendado debido a las condiciones secas</li>
            )}
            {weather.agricultural.irrigationRecommendation === 'none' && weather.humidity > 80 && (
              <li>• Excelentes condiciones de humedad, no se necesita riego</li>
            )}
            {weather.agricultural.pestRisk === 'high' && (
              <li>• Monitorear cultivos por posible actividad de plagas</li>
            )}
            {weather.agricultural.diseaseRisk === 'high' && (
              <li>• Aplicar medidas preventivas contra enfermedades</li>
            )}
            {weather.agricultural.plantingConditions === 'excellent' && (
              <li>• Condiciones ideales para siembra de nuevos cultivos</li>
            )}
            {weather.agricultural.harvestConditions === 'excellent' && (
              <li>• Excelente momento para actividades de cosecha</li>
            )}
            {weather.windSpeed > 25 && (
              <li>• Evitar aplicaciones de pesticidas debido a vientos fuertes</li>
            )}
            {weather.uvIndex > 7 && (
              <li>• Proteger trabajadores del campo con alta radiación UV</li>
            )}
          </ul>
        </div>
      </div>

      {/* Alertas meteorológicas */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
            Alertas Agrícolas ({weather.alerts.length})
          </h4>
          
          {weather.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-3 ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm">{alert.title}</h5>
                  <p className="text-xs mt-1 opacity-90">{alert.description}</p>
                  
                  {alert.recommendations && alert.recommendations.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Recomendaciones:</p>
                      <ul className="text-xs mt-1 space-y-1">
                        {alert.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pronóstico extendido */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">Pronóstico de 7 días</h4>
          
          {/* Vista móvil: primeros 3 días */}
          <div className="grid grid-cols-3 gap-2 text-xs md:hidden">
            {weather.forecast.slice(0, 3).map((day, index) => (
              <div key={index} className="text-center p-2 bg-gray-50 rounded">
                <p className="font-medium">{new Date(day.date).toLocaleDateString('es', { weekday: 'short' })}</p>
                <div className="my-1 flex justify-center">{getWeatherIcon(day.icon)}</div>
                <p className="font-semibold">{day.maxTemp}°/{day.minTemp}°</p>
                <p className="text-blue-600">{day.precipitationChance}%</p>
                <p className="text-xs text-gray-500">{day.windSpeed} km/h</p>
              </div>
            ))}
          </div>

          {/* Vista escritorio: 7 días completos */}
          <div className="hidden md:block overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 text-xs">
              {weather.forecast.slice(0, 7).map((day, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg min-w-0">
                  <p className="font-medium text-gray-800 mb-1">
                    {index === 0 ? 'Hoy' : 
                     index === 1 ? 'Mañana' :
                     new Date(day.date).toLocaleDateString('es', { weekday: 'short' })}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    {new Date(day.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                  </p>
                  
                  <div className="my-2 flex justify-center">{getWeatherIcon(day.icon)}</div>
                  
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">{day.maxTemp}°/{day.minTemp}°</p>
                    <p className="text-blue-600 flex items-center justify-center">
                      <Droplets className="w-3 h-3 mr-1" />
                      {day.precipitationChance}%
                    </p>
                    <p className="text-gray-600 flex items-center justify-center">
                      <Wind className="w-3 h-3 mr-1" />
                      {day.windSpeed} km/h
                    </p>
                    <p className="text-gray-600">{day.humidity}% hum</p>
                    {day.precipitation > 0 && (
                      <p className="text-blue-700 font-medium">{day.precipitation}mm lluvia</p>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2 capitalize leading-tight">
                    {day.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen del pronóstico */}
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <h5 className="font-medium text-indigo-800 mb-2">📊 Resumen Semanal</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-gray-600">Temp. Promedio</p>
                <p className="font-semibold">
                  {Math.round(weather.forecast.slice(0, 7).reduce((acc, day) => acc + (day.maxTemp + day.minTemp) / 2, 0) / 7)}°C
                </p>
              </div>
              <div>
                <p className="text-gray-600">Días con lluvia</p>
                <p className="font-semibold text-blue-600">
                  {weather.forecast.slice(0, 7).filter(day => day.precipitationChance > 30).length}/7
                </p>
              </div>
              <div>
                <p className="text-gray-600">Humedad promedio</p>
                <p className="font-semibold">
                  {Math.round(weather.forecast.slice(0, 7).reduce((acc, day) => acc + day.humidity, 0) / 7)}%
                </p>
              </div>
              <div>
                <p className="text-gray-600">Viento promedio</p>
                <p className="font-semibold">
                  {Math.round(weather.forecast.slice(0, 7).reduce((acc, day) => acc + day.windSpeed, 0) / 7)} km/h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800 text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span>Mostrando datos de respaldo. {error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
