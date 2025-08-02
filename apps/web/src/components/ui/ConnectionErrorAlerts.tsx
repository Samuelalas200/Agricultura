import { useState, useEffect } from 'react';
import { X, Wifi, WifiOff, AlertTriangle, Info, ExternalLink } from 'lucide-react';

interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  duration?: number;
  actionUrl?: string;
  actionText?: string;
}

interface ConnectionErrorAlertsProps {
  className?: string;
  maxAlerts?: number;
}

export function ConnectionErrorAlerts({ 
  className = '', 
  maxAlerts = 3 
}: ConnectionErrorAlertsProps) {
  const [alerts, setAlerts] = useState<ErrorNotification[]>([]);

  useEffect(() => {
    const handleFinancialError = (event: CustomEvent) => {
      const { errorKey, message, type = 'error', actionUrl, actionText } = event.detail;
      
      addAlert({
        id: errorKey,
        type,
        message,
        duration: type === 'error' ? 10000 : 5000,
        actionUrl,
        actionText
      });
    };

    const handleOnline = () => {
      addAlert({
        id: 'connection-restored',
        type: 'info',
        message: '🟢 Conexión restaurada. Sincronizando datos...',
        duration: 3000
      });
    };

    const handleOffline = () => {
      addAlert({
        id: 'connection-lost',
        type: 'warning',
        message: '🟡 Sin conexión. Trabajando en modo offline.',
        duration: 0 // No auto-hide
      });
    };

    // Escuchar eventos personalizados
    window.addEventListener('financial-error', handleFinancialError as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('financial-error', handleFinancialError as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addAlert = (alertData: Omit<ErrorNotification, 'timestamp'>) => {
    const newAlert: ErrorNotification = {
      ...alertData,
      timestamp: new Date()
    };

    setAlerts(prev => {
      // Remover alerta existente con el mismo ID
      const filtered = prev.filter(alert => alert.id !== newAlert.id);
      
      // Agregar nueva alerta y limitar el número máximo
      const updated = [newAlert, ...filtered].slice(0, maxAlerts);
      
      // Auto-hide si tiene duración
      if (newAlert.duration && newAlert.duration > 0) {
        setTimeout(() => {
          removeAlert(newAlert.id);
        }, newAlert.duration);
      }
      
      return updated;
    });
  };

  const removeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: ErrorNotification['type']) => {
    switch (type) {
      case 'error':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Wifi className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertStyles = (type: ErrorNotification['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`} style={{ maxWidth: '400px' }}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 shadow-lg transition-all duration-300 ${getAlertStyles(alert.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getAlertIcon(alert.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-5">
                {alert.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {alert.timestamp.toLocaleTimeString()}
              </p>
              
              {/* Botón de acción si existe */}
              {alert.actionUrl && alert.actionText && (
                <a
                  href={alert.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {alert.actionText}
                </a>
              )}
            </div>
            
            <button
              onClick={() => removeAlert(alert.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Barra de progreso para alertas con duración */}
          {alert.duration && alert.duration > 0 && (
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-current h-1 rounded-full transition-all ease-linear"
                style={{
                  width: '100%',
                  animation: `progressShrink ${alert.duration}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      ))}
      
      {/* Estilos para la animación */}
      <style>{`
        @keyframes progressShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Hook para mostrar alertas programáticamente
export function useConnectionAlerts() {
  const showError = (message: string, id?: string) => {
    window.dispatchEvent(new CustomEvent('financial-error', {
      detail: { 
        errorKey: id || `error-${Date.now()}`,
        message, 
        type: 'error' 
      }
    }));
  };

  const showWarning = (message: string, id?: string) => {
    window.dispatchEvent(new CustomEvent('financial-error', {
      detail: { 
        errorKey: id || `warning-${Date.now()}`,
        message, 
        type: 'warning' 
      }
    }));
  };

  const showInfo = (message: string, id?: string) => {
    window.dispatchEvent(new CustomEvent('financial-error', {
      detail: { 
        errorKey: id || `info-${Date.now()}`,
        message, 
        type: 'info' 
      }
    }));
  };

  return {
    showError,
    showWarning,
    showInfo
  };
}

export default ConnectionErrorAlerts;
