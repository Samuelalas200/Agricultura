import { useMemo, useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Task } from '../../services/firebaseService';
import { format, startOfWeek, addDays, isSameDay, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface TasksCalendarProps {
  tasks: Task[];
}

export function TasksCalendar({ tasks }: TasksCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekData = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lunes
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayTasks = tasks.filter(task => isSameDay(task.dueDate.toDate(), day));
      
      days.push({
        date: day,
        tasks: dayTasks,
        isToday: isToday(day),
        isPast: isPast(day) && !isToday(day)
      });
    }
    
    return days;
  }, [currentWeek, tasks]);

  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const overdueTasks = tasks.filter(task => {
    const dueDate = task.dueDate.toDate();
    return isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed';
  }).length;

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (task: Task) => {
    if (task.status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (isPast(task.dueDate.toDate()) && !isToday(task.dueDate.toDate())) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Calendario de Tareas
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousWeek}
              className="p-1 hover:bg-gray-100 rounded"
              title="Semana anterior"
            >
              ←
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
            >
              Hoy
            </button>
            <button
              onClick={goToNextWeek}
              className="p-1 hover:bg-gray-100 rounded"
              title="Siguiente semana"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingTasks}</p>
          <p className="text-xs text-gray-600">Pendientes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
          <p className="text-xs text-gray-600">Completadas</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
          <p className="text-xs text-gray-600">Vencidas</p>
        </div>
      </div>

      {/* Encabezado de la semana */}
      <div className="text-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">
          {format(weekData[0].date, 'd MMM', { locale: es })} - {format(weekData[6].date, 'd MMM yyyy', { locale: es })}
        </h4>
      </div>

      {/* Calendario semanal */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, index) => (
          <div
            key={index}
            className={`border rounded-lg p-2 min-h-[120px] ${
              day.isToday ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
            } ${day.isPast ? 'bg-gray-50' : 'bg-white'}`}
          >
            <div className="text-center mb-2">
              <p className={`text-xs font-medium ${day.isToday ? 'text-primary-700' : 'text-gray-600'}`}>
                {format(day.date, 'EEE', { locale: es })}
              </p>
              <p className={`text-sm font-bold ${day.isToday ? 'text-primary-800' : 'text-gray-900'}`}>
                {format(day.date, 'd')}
              </p>
            </div>
            
            <div className="space-y-1">
              {day.tasks.slice(0, 3).map((task, taskIndex) => (
                <div
                  key={taskIndex}
                  className={`text-xs p-1 rounded border ${getTaskPriorityColor(task.priority)} cursor-pointer hover:shadow-sm`}
                  title={`${task.title} - ${task.description}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1">{task.title}</span>
                    {getStatusIcon(task)}
                  </div>
                </div>
              ))}
              
              {day.tasks.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{day.tasks.length - 3} más
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enlaces rápidos */}
      <div className="mt-4 flex items-center justify-between">
        <Link
          to="/tasks"
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          Ver todas las tareas →
        </Link>
        <Link
          to="/tasks"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nueva tarea
        </Link>
      </div>

      {/* Lista de tareas de hoy */}
      {(() => {
        const todayData = weekData.find(day => day.isToday);
        return todayData && todayData.tasks.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Tareas de Hoy</h5>
          <div className="space-y-2">
            {todayData.tasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(task)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getTaskPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            ))}
          </div>
        </div>
        );
      })()}
    </div>
  );
}
