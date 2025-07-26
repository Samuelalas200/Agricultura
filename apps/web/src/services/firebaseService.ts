import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Tipos para las entidades
export interface Farm {
  id?: string;
  name: string;
  location: string;
  size: number;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Crop {
  id?: string;
  name: string;
  variety: string;
  plantedDate: Timestamp;
  expectedHarvestDate: Timestamp;
  farmId: string;
  userId: string;
  status: 'planted' | 'growing' | 'ready' | 'harvested';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  farmId?: string;
  cropId?: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ============ FARMS SERVICE ============
export const farmsService = {
  // Obtener todas las granjas del usuario
  async getFarms(userId: string): Promise<Farm[]> {
    try {
      const farmsRef = collection(db, 'farms');
      const q = query(farmsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const farms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Farm));
      
      // Ordenar en el cliente por createdAt
      return farms.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime; // Más reciente primero
      });
    } catch (error) {
      console.error('Error fetching farms:', error);
      throw error;
    }
  },

  // Obtener una granja específica
  async getFarm(farmId: string): Promise<Farm | null> {
    try {
      const farmRef = doc(db, 'farms', farmId);
      const farmSnap = await getDoc(farmRef);
      
      if (farmSnap.exists()) {
        return { id: farmSnap.id, ...farmSnap.data() } as Farm;
      }
      return null;
    } catch (error) {
      console.error('Error fetching farm:', error);
      throw error;
    }
  },

  // Crear nueva granja
  async createFarm(farmData: Omit<Farm, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const farmsRef = collection(db, 'farms');
      const now = Timestamp.now();
      
      const docRef = await addDoc(farmsRef, {
        ...farmData,
        createdAt: now,
        updatedAt: now
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating farm:', error);
      throw error;
    }
  },

  // Actualizar granja
  async updateFarm(farmId: string, farmData: Partial<Farm>): Promise<void> {
    try {
      const farmRef = doc(db, 'farms', farmId);
      await updateDoc(farmRef, {
        ...farmData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating farm:', error);
      throw error;
    }
  },

  // Eliminar granja
  async deleteFarm(farmId: string): Promise<void> {
    try {
      const farmRef = doc(db, 'farms', farmId);
      await deleteDoc(farmRef);
    } catch (error) {
      console.error('Error deleting farm:', error);
      throw error;
    }
  }
};

// ============ CROPS SERVICE ============
export const cropsService = {
  // Obtener todos los cultivos del usuario
  async getCrops(userId: string): Promise<Crop[]> {
    try {
      const cropsRef = collection(db, 'crops');
      const q = query(cropsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const crops = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Crop));
      
      // Ordenar en el cliente por createdAt
      return crops.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime; // Más reciente primero
      });
    } catch (error) {
      console.error('Error fetching crops:', error);
      throw error;
    }
  },

  // Obtener cultivos por granja
  async getCropsByFarm(farmId: string): Promise<Crop[]> {
    try {
      const cropsRef = collection(db, 'crops');
      const q = query(cropsRef, where('farmId', '==', farmId));
      const querySnapshot = await getDocs(q);
      
      const crops = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Crop));
      
      // Ordenar en el cliente por createdAt
      return crops.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching crops by farm:', error);
      throw error;
    }
  },

  // Obtener un cultivo específico
  async getCrop(cropId: string): Promise<Crop | null> {
    try {
      const cropRef = doc(db, 'crops', cropId);
      const cropSnap = await getDoc(cropRef);
      
      if (cropSnap.exists()) {
        return { id: cropSnap.id, ...cropSnap.data() } as Crop;
      }
      return null;
    } catch (error) {
      console.error('Error fetching crop:', error);
      throw error;
    }
  },

  // Crear nuevo cultivo
  async createCrop(cropData: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const cropsRef = collection(db, 'crops');
      const now = Timestamp.now();
      
      const docRef = await addDoc(cropsRef, {
        ...cropData,
        createdAt: now,
        updatedAt: now
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating crop:', error);
      throw error;
    }
  },

  // Actualizar cultivo
  async updateCrop(cropId: string, cropData: Partial<Crop>): Promise<void> {
    try {
      const cropRef = doc(db, 'crops', cropId);
      await updateDoc(cropRef, {
        ...cropData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating crop:', error);
      throw error;
    }
  },

  // Eliminar cultivo
  async deleteCrop(cropId: string): Promise<void> {
    try {
      const cropRef = doc(db, 'crops', cropId);
      await deleteDoc(cropRef);
    } catch (error) {
      console.error('Error deleting crop:', error);
      throw error;
    }
  }
};

// ============ TASKS SERVICE ============
export const tasksService = {
  // Obtener todas las tareas del usuario
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
      
      // Ordenar en el cliente por dueDate
      return tasks.sort((a, b) => {
        const aTime = a.dueDate?.toMillis() || 0;
        const bTime = b.dueDate?.toMillis() || 0;
        return aTime - bTime; // Más próximo primero
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Obtener tareas por granja
  async getTasksByFarm(farmId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('farmId', '==', farmId));
      const querySnapshot = await getDocs(q);
      
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
      
      // Ordenar en el cliente por dueDate
      return tasks.sort((a, b) => {
        const aTime = a.dueDate?.toMillis() || 0;
        const bTime = b.dueDate?.toMillis() || 0;
        return aTime - bTime;
      });
    } catch (error) {
      console.error('Error fetching tasks by farm:', error);
      throw error;
    }
  },

  // Obtener tareas por cultivo
  async getTasksByCrop(cropId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('cropId', '==', cropId));
      const querySnapshot = await getDocs(q);
      
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
      
      // Ordenar en el cliente por dueDate
      return tasks.sort((a, b) => {
        const aTime = a.dueDate?.toMillis() || 0;
        const bTime = b.dueDate?.toMillis() || 0;
        return aTime - bTime;
      });
    } catch (error) {
      console.error('Error fetching tasks by crop:', error);
      throw error;
    }
  },

  // Obtener una tarea específica
  async getTask(taskId: string): Promise<Task | null> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (taskSnap.exists()) {
        return { id: taskSnap.id, ...taskSnap.data() } as Task;
      }
      return null;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Crear nueva tarea
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const tasksRef = collection(db, 'tasks');
      const now = Timestamp.now();
      
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        createdAt: now,
        updatedAt: now
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Actualizar tarea
  async updateTask(taskId: string, taskData: Partial<Task>): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...taskData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Eliminar tarea
  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};
