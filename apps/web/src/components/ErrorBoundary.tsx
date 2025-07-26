import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por Error Boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Aquí podrías enviar el error a un servicio como Sentry
    // reportError(error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de error por defecto
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-error-600" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Oops! Algo salió mal
            </h1>
            
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. No te preocupes, nuestro equipo ha sido notificado.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRefresh}
                className="w-full btn btn-primary flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al Dashboard
              </button>
            </div>

            {/* Información de error en desarrollo */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalles técnicos
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-32">
                  <div className="text-error-600 mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="text-gray-600">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div className="text-gray-600 mt-2">
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Boundary específico para páginas
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      fallback={
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error en la página
          </h2>
          <p className="text-gray-600 mb-4">
            Esta página no se pudo cargar correctamente.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Reintentar
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Error Boundary para componentes pequeños
export function ComponentErrorBoundary({ children, componentName }: { 
  children: ReactNode; 
  componentName?: string; 
}) {
  return (
    <ErrorBoundary 
      fallback={
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-center">
          <AlertTriangle className="w-6 h-6 text-error-500 mx-auto mb-2" />
          <p className="text-sm text-error-700">
            Error en {componentName || 'componente'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs text-error-600 hover:text-error-800 mt-1"
          >
            Reintentar
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
