import api from '@/lib/api';
import { Crop, CreateCropDto, UpdateCropDto } from '@campo360/lib';

export const cropsService = {
  /**
   * Obtener todos los cultivos del usuario
   */
  async getCrops(farmId?: string): Promise<Crop[]> {
    const params = farmId ? { farmId } : {};
    const { data } = await api.get<Crop[]>('/crops', { params });
    return data;
  },

  /**
   * Obtener cultivo por ID
   */
  async getCrop(id: string): Promise<Crop> {
    const { data } = await api.get<Crop>(`/crops/${id}`);
    return data;
  },

  /**
   * Crear nuevo cultivo
   */
  async createCrop(cropData: CreateCropDto): Promise<Crop> {
    const { data } = await api.post<Crop>('/crops', cropData);
    return data;
  },

  /**
   * Actualizar cultivo
   */
  async updateCrop(id: string, cropData: UpdateCropDto): Promise<Crop> {
    const { data } = await api.patch<Crop>(`/crops/${id}`, cropData);
    return data;
  },

  /**
   * Eliminar cultivo
   */
  async deleteCrop(id: string): Promise<void> {
    await api.delete(`/crops/${id}`);
  },
};
