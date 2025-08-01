import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, AlertTriangle, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { weatherService, WeatherData as WeatherServiceData } from '../../services/weatherService';

export function WeatherAlerts() {
  const [weather, setWeather] = useState<WeatherServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('San Salvador'); // Ubicación por defecto

  useEffect(() => {
    loadWeatherData();
  }, [location]);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weatherService.getWeatherByCity(location);
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
          <button 
            onClick={loadWeatherData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <MapPin className="w-4 h-4 mr-1" />
          {weather.location}
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

      {/* Datos agrícolas */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-800 mb-3 flex items-center">
          <Sun className="w-4 h-4 mr-2" />
          Información Agrícola
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Temp. Suelo</p>
            <p className="font-semibold">{weather.agricultural.soilTemperature}°C</p>
          </div>
          
          <div>
            <p className="text-gray-600">Evapotranspiración</p>
            <p className="font-semibold">{weather.agricultural.evapotranspiration} mm</p>
          </div>
          
          <div>
            <p className="text-gray-600">Días Grado</p>
            <p className="font-semibold">{Math.round(weather.agricultural.growingDegreeDays)}</p>
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

        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Riesgo de plagas:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskBadgeColor(weather.agricultural.pestRisk)}`}>
              {weather.agricultural.pestRisk === 'low' ? 'Bajo' : 
               weather.agricultural.pestRisk === 'medium' ? 'Medio' : 'Alto'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Riesgo de enfermedades:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskBadgeColor(weather.agricultural.diseaseRisk)}`}>
              {weather.agricultural.diseaseRisk === 'low' ? 'Bajo' : 
               weather.agricultural.diseaseRisk === 'medium' ? 'Medio' : 'Alto'}
            </span>
          </div>
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

      {/* Pronóstico corto */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">Próximos días</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {weather.forecast.slice(0, 3).map((day, index) => (
              <div key={index} className="text-center p-2 bg-gray-50 rounded">
                <p className="font-medium">{new Date(day.date).toLocaleDateString('es', { weekday: 'short' })}</p>
                <div className="my-1">{getWeatherIcon(day.icon)}</div>
                <p className="font-semibold">{day.maxTemp}°/{day.minTemp}°</p>
                <p className="text-blue-600">{day.precipitationChance}%</p>
              </div>
            ))}
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
