import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SyncStatus } from '../../components/ui/SyncStatus';
import { OfflineBanner } from '../../components/ui/OfflineIndicator';
import { OfflineSettings } from '../../components/ui/OfflineSettings';
import { ConnectionErrorAlerts } from '../../components/ui/ConnectionErrorAlerts';
import TransactionForm from '../../components/financial/TransactionForm';
import BudgetForm from '../../components/financial/BudgetForm';
import CustomerForm from '../../components/financial/CustomerForm';
import { useOfflineData } from '../../hooks/useOfflineData';
import { Settings, Plus, DollarSign, Target, Users, Edit, Trash2 } from 'lucide-react';
import type { Transaction, Budget, ProfitLossData, Customer } from '../../services/financialService';
import { offlineService } from '../../services/offlineService';
import { firebaseSyncService } from '../../services/firebaseSyncService';

const FinancialPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profitLossData, setProfitLossData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'budgets' | 'reports' | 'customers'>('transactions');
  const [showOfflineSettings, setShowOfflineSettings] = useState(false);
  
  // Estados para formularios
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ isSyncing: false, lastSync: null as Date | null });

  // Hook para manejo offline
  const { isOnline } = useOfflineData({
    autoSync: true,
    onSyncComplete: () => {
      console.log('Sincronización completada');
      loadFinancialData();
    },
    onSyncError: (error) => {
      console.error('Error en sincronización:', error);
      setError('Error al sincronizar datos offline');
    }
  });

  console.log('Estado online:', isOnline);

  useEffect(() => {
    loadFinancialData();
  }, []);

  // Escuchar cambios en el estado de sincronización
  useEffect(() => {
    const handleSyncStatus = (status: any) => {
      setSyncStatus({
        isSyncing: status.isSyncing,
        lastSync: status.lastSync
      });
    };

    firebaseSyncService.addSyncListener(handleSyncStatus);
    
    return () => {
      firebaseSyncService.removeSyncListener(handleSyncStatus);
    };
  }, []);

  // Configurar sincronización automática cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && !syncStatus.isSyncing) {
        console.log('🔄 Sincronización automática cada 5 minutos');
        firebaseSyncService.attemptSync('demo-user');
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [syncStatus.isSyncing]);

  // Validar integridad de datos cuando cambien las transacciones
  useEffect(() => {
    if (transactions.length > 0) {
      validateDataIntegrity();
    }
  }, [transactions]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando datos financieros...');
      
      // Primero intentar cargar desde Firebase (si hay conexión)
      if (navigator.onLine) {
        try {
          console.log('🌐 Intentando cargar desde Firebase...');
          const firebaseData = await firebaseSyncService.loadDataFromFirebase('demo-user');
          
          setTransactions(firebaseData.transactions);
          setBudgets(firebaseData.budgets);
          setCustomers(firebaseData.customers);
          updateFinancialSummary(firebaseData.transactions);
          
          console.log('✅ Datos cargados desde Firebase exitosamente');
          setLoading(false);
          return;
          
        } catch (firebaseError) {
          console.warn('⚠️ Error cargando desde Firebase, intentando offline:', firebaseError);
          // Continuar con carga offline si Firebase falla
        }
      }
      
      // Fallback: cargar datos offline/persistidos
      const offlineStore = offlineService.getOfflineStore();
      console.log('📦 Datos offline encontrados:', {
        transactions: offlineStore.transactions.length,
        budgets: offlineStore.budgets.length,
        customers: offlineStore.customers.length
      });

      // Si hay datos offline, usarlos
      if (offlineStore.transactions.length > 0 || offlineStore.budgets.length > 0 || offlineStore.customers.length > 0) {
        console.log('✅ Cargando datos desde localStorage');
        
        // Convertir fechas string de vuelta a objetos Date
        const transactionsWithDates = offlineStore.transactions.map((t, index) => {
          try {
            return {
              ...t,
              date: new Date(t.date),
              dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
              createdAt: new Date(t.createdAt),
              updatedAt: new Date(t.updatedAt)
            };
          } catch (error) {
            console.error(`Error convirtiendo fechas en transacción ${index}:`, error, t);
            // Usar fechas por defecto si hay error
            return {
              ...t,
              date: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            };
          }
        });
        
        const budgetsWithDates = offlineStore.budgets.map(b => ({
          ...b,
          startDate: new Date(b.startDate),
          endDate: new Date(b.endDate),
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt)
        }));
        
        const customersWithDates = offlineStore.customers.map(c => ({
          ...c,
          lastSaleDate: c.lastSaleDate ? new Date(c.lastSaleDate) : undefined,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt)
        }));
        
        setTransactions(transactionsWithDates);
        setBudgets(budgetsWithDates);
        setCustomers(customersWithDates);
        
        // Calcular datos de profit/loss basado en transacciones reales
        updateFinancialSummary(transactionsWithDates);
        
        // Notificar que los datos se cargaron correctamente
        window.dispatchEvent(new CustomEvent('financial-error', {
          detail: { 
            errorKey: 'data-loaded',
            message: `✅ Datos cargados: ${transactionsWithDates.length} transacciones, ${budgetsWithDates.length} presupuestos`,
            type: 'info' 
          }
        }));
        
        setLoading(false);
        return;
      }

      // Si no hay datos offline, cargar datos demo iniciales
      console.log('📄 No hay datos persistidos, cargando datos demo');
      
      const demoTransactions: Transaction[] = [
        {
          id: '1',
          userId: 'demo-user',
          type: 'income',
          category: 'Venta de Cosecha',
          amount: 16500, // $16,500 USD
          currency: 'USD',
          description: 'Venta de maíz - Temporada 2024',
          date: new Date('2024-07-15'),
          paymentMethod: 'Transferencia',
          paymentStatus: 'paid',
          tags: ['maíz', 'cosecha'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'demo-user',
          type: 'expense',
          category: 'Semillas',
          amount: 2750, // $2,750 USD
          currency: 'USD',
          description: 'Compra de semillas de trigo',
          date: new Date('2024-06-20'),
          paymentMethod: 'Efectivo',
          paymentStatus: 'paid',
          tags: ['trigo', 'siembra'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          userId: 'demo-user',
          type: 'expense',
          category: 'Fertilizantes',
          amount: 3520, // $3,520 USD
          currency: 'USD',
          description: 'Fertilizante NPK para cultivos',
          date: new Date('2024-05-10'),
          paymentMethod: 'Tarjeta',
          paymentStatus: 'paid',
          tags: ['fertilizante', 'NPK'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const demoBudgets: Budget[] = [
        {
          id: '1',
          userId: 'demo-user',
          name: 'Presupuesto Anual 2024',
          description: 'Presupuesto principal para la temporada',
          type: 'annual',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          totalBudget: 55000, // $55,000 USD
          actualSpent: 17270, // $17,270 USD
          actualIncome: 16500, // $16,500 USD
          variance: -68.6,
          currency: 'USD',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const demoCustomers: Customer[] = [
        {
          id: '1',
          userId: 'demo-user',
          name: 'Cooperativa Local',
          email: 'ventas@cooperativa.com',
          phone: '+1 555 987 6543',
          paymentTerms: '30-dias',
          totalSales: 16500, // $16,500 USD
          outstandingBalance: 0,
          lastSaleDate: new Date('2024-07-15'),
          notes: 'Cliente principal para ventas de maíz',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'demo-user',
          name: 'Semillas García',
          email: 'pedidos@semillasgarcia.us',
          phone: '+1 555 123 4567',
          paymentTerms: 'contado',
          totalSales: 0,
          outstandingBalance: 2750, // $2,750 USD
          notes: 'Proveedor de semillas',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const demoProfitLossData: ProfitLossData = {
        totalIncome: 16500, // $16,500 USD
        totalExpenses: 6270, // $6,270 USD
        grossProfit: 10230, // $10,230 USD
        netProfit: 10230, // $10,230 USD
        profitMargin: 62,
        incomeByCategory: [
          { category: 'Venta de Cosecha', amount: 16500, percentage: 100, count: 1, average: 16500 }
        ],
        expensesByCategory: [
          { category: 'Semillas', amount: 2750, percentage: 43.9, count: 1, average: 2750 },
          { category: 'Fertilizantes', amount: 3520, percentage: 56.1, count: 1, average: 3520 }
        ],
        monthlyTrend: [
          { month: '2024-05', income: 0, expenses: 3520, profit: -3520 },
          { month: '2024-06', income: 0, expenses: 2750, profit: -2750 },
          { month: '2024-07', income: 16500, expenses: 0, profit: 16500 }
        ]
      };

      setTransactions(demoTransactions);
      setBudgets(demoBudgets);
      setCustomers(demoCustomers);
      setProfitLossData(demoProfitLossData);
      
      // Guardar datos demo en localStorage para persistencia
      console.log('💾 Guardando datos demo en localStorage');
      const store = offlineService.getOfflineStore();
      store.transactions = demoTransactions;
      store.budgets = demoBudgets;
      store.customers = demoCustomers;
      localStorage.setItem('campo360_offline_data', JSON.stringify(store));
      
    } catch (error) {
      console.error('Error loading financial data:', error);
      setError('Error al cargar los datos financieros');
    } finally {
      setLoading(false);
    }
  };

  const updateFinancialSummary = (updatedTransactions: Transaction[]) => {
    // Recalcular los datos de profit/loss basado en las transacciones actuales
    const totalIncome = updatedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = updatedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const newProfitLossData: ProfitLossData = {
      totalIncome,
      totalExpenses,
      grossProfit: totalIncome - totalExpenses,
      netProfit: totalIncome - totalExpenses,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      incomeByCategory: [],
      expensesByCategory: [],
      monthlyTrend: []
    };
    
    setProfitLossData(newProfitLossData);
  };

  const handleTransactionCreated = async (newTransaction: Transaction) => {
    console.log('🆕 Nueva transacción creada:', newTransaction);
    
    setTransactions(prev => {
      const updatedTransactions = [newTransaction, ...prev];
      console.log('📊 Total transacciones:', updatedTransactions.length);
      
      // Actualizar resumen inmediatamente
      updateFinancialSummary(updatedTransactions);
      
      // Persistir en localStorage inmediatamente
      const store = offlineService.getOfflineStore();
      store.transactions = updatedTransactions;
      offlineService.saveOfflineStore(store);
      console.log('💾 Transacciones persistidas en localStorage');
      
      return updatedTransactions;
    });
    
    // Intentar sincronizar con Firebase inmediatamente
    if (navigator.onLine) {
      try {
        await firebaseSyncService.syncToFirebase('demo-user');
        console.log('🔄 Transacción sincronizada con Firebase');
      } catch (error) {
        console.warn('⚠️ Error sincronizando con Firebase:', error);
      }
    }
    
    // Mostrar notificación de éxito
    window.dispatchEvent(new CustomEvent('financial-error', {
      detail: { 
        errorKey: 'transaction-created',
        message: `✅ Transacción de ${formatCurrency(newTransaction.amount)} agregada y ${navigator.onLine ? 'sincronizada' : 'guardada offline'}`,
        type: 'info' 
      }
    }));
  };

  const handleBudgetCreated = async (newBudget: Budget) => {
    console.log('🆕 Nuevo presupuesto creado:', newBudget);
    setBudgets(prev => {
      const updatedBudgets = [newBudget, ...prev];
      
      // Persistir en localStorage
      const store = offlineService.getOfflineStore();
      store.budgets = updatedBudgets;
      offlineService.saveOfflineStore(store);
      console.log('💾 Presupuestos persistidos en localStorage');
      
      return updatedBudgets;
    });
    
    // Intentar sincronizar con Firebase
    if (navigator.onLine) {
      try {
        await firebaseSyncService.syncToFirebase('demo-user');
      } catch (error) {
        console.warn('⚠️ Error sincronizando presupuesto con Firebase:', error);
      }
    }
    
    window.dispatchEvent(new CustomEvent('financial-error', {
      detail: { 
        errorKey: 'budget-created',
        message: `✅ Presupuesto "${newBudget.name}" creado y ${navigator.onLine ? 'sincronizado' : 'guardado offline'}`,
        type: 'info' 
      }
    }));
  };

  const handleCustomerCreated = async (newCustomer: Customer) => {
    console.log('🆕 Nuevo cliente/proveedor creado:', newCustomer);
    setCustomers(prev => {
      const updatedCustomers = [newCustomer, ...prev];
      
      // Persistir en localStorage
      const store = offlineService.getOfflineStore();
      store.customers = updatedCustomers;
      offlineService.saveOfflineStore(store);
      console.log('💾 Clientes persistidos en localStorage');
      
      return updatedCustomers;
    });
    
    // Intentar sincronizar con Firebase
    if (navigator.onLine) {
      try {
        await firebaseSyncService.syncToFirebase('demo-user');
      } catch (error) {
        console.warn('⚠️ Error sincronizando cliente con Firebase:', error);
      }
    }
    
    window.dispatchEvent(new CustomEvent('financial-error', {
      detail: { 
        errorKey: 'customer-created',
        message: `✅ Cliente "${newCustomer.name}" creado y ${navigator.onLine ? 'sincronizado' : 'guardado offline'}`,
        type: 'info' 
      }
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        console.warn('Fecha inválida detectada:', date);
        return 'Fecha inválida';
      }
      
      return new Intl.DateTimeFormat('es-ES').format(dateObj);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };

  // Función para limpiar todos los datos (útil para testing)
  const clearAllData = () => {
    console.log('🗑️ Limpiando todos los datos...');
    localStorage.removeItem('campo360_offline_data');
    setTransactions([]);
    setBudgets([]);
    setCustomers([]);
    setProfitLossData(null);
    
    window.dispatchEvent(new CustomEvent('financial-error', {
      detail: { 
        errorKey: 'data-cleared',
        message: '🗑️ Todos los datos han sido eliminados',
        type: 'info' 
      }
    }));
  };

  // Función para validar que los objetos tengan fechas válidas
  const validateDataIntegrity = () => {
    let hasErrors = false;
    
    transactions.forEach((t, index) => {
      if (!t.date || isNaN(new Date(t.date).getTime())) {
        console.error(`Transacción ${index} tiene fecha inválida:`, t);
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      console.warn('⚠️ Se encontraron errores en los datos. Limpiando...');
      clearAllData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Banner offline */}
      <OfflineBanner className="mb-4" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Módulo Financiero</h1>
        <div className="flex items-center space-x-4">
          {/* Indicador de sincronización */}
          <SyncStatus />
          
          {/* Botón de configuración offline */}
          <button
            onClick={() => setShowOfflineSettings(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Configuración offline"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {/* Botón de sincronización con Firebase */}
          <button
            onClick={async () => {
              if (!navigator.onLine) {
                window.dispatchEvent(new CustomEvent('financial-error', {
                  detail: { 
                    errorKey: 'sync-offline',
                    message: '📴 Sin conexión. La sincronización se realizará automáticamente cuando haya internet.',
                    type: 'warning' 
                  }
                }));
                return;
              }
              
              try {
                await firebaseSyncService.syncToFirebase('demo-user');
                await loadFinancialData(); // Recargar datos después de sincronizar
              } catch (error) {
                console.error('Error en sincronización manual:', error);
                window.dispatchEvent(new CustomEvent('financial-error', {
                  detail: { 
                    errorKey: 'sync-error',
                    message: '❌ Error al sincronizar con Firebase',
                    type: 'error' 
                  }
                }));
              }
            }}
            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
            title="Sincronizar con Firebase"
          >
            🔄
          </button>
          
          {/* Botón de información del estado */}
          <button
            onClick={() => {
              const store = offlineService.getOfflineStore();
              console.log('📊 Estado actual:', {
                transacciones: transactions.length,
                presupuestos: budgets.length,
                clientes: customers.length,
                localStorage: store
              });
              window.dispatchEvent(new CustomEvent('financial-error', {
                detail: { 
                  errorKey: 'status-info',
                  message: `📊 Estado: ${transactions.length} transacciones, ${budgets.length} presupuestos, ${customers.length} clientes`,
                  type: 'info' 
                }
              }));
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            title="Ver estado de datos"
          >
            📊
          </button>
          
          {/* Botón para limpiar datos */}
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
                clearAllData();
              }
            }}
            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            title="Limpiar todos los datos"
          >
            🗑️
          </button>
          
          <button
            onClick={loadFinancialData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar Datos'}
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Aviso
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen financiero */}
      {profitLossData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ingresos Totales
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(profitLossData.totalIncome)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Gastos Totales
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(profitLossData.totalExpenses)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Beneficio Neto
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(profitLossData.netProfit)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">%</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Margen de Beneficio
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {profitLossData.profitMargin.toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de persistencia y sincronización */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-blue-700">
            <div className="flex items-center">
              <span className="mr-2">💾</span>
              <span>Datos guardados automáticamente</span>
            </div>
            {navigator.onLine && (
              <div className="flex items-center">
                <span className="mr-2">🔄</span>
                <span>{syncStatus.isSyncing ? 'Sincronizando...' : 'Sincronizado con Firebase'}</span>
              </div>
            )}
          </div>
          <div className="text-blue-600">
            {transactions.length} transacciones • {budgets.length} presupuestos • {customers.length} clientes
            {syncStatus.lastSync && (
              <span className="ml-2 text-xs">
                • Última sync: {syncStatus.lastSync.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'transactions', name: 'Transacciones', icon: DollarSign },
            { id: 'budgets', name: 'Presupuestos', icon: Target },
            { id: 'customers', name: 'Clientes/Proveedores', icon: Users },
            { id: 'reports', name: 'Reportes', icon: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Botón para agregar transacción */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Transacciones</h2>
            <button
              onClick={() => setShowTransactionForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Transacción
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Transacciones Recientes
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Total: {transactions.length} transacciones
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {isOnline ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      🟢 En línea
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      📴 Offline
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {transactions.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No hay transacciones
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza agregando tu primera transacción.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowTransactionForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Transacción
                  </button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">{transactions.map((transaction) => (
                <li key={transaction.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            {/* Indicador de transacción offline */}
                            {transaction.id.startsWith('transaction_') && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                📴 Offline
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {transaction.category} • {formatDate(transaction.date)} • {transaction.paymentMethod}
                          </p>
                          {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex items-center space-x-1 mt-1">
                              {transaction.tags.map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className={`text-sm font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {transaction.paymentStatus === 'paid' ? '✅ Pagado' : 
                             transaction.paymentStatus === 'pending' ? '⏳ Pendiente' : 
                             transaction.paymentStatus === 'overdue' ? '🔴 Vencido' : '❌ Cancelado'}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            className="text-gray-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === 'budgets' && (
        <div className="space-y-6">
          {/* Botón para agregar presupuesto */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Presupuestos</h2>
            <button
              onClick={() => setShowBudgetForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Presupuesto
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Presupuestos
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Control y seguimiento de presupuestos
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              {budgets.map((budget) => (
                <div key={budget.id} className="mb-6 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-medium text-gray-900">{budget.name}</h4>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        {formatCurrency(budget.actualSpent)} / {formatCurrency(budget.totalBudget)}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          className="text-gray-400 hover:text-blue-600"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((budget.actualSpent / budget.totalBudget) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{((budget.actualSpent / budget.totalBudget) * 100).toFixed(1)}% utilizado</span>
                    <span>Ingresos: {formatCurrency(budget.actualIncome)}</span>
                  </div>
                  {budget.description && (
                    <p className="text-sm text-gray-600 mt-2">{budget.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Botón para agregar cliente/proveedor */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Clientes y Proveedores</h2>
            <button
              onClick={() => setShowCustomerForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contacto
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Lista de Contactos
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Gestión de clientes y proveedores
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <li key={customer.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                          customer.totalSales > 0 ? 'bg-green-400' : 'bg-blue-400'
                        }`} />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.email} • {customer.paymentTerms}
                          </p>
                          {customer.notes && (
                            <p className="text-xs text-gray-400 mt-1">{customer.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {customer.totalSales > 0 ? 'Cliente' : 'Proveedor'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {customer.totalSales > 0 
                              ? `Ventas: ${formatCurrency(customer.totalSales)}`
                              : `Pendiente: ${formatCurrency(customer.outstandingBalance)}`
                            }
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            className="text-gray-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'reports' && profitLossData && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Análisis Financiero
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Desglose de ingresos y gastos por categoría
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <div className="space-y-6">
              {/* Ingresos por categoría */}
              <div>
                <h4 className="text-md font-semibold text-green-600 mb-3">Ingresos por Categoría</h4>
                <div className="space-y-2">
                  {profitLossData.incomeByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3 bg-green-400" />
                        <span className="text-sm font-medium text-gray-900">{category.category}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(category.amount)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gastos por categoría */}
              <div>
                <h4 className="text-md font-semibold text-red-600 mb-3">Gastos por Categoría</h4>
                <div className="space-y-2">
                  {profitLossData.expensesByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3 bg-red-400" />
                        <span className="text-sm font-medium text-gray-900">{category.category}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(category.amount)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tendencia mensual */}
              <div>
                <h4 className="text-md font-semibold text-blue-600 mb-3">Tendencia Mensual</h4>
                <div className="space-y-2">
                  {profitLossData.monthlyTrend.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-green-600">
                          Ingresos: {formatCurrency(month.income)}
                        </span>
                        <span className="text-xs text-red-600">
                          Gastos: {formatCurrency(month.expenses)}
                        </span>
                        <span className={`text-sm font-semibold ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {month.profit >= 0 ? '+' : ''}{formatCurrency(month.profit)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Formularios */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onTransactionCreated={handleTransactionCreated}
      />

      <BudgetForm
        isOpen={showBudgetForm}
        onClose={() => setShowBudgetForm(false)}
        onBudgetCreated={handleBudgetCreated}
      />

      <CustomerForm
        isOpen={showCustomerForm}
        onClose={() => setShowCustomerForm(false)}
        onCustomerCreated={handleCustomerCreated}
      />
      
      {/* Modal de configuración offline */}
      <OfflineSettings 
        isOpen={showOfflineSettings}
        onClose={() => setShowOfflineSettings(false)}
      />
      
      {/* Alertas de errores de conexión */}
      <ConnectionErrorAlerts />
    </div>
  );
};

export default FinancialPage;
