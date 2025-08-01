import { useState } from 'react';
import { Cloud, RefreshCw, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { weatherService } from '../../services/weatherService';

export function WeatherTestComponent() {
  const [location, setLocation] = useState('San Salvador');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiStatus, setApiStatus] = useState<'unknown' | 'working' | 'error'>('unknown');

  const testWeatherAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.getWeatherByCity(location);
      setWeatherData(data);
      setApiStatus('working');
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos meteorológicos');
      setApiStatus('error');
      
      // Try to load mock data to show the interface
      try {
        const mockData = await weatherService.getWeatherByCity('mock');
        setWeatherData(mockData);
      } catch {
        setWeatherData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const testApiKey = async () => {
    if (!apiKey) {
      setError('Por favor ingresa un API key');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=San Salvador&appid=${apiKey}`
      );
      
      if (response.ok) {
        setApiStatus('working');
        setError(null);
      } else {
        setApiStatus('error');
        setError('API key inválido o problema de conexión');
      }
    } catch (err) {
      setApiStatus('error');
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🌤️ Prueba de Integración Meteorológica
        </h1>
        <p className="text-gray-600">
          Prueba la nueva funcionalidad de clima de Campo360 Manager
        </p>
      </div>

      {/* API Key Test */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Cloud className="w-5 h-5 mr-2" />
          1. Verificación de API Key
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenWeatherMap API Key (opcional para prueba)
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu API key para probar..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={testApiKey}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Probar'}
              </button>
            </div>
          </div>

          {apiStatus !== 'unknown' && (
            <div className={`flex items-center space-x-2 ${
              apiStatus === 'working' ? 'text-green-600' : 'text-red-600'
            }`}>
              {apiStatus === 'working' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm">
                {apiStatus === 'working' 
                  ? '✅ API Key funcionando correctamente' 
                  : '❌ Problema con API Key o conexión'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Location Test */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          2. Prueba de Ubicación
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad a consultar
            </label>
            <div className="flex space-x-2">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="San Salvador">San Salvador, El Salvador</option>
                <option value="Santa Ana">Santa Ana, El Salvador</option>
                <option value="San Miguel">San Miguel, El Salvador</option>
                <option value="mock">Datos Mock (sin API)</option>
              </select>
              <button
                onClick={testWeatherAPI}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
                <span>Consultar</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
              {error.includes('No se pudo cargar') && (
                <p className="text-xs text-red-500 mt-1">
                  ℹ️ Sin API key configurado. Mostrando datos de demostración.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Weather Data Display */}
      {weatherData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">
            3. ✅ Datos Meteorológicos Obtenidos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Weather Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Condiciones Actuales</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>📍 Ubicación:</span>
                  <span className="font-medium">{weatherData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>🌡️ Temperatura:</span>
                  <span className="font-medium">{weatherData.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>💧 Humedad:</span>
                  <span className="font-medium">{weatherData.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>💨 Viento:</span>
                  <span className="font-medium">{weatherData.windSpeed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span>☀️ Índice UV:</span>
                  <span className="font-medium">{weatherData.uvIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span>📝 Descripción:</span>
                  <span className="font-medium capitalize">{weatherData.description}</span>
                </div>
              </div>
            </div>

            {/* Agricultural Data */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Datos Agrícolas</h3>
              <div className="bg-green-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>🌱 Temp. Suelo:</span>
                  <span className="font-medium">{weatherData.agricultural.soilTemperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>💦 Evapotranspiración:</span>
                  <span className="font-medium">{weatherData.agricultural.evapotranspiration} mm</span>
                </div>
                <div className="flex justify-between">
                  <span>📈 Días Grado:</span>
                  <span className="font-medium">{Math.round(weatherData.agricultural.growingDegreeDays)}</span>
                </div>
                <div className="flex justify-between">
                  <span>🚿 Riego:</span>
                  <span className="font-medium capitalize">
                    {weatherData.agricultural.irrigationRecommendation === 'none' ? 'No necesario' :
                     weatherData.agricultural.irrigationRecommendation === 'light' ? 'Ligero' :
                     weatherData.agricultural.irrigationRecommendation === 'moderate' ? 'Moderado' : 'Intenso'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>🐛 Riesgo Plagas:</span>
                  <span className={`font-medium ${
                    weatherData.agricultural.pestRisk === 'low' ? 'text-green-600' :
                    weatherData.agricultural.pestRisk === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {weatherData.agricultural.pestRisk === 'low' ? 'Bajo' : 
                     weatherData.agricultural.pestRisk === 'medium' ? 'Medio' : 'Alto'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>🦠 Riesgo Enfermedades:</span>
                  <span className={`font-medium ${
                    weatherData.agricultural.diseaseRisk === 'low' ? 'text-green-600' :
                    weatherData.agricultural.diseaseRisk === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {weatherData.agricultural.diseaseRisk === 'low' ? 'Bajo' : 
                     weatherData.agricultural.diseaseRisk === 'medium' ? 'Medio' : 'Alto'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {weatherData.alerts && weatherData.alerts.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">⚠️ Alertas Meteorológicas</h3>
              <div className="space-y-3">
                {weatherData.alerts.map((alert: any, index: number) => (
                  <div key={index} className="border-l-4 border-orange-400 bg-orange-50 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-orange-800">{alert.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === 'extreme' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity === 'extreme' ? 'Extrema' :
                         alert.severity === 'high' ? 'Alta' :
                         alert.severity === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                    <p className="text-orange-700 text-sm mb-2">{alert.description}</p>
                    {alert.recommendations && (
                      <div>
                        <p className="text-xs font-medium text-orange-800 mb-1">Recomendaciones:</p>
                        <ul className="text-xs text-orange-700 space-y-1">
                          {alert.recommendations.slice(0, 2).map((rec: string, i: number) => (
                            <li key={i}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forecast */}
          {weatherData.forecast && weatherData.forecast.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">📅 Pronóstico (3 días)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weatherData.forecast.slice(0, 3).map((day: any, index: number) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('es', { weekday: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xl font-bold text-blue-600 my-2">
                      {day.maxTemp}° / {day.minTemp}°
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{day.description}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Lluvia: {day.precipitationChance}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          📖 Instrucciones de Configuración
        </h2>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>1.</strong> Obtén un API key gratuito en: <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="underline">openweathermap.org/api</a></p>
          <p><strong>2.</strong> Crea un archivo <code>.env.local</code> en <code>apps/web/</code></p>
          <p><strong>3.</strong> Agrega: <code>VITE_OPENWEATHER_API_KEY=tu_api_key_aquí</code></p>
          <p><strong>4.</strong> Reinicia el servidor de desarrollo</p>
          <p><strong>Nota:</strong> Sin API key, la aplicación funciona con datos mock para demostración.</p>
        </div>
      </div>
    </div>
  );
}
