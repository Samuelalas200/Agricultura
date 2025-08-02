import { useState, useEffect, useCallback } from 'react';
import { offlineService } from '../services/offlineService';

interface UseOfflineDataOptions {
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
  autoSync?: boolean;
}

export function useOfflineData(options: UseOfflineDataOptions = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStats, setSyncStats] = useState(offlineService.getSyncStats());
  const [isSyncing, setIsSyncing] = useState(false);

  // Actualizar estadísticas de sincronización
  const updateSyncStats = useCallback(() => {
    setSyncStats(offlineService.getSyncStats());
  }, []);

  // Sincronización manual
  const syncData = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      await offlineService.syncPendingData();
      options.onSyncComplete?.();
    } catch (error) {
      options.onSyncError?.(error as Error);
    } finally {
      setIsSyncing(false);
      updateSyncStats();
    }
  }, [isOnline, isSyncing, options, updateSyncStats]);

  useEffect(() => {
    // Listeners para cambios de conectividad
    const handleOnline = () => {
      setIsOnline(true);
      if (options.autoSync !== false) {
        syncData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateSyncStats();
    };

    // Listener para cambios de sincronización
    const handleSyncChange = () => {
      updateSyncStats();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    offlineService.addSyncListener(handleSyncChange);

    // Sincronización inicial si está online
    if (isOnline && options.autoSync !== false && syncStats.pendingCount > 0) {
      syncData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      offlineService.removeSyncListener(handleSyncChange);
    };
  }, [syncData, updateSyncStats, options.autoSync, isOnline, syncStats.pendingCount]);

  return {
    isOnline,
    syncStats,
    isSyncing,
    syncData,
    updateSyncStats
  };
}

export default useOfflineData;
