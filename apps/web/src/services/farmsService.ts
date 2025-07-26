import api from '@/lib/api';
import { Farm, CreateFarmDto, UpdateFarmDto } from '@campo360/lib';

export const farmsService = {
  /**
   * Obtener todas las fincas del usuario
   */
  async getFarms(): Promise<Farm[]> {
    const { data } = await api.get<Farm[]>('/farms');
    return data;
  },

  /**
   * Obtener finca por ID
   */
  async getFarm(id: string): Promise<Farm> {
    const { data } = await api.get<Farm>(`/farms/${id}`);
    return data;
  },

  /**
   * Crear nueva finca
   */
  async createFarm(farmData: CreateFarmDto): Promise<Farm> {
    const { data } = await api.post<Farm>('/farms', farmData);
    return data;
  },

  /**
   * Actualizar finca
   */
  async updateFarm(id: string, farmData: UpdateFarmDto): Promise<Farm> {
    const { data } = await api.patch<Farm>(`/farms/${id}`, farmData);
    return data;
  },

  /**
   * Eliminar finca
   */
  async deleteFarm(id: string): Promise<void> {
    await api.delete(`/farms/${id}`);
  },
};
