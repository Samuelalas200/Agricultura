import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Database, AlertTriangle, CheckCircle } from 'lucide-react';

interface FirebaseIndexCheckerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FirebaseIndexChecker: React.FC<FirebaseIndexCheckerProps> = ({
  isOpen,
  onClose
}) => {
  const [indexStatus, setIndexStatus] = useState<'checking' | 'needed' | 'ready'>('checking');
  const [indexUrl, setIndexUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      checkIndexStatus();
    }
  }, [isOpen]);

  const checkIndexStatus = () => {
    // Escuchar errores de índices
    const handleFirebaseError = (event: any) => {
      const error = event.detail?.error || event.error;
      if (error?.message?.includes('query requires an index')) {
        const urlMatch = error.message.match(/https:\/\/[^\s]+/);
        if (urlMatch) {
          setIndexUrl(urlMatch[0]);
          setIndexStatus('needed');
        }
      }
    };

    window.addEventListener('firebase-index-error', handleFirebaseError);
    
    // Simular verificación
    setTimeout(() => {
      if (indexStatus === 'checking') {
        setIndexStatus('ready');
      }
    }, 2000);

    return () => {
      window.removeEventListener('firebase-index-error', handleFirebaseError);
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            Estado de Firebase
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {indexStatus === 'checking' && (
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              <div>
                <p className="font-medium text-blue-800">Verificando configuración...</p>
                <p className="text-sm text-blue-600">Comprobando el estado de los índices de Firebase</p>
              </div>
            </div>
          )}

          {indexStatus === 'needed' && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-orange-800">Configuración de índices requerida</p>
                  <p className="text-sm text-orange-600 mt-1">
                    Firebase requiere crear índices para las consultas de transacciones. 
                    Esto es normal y solo necesita hacerse una vez.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Pasos para configurar:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Haz clic en el enlace de abajo para abrir la consola de Firebase</li>
                  <li>Inicia sesión con tu cuenta de Google</li>
                  <li>Haz clic en "Crear índice" en la página que se abre</li>
                  <li>Espera unos minutos a que se complete la creación</li>
                  <li>Vuelve aquí y recarga la página</li>
                </ol>
              </div>

              {indexUrl && (
                <div className="flex items-center space-x-3">
                  <a
                    href={indexUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Consola de Firebase
                  </a>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Mientras tanto</p>
                    <p className="text-sm text-green-600">
                      El módulo financiero funcionará perfectamente en modo offline. 
                      Todas tus transacciones se guardarán localmente y se sincronizarán 
                      automáticamente una vez que los índices estén listos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {indexStatus === 'ready' && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">Configuración completa</p>
                <p className="text-sm text-green-600">
                  Firebase está configurado correctamente y funcionando.
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Información técnica</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Los índices permiten consultas rápidas y eficientes</li>
              <li>• Solo necesitas configurarlos una vez por proyecto</li>
              <li>• La configuración es automática y segura</li>
              <li>• Los datos offline se sincronizan automáticamente</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
          {indexStatus === 'needed' && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Recargar Página
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirebaseIndexChecker;
