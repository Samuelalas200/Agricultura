import { useState, useEffect } from 'react';
import { Download, Upload, Trash2, Settings, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { offlineService } from '../../services/offlineService';
import { useServiceWorker } from '../../hooks/useServiceWorker';

interface OfflineSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OfflineSettings({ isOpen, onClose }: OfflineSettingsProps) {
  const [syncStats, setSyncStats] = useState(offlineService.getSyncStats());
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const serviceWorker = useServiceWorker();

  useEffect(() => {
    if (isOpen) {
      updateStats();
      
      const handleSyncChange = () => updateStats();
      offlineService.addSyncListener(handleSyncChange);
      
      return () => {
        offlineService.removeSyncListener(handleSyncChange);
      };
    }
  }, [isOpen]);

  const updateStats = () => {
    setSyncStats(offlineService.getSyncStats());
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = offlineService.exportOfflineData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `campo360-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('success', 'Datos exportados correctamente');
    } catch (error) {
      showMessage('error', 'Error al exportar datos');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      offlineService.importOfflineData(text);
      updateStats();
      showMessage('success', 'Datos importados correctamente');
    } catch (error) {
      showMessage('error', 'Error al importar datos. Verifica el formato del archivo.');
    } finally {
      setIsImporting(false);
      // Resetear input
      event.target.value = '';
    }
  };

  const handleClearOfflineData = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los datos offline? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      offlineService.clearOfflineData();
      updateStats();
      showMessage('success', 'Datos offline eliminados');
    } catch (error) {
      showMessage('error', 'Error al eliminar datos offline');
    }
  };

  const handleClearCache = async () => {
    if (!confirm('¿Estás seguro de que quieres limpiar la caché? Esto puede afectar el rendimiento offline.')) {
      return;
    }

    try {
      setIsClearingCache(true);
      const success = await serviceWorker.clearCache();
      if (success) {
        showMessage('success', 'Caché limpiada correctamente');
      } else {
        showMessage('error', 'Error al limpiar la caché');
      }
    } catch (error) {
      showMessage('error', 'Error al limpiar la caché');
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleManualSync = async () => {
    if (!syncStats.isOnline) {
      showMessage('error', 'No hay conexión disponible');
      return;
    }

    try {
      await offlineService.syncPendingData();
      updateStats();
      showMessage('success', 'Sincronización completada');
    } catch (error) {
      showMessage('error', 'Error en la sincronización');
    }
  };

  const formatDataSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageUsage = () => {
    try {
      const data = localStorage.getItem('campo360_offline_data');
      return data ? new Blob([data]).size : 0;
    } catch {
      return 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración Offline
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Mensaje de estado */}
          {message && (
            <div className={`p-3 rounded-md flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

          {/* Estado de conexión */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Estado de Conexión</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                <div className={`flex items-center ${syncStats.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {syncStats.isOnline ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
                  {syncStats.isOnline ? 'En línea' : 'Sin conexión'}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Operaciones pendientes:</span>
                <span className="text-sm font-medium text-yellow-600">{syncStats.pendingCount}</span>
              </div>
              
              {syncStats.failedOperations > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Operaciones fallidas:</span>
                  <span className="text-sm font-medium text-red-600">{syncStats.failedOperations}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Última sincronización:</span>
                <span className="text-sm text-gray-800">
                  {syncStats.lastSync 
                    ? new Date(syncStats.lastSync).toLocaleString()
                    : 'Nunca'
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Almacenamiento usado:</span>
                <span className="text-sm text-gray-800">{formatDataSize(getStorageUsage())}</span>
              </div>
            </div>
            
            {/* Botón de sincronización manual */}
            {syncStats.isOnline && syncStats.pendingCount > 0 && (
              <button
                onClick={handleManualSync}
                className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Sincronizar ahora ({syncStats.pendingCount} pendientes)
              </button>
            )}
          </div>

          {/* Backup y Restauración */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Backup y Restauración</h3>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exportando...' : 'Exportar datos offline'}
              </button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <button
                  disabled={isImporting}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importando...' : 'Importar datos offline'}
                </button>
              </div>
            </div>
          </div>

          {/* Mantenimiento */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Mantenimiento</h3>
            <div className="space-y-3">
              <button
                onClick={handleClearCache}
                disabled={isClearingCache}
                className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                {isClearingCache ? 'Limpiando...' : 'Limpiar caché de la aplicación'}
              </button>
              
              <button
                onClick={handleClearOfflineData}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar todos los datos offline
              </button>
            </div>
          </div>

          {/* Service Worker Info */}
          {serviceWorker.isRegistered && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Service Worker</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✓ Service Worker activo</p>
                <p>✓ Funcionalidades offline habilitadas</p>
                <p>✓ Cache automático de recursos</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default OfflineSettings;
