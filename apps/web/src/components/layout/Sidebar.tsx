import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  Wheat, 
  CheckSquare, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Fincas', href: '/farms', icon: MapPin },
  { name: 'Cultivos', href: '/crops', icon: Wheat },
  { name: 'Tareas', href: '/tasks', icon: CheckSquare },
];

export function Sidebar() {
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
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Wheat className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Campo360</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={clsx(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive
                        ? 'text-primary-600'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {getInitials()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser?.email}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
