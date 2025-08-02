import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  limit,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { offlineService } from './offlineService';
import { ErrorNotificationService } from './connectionErrorDetector';
import type { Transaction, Budget, Customer } from './financialService';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  syncError: string | null;
}

class FirebaseSyncService {
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingOperations: 0,
    syncError: null
  };

  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private unsubscribeCallbacks: Unsubscribe[] = [];

  constructor() {
    this.initializeSync();
  }

  private initializeSync() {
    // Detectar cambios de conectividad
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      this.attemptSync();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    });
  }

  // Registrar listener para cambios de estado
  addSyncListener(callback: (status: SyncStatus) => void): void {
    this.listeners.add(callback);
  }

  removeSyncListener(callback: (status: SyncStatus) => void): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback({ ...this.syncStatus }));
  }

  // Obtener estado actual
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Cargar datos desde Firebase
  async loadDataFromFirebase(userId: string): Promise<{
    transactions: Transaction[];
    budgets: Budget[];
    customers: Customer[];
  }> {
    try {
      this.syncStatus.isSyncing = true;
      this.syncStatus.syncError = null;
      this.notifyListeners();

      console.log('🔄 Cargando datos desde Firebase para usuario:', userId);

      // Cargar transacciones - Simplificar consulta para evitar error de índice
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        limit(100)
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions: Transaction[] = transactionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : (data.dueDate ? new Date(data.dueDate) : undefined),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        } as Transaction;
      });

      // Ordenar por fecha en el cliente en lugar de en Firebase
      transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Cargar presupuestos - Simplificar consulta
      const budgetsQuery = query(
        collection(db, 'budgets'),
        where('userId', '==', userId),
        limit(50)
      );

      const budgetsSnapshot = await getDocs(budgetsQuery);
      const budgets: Budget[] = budgetsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
          endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        } as Budget;
      });

      // Ordenar presupuestos por fecha de creación
      budgets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Cargar clientes - Simplificar consulta
      const customersQuery = query(
        collection(db, 'customers'),
        where('userId', '==', userId),
        limit(50)
      );

      const customersSnapshot = await getDocs(customersQuery);
      const customers: Customer[] = customersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastSaleDate: data.lastSaleDate?.toDate ? data.lastSaleDate.toDate() : (data.lastSaleDate ? new Date(data.lastSaleDate) : undefined),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        } as Customer;
      });

      // Ordenar clientes por fecha de creación
      customers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Actualizar localStorage con datos de Firebase
      const store = offlineService.getOfflineStore();
      store.transactions = transactions;
      store.budgets = budgets;
      store.customers = customers;
      store.lastSync = Date.now();
      localStorage.setItem('campo360_offline_data', JSON.stringify(store));

      this.syncStatus.lastSync = new Date();
      this.syncStatus.isSyncing = false;
      this.notifyListeners();

      console.log(`✅ Datos cargados desde Firebase:`, {
        transactions: transactions.length,
        budgets: budgets.length,
        customers: customers.length
      });

      ErrorNotificationService.showInfoOnce(
        'firebase-sync-success',
        `✅ Sincronizado: ${transactions.length} transacciones, ${budgets.length} presupuestos desde Firebase`,
        3000
      );

      return { transactions, budgets, customers };

    } catch (error) {
      console.error('❌ Error cargando datos desde Firebase:', error);
      this.syncStatus.syncError = error instanceof Error ? error.message : 'Error desconocido';
      this.syncStatus.isSyncing = false;
      this.notifyListeners();

      ErrorNotificationService.showWarningOnce(
        'firebase-load-error',
        '⚠️ Error al cargar desde Firebase. Usando datos offline.',
        5000
      );

      // Devolver datos offline como fallback
      const store = offlineService.getOfflineStore();
      return {
        transactions: store.transactions.map(t => ({
          ...t,
          date: new Date(t.date),
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        })),
        budgets: store.budgets.map(b => ({
          ...b,
          startDate: new Date(b.startDate),
          endDate: new Date(b.endDate),
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt)
        })),
        customers: store.customers.map(c => ({
          ...c,
          lastSaleDate: c.lastSaleDate ? new Date(c.lastSaleDate) : undefined,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt)
        }))
      };
    }
  }

  // Sincronizar datos locales a Firebase
  async syncToFirebase(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      console.log('📴 Sin conexión, no se puede sincronizar a Firebase');
      return;
    }

    try {
      this.syncStatus.isSyncing = true;
      this.notifyListeners();

      const store = offlineService.getOfflineStore();
      const { pendingQueue } = store;

      console.log(`🔄 Sincronizando ${pendingQueue.length} operaciones pendientes a Firebase`);

      let syncedCount = 0;

      for (const operation of pendingQueue) {
        try {
          await this.processPendingOperation(operation);
          syncedCount++;
          
          // Remover operación exitosa de la cola
          store.pendingQueue = store.pendingQueue.filter(op => op.id !== operation.id);
          offlineService.saveOfflineStore(store);
          
        } catch (error) {
          console.error(`❌ Error sincronizando operación ${operation.id}:`, error);
        }
      }

      this.syncStatus.pendingOperations = store.pendingQueue.length;
      this.syncStatus.lastSync = new Date();
      this.syncStatus.isSyncing = false;
      this.notifyListeners();

      if (syncedCount > 0) {
        ErrorNotificationService.showInfoOnce(
          'sync-to-firebase-success',
          `✅ ${syncedCount} operaciones sincronizadas a Firebase`,
          3000
        );
      }

    } catch (error) {
      console.error('❌ Error en sincronización a Firebase:', error);
      this.syncStatus.syncError = error instanceof Error ? error.message : 'Error desconocido';
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async processPendingOperation(operation: any): Promise<void> {
    const { type, collection: collectionName, data } = operation;

    switch (type) {
      case 'CREATE':
        await addDoc(collection(db, collectionName), {
          ...data,
          date: data.date ? Timestamp.fromDate(new Date(data.date)) : null,
          dueDate: data.dueDate ? Timestamp.fromDate(new Date(data.dueDate)) : null,
          startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : null,
          endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
          lastSaleDate: data.lastSaleDate ? Timestamp.fromDate(new Date(data.lastSaleDate)) : null,
          createdAt: Timestamp.fromDate(new Date(data.createdAt)),
          updatedAt: Timestamp.fromDate(new Date())
        });
        break;

      case 'UPDATE':
        await updateDoc(doc(db, collectionName, data.id), {
          ...data,
          updatedAt: Timestamp.fromDate(new Date())
        });
        break;

      case 'DELETE':
        await deleteDoc(doc(db, collectionName, data.id));
        break;
    }
  }

  // Intentar sincronización automática
  async attemptSync(userId: string = 'demo-user'): Promise<void> {
    if (!this.syncStatus.isOnline || this.syncStatus.isSyncing) {
      return;
    }

    try {
      // Primero sincronizar cambios locales a Firebase
      await this.syncToFirebase();
      
      // Luego cargar cambios desde Firebase (para otros dispositivos)
      await this.loadDataFromFirebase(userId);
      
    } catch (error) {
      console.error('❌ Error en sincronización automática:', error);
    }
  }

  // Configurar listeners en tiempo real (opcional)
  setupRealtimeListeners(userId: string): void {
    if (!this.syncStatus.isOnline) return;

    try {
      // Listener para transacciones
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId)
      );

      const unsubTransactions = onSnapshot(transactionsQuery, (_snapshot) => {
        console.log('🔔 Cambios detectados en transacciones desde otros dispositivos');
        // Notificar que hay cambios disponibles
        ErrorNotificationService.showInfoOnce(
          'realtime-changes',
          '🔔 Cambios detectados desde otro dispositivo. Actualizando...',
          3000
        );
      });

      this.unsubscribeCallbacks.push(unsubTransactions);

    } catch (error) {
      console.error('❌ Error configurando listeners en tiempo real:', error);
    }
  }

  // Limpiar listeners
  cleanup(): void {
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    this.unsubscribeCallbacks = [];
  }
}

export const firebaseSyncService = new FirebaseSyncService();
