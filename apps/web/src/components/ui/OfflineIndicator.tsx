import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Clock, AlertTriangle } from 'lucide-react';

interface OfflineIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function OfflineIndicator({ 
  size = 'md', 
  showText = true, 
  className = '' 
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3 text-xs';
      case 'lg':
        return 'w-6 h-6 text-base';
      default:
        return 'w-4 h-4 text-sm';
    }
  };

  const getIcon = () => {
    if (!isOnline) {
      return <WifiOff className={getSizeClasses()} />;
    }
    
    if (pendingCount > 0) {
      return <Clock className={getSizeClasses()} />;
    }
    
    return <Wifi className={getSizeClasses()} />;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (pendingCount > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Sin conexión';
    if (pendingCount > 0) return `${pendingCount} pendientes`;
    return 'Conectado';
  };

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <div className={getStatusColor()}>
        {getIcon()}
      </div>
      {showText && (
        <span className={`${getStatusColor()} font-medium ${getSizeClasses()}`}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
}

interface OfflineBannerProps {
  className?: string;
}

export function OfflineBanner({ className = '' }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShow(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShow(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!show || isOnline) return null;

  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Modo sin conexión:</strong> Los datos se guardan localmente y se sincronizarán automáticamente cuando recuperes la conexión a internet.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="text-yellow-400 hover:text-yellow-500 text-sm underline"
            >
              Ocultar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfflineIndicator;
