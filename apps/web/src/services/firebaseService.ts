import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  deleteField,
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

export interface InventoryItem {
  id?: string;
  name: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'machinery' | 'other';
  brand?: string;
  description?: string;
  quantity: number;
  unit: string; // kg, L, unidades, etc.
  minStock: number; // Para alertas de stock bajo
  cost: number; // Costo por unidad
  supplier?: string;
  purchaseDate?: Timestamp;
  expirationDate?: Timestamp;
  location?: string; // Dónde se almacena
  farmId?: string;
  userId: string;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Purchase {
  id?: string;
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  invoiceNumber?: string;
  purchaseDate: Timestamp;
  notes?: string;
  farmId?: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface StockMovement {
  id?: string;
  itemId: string;
  itemName: string;
  movementType: 'purchase' | 'usage' | 'adjustment' | 'transfer';
  quantity: number;
  unit: string;
  previousStock: number;
  newStock: number;
  reason?: string;
  farmId?: string;
  cropId?: string;
  taskId?: string;
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

// ============ INVENTORY SERVICE ============
export const inventoryService = {
  // Obtener todos los items del inventario del usuario
  async getInventoryItems(userId: string): Promise<InventoryItem[]> {
    try {
      const itemsRef = collection(db, 'inventory');
      const q = query(itemsRef, where('userId', '==', userId), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
      
      return items.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  },

  // Obtener items por categoría
  async getItemsByCategory(userId: string, category: string): Promise<InventoryItem[]> {
    try {
      const itemsRef = collection(db, 'inventory');
      const q = query(
        itemsRef, 
        where('userId', '==', userId),
        where('category', '==', category),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryItem));
      
      return items.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching items by category:', error);
      throw error;
    }
  },

  // Obtener items con stock bajo
  async getLowStockItems(userId: string): Promise<InventoryItem[]> {
    try {
      const items = await this.getInventoryItems(userId);
      return items.filter(item => item.quantity <= item.minStock);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  },

  // Obtener un item específico
  async getInventoryItem(itemId: string): Promise<InventoryItem | null> {
    try {
      const itemRef = doc(db, 'inventory', itemId);
      const itemSnap = await getDoc(itemRef);
      
      if (itemSnap.exists()) {
        return { id: itemSnap.id, ...itemSnap.data() } as InventoryItem;
      }
      return null;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  },

  // Crear nuevo item de inventario
  async createInventoryItem(itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const itemsRef = collection(db, 'inventory');
      const now = Timestamp.now();
      
      const docRef = await addDoc(itemsRef, {
        ...itemData,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },

  // Actualizar item de inventario
  async updateInventoryItem(itemId: string, itemData: Partial<InventoryItem>): Promise<void> {
    try {
      console.log('updateInventoryItem - itemId:', itemId);
      console.log('updateInventoryItem - itemData recibido:', itemData);
      
      const itemRef = doc(db, 'inventory', itemId);
      
      // Preparar los datos para la actualización
      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      // Procesar cada campo del itemData
      Object.entries(itemData).forEach(([key, value]) => {
        console.log(`Procesando campo: ${key}, valor:`, value, 'tipo:', typeof value);
        
        if (value === null || value === undefined) {
          // Si el valor es null o undefined, eliminamos el campo
          updateData[key] = deleteField();
          console.log(`Campo ${key} será eliminado`);
        } else {
          // Si tiene valor, lo actualizamos
          updateData[key] = value;
          console.log(`Campo ${key} será actualizado con:`, value);
        }
      });

      console.log('updateData final a enviar a Firestore:', updateData);

      await updateDoc(itemRef, updateData);
      console.log('✅ Actualización exitosa en Firestore');
    } catch (error) {
      console.error('❌ Error updating inventory item:', error);
      throw error;
    }
  },

  // Actualizar stock del item
  async updateStock(itemId: string, newQuantity: number, movementType: StockMovement['movementType'], reason?: string): Promise<void> {
    try {
      const item = await this.getInventoryItem(itemId);
      if (!item) throw new Error('Item not found');

      const previousStock = item.quantity;
      
      // Actualizar el item
      await this.updateInventoryItem(itemId, { quantity: newQuantity });
      
      // Crear movimiento de stock
      await stockMovementService.createStockMovement({
        itemId: itemId,
        itemName: item.name,
        movementType,
        quantity: newQuantity - previousStock,
        unit: item.unit,
        previousStock,
        newStock: newQuantity,
        reason,
        farmId: item.farmId,
        userId: item.userId
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  // Eliminar item (soft delete)
  async deleteInventoryItem(itemId: string): Promise<void> {
    try {
      await this.updateInventoryItem(itemId, { isActive: false });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }
};

// ============ PURCHASES SERVICE ============
export const purchasesService = {
  // Obtener todas las compras del usuario
  async getPurchases(userId: string): Promise<Purchase[]> {
    try {
      const purchasesRef = collection(db, 'purchases');
      const q = query(purchasesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const purchases = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Purchase));
      
      return purchases.sort((a, b) => {
        const aTime = a.purchaseDate?.toMillis() || 0;
        const bTime = b.purchaseDate?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  },

  // Obtener compras por período
  async getPurchasesByDateRange(userId: string, startDate: Timestamp, endDate: Timestamp): Promise<Purchase[]> {
    try {
      const purchases = await this.getPurchases(userId);
      return purchases.filter(purchase => {
        const purchaseTime = purchase.purchaseDate.toMillis();
        return purchaseTime >= startDate.toMillis() && purchaseTime <= endDate.toMillis();
      });
    } catch (error) {
      console.error('Error fetching purchases by date range:', error);
      throw error;
    }
  },

  // Crear nueva compra
  async createPurchase(purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const purchasesRef = collection(db, 'purchases');
      const now = Timestamp.now();
      
      const docRef = await addDoc(purchasesRef, {
        ...purchaseData,
        createdAt: now,
        updatedAt: now
      });

      // Actualizar stock del item si existe
      try {
        await inventoryService.updateStock(
          purchaseData.itemId,
          0, // Se actualizará con la cantidad actual + nueva cantidad
          'purchase',
          `Compra: ${purchaseData.invoiceNumber || 'Sin factura'}`
        );
      } catch (error) {
        console.warn('Could not update stock for purchase:', error);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  },

  // Actualizar compra
  async updatePurchase(purchaseId: string, purchaseData: Partial<Purchase>): Promise<void> {
    try {
      const purchaseRef = doc(db, 'purchases', purchaseId);
      await updateDoc(purchaseRef, {
        ...purchaseData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating purchase:', error);
      throw error;
    }
  },

  // Eliminar compra
  async deletePurchase(purchaseId: string): Promise<void> {
    try {
      const purchaseRef = doc(db, 'purchases', purchaseId);
      await deleteDoc(purchaseRef);
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw error;
    }
  }
};

// ============ STOCK MOVEMENTS SERVICE ============
export const stockMovementService = {
  // Obtener movimientos de stock
  async getStockMovements(userId: string): Promise<StockMovement[]> {
    try {
      const movementsRef = collection(db, 'stock_movements');
      const q = query(movementsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const movements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockMovement));
      
      return movements.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  },

  // Obtener movimientos por item
  async getMovementsByItem(itemId: string): Promise<StockMovement[]> {
    try {
      const movementsRef = collection(db, 'stock_movements');
      const q = query(movementsRef, where('itemId', '==', itemId));
      const querySnapshot = await getDocs(q);
      
      const movements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StockMovement));
      
      return movements.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching movements by item:', error);
      throw error;
    }
  },

  // Crear movimiento de stock
  async createStockMovement(movementData: Omit<StockMovement, 'id' | 'createdAt'>): Promise<string> {
    try {
      const movementsRef = collection(db, 'stock_movements');
      const now = Timestamp.now();
      
      const docRef = await addDoc(movementsRef, {
        ...movementData,
        createdAt: now
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating stock movement:', error);
      throw error;
    }
  }
};
