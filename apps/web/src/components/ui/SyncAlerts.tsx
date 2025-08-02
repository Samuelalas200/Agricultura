import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Upload } from 'lucide-react';

interface SyncAlert {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
  autoHide?: boolean;
}

interface SyncAlertsProps {
  className?: string;
  maxAlerts?: number;
  autoHideDuration?: number;
}

export function SyncAlerts({ 
  className = '',
  maxAlerts = 3,
  autoHideDuration = 5000
}: SyncAlertsProps) {
  const [alerts, setAlerts] = useState<SyncAlert[]>([]);

  useEffect(() => {
    // Escuchar eventos de sincronización
    const handleOnline = () => {
      addAlert({
        type: 'success',
        message: 'Conexión restaurada. Sincronizando datos...',
        autoHide: true
      });
    };

    const handleOffline = () => {
      addAlert({
        type: 'warning',
        message: 'Sin conexión. Los datos se guardarán localmente.',
        autoHide: false
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addAlert = (alertData: Omit<SyncAlert, 'id' | 'timestamp'>) => {
    const newAlert: SyncAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setAlerts(prev => {
      const updated = [newAlert, ...prev].slice(0, maxAlerts);
      
      // Auto-hide si está configurado
      if (newAlert.autoHide) {
        setTimeout(() => {
          removeAlert(newAlert.id);
        }, autoHideDuration);
      }
      
      return updated;
    });
  };

  const removeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: SyncAlert['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Upload className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getAlertStyles = (type: SyncAlert['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
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
    <div className={`space-y-2 ${className}`}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-md p-3 flex items-center justify-between ${getAlertStyles(alert.type)}`}
        >
          <div className="flex items-center space-x-2">
            {getAlertIcon(alert.type)}
            <span className="text-sm font-medium">{alert.message}</span>
          </div>
          
          <button
            onClick={() => removeAlert(alert.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Hook para usar las alertas desde cualquier componente
export function useSyncAlerts() {
  const showSyncSuccess = (message: string) => {
    window.dispatchEvent(new CustomEvent('syncAlert', {
      detail: { type: 'success', message, autoHide: true }
    }));
  };

  const showSyncError = (message: string) => {
    window.dispatchEvent(new CustomEvent('syncAlert', {
      detail: { type: 'error', message, autoHide: false }
    }));
  };

  const showSyncInfo = (message: string) => {
    window.dispatchEvent(new CustomEvent('syncAlert', {
      detail: { type: 'info', message, autoHide: true }
    }));
  };

  const showSyncWarning = (message: string) => {
    window.dispatchEvent(new CustomEvent('syncAlert', {
      detail: { type: 'warning', message, autoHide: false }
    }));
  };

  return {
    showSyncSuccess,
    showSyncError,
    showSyncInfo,
    showSyncWarning
  };
}

export default SyncAlerts;
