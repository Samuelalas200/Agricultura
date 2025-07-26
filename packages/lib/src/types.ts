/**
 * Tipos compartidos para el sistema Campo360 Manager
 * Estos tipos son utilizados tanto en el frontend como en el backend
 */

// ==================== USUARIO ====================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  farms: Farm[];
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'farms'>;
  token: string;
  expiresIn: number;
}

// ==================== FINCA ====================
export interface Farm {
  id: string;
  name: string;
  location: string;
  totalArea: number; // en hectáreas
  description?: string;
  ownerId: string;
  owner: User;
  createdAt: Date;
  updatedAt: Date;
  crops: Crop[];
  parcels: Parcel[];
}

export interface CreateFarmDto {
  name: string;
  location: string;
  totalArea: number;
  description?: string;
}

export interface UpdateFarmDto {
  name?: string;
  location?: string;
  totalArea?: number;
  description?: string;
}

// ==================== PARCELA ====================
export interface Parcel {
  id: string;
  name: string;
  area: number; // en hectáreas
  soilType?: string;
  farmId: string;
  farm: Farm;
  createdAt: Date;
  updatedAt: Date;
  crops: Crop[];
}

export interface CreateParcelDto {
  name: string;
  area: number;
  soilType?: string;
  farmId: string;
}

// ==================== CULTIVO ====================
export interface Crop {
  id: string;
  name: string;
  variety: string;
  plantingDate: Date;
  expectedHarvestDate?: Date;
  actualHarvestDate?: Date;
  area: number; // en hectáreas
  status: CropStatus;
  notes?: string;
  farmId: string;
  farm: Farm;
  parcelId?: string;
  parcel?: Parcel;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
}

export enum CropStatus {
  PLANNED = 'PLANNED',
  PLANTED = 'PLANTED',
  GROWING = 'GROWING',
  HARVESTED = 'HARVESTED',
  FAILED = 'FAILED',
}

export interface CreateCropDto {
  name: string;
  variety: string;
  plantingDate: string; // ISO string
  expectedHarvestDate?: string; // ISO string
  area: number;
  notes?: string;
  farmId: string;
  parcelId?: string;
}

export interface UpdateCropDto {
  name?: string;
  variety?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  area?: number;
  status?: CropStatus;
  notes?: string;
  parcelId?: string;
}

// ==================== TAREAS ====================
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  scheduledDate: Date;
  completedDate?: Date;
  priority: TaskPriority;
  estimatedDuration?: number; // en minutos
  actualDuration?: number; // en minutos
  cost?: number;
  notes?: string;
  cropId?: string;
  crop?: Crop;
  farmId: string;
  farm: Farm;
  assignedUserId: string;
  assignedUser: User;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskType {
  PLANTING = 'PLANTING',
  IRRIGATION = 'IRRIGATION',
  FERTILIZATION = 'FERTILIZATION',
  PEST_CONTROL = 'PEST_CONTROL',
  HARVESTING = 'HARVESTING',
  SOIL_PREPARATION = 'SOIL_PREPARATION',
  MAINTENANCE = 'MAINTENANCE',
  MONITORING = 'MONITORING',
  OTHER = 'OTHER',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  type: TaskType;
  scheduledDate: string; // ISO string
  priority: TaskPriority;
  estimatedDuration?: number;
  cost?: number;
  notes?: string;
  cropId?: string;
  farmId: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  scheduledDate?: string;
  completedDate?: string;
  priority?: TaskPriority;
  estimatedDuration?: number;
  actualDuration?: number;
  cost?: number;
  notes?: string;
  cropId?: string;
}

// ==================== RESPUESTAS API ====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ==================== CLIMA ====================
export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  pressure: number;
  description: string;
  icon: string;
  timestamp: Date;
  location: string;
}

export interface WeatherForecast {
  daily: WeatherData[];
  alerts?: WeatherAlert[];
}

export interface WeatherAlert {
  id: string;
  type: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

// ==================== CONSTANTES ====================
export const CROP_TYPES = [
  'Maíz',
  'Arroz',
  'Trigo',
  'Soja',
  'Café',
  'Caña de azúcar',
  'Frijol',
  'Papa',
  'Tomate',
  'Cebolla',
  'Plátano',
  'Aguacate',
  'Mango',
  'Cítricos',
  'Otro',
] as const;

export const TASK_TYPES = [
  'Siembra',
  'Riego',
  'Fertilización',
  'Control de plagas',
  'Cosecha',
  'Preparación del suelo',
  'Mantenimiento',
  'Monitoreo',
  'Otro',
] as const;

export const TASK_PRIORITIES = [
  'LOW',
  'MEDIUM', 
  'HIGH',
  'URGENT',
] as const;

export const SOIL_TYPES = [
  'Arcilloso',
  'Arenoso',
  'Limoso',
  'Franco',
  'Franco arcilloso',
  'Franco arenoso',
  'Franco limoso',
] as const;

export const TASK_COLORS = {
  [TaskType.PLANTING]: '#10b981',
  [TaskType.IRRIGATION]: '#3b82f6',
  [TaskType.FERTILIZATION]: '#f59e0b',
  [TaskType.PEST_CONTROL]: '#ef4444',
  [TaskType.HARVESTING]: '#8b5cf6',
  [TaskType.SOIL_PREPARATION]: '#6b7280',
  [TaskType.MAINTENANCE]: '#84cc16',
  [TaskType.MONITORING]: '#06b6d4',
  [TaskType.OTHER]: '#6b7280',
} as const;

export const PRIORITY_COLORS = {
  [TaskPriority.LOW]: '#10b981',
  [TaskPriority.MEDIUM]: '#f59e0b',
  [TaskPriority.HIGH]: '#ef4444',
  [TaskPriority.URGENT]: '#dc2626',
} as const;
