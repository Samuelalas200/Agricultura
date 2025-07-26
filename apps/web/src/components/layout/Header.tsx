import React, { useState } from 'react';
import { Search, Bell, User, Menu, X, ChevronDown, Settings, LogOut, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/FirebaseAuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-full px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            
            {/* Mobile: Solo mostrar saludo corto */}
            <div className="block sm:hidden">
              <h1 className="text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ¡Hola, {currentUser?.displayName?.split(' ')[0] || 'Usuario'}!
              </h1>
            </div>
            
            {/* Desktop: Mostrar saludo completo */}
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ¡Buen día, {currentUser?.displayName || 'Usuario'}!
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 capitalize">
                {currentDate}
              </p>
            </div>
          </div>

          {/* Center Section - Search (Solo en tablet y desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en Campo360..."
                className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs bg-gray-200 rounded hidden lg:block">⌘K</kbd>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Icon para móvil */}
            <button className="md:hidden p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Weather Widget - Solo en desktop */}
            <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-sky-50 px-3 py-2 rounded-lg border border-blue-100">
              <Sun className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-700">24°C</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-hidden">
                  <div className="px-3 sm:px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notificaciones</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="px-3 sm:px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Tarea completada en Finca Norte
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Hace 2 horas
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 sm:px-4 py-2 border-t border-gray-100">
                    <button className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium">
                      Ver todas
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="relative">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 border border-white rounded-full"></div>
                </div>
                {/* Nombre solo visible en pantallas medianas y grandes */}
                <span className="hidden md:block font-medium text-sm">{currentUser?.displayName || 'Usuario'}</span>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-3 sm:px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm truncate">{currentUser?.displayName || 'Usuario'}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{currentUser?.email || 'usuario@campo360.com'}</p>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      <span>Configuración</span>
                    </button>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-3 sm:px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
