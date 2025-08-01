import { useState } from 'react';
import { Bell, BellRing, X, Settings, Cloud, AlertTriangle } from 'lucide-react';
import { WeatherAlert } from '../../services/weatherService';

interface WeatherNotificationsPanelProps {
  notifications: WeatherAlert[];
  unreadCount: number;
  onMarkAsRead: (alertId: string) => void;
  onClearAll: () => void;
  onOpenSettings?: () => void;
}

export function WeatherNotificationsPanel({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onClearAll,
  onOpenSettings 
}: WeatherNotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rain': return '🌧️';
      case 'frost': return '❄️';
      case 'wind': return '💨';
      case 'drought': return '☀️';
      case 'hail': return '🧊';
      case 'extreme_temp': return '🌡️';
      default: return '⚠️';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'Extrema';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Desconocida';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es', { 
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Alertas meteorológicas"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        
        {/* Badge de notificaciones no leídas */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Alertas Meteorológicas</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                  title="Configurar notificaciones"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Cloud className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay alertas meteorológicas</p>
                <p className="text-xs text-gray-400 mt-1">Te notificaremos cuando haya cambios importantes</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {notifications.map((alert) => (
                  <div
                    key={alert.id}
                    className={`relative p-3 rounded-lg border ${getAlertColor(alert.severity)} transition-colors`}
                  >
                    {/* Botón de cerrar individual */}
                    <button
                      onClick={() => onMarkAsRead(alert.id)}
                      className="absolute top-2 right-2 p-1 hover:bg-white hover:bg-opacity-50 rounded text-current opacity-70 hover:opacity-100"
                      title="Marcar como leída"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Contenido de la alerta */}
                    <div className="pr-6">
                      <div className="flex items-start space-x-2 mb-2">
                        <span className="text-lg">{getAlertIcon(alert.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm leading-tight">{alert.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs opacity-75">
                              Severidad: {getSeverityText(alert.severity)}
                            </span>
                            <span className="text-xs opacity-75">
                              {formatDate(alert.startTime)} {formatTime(alert.startTime)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed opacity-90 mb-2">
                        {alert.description}
                      </p>

                      {/* Recomendaciones */}
                      {alert.recommendations && alert.recommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium opacity-90 mb-1">Recomendaciones:</p>
                          <ul className="text-xs space-y-1 opacity-80">
                            {alert.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                            {alert.recommendations.length > 2 && (
                              <li className="text-xs opacity-60">
                                +{alert.recommendations.length - 2} más...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Duración de la alerta */}
                      <div className="flex items-center mt-2 text-xs opacity-75">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        <span>
                          Hasta: {formatDate(alert.endTime)} {formatTime(alert.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer con acciones */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClearAll}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                Marcar todas como leídas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
