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

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Datos de demostración para evitar errores de Firebase
      const demoTransactions: Transaction[] = [
        {
          id: '1',
          userId: 'demo-user',
          type: 'income',
          category: 'Venta de Cosecha',
          amount: 15000,
          currency: 'EUR',
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
          amount: 2500,
          currency: 'EUR',
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
          amount: 3200,
          currency: 'EUR',
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
          totalBudget: 50000,
          actualSpent: 15700,
          actualIncome: 15000,
          variance: -68.6,
          currency: 'EUR',
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
          phone: '+34 987 654 321',
          paymentTerms: '30-dias',
          totalSales: 15000,
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
          email: 'pedidos@semillasgarcia.es',
          phone: '+34 123 456 789',
          paymentTerms: 'contado',
          totalSales: 0,
          outstandingBalance: 2500,
          notes: 'Proveedor de semillas',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const demoProfitLossData: ProfitLossData = {
        totalIncome: 15000,
        totalExpenses: 5700,
        grossProfit: 9300,
        netProfit: 9300,
        profitMargin: 62,
        incomeByCategory: [
          { category: 'Venta de Cosecha', amount: 15000, percentage: 100, count: 1, average: 15000 }
        ],
        expensesByCategory: [
          { category: 'Semillas', amount: 2500, percentage: 43.9, count: 1, average: 2500 },
          { category: 'Fertilizantes', amount: 3200, percentage: 56.1, count: 1, average: 3200 }
        ],
        monthlyTrend: [
          { month: '2024-05', income: 0, expenses: 3200, profit: -3200 },
          { month: '2024-06', income: 0, expenses: 2500, profit: -2500 },
          { month: '2024-07', income: 15000, expenses: 0, profit: 15000 }
        ]
      };

      setTransactions(demoTransactions);
      setBudgets(demoBudgets);
      setCustomers(demoCustomers);
      setProfitLossData(demoProfitLossData);
      
    } catch (error) {
      console.error('Error loading financial data:', error);
      setError('Error al cargar los datos financieros');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionCreated = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    loadFinancialData(); // Recargar para actualizar los resúmenes
  };

  const handleBudgetCreated = (newBudget: Budget) => {
    setBudgets(prev => [newBudget, ...prev]);
  };

  const handleCustomerCreated = (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES').format(date);
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
                    <span className="text-white text-sm font-medium">€</span>
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
                    <span className="text-white text-sm font-medium">€</span>
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
                    <span className="text-white text-sm font-medium">€</span>
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
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Transacciones Recientes
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Lista de transacciones de ingresos y gastos
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <li key={transaction.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.category} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
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
                  </div>
                </li>
              ))}
            </ul>
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
