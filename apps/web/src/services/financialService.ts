import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { offlineService } from './offlineService';
import { ConnectionErrorDetector, ErrorNotificationService } from './connectionErrorDetector';

// Tipos financieros básicos
export interface Transaction {
  id: string;
  userId: string;
  farmId?: string;
  cropId?: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  dueDate?: Date;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'cancelled';
  reference?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  description?: string;
  farmId?: string;
  cropId?: string;
  type: 'annual' | 'seasonal' | 'project';
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  currency: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  actualSpent: number;
  actualIncome: number;
  variance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  paymentTerms: string;
  totalSales: number;
  outstandingBalance: number;
  lastSaleDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatePeriod {
  startDate: Date;
  endDate: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
}

export interface ReportFilters {
  farmId?: string;
  cropId?: string;
  categories?: string[];
  paymentMethods?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface ProfitLossData {
  totalIncome: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  incomeByCategory: CategorySummary[];
  expensesByCategory: CategorySummary[];
  monthlyTrend: MonthlyData[];
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  average: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface CashFlowData {
  openingBalance: number;
  closingBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  dailyFlow: DailyCashFlow[];
  projectedFlow: ProjectedCashFlow[];
}

export interface DailyCashFlow {
  date: Date;
  inflow: number;
  outflow: number;
  balance: number;
}

export interface ProjectedCashFlow {
  date: Date;
  projectedInflow: number;
  projectedOutflow: number;
  projectedBalance: number;
}

export interface ROIAnalysis {
  cropId: string;
  cropName: string;
  totalInvestment: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  roiPercentage: number;
  paybackPeriod: number;
  profitMargin: number;
}

// Funciones utilitarias
const calculateVariance = (planned: number, actual: number): number => {
  if (planned === 0) return actual > 0 ? 100 : 0;
  return ((actual - planned) / planned) * 100;
};

const calculateROI = (investment: number, returns: number): number => {
  if (investment === 0) return 0;
  return ((returns - investment) / investment) * 100;
};

const groupTransactionsByPeriod = (
  transactions: Transaction[],
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): { [key: string]: Transaction[] } => {
  return transactions.reduce((groups, transaction) => {
    let key: string;
    const date = new Date(transaction.date);
    
    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'yearly':
        key = String(date.getFullYear());
        break;
    }
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(transaction);
    return groups;
  }, {} as { [key: string]: Transaction[] });
};

class FinancialService {
  private readonly COLLECTIONS = {
    TRANSACTIONS: 'transactions',
    BUDGETS: 'budgets',
    INVOICES: 'invoices',
    CUSTOMERS: 'customers',
    SUPPLIERS: 'suppliers',
    GOALS: 'financial_goals',
    REPORTS: 'financial_reports'
  };

  // ========== TRANSACCIONES ==========

