import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, AlertTriangle } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  description: string;
  alerts: WeatherAlert[];
}

interface WeatherAlert {
  id: string;
  type: 'rain' | 'frost' | 'wind' | 'drought';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  recommendation: string;
}

export function WeatherAlerts() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulamos datos meteorológicos - en una app real, esto vendría de una API meteorológica
  useEffect(() => {
    const fetchWeatherData = async () => {
      // Simulación de llamada a API meteorológica
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockWeatherData: WeatherData = {
        temperature: 24,
        humidity: 68,
        windSpeed: 12,
        condition: 'cloudy',
        description: 'Parcialmente nublado',
        alerts: [
          {
            id: '1',
            type: 'rain',
            severity: 'medium',
            title: 'Posible lluvia en las próximas 24h',
            message: 'Se prevén precipitaciones de 15-25mm',
            recommendation: 'Considera postergar la aplicación de fertilizantes foliares'
          },
          {
            id: '2',
            type: 'wind',
            severity: 'low',
            title: 'Vientos moderados',
            message: 'Vientos de 15-20 km/h esperados',
            recommendation: 'Evita aplicaciones de agroquímicos durante las horas de mayor viento'
          }
        ]
      };
      
      setWeather(mockWeatherData);
      setLoading(false);
    };

    fetchWeatherData();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'windy': return <Wind className="w-8 h-8 text-gray-600" />;
      default: return <Cloud className="w-8 h-8 text-gray-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rain': return <CloudRain className="w-5 h-5" />;
      case 'frost': return <Thermometer className="w-5 h-5" />;
      case 'wind': return <Wind className="w-5 h-5" />;
      case 'drought': return <Sun className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            Condiciones Meteorológicas
          </h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            Condiciones Meteorológicas
          </h3>
        </div>
        <div className="text-center py-4 text-gray-500">
          <p>No se pudieron cargar los datos meteorológicos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title flex items-center">
          <Cloud className="w-5 h-5 mr-2" />
          Condiciones Meteorológicas
        </h3>
      </div>

      {/* Condiciones actuales */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {getWeatherIcon(weather.condition)}
          <div>
            <p className="text-2xl font-bold text-gray-900">{weather.temperature}°C</p>
            <p className="text-sm text-gray-600">{weather.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
            <p className="text-xs text-gray-600">Humedad</p>
            <p className="text-sm font-medium">{weather.humidity}%</p>
          </div>
          <div>
            <Wind className="w-4 h-4 mx-auto text-gray-500 mb-1" />
            <p className="text-xs text-gray-600">Viento</p>
            <p className="text-sm font-medium">{weather.windSpeed} km/h</p>
          </div>
          <div>
            <Thermometer className="w-4 h-4 mx-auto text-red-500 mb-1" />
            <p className="text-xs text-gray-600">Sensación</p>
            <p className="text-sm font-medium">{weather.temperature + 2}°C</p>
          </div>
        </div>
      </div>

      {/* Alertas meteorológicas */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
            Alertas Agrícolas ({weather.alerts.length})
          </h4>
          
          {weather.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-3 ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-medium mb-1">{alert.title}</h5>
                  <p className="text-xs mb-2">{alert.message}</p>
                  <div className="bg-white bg-opacity-50 rounded p-2">
                    <p className="text-xs font-medium">💡 Recomendación:</p>
                    <p className="text-xs">{alert.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pronóstico semanal simplificado */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Pronóstico 7 días</h4>
        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => {
            const temp = weather.temperature + (Math.random() * 6 - 3);
            const conditions = ['sunny', 'cloudy', 'rainy', 'cloudy', 'sunny', 'cloudy', 'sunny'];
            return (
              <div key={day} className="text-center">
                <p className="text-xs text-gray-600 mb-1">{day}</p>
                <div className="flex justify-center mb-1">
                  {getWeatherIcon(conditions[index])}
                </div>
                <p className="text-xs font-medium">{Math.round(temp)}°</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consejos agrícolas */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
        <h5 className="text-sm font-medium text-green-800 mb-2">🌱 Consejos Agrícolas</h5>
        <ul className="text-xs text-green-700 space-y-1">
          <li>• Las condiciones actuales son favorables para el crecimiento de cultivos</li>
          <li>• Mantén un buen drenaje debido a la humedad moderada</li>
          <li>• Considera la aplicación de fertilizantes antes de las lluvias previstas</li>
        </ul>
      </div>
    </div>
  );
}
