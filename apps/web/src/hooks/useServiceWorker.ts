import { useState, useEffect } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    registration: null,
    error: null
  });

  useEffect(() => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Service Workers no son soportados en este navegador'
      }));
      return;
    }

    registerServiceWorker();
  }, [state.isSupported]);

  const registerServiceWorker = async () => {
    try {
      setState(prev => ({ ...prev, isInstalling: true, error: null }));

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      setState(prev => ({
        ...prev,
        isRegistered: true,
        isInstalling: false,
        registration
      }));

      // Escuchar actualizaciones del Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          setState(prev => ({ ...prev, isInstalling: true }));
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              setState(prev => ({ 
                ...prev, 
                isInstalling: false,
                isWaiting: navigator.serviceWorker.controller !== null 
              }));
            }
          });
        }
      });

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      console.log('Service Worker registrado exitosamente');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isInstalling: false,
        error: `Error registrando Service Worker: ${(error as Error).message}`
      }));
      console.error('Error registrando Service Worker:', error);
    }
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'SYNC_COMPLETE':
        console.log('Sincronización completada en segundo plano');
        // Disparar evento personalizado para que otros componentes puedan reaccionar
        window.dispatchEvent(new CustomEvent('sw-sync-complete', { detail: payload }));
        break;
        
      case 'SYNC_ERROR':
        console.error('Error en sincronización en segundo plano:', payload);
        window.dispatchEvent(new CustomEvent('sw-sync-error', { detail: payload }));
        break;
        
      default:
        console.log('Mensaje del Service Worker:', type, payload);
    }
  };

  const skipWaiting = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setState(prev => ({ ...prev, isWaiting: false }));
      window.location.reload();
    }
  };

  const clearCache = async () => {
    if (!state.registration) return false;
    
    try {
      const messageChannel = new MessageChannel();
      
      return new Promise<boolean>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success);
        };
        
        state.registration!.active?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('Error limpiando cache:', error);
      return false;
    }
  };

  const requestBackgroundSync = async (tag: string = 'financial-sync') => {
    if (!state.registration) return false;
    
    try {
      // @ts-ignore - Background Sync API puede no estar en tipos
      await state.registration.sync.register(tag);
      console.log('Sincronización en segundo plano solicitada');
      return true;
    } catch (error) {
      console.error('Error solicitando sincronización en segundo plano:', error);
      return false;
    }
  };

  const getServiceWorkerVersion = async () => {
    if (!state.registration?.active) return null;
    
    try {
      const messageChannel = new MessageChannel();
      
      return new Promise<string>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version);
        };
        
        state.registration!.active!.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('Error obteniendo versión del Service Worker:', error);
      return null;
    }
  };

  const isOnline = () => {
    return navigator.onLine;
  };

  const addConnectivityListener = (callback: (isOnline: boolean) => void) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  return {
    ...state,
    skipWaiting,
    clearCache,
    requestBackgroundSync,
    getServiceWorkerVersion,
    isOnline,
    addConnectivityListener
  };
}

export default useServiceWorker;
