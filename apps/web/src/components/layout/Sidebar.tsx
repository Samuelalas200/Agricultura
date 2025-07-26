import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  Wheat, 
  CheckSquare, 
  Package,
  LogOut,
  X,
  ChevronRight,
  Settings,
  HelpCircle,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { clsx } from 'clsx';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
    description: 'Vista general de tu finca'
  },
  { 
    name: 'Fincas', 
    href: '/farms', 
    icon: MapPin,
    description: 'Gestiona tus propiedades'
  },
  { 
    name: 'Cultivos', 
    href: '/crops', 
    icon: Wheat,
    description: 'Control de plantaciones'
  },
  { 
    name: 'Tareas', 
    href: '/tasks', 
    icon: CheckSquare,
    description: 'Organiza actividades'
  },
  { 
    name: 'Inventario', 
    href: '/inventory', 
    icon: Package,
    description: 'Control de recursos'
  },
];

const secondaryNavigation = [
  { name: 'Configuración', href: '/settings', icon: Settings },
  { name: 'Ayuda', href: '/help', icon: HelpCircle },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { logout, currentUser } = useAuth();

  const getInitials = () => {
    if (currentUser?.displayName) {
      const names = currentUser.displayName.split(' ');
      return names.map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2);
    }
    return currentUser?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    return currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario';
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-all duration-300 ease-in-out",
        "md:relative md:translate-x-0 md:shadow-xl md:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header con logo mejorado */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wheat className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-white">Campo360</span>
                <p className="text-xs text-emerald-400 font-medium">Gestión Agrícola</p>
              </div>
            </div>
            
            {/* Botón cerrar mejorado para móvil */}
            <button
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 md:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Perfil de usuario compacto */}
          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/30">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {getInitials()}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  En línea
                </p>
              </div>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200">
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation principal */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Navegación Principal
              </h3>
            </div>
            
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={clsx(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  )}
                >
                  {/* Indicador activo */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-500/20 rounded-xl" />
                  )}
                  
                  <Icon
                    className={clsx(
                      'mr-3 flex-shrink-0 h-5 w-5 transition-all duration-200',
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-emerald-400'
                    )}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-white/70" />
                      )}
                    </div>
                    {!isActive && (
                      <p className="text-xs text-slate-500 group-hover:text-slate-400 mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* Navegación secundaria */}
            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Herramientas
              </h3>
              
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className="group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-700/50"
                  >
                    <Icon className="mr-3 flex-shrink-0 h-4 w-4 group-hover:text-emerald-400 transition-colors duration-200" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User actions */}
          <div className="flex-shrink-0 border-t border-slate-700/50 p-4 bg-slate-800/30">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-red-600/20 border border-slate-600/50 hover:border-red-500/50 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:text-red-400 transition-colors duration-200" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
