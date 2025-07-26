import { useState } from 'react';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, CheckSquare, Calendar, Clock } from 'lucide-react';
import { tasksService, farmsService, Task } from '@/services/firebaseService';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { toast } from '@/components/ui/Toaster';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Timestamp } from 'firebase/firestore';

const taskSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  farmId: z.string().optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

export default function TasksPage() {
  const { currentUser } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
  });

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
      await tasksService.updateTask(taskId, { status: 'completed' });
      toast.success('Tarea completada', 'La tarea ha sido marcada como completada');
      refetchTasks();
    } catch (error: any) {
      toast.error('Error al completar tarea', error.message || 'Ha ocurrido un error');
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    try {
      return timestamp.toDate().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin prioridad';
    }
  };

  if (tasksLoading || farmsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <CheckSquare className="w-8 h-8 inline mr-3 text-blue-600" />
            Gestión de Tareas
          </h1>
          <p className="text-gray-600 mt-1">
            {tasks.length || 0} tarea{(tasks.length || 0) !== 1 ? 's' : ''} registrada{(tasks.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarea
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nueva Tarea</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Título</label>
                <input
                  {...register('title')}
                  type="text"
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="Nombre de la tarea"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input resize-none"
                  placeholder="Descripción detallada (opcional)"
                />
              </div>

              <div>
                <label className="label">Prioridad</label>
                <select
                  {...register('priority')}
                  className={`input ${errors.priority ? 'input-error' : ''}`}
                >
                  <option value="">Selecciona una prioridad</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
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
                <select {...register('farmId')} className="input">
                  <option value="">Sin finca específica</option>
                  {farms.map((farm: any) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    reset();
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Creando...' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {(!tasks || tasks.length === 0) ? (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas registradas</h3>
            <p className="text-gray-500 mb-4">Comienza creando tu primera tarea</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task: Task) => (
              <div
                key={task.id}
                className={`bg-white rounded-lg border-2 p-4 hover:shadow-md transition-shadow ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-700 text-sm mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="capitalize">{task.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  {task.status === 'pending' && (
                    <button
                      onClick={() => task.id && handleCompleteTask(task.id)}
                      className="btn btn-sm btn-success"
                      title="Marcar como completada"
                    >
                      <CheckSquare className="w-4 h-4" />
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
