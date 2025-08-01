import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, Menu, X, ChevronDown, Settings, LogOut, Sun, MapPin, Wheat, CheckSquare, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { useQuery } from 'react-query';
import { farmsService, cropsService, tasksService } from '../../services/firebaseService';
import { Link } from 'react-router-dom';
import { useWeatherNotifications } from '../../hooks/useWeatherNotifications';
import { WeatherNotificationsPanel } from '../weather/WeatherNotificationsPanel';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Weather notifications hook
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    clearAllNotifications,
    requestNotificationPermission
  } = useWeatherNotifications({
    location: 'San Salvador', // You can make this configurable
    enableNotifications: true,
    refreshInterval: 30
  });

  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Obtener datos para búsqueda
  const userId = currentUser?.uid;
  
  const { data: farms = [] } = useQuery(
    ['farms', userId], 
    () => farmsService.getFarms(userId!),
    { enabled: !!userId }
  );
  
  const { data: crops = [] } = useQuery(
    ['crops', userId], 
    () => cropsService.getCrops(userId!),
    { enabled: !!userId }
  );
  
  const { data: tasks = [] } = useQuery(
    ['tasks', userId], 
    () => tasksService.getTasks(userId!),
    { enabled: !!userId }
  );

  // Función de búsqueda con useMemo para evitar bucles infinitos
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Buscar en fincas
    farms?.forEach(farm => {
      if (farm.name.toLowerCase().includes(query) || 
          farm.location?.toLowerCase().includes(query)) {
        results.push({
          type: 'farm',
          id: farm.id,
          title: farm.name,
          subtitle: farm.location || 'Sin ubicación',
          description: `${farm.size || 0} hectáreas`,
          href: '/farms',
          icon: MapPin,
          color: 'text-blue-600'
        });
      }
    });

    // Buscar en cultivos
    crops?.forEach(crop => {
      const farmName = farms?.find(f => f.id === crop.farmId)?.name || 'Finca desconocida';
      if (crop.name.toLowerCase().includes(query) || 
          crop.variety?.toLowerCase().includes(query) ||
          farmName.toLowerCase().includes(query)) {
        results.push({
          type: 'crop',
          id: crop.id,
          title: crop.name,
          subtitle: crop.variety || 'Sin variedad',
          description: `En ${farmName}`,
          href: '/crops',
          icon: Wheat,
          color: 'text-green-600'
        });
      }
    });

    // Buscar en tareas
    tasks?.forEach(task => {
      const farmName = farms?.find(f => f.id === task.farmId)?.name || 'Finca desconocida';
      if (task.title.toLowerCase().includes(query) || 
          task.description?.toLowerCase().includes(query) ||
          farmName.toLowerCase().includes(query)) {
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          subtitle: task.status === 'completed' ? 'Completada' : 'Pendiente',
          description: `En ${farmName}`,
          href: '/tasks',
          icon: CheckSquare,
          color: 'text-yellow-600'
        });
      }
    });

    return results.slice(0, 8); // Limitar a 8 resultados
  }, [searchQuery, farms, crops, tasks]);

  // Controlar la visibilidad de resultados
  useEffect(() => {
    setShowSearchResults(searchQuery.trim().length > 0);
  }, [searchQuery]);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('header-search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchResults]);

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
          <div id="header-search-container" className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en Campo360..."
                className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="px-2 py-1 text-xs bg-gray-200 rounded hidden lg:block">⌘K</kbd>
                </div>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result, index) => {
                      const Icon = result.icon;
                      return (
                        <Link
                          key={`${result.type}-${result.id}-${index}`}
                          to={result.href}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                            result.type === 'farm' ? 'bg-blue-100' : 
                            result.type === 'crop' ? 'bg-green-100' : 'bg-yellow-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${result.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {result.subtitle} • {result.description}
                            </p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="px-4 py-6 text-center">
                    <div className="text-gray-400 mb-2">
                      <Search className="w-6 h-6 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500">
                      No se encontraron resultados para "{searchQuery}"
                    </p>
                  </div>
                ) : null}
              </div>
            )}
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

            {/* Weather Notifications */}
            <WeatherNotificationsPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markNotificationAsRead}
              onClearAll={clearAllNotifications}
            />

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
