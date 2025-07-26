import api from '@/lib/api';
import { AuthResponse, CreateUserDto, LoginDto } from '@campo360/lib';

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /**
   * Registrar nuevo usuario
   */
  async register(userData: CreateUserDto): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile() {
    const { data } = await api.get('/users/profile');
    return data;
  },
};
