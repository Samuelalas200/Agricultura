import api from '@/lib/api';
import { Task, CreateTaskDto, UpdateTaskDto } from '@campo360/lib';

export const tasksService = {
  /**
   * Obtener todas las tareas del usuario
   */
  async getTasks(): Promise<Task[]> {
    const { data } = await api.get<Task[]>('/tasks');
    return data;
  },

  /**
   * Crear una nueva tarea
   */
  async createTask(taskData: CreateTaskDto): Promise<Task> {
    const { data } = await api.post<Task>('/tasks', taskData);
    return data;
  },

  /**
   * Actualizar una tarea existente
   */
  async updateTask(id: string, taskData: Partial<UpdateTaskDto>): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${id}`, taskData);
    return data;
  },

  /**
   * Eliminar una tarea
   */
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
