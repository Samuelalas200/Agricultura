import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Wheat, 
  CheckSquare, 
  TrendingUp,
  Calendar,
  Cloud,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { farmsService } from '@/services/farmsService';
import { cropsService } from '@/services/cropsService';
import { tasksService } from '@/services/tasksService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate, formatArea } from '@campo360/lib';

export default function DashboardPage() {
  const { currentUser } = useAuth();

  // Queries para obtener datos del dashboard
  const { data: farms, isLoading: farmsLoading } = useQuery('farms', farmsService.getFarms);
  const { data: crops, isLoading: cropsLoading } = useQuery('crops', () => cropsService.getCrops());
  const { data: tasks, isLoading: tasksLoading } = useQuery('tasks', tasksService.getTasks);

  // Cálculos para las estadísticas
  const totalFarms = farms?.length || 0;
  const totalCrops = crops?.length || 0;
  const totalTasks = tasks?.length || 0;
  const totalArea = farms?.reduce((sum, farm) => sum + farm.totalArea, 0) || 0;
  
  // Tareas pendientes y vencidas
  const pendingTasks = tasks?.filter(task => task.status === 'PENDING') || [];
  const overdueTasks = tasks?.filter(task => task.status === 'OVERDUE') || [];

  // Cultivos por estado
  const activeCrops = crops?.filter(crop => crop.status === 'GROWING') || [];

  const stats = [
    {
      name: 'Fincas',
      value: totalFarms,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/farms',
    },
    {
      name: 'Cultivos Activos',
      value: activeCrops.length,
      icon: Wheat,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/crops',
    },
    {
      name: 'Tareas Pendientes',
      value: pendingTasks.length,
      icon: CheckSquare,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/tasks',
    },
    {
      name: 'Área Total',
      value: `${formatArea(totalArea)}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (farmsLoading || cropsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola, {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Aquí tienes un resumen de tu actividad agrícola
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(new Date(), 'long')}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Cloud className="w-4 h-4 mr-1" />
            24°C, Parcialmente nublado
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              {stat.href && (
                <div className="mt-4">
                  <Link
                    to={stat.href}
                    className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Ver detalles →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alertas */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-red-800">
              Tareas Vencidas ({overdueTasks.length})
            </h3>
          </div>
          <p className="text-red-700 mt-1">
            Tienes {overdueTasks.length} tarea{overdueTasks.length > 1 ? 's' : ''} vencida{overdueTasks.length > 1 ? 's' : ''} que requiere{overdueTasks.length > 1 ? 'n' : ''} atención inmediata.
          </p>
          <Link
            to="/tasks"
            className="inline-flex items-center mt-3 text-sm font-medium text-red-600 hover:text-red-500"
          >
            Ver tareas vencidas →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas Recientes */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Tareas Recientes</h3>
              <Link
                to="/tasks"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Ver todas
              </Link>
            </div>
          </div>
          
          <div className="space-y-3">
            {tasks?.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">
                    {task.farm.name} • {formatDate(task.scheduledDate)}
                  </p>
                </div>
                <span className={`badge ${
                  task.status === 'COMPLETED' ? 'badge-success' :
                  task.status === 'OVERDUE' ? 'badge-error' :
                  task.status === 'IN_PROGRESS' ? 'badge-info' :
                  'badge-gray'
                }`}>
                  {task.status === 'COMPLETED' ? 'Completada' :
                   task.status === 'OVERDUE' ? 'Vencida' :
                   task.status === 'IN_PROGRESS' ? 'En Progreso' :
                   'Pendiente'}
                </span>
              </div>
            ))}
            
            {(!tasks || tasks.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500">No tienes tareas registradas</p>
                <Link
                  to="/tasks"
                  className="inline-flex items-center mt-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Crear primera tarea
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Cultivos Activos */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Cultivos Activos</h3>
              <Link
                to="/crops"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Ver todos
              </Link>
            </div>
          </div>
          
          <div className="space-y-3">
            {activeCrops.slice(0, 5).map((crop) => (
              <div key={crop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{crop.name}</p>
                  <p className="text-sm text-gray-600">
                    {crop.variety} • {formatArea(crop.area)} • {crop.farm.name}
                  </p>
                </div>
                <span className="badge badge-success">
                  En Crecimiento
                </span>
              </div>
            ))}
            
            {activeCrops.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No tienes cultivos activos</p>
                <Link
                  to="/crops"
                  className="inline-flex items-center mt-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Registrar cultivo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Acciones Rápidas</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/farms"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <MapPin className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Nueva Finca</p>
              <p className="text-sm text-gray-600">Registra una nueva finca</p>
            </div>
          </Link>
          
          <Link
            to="/crops"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Wheat className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Nuevo Cultivo</p>
              <p className="text-sm text-gray-600">Registra un nuevo cultivo</p>
            </div>
          </Link>
          
          <Link
            to="/tasks"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <CheckSquare className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Nueva Tarea</p>
              <p className="text-sm text-gray-600">Programa una nueva tarea</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