  async createTransaction(userId: string, transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date();
    const transaction: Omit<Transaction, 'id'> = {
      ...transactionData,
      userId,
      date: transactionData.date || now,
      createdAt: now,
      updatedAt: now
    };

    // Generar ID único para la transacción
    const tempId = `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTransaction = { ...transaction, id: tempId };
    
    console.log('🔄 Creando transacción:', newTransaction);

    // Verificar si está online y Firebase disponible
    if (!offlineService.isOnline()) {
      console.log('📴 Modo offline: guardando transacción localmente');
      offlineService.saveTransactionOffline(newTransaction, 'CREATE', userId);
      
      // Notificar que se guardó offline
      ErrorNotificationService.showInfoOnce(
        'transaction-offline',
        '📴 Transacción guardada offline. Se sincronizará cuando haya conexión.',
        5000
      );
      
      return newTransaction;
    }

    try {
      // Intentar guardar en Firebase
      const docRef = await addDoc(collection(db, this.COLLECTIONS.TRANSACTIONS), {
        ...transaction,
        date: Timestamp.fromDate(transaction.date),
        dueDate: transaction.dueDate ? Timestamp.fromDate(transaction.dueDate) : null,
        createdAt: Timestamp.fromDate(transaction.createdAt),
        updatedAt: Timestamp.fromDate(transaction.updatedAt)
      });

      console.log('✅ Transacción guardada en Firebase con ID:', docRef.id);
      return { ...transaction, id: docRef.id };
      
    } catch (error) {
      console.error('❌ Error al guardar en Firebase, usando modo offline:', error);
      
      // Usar el detector de errores mejorado
      const errorType = ConnectionErrorDetector.getErrorType(error);
      const errorMessage = ConnectionErrorDetector.getErrorMessage(error);
      
      // Si es error de conexión bloqueada, usar modo offline
      if (errorType === 'blocked' || errorType === 'network') {
        console.log('🔒 Conexión bloqueada o sin red, guardando offline');
        
        offlineService.saveTransactionOffline(newTransaction, 'CREATE', userId);
        
        ErrorNotificationService.showWarningOnce(
          'transaction-blocked',
          '🔒 Firebase bloqueado. Transacción guardada offline y se sincronizará automáticamente.',
          8000
        );
        
        return newTransaction;
      }
      
      // Para otros errores, también guardar offline pero mostrar error específico
      offlineService.saveTransactionOffline(newTransaction, 'CREATE', userId);
      
      ErrorNotificationService.showErrorOnce(
        `transaction-error-${errorType}`,
        `Error: ${errorMessage}. Transacción guardada offline.`,
        8000
      );
      
      return newTransaction;
    }
  }

  async getTransactions(
    userId: string, 
    filters?: {
      farmId?: string;
      cropId?: string;
      type?: 'income' | 'expense';
      category?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<Transaction[]> {
    let onlineTransactions: Transaction[] = [];
    let offlineTransactions: Transaction[] = [];

    // Obtener datos offline
    offlineTransactions = offlineService.getOfflineTransactions()
      .filter(t => t.userId === userId);

    // Si está online, intentar obtener datos de Firebase con consulta simplificada
    if (offlineService.isOnline()) {
      try {
        // Usar consulta simple para evitar problemas de índices
        let q = query(
          collection(db, this.COLLECTIONS.TRANSACTIONS),
          where('userId', '==', userId)
        );

        // Solo agregar orderBy si no hay otros filtros complejos
        if (!filters?.farmId && !filters?.cropId && !filters?.type && !filters?.category && !filters?.startDate && !filters?.endDate) {
          q = query(q, orderBy('date', 'desc'));
        }

        if (filters?.limit && !filters?.farmId && !filters?.cropId && !filters?.type && !filters?.category && !filters?.startDate && !filters?.endDate) {
          q = query(q, limit(filters.limit));
        }

        const querySnapshot = await getDocs(q);
        onlineTransactions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            dueDate: data.dueDate?.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Transaction;
        });
      } catch (error) {
        console.error('Error fetching online transactions:', error);
        
        // Usar el detector de errores mejorado
        const errorType = ConnectionErrorDetector.getErrorType(error);
        let errorMessage = ConnectionErrorDetector.getErrorMessage(error);
        let actionUrl = '';
        let actionText = '';
        
        // Extraer URL del índice si es un error de índice
        if (errorType === 'firebase-index' && (error as any)?.message) {
          const urlMatch = (error as any).message.match(/https:\/\/[^\s]+/);
          if (urlMatch) {
            actionUrl = urlMatch[0];
            actionText = 'Configurar Firebase';
            errorMessage = '📊 Configuración de base de datos requerida. Click para configurar.';
          }
        }
        
        // Mostrar notificación una vez por tipo de error con mensaje específico
        let notificationMessage = errorMessage;
        if (errorType === 'firebase-index') {
          notificationMessage = '📊 Configurando base de datos. Usando modo offline temporalmente.';
        }
        
        ErrorNotificationService.showErrorOnce(
          `firebase-connection-${errorType}`,
          notificationMessage,
          errorType === 'firebase-index' ? 15000 : 10000, // Más tiempo para errores de índice
          actionUrl,
          actionText
        );
        
        // Log específico según el tipo de error
        switch (errorType) {
          case 'blocked':
            console.warn('🚫 Firebase bloqueado - usando datos offline únicamente');
            break;
          case 'network':
            console.warn('🌐 Sin conexión - usando datos offline únicamente');
            break;
          case 'firebase-index':
            console.warn('📊 Firebase requiere índices - usando datos offline únicamente');
            break;
          case 'firebase':
            console.warn('🔥 Error de Firebase - usando datos offline únicamente');
            break;
          default:
            console.warn('❓ Error desconocido - usando datos offline únicamente');
        }
        
        // Continuar con solo datos offline - no lanzar error
      }
    }

    // Combinar datos online y offline, eliminando duplicados
    const combinedTransactions = [...onlineTransactions];
    
    // Agregar transacciones offline que no existen online
    offlineTransactions.forEach(offlineTransaction => {
      const existsOnline = onlineTransactions.some(onlineTransaction => 
        onlineTransaction.id === offlineTransaction.id || 
        // Comparar por contenido para detectar transacciones ya sincronizadas
        (onlineTransaction.amount === offlineTransaction.amount &&
         onlineTransaction.description === offlineTransaction.description &&
         Math.abs(onlineTransaction.date.getTime() - offlineTransaction.date.getTime()) < 60000) // 1 minuto de diferencia
      );
      
      if (!existsOnline) {
        combinedTransactions.push(offlineTransaction);
      }
    });

    // Aplicar filtros a los datos combinados
    let filteredTransactions = combinedTransactions;

    if (filters?.farmId) {
      filteredTransactions = filteredTransactions.filter(t => t.farmId === filters.farmId);
    }

    if (filters?.cropId) {
      filteredTransactions = filteredTransactions.filter(t => t.cropId === filters.cropId);
    }

    if (filters?.type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
    }

    if (filters?.category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
    }

    if (filters?.startDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date >= filters.startDate!);
    }

    if (filters?.endDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date <= filters.endDate!);
    }

    // Ordenar por fecha (más recientes primero)
    filteredTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Aplicar límite si se especifica
    if (filters?.limit) {
      filteredTransactions = filteredTransactions.slice(0, filters.limit);
    }

    return filteredTransactions;
  }

  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTIONS.TRANSACTIONS, transactionId);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (updates.date && updates.date instanceof Date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      if (updates.dueDate && updates.dueDate instanceof Date) {
        updateData.dueDate = Timestamp.fromDate(updates.dueDate);
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw new Error('Failed to update transaction');
    }
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTIONS.TRANSACTIONS, transactionId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw new Error('Failed to delete transaction');
    }
  }

  // ========== PRESUPUESTOS ==========

  async createBudget(userId: string, budgetData: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    try {
      const now = new Date();
      const budget: Omit<Budget, 'id'> = {
        ...budgetData,
        userId,
        actualSpent: 0,
        actualIncome: 0,
        variance: 0,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, this.COLLECTIONS.BUDGETS), {
        ...budget,
        startDate: Timestamp.fromDate(budget.startDate),
        endDate: Timestamp.fromDate(budget.endDate),
        createdAt: Timestamp.fromDate(budget.createdAt),
        updatedAt: Timestamp.fromDate(budget.updatedAt)
      });

      return { ...budget, id: docRef.id };
    } catch (error) {
      console.error('Error creating budget:', error);
      throw new Error('Failed to create budget');
    }
  }

  async getBudgets(userId: string, status?: string): Promise<Budget[]> {
    try {
      let q = query(
        collection(db, this.COLLECTIONS.BUDGETS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Budget;
      });
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  }

  async updateBudgetActuals(budgetId: string): Promise<void> {
    try {
      const budgetRef = doc(db, this.COLLECTIONS.BUDGETS, budgetId);
      const budgetDoc = await getDoc(budgetRef);
      
      if (!budgetDoc.exists()) return;
      
      const budget = budgetDoc.data() as Budget;
      
      // Obtener transacciones del período del presupuesto
      const transactions = await this.getTransactions(budget.userId, {
        farmId: budget.farmId,
        cropId: budget.cropId,
        startDate: budget.startDate,
        endDate: budget.endDate
      });

      const actualIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const actualSpent = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const variance = calculateVariance(budget.totalBudget, actualSpent);

      await updateDoc(budgetRef, {
        actualIncome,
        actualSpent,
        variance,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating budget actuals:', error);
    }
  }

  // ========== ANÁLISIS Y REPORTES ==========

  async generateProfitLossReport(
    userId: string, 
    period: DatePeriod, 
    filters?: ReportFilters
  ): Promise<ProfitLossData> {
    try {
      const transactions = await this.getTransactions(userId, {
        startDate: period.startDate,
        endDate: period.endDate,
        farmId: filters?.farmId,
        cropId: filters?.cropId
      });

      const income = transactions.filter(t => t.type === 'income');
      const expenses = transactions.filter(t => t.type === 'expense');

      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
      const grossProfit = totalIncome - totalExpenses;
      const netProfit = grossProfit; // Simplificado por ahora
      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

      // Agrupar por categorías
      const incomeByCategory = this.groupByCategory(income);
      const expensesByCategory = this.groupByCategory(expenses);

      // Tendencia mensual
      const monthlyGroups = groupTransactionsByPeriod(transactions, 'monthly');
      const monthlyTrend = Object.entries(monthlyGroups).map(([month, monthTransactions]) => {
        const monthIncome = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const monthExpenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          month,
          income: monthIncome,
          expenses: monthExpenses,
          profit: monthIncome - monthExpenses
        };
      }).sort((a, b) => a.month.localeCompare(b.month));

      return {
        totalIncome,
        totalExpenses,
        grossProfit,
        netProfit,
        profitMargin,
        incomeByCategory,
        expensesByCategory,
        monthlyTrend
      };
    } catch (error) {
      console.error('Error generating profit loss report:', error);
      throw new Error('Failed to generate profit loss report');
    }
  }

  async generateCashFlowReport(
    userId: string, 
    period: DatePeriod,
    openingBalance: number = 0
  ): Promise<CashFlowData> {
    try {
      const transactions = await this.getTransactions(userId, {
        startDate: period.startDate,
        endDate: period.endDate
      });

      transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

      const dailyGroups = groupTransactionsByPeriod(transactions, 'daily');
      let runningBalance = openingBalance;
      
      const dailyFlow = Object.entries(dailyGroups).map(([date, dayTransactions]) => {
        const inflow = dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const outflow = dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        runningBalance = runningBalance + inflow - outflow;
        
        return {
          date: new Date(date),
          inflow,
          outflow,
          balance: runningBalance
        };
      }).sort((a, b) => a.date.getTime() - b.date.getTime());

      const totalInflow = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalOutflow = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        openingBalance,
        closingBalance: runningBalance,
        totalInflow,
        totalOutflow,
        netCashFlow: totalInflow - totalOutflow,
        dailyFlow,
        projectedFlow: [] // TODO: Implementar proyecciones
      };
    } catch (error) {
      console.error('Error generating cash flow report:', error);
      throw new Error('Failed to generate cash flow report');
    }
  }

  async generateROIAnalysis(userId: string, cropId?: string): Promise<ROIAnalysis[]> {
    try {
      // Si se especifica un cultivo, analizarlo específicamente
      if (cropId) {
        const transactions = await this.getTransactions(userId, { cropId });
        const analysis = this.calculateCropROI(transactions, cropId);
        return analysis ? [analysis] : [];
      }

      // Análisis de todos los cultivos
      const allTransactions = await this.getTransactions(userId);
      const cropGroups = allTransactions.reduce((groups, transaction) => {
        if (transaction.cropId) {
          if (!groups[transaction.cropId]) groups[transaction.cropId] = [];
          groups[transaction.cropId].push(transaction);
        }
        return groups;
      }, {} as { [cropId: string]: Transaction[] });

      const analyses: ROIAnalysis[] = [];
      for (const [cropId, transactions] of Object.entries(cropGroups)) {
        const analysis = this.calculateCropROI(transactions, cropId);
        if (analysis) analyses.push(analysis);
      }

      return analyses.sort((a, b) => b.roi - a.roi);
    } catch (error) {
      console.error('Error generating ROI analysis:', error);
      return [];
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  private groupByCategory(transactions: Transaction[]) {
    const groups = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = {
          category: transaction.category,
          amount: 0,
          count: 0,
          percentage: 0,
          average: 0
        };
      }
      acc[transaction.category].amount += transaction.amount;
      acc[transaction.category].count += 1;
      return acc;
    }, {} as { [key: string]: any });

    const total = Object.values(groups).reduce((sum: number, group: any) => sum + group.amount, 0);
    
    return Object.values(groups).map((group: any) => ({
      ...group,
      percentage: total > 0 ? (group.amount / total) * 100 : 0,
      average: group.count > 0 ? group.amount / group.count : 0
    }));
  }

  private calculateCropROI(transactions: Transaction[], cropId: string): ROIAnalysis | null {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    const totalRevenue = income.reduce((sum, t) => sum + t.amount, 0);
    const totalInvestment = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalRevenue - totalInvestment;
    const roi = calculateROI(totalInvestment, totalRevenue);

    if (totalInvestment === 0 && totalRevenue === 0) return null;

    return {
      cropId,
      cropName: `Cultivo ${cropId}`, // TODO: Obtener nombre real del cultivo
      totalInvestment,
      totalRevenue,
      netProfit,
      roi: netProfit,
      roiPercentage: roi,
      paybackPeriod: totalRevenue > 0 ? totalInvestment / (totalRevenue / 12) : 0, // Simplificado
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    };
  }

  // ========== CLIENTES Y PROVEEDORES ==========

  async createCustomer(userId: string, customerData: Omit<Customer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      const now = new Date();
      const customer: Omit<Customer, 'id'> = {
        ...customerData,
        userId,
        totalSales: 0,
        outstandingBalance: 0,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, this.COLLECTIONS.CUSTOMERS), {
        ...customer,
        createdAt: Timestamp.fromDate(customer.createdAt),
        updatedAt: Timestamp.fromDate(customer.updatedAt),
        lastSaleDate: customer.lastSaleDate ? Timestamp.fromDate(customer.lastSaleDate) : null
      });

      return { ...customer, id: docRef.id };
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async getCustomers(userId: string): Promise<Customer[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.CUSTOMERS),
        where('userId', '==', userId),
        orderBy('name')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastSaleDate: data.lastSaleDate?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Customer;
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }

  // ========== SUSCRIPCIONES EN TIEMPO REAL ==========

  subscribeToTransactions(
    userId: string, 
    callback: (transactions: Transaction[]) => void,
    filters?: { farmId?: string; cropId?: string }
  ): Unsubscribe {
    let q = query(
      collection(db, this.COLLECTIONS.TRANSACTIONS),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(50)
    );

    if (filters?.farmId) {
      q = query(q, where('farmId', '==', filters.farmId));
    }

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          dueDate: data.dueDate?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Transaction;
      });
      callback(transactions);
    });
  }

  // ========== UTILIDADES ==========

  async getFinancialSummary(userId: string, period: DatePeriod) {
    try {
      const transactions = await this.getTransactions(userId, {
        startDate: period.startDate,
        endDate: period.endDate
      });

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const profit = income - expenses;
      const transactionCount = transactions.length;
      const avgTransactionAmount = transactionCount > 0 ? (income + expenses) / transactionCount : 0;

      return {
        totalIncome: income,
        totalExpenses: expenses,
        netProfit: profit,
        transactionCount,
        avgTransactionAmount,
        profitMargin: income > 0 ? (profit / income) * 100 : 0
      };
    } catch (error) {
      console.error('Error calculating financial summary:', error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        transactionCount: 0,
        avgTransactionAmount: 0,
        profitMargin: 0
      };
    }
  }
}

// Crear instancia única del servicio
export const financialService = new FinancialService();
export default financialService;
