import { useState } from 'react';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, CheckSquare, Calendar, Clock, Filter } from 'lucide-react';
import { tasksService, farmsService, cropsService, Task } from '@/services/firebaseService';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { toast } from '@/components/ui/Toaster';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Timestamp } from 'firebase/firestore';

const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
const TASK_TYPES = ['irrigation', 'fertilization', 'pest_control', 'pruning', 'harvest', 'planting', 'other'] as const;

const taskSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  farmId: z.string().optional(),
  cropId: z.string().optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

interface FilterOptions {
  status: string;
  priority: string;
  type: string;
  farmId: string;
}

export default function TasksPage() {
  const { currentUser } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    priority: '',
    type: '',
    farmId: '',
  });

  // Queries
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useQuery(
    ['tasks', currentUser?.uid],
    () => currentUser ? tasksService.getTasks(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );
  
  const { data: farms = [], isLoading: farmsLoading } = useQuery(
    ['farms', currentUser?.uid], 
    () => currentUser ? farmsService.getFarms(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );
  
  const { data: crops = [], isLoading: cropsLoading } = useQuery(
    ['crops', currentUser?.uid], 
    () => currentUser ? cropsService.getCrops(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
  });

  const selectedFarmId = watch('farmId');

  const onSubmit = async (data: TaskForm) => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      const dueDate = Timestamp.fromDate(new Date(data.dueDate));
      
      const taskData = {
        title: data.title,
        description: data.description || '',
        dueDate: dueDate,
        status: 'pending' as const,
        priority: data.priority,
        farmId: data.farmId || undefined,
        cropId: data.cropId || undefined,
        userId: currentUser.uid,
      };
      
      await tasksService.createTask(taskData);
      
      toast.success('¡Tarea creada!', 'La tarea ha sido registrada exitosamente');
      reset();
      setShowCreateForm(false);
      refetchTasks();
    } catch (error: any) {
      toast.error('Error al crear tarea', error.message || 'Ha ocurrido un error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await tasksService.updateTask(taskId, { status: 'COMPLETED' as any });
      toast.success('Tarea completada', 'La tarea ha sido marcada como completada');
      refetchTasks();
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || 'Ha ocurrido un error');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'badge-warning',
      IN_PROGRESS: 'badge-info',
      COMPLETED: 'badge-success',
      CANCELLED: 'badge-gray',
    };
    
    const labels = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };

    return (
      <span className={`badge ${badges[status as keyof typeof badges] || 'badge-gray'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      LOW: 'badge-gray',
      MEDIUM: 'badge-warning',
      HIGH: 'badge-error',
      URGENT: 'badge-error animate-pulse',
    };
    
    const labels = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      URGENT: 'Urgente',
    };

    return (
      <span className={`badge ${badges[priority as keyof typeof badges] || 'badge-gray'}`}>
        {labels[priority as keyof typeof labels] || priority}
      </span>
    );
  };

  const isTaskOverdue = (scheduledDate: string) => {
    const scheduled = new Date(scheduledDate);
    const now = new Date();
    return scheduled < now;
  };

  // Filter tasks
  const filteredTasks = tasks?.filter((task: Task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.type && task.type !== filters.type) return false;
    if (filters.farmId && task.farmId !== filters.farmId) return false;
    return true;
  });

  if (tasksLoading || farmsLoading || cropsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando tareas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y programa todas tus actividades agrícolas
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarea
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input"
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>
          
          <div>
            <label className="label">Prioridad</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="input"
            >
              <option value="">Todas las prioridades</option>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === 'LOW' ? 'Baja' : 
                   priority === 'MEDIUM' ? 'Media' : 
                   priority === 'HIGH' ? 'Alta' : 'Urgente'}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="input"
            >
              <option value="">Todos los tipos</option>
              {TASK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Finca</label>
            <select
              value={filters.farmId}
              onChange={(e) => setFilters(prev => ({ ...prev, farmId: e.target.value }))}
              className="input"
            >
              <option value="">Todas las fincas</option>
              {farms?.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Nueva Tarea</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Título de la Tarea</label>
                <input
                  {...register('title')}
                  type="text"
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="Ej: Riego de café, Aplicación de fertilizante..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label className="label">Prioridad</label>
                <select
                  {...register('priority')}
                  className={`input ${errors.priority ? 'input-error' : ''}`}
                >
                  <option value="">Selecciona prioridad</option>
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority === 'LOW' ? 'Baja' : 
                       priority === 'MEDIUM' ? 'Media' : 
                       priority === 'HIGH' ? 'Alta' : 'Urgente'}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-error-600">{errors.priority.message}</p>
                )}
              </div>
              
              <div>
                <label className="label">Fecha de Vencimiento</label>
                <input
                  {...register('dueDate')}
                  type="datetime-local"
                  className={`input ${errors.dueDate ? 'input-error' : ''}`}
                />
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-error-600">{errors.dueDate.message}</p>
                )}
              </div>
              
              <div>
                <label className="label">Finca (opcional)</label>
                <select
                  {...register('farmId')}
                  className="input"
                >
                  <option value="">Sin finca específica</option>
                  {farms?.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">Cultivo (opcional)</label>
                <select
                  {...register('cropId')}
                  className="input"
                  disabled={!selectedFarmId}
                >
                  <option value="">Sin cultivo específico</option>
                  {crops
                    ?.filter(crop => !selectedFarmId || crop.farmId === selectedFarmId)
                    .map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name} - {crop.variety}
                      </option>
                    ))}
                </select>
                {!selectedFarmId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selecciona una finca primero para ver los cultivos
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label className="label">Descripción (opcional)</label>
              <textarea
                {...register('description')}
                rows={3}
                className="input resize-none"
                placeholder="Detalles adicionales sobre la tarea..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Guardando...
                  </div>
                ) : (
                  'Crear Tarea'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de tareas */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mis Tareas</h3>
          <div className="text-sm text-gray-600">
            {filteredTasks?.length || 0} tarea{(filteredTasks?.length || 0) !== 1 ? 's' : ''}
          </div>
        </div>
        
        {(!filteredTasks || filteredTasks.length === 0) ? (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tasks?.length === 0 ? 'No tienes tareas registradas' : 'No hay tareas que coincidan con los filtros'}
            </h3>
            <p className="text-gray-600 mb-4">
              {tasks?.length === 0 
                ? 'Comienza creando tu primera tarea para organizar tus actividades'
                : 'Intenta ajustar los filtros para ver más resultados'
              }
            </p>
            {tasks?.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Tarea
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task: Task) => (
              <div 
                key={task.id} 
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${
                  isTaskOverdue(task.scheduledDate.toString()) ? 'border-error-200 bg-error-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className={isTaskOverdue(task.scheduledDate.toString()) ? 'text-error-600 font-medium' : ''}>
                          {formatDateTime(task.scheduledDate)}
                          {isTaskOverdue(task.scheduledDate.toString()) && ' (Vencida)'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{task.type}</span>
                      </div>
                      
                      {task.farm && (
                        <div className="flex items-center">
                          <span>📍 {task.farm.name}</span>
                        </div>
                      )}
                      
                      {task.crop && (
                        <div className="flex items-center">
                          <span>🌱 {task.crop.name} - {task.crop.variety}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {task.status === 'PENDING' && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="btn btn-success btn-sm ml-4"
                    >
                      <CheckSquare className="w-4 h-4 mr-1" />
                      Completar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
