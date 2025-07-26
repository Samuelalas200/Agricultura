import { Menu, Bell, Cloud } from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';

export function Header() {
  const { currentUser } = useAuth();

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
      >
        <span className="sr-only">Abrir sidebar</span>
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              {/* Breadcrumb o título de página */}
              <div className="flex items-center h-16">
                <h1 className="text-lg font-semibold text-gray-900">
                  Bienvenido, {currentUser?.displayName || currentUser?.email?.split('@')[0]}
                </h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          {/* Clima */}
          <div className="flex items-center text-sm text-gray-500 mr-4">
            <Cloud className="w-4 h-4 mr-1" />
            <span>24°C</span>
          </div>
          
          {/* Notificaciones */}
          <button
            type="button"
            className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="sr-only">Ver notificaciones</span>
            <Bell className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
