// Utilidades para detectar y manejar errores de conexión
export class ConnectionErrorDetector {
  static isBlockedByClient(error: any): boolean {
    if (!error) return false;
    
    const errorString = error.toString().toLowerCase();
    const message = error.message?.toLowerCase() || '';
    
    // Patrones comunes de errores de bloqueo
    const blockedPatterns = [
      'err_blocked_by_client',
      'net::err_blocked_by_client',
      'blocked by client',
      'adblocker',
      'ublock',
      'adblock'
    ];

    return blockedPatterns.some(pattern => 
      errorString.includes(pattern) || message.includes(pattern)
    );
  }

  static isNetworkError(error: any): boolean {
    if (!error) return false;
    
    const errorString = error.toString().toLowerCase();
    const message = error.message?.toLowerCase() || '';
    
    // Patrones de errores de red
    const networkPatterns = [
      'network error',
      'failed to fetch',
      'fetch error',
      'connection failed',
      'net::err_',
      'timeout',
      'connection_refused',
      'connection_reset',
      'dns_probe_finished',
      'no internet'
    ];

    return networkPatterns.some(pattern => 
      errorString.includes(pattern) || message.includes(pattern)
    );
  }

  static isFirebaseError(error: any): boolean {
    if (!error) return false;
    
    // Verificar si es un error específico de Firebase
    return error.code?.startsWith('firestore/') || 
           error.code?.startsWith('auth/') ||
           error.name === 'FirebaseError';
  }

  static isFirebaseIndexError(error: any): boolean {
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    const errorString = error.toString().toLowerCase();
    
    return message.includes('query requires an index') || 
           message.includes('create it here') ||
           errorString.includes('indexes?create_composite');
  }

  static getErrorType(error: any): 'blocked' | 'network' | 'firebase' | 'firebase-index' | 'unknown' {
    if (this.isBlockedByClient(error)) return 'blocked';
    if (this.isNetworkError(error)) return 'network';
    if (this.isFirebaseIndexError(error)) return 'firebase-index';
    if (this.isFirebaseError(error)) return 'firebase';
    return 'unknown';
  }

  static getErrorMessage(error: any): string {
    const type = this.getErrorType(error);
    
    switch (type) {
      case 'blocked':
        return '🚫 Conexión bloqueada por el navegador. Verifica extensiones de bloqueo de anuncios.';
      case 'network':
        return '🌐 Error de conexión a internet. Verifica tu conectividad.';
      case 'firebase-index':
        return '📊 Base de datos requiere configuración de índices. Funcionando en modo offline.';
      case 'firebase':
        return '🔥 Error de Firebase. Verifica la configuración del proyecto.';
      default:
        return `❌ Error desconocido: ${error.message || error}`;
    }
  }

  static shouldFallbackToOffline(error: any): boolean {
    const type = this.getErrorType(error);
    // Usar modo offline para errores de bloqueo, red e índices
    return type === 'blocked' || type === 'network' || type === 'firebase-index';
  }
}

// Hook para mostrar notificaciones de error
export class ErrorNotificationService {
  private static notifications: Set<string> = new Set();

  static showErrorOnce(
    errorKey: string, 
    message: string, 
    duration = 5000, 
    actionUrl?: string, 
    actionText?: string
  ): void {
    this.showNotificationOnce(errorKey, message, 'error', duration, actionUrl, actionText);
  }

  static showWarningOnce(
    errorKey: string, 
    message: string, 
    duration = 5000, 
    actionUrl?: string, 
    actionText?: string
  ): void {
    this.showNotificationOnce(errorKey, message, 'warning', duration, actionUrl, actionText);
  }

  static showInfoOnce(
    errorKey: string, 
    message: string, 
    duration = 3000, 
    actionUrl?: string, 
    actionText?: string
  ): void {
    this.showNotificationOnce(errorKey, message, 'info', duration, actionUrl, actionText);
  }

  private static showNotificationOnce(
    errorKey: string,
    message: string,
    type: 'error' | 'warning' | 'info',
    duration: number,
    actionUrl?: string,
    actionText?: string
  ): void {
    if (this.notifications.has(errorKey)) return;
    
    this.notifications.add(errorKey);
    
    // Mostrar notificación en consola
    switch (type) {
      case 'error':
        console.error(message);
        break;
      case 'warning':
        console.warn(message);
        break;
      case 'info':
        console.info(message);
        break;
    }
    
    // Disparar evento personalizado para componentes que quieran escuchar
    window.dispatchEvent(new CustomEvent('financial-error', {
      detail: { 
        errorKey, 
        message, 
        type,
        actionUrl,
        actionText
      }
    }));
    
    // Limpiar después del tiempo especificado
    setTimeout(() => {
      this.notifications.delete(errorKey);
    }, duration);
  }

  private static getNotificationType(message: string): 'error' | 'warning' | 'info' {
    if (message.includes('🚫') || message.includes('❌')) return 'error';
    if (message.includes('🟡') || message.includes('📊')) return 'warning';
    if (message.includes('🟢') || message.includes('✅')) return 'info';
    return 'error';
  }

  static clearNotifications(): void {
    this.notifications.clear();
  }
}

export default ConnectionErrorDetector;
