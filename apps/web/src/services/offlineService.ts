import type { Transaction, Budget, Customer } from './financialService';

export interface OfflineQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: 'transactions' | 'budgets' | 'customers';
  data: any;
  timestamp: number;
  retryCount: number;
  userId: string;
}

export interface OfflineStore {
  transactions: Transaction[];
  budgets: Budget[];
  customers: Customer[];
  pendingQueue: OfflineQueueItem[];
  lastSync: number;
  isOnline: boolean;
}

class OfflineService {
  private storageKey = 'campo360_offline_data';
  private maxRetries = 3;
  private syncListeners: Set<() => void> = new Set();

  constructor() {
    this.initializeOfflineDetection();
  }

  // Detección de estado online/offline
  private initializeOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.updateOnlineStatus(true);
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.updateOnlineStatus(false);
    });
  }

  // Obtener datos offline del localStorage
  getOfflineStore(): OfflineStore {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      transactions: [],
      budgets: [],
      customers: [],
      pendingQueue: [],
      lastSync: 0,
      isOnline: navigator.onLine
    };
  }

  // Guardar datos offline
  saveOfflineStore(store: OfflineStore): void {
    localStorage.setItem(this.storageKey, JSON.stringify(store));
  }

  // Actualizar estado online
  private updateOnlineStatus(isOnline: boolean): void {
    const store = this.getOfflineStore();
    store.isOnline = isOnline;
    this.saveOfflineStore(store);
    this.notifySyncListeners();
  }

  // Verificar si está online
  isOnline(): boolean {
    return navigator.onLine && this.getOfflineStore().isOnline;
  }

  // Agregar operación a la cola de sincronización
  addToQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
    const store = this.getOfflineStore();
    const queueItem: OfflineQueueItem = {
      ...item,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    store.pendingQueue.push(queueItem);
    this.saveOfflineStore(store);
  }

  // Guardar transacción offline
  saveTransactionOffline(transaction: Transaction, type: 'CREATE' | 'UPDATE' | 'DELETE', userId: string): void {
    const store = this.getOfflineStore();
    
    if (type === 'CREATE') {
      // Asignar ID temporal para operaciones offline
      const tempId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const offlineTransaction = { ...transaction, id: tempId };
      store.transactions.push(offlineTransaction);
    } else if (type === 'UPDATE') {
      const index = store.transactions.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        store.transactions[index] = transaction;
      }
    } else if (type === 'DELETE') {
      store.transactions = store.transactions.filter(t => t.id !== transaction.id);
    }

    this.addToQueue({
      type,
      collection: 'transactions',
      data: transaction,
      userId
    });

    this.saveOfflineStore(store);
  }

  // Guardar presupuesto offline
  saveBudgetOffline(budget: Budget, type: 'CREATE' | 'UPDATE' | 'DELETE', userId: string): void {
    const store = this.getOfflineStore();
    
    if (type === 'CREATE') {
      const tempId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const offlineBudget = { ...budget, id: tempId };
      store.budgets.push(offlineBudget);
    } else if (type === 'UPDATE') {
      const index = store.budgets.findIndex(b => b.id === budget.id);
      if (index !== -1) {
        store.budgets[index] = budget;
      }
    } else if (type === 'DELETE') {
      store.budgets = store.budgets.filter(b => b.id !== budget.id);
    }

    this.addToQueue({
      type,
      collection: 'budgets',
      data: budget,
      userId
    });

    this.saveOfflineStore(store);
  }

  // Guardar cliente offline
  saveCustomerOffline(customer: Customer, type: 'CREATE' | 'UPDATE' | 'DELETE', userId: string): void {
    const store = this.getOfflineStore();
    
    if (type === 'CREATE') {
      const tempId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const offlineCustomer = { ...customer, id: tempId };
      store.customers.push(offlineCustomer);
    } else if (type === 'UPDATE') {
      const index = store.customers.findIndex(c => c.id === customer.id);
      if (index !== -1) {
        store.customers[index] = customer;
      }
    } else if (type === 'DELETE') {
      store.customers = store.customers.filter(c => c.id !== customer.id);
    }

    this.addToQueue({
      type,
      collection: 'customers',
      data: customer,
      userId
    });

    this.saveOfflineStore(store);
  }

  // Obtener datos offline
  getOfflineTransactions(): Transaction[] {
    return this.getOfflineStore().transactions;
  }

  getOfflineBudgets(): Budget[] {
    return this.getOfflineStore().budgets;
  }

  getOfflineCustomers(): Customer[] {
    return this.getOfflineStore().customers;
  }

  // Sincronizar datos pendientes
  async syncPendingData(): Promise<void> {
    if (!this.isOnline()) {
      console.log('No hay conexión disponible para sincronizar');
      return;
    }

    const store = this.getOfflineStore();
    const { pendingQueue } = store;

    if (pendingQueue.length === 0) {
      console.log('No hay datos pendientes para sincronizar');
      return;
    }

    console.log(`Sincronizando ${pendingQueue.length} operaciones pendientes...`);

    // Procesar cola de sincronización
    const processedItems: string[] = [];
    
    for (const item of pendingQueue) {
      try {
        await this.processSyncItem(item);
        processedItems.push(item.id);
        console.log(`✓ Operación ${item.type} en ${item.collection} sincronizada correctamente`);
      } catch (error) {
        console.error(`✗ Error sincronizando operación ${item.id}:`, error);
        
        // Incrementar contador de reintentos
        item.retryCount++;
        
        // Si se superó el máximo de reintentos, marcar como fallida
        if (item.retryCount >= this.maxRetries) {
          console.error(`Operación ${item.id} falló después de ${this.maxRetries} intentos`);
          processedItems.push(item.id); // Remover de la cola
        }
      }
    }

    // Remover elementos procesados de la cola
    store.pendingQueue = store.pendingQueue.filter(item => !processedItems.includes(item.id));
    store.lastSync = Date.now();
    this.saveOfflineStore(store);

    this.notifySyncListeners();
    console.log(`Sincronización completada. ${processedItems.length} operaciones procesadas.`);
  }

  // Procesar elemento individual de sincronización
  private async processSyncItem(_item: OfflineQueueItem): Promise<void> {
    // Aquí se integraría con el financialService real
    // Por ahora simularemos la operación
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // En una implementación real, aquí harías:
    // switch (item.collection) {
    //   case 'transactions':
    //     await financialService.syncTransaction(item);
    //     break;
    //   case 'budgets':
    //     await financialService.syncBudget(item);
    //     break;
    //   case 'customers':
    //     await financialService.syncCustomer(item);
    //     break;
    // }
  }

  // Obtener estadísticas de sincronización
  getSyncStats(): {
    pendingCount: number;
    lastSync: Date | null;
    isOnline: boolean;
    failedOperations: number;
  } {
    const store = this.getOfflineStore();
    const failedOperations = store.pendingQueue.filter(item => item.retryCount >= this.maxRetries).length;

    return {
      pendingCount: store.pendingQueue.length,
      lastSync: store.lastSync ? new Date(store.lastSync) : null,
      isOnline: store.isOnline,
      failedOperations
    };
  }

  // Limpiar datos offline
  clearOfflineData(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Registrar listener para cambios de sincronización
  addSyncListener(callback: () => void): void {
    this.syncListeners.add(callback);
  }

  // Desregistrar listener
  removeSyncListener(callback: () => void): void {
    this.syncListeners.delete(callback);
  }

  // Notificar listeners
  private notifySyncListeners(): void {
    this.syncListeners.forEach(callback => callback());
  }

  // Exportar datos para backup
  exportOfflineData(): string {
    const store = this.getOfflineStore();
    return JSON.stringify(store, null, 2);
  }

  // Importar datos desde backup
  importOfflineData(dataJson: string): void {
    try {
      const data = JSON.parse(dataJson);
      this.saveOfflineStore(data);
      console.log('Datos offline importados correctamente');
    } catch (error) {
      console.error('Error importando datos offline:', error);
      throw new Error('Formato de datos inválido');
    }
  }
}

export const offlineService = new OfflineService();
