import { useState, useEffect } from 'react';
import { offlineService } from '../../services/offlineService';
import { Wifi, WifiOff, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SyncStatusProps {
  className?: string;
}

export function SyncStatus({ className = '' }: SyncStatusProps) {
  const [syncStats, setSyncStats] = useState({
    pendingCount: 0,
    lastSync: null as Date | null,
    isOnline: true,
    failedOperations: 0
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Actualizar estadísticas iniciales
    updateSyncStats();

    // Suscribirse a cambios de sincronización
    const handleSyncChange = () => {
      updateSyncStats();
    };

    offlineService.addSyncListener(handleSyncChange);

    // Listener para cambios de conectividad
    const handleOnline = () => {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        updateSyncStats();
      }, 2000);
    };

    const handleOffline = () => {
      updateSyncStats();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      offlineService.removeSyncListener(handleSyncChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateSyncStats = () => {
    setSyncStats(offlineService.getSyncStats());
  };

  const handleManualSync = async () => {
    if (syncStats.isOnline && syncStats.pendingCount > 0) {
      setIsConnecting(true);
      try {
        await offlineService.syncPendingData();
      } catch (error) {
        console.error('Error en sincronización manual:', error);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const getStatusColor = () => {
    if (!syncStats.isOnline) return 'text-red-500';
    if (syncStats.failedOperations > 0) return 'text-yellow-500';
    if (syncStats.pendingCount > 0) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (isConnecting) {
      return <Upload className="w-4 h-4 animate-pulse" />;
    }
    
    if (!syncStats.isOnline) {
      return <WifiOff className="w-4 h-4" />;
    }
    
    if (syncStats.failedOperations > 0) {
      return <AlertCircle className="w-4 h-4" />;
    }
    
    if (syncStats.pendingCount > 0) {
      return <Clock className="w-4 h-4" />;
    }
    
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isConnecting) return 'Sincronizando...';
    if (!syncStats.isOnline) return 'Sin conexión';
    if (syncStats.failedOperations > 0) return `${syncStats.failedOperations} errores`;
    if (syncStats.pendingCount > 0) return `${syncStats.pendingCount} pendientes`;
    return 'Sincronizado';
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Hace un momento';
    if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Indicador principal */}
      <div className="flex items-center space-x-1">
        <div className={`${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Botón de sincronización manual */}
      {syncStats.isOnline && syncStats.pendingCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={isConnecting}
          className="p-1 text-blue-500 hover:text-blue-600 disabled:opacity-50 transition-colors"
          title="Sincronizar ahora"
        >
          <Upload className={`w-4 h-4 ${isConnecting ? 'animate-pulse' : ''}`} />
        </button>
      )}

      {/* Tooltip con información detallada */}
      <div className="relative group">
        <div className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help">
          <Wifi className="w-4 h-4" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Estado:</span>
              <span className={syncStats.isOnline ? 'text-green-400' : 'text-red-400'}>
                {syncStats.isOnline ? 'En línea' : 'Sin conexión'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Operaciones pendientes:</span>
              <span className="text-yellow-400">{syncStats.pendingCount}</span>
            </div>
            
            {syncStats.failedOperations > 0 && (
              <div className="flex justify-between">
                <span>Operaciones fallidas:</span>
                <span className="text-red-400">{syncStats.failedOperations}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Última sincronización:</span>
              <span className="text-gray-300">{formatLastSync(syncStats.lastSync)}</span>
            </div>
            
            {!syncStats.isOnline && (
              <div className="mt-2 pt-2 border-t border-gray-700 text-yellow-300">
                Los datos se guardan localmente y se sincronizarán cuando recuperes la conexión.
              </div>
            )}
          </div>
          
          {/* Flecha del tooltip */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}

export default SyncStatus;
