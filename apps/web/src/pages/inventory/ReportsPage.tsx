import { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Filter, Package, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { inventoryService } from '../../services/firebaseService';
import { PDFExportService } from '../../services/pdfExportService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface ReportData {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  expiringSoon: number;
  monthlyMovement: number;
  topCategories: { name: string; count: number; value: number }[];
  stockStatus: { status: string; count: number; percentage: number }[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    loadData();
  }, [selectedDateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const items = await inventoryService.getInventoryItems('user-id');
      
      // Calcular datos del reporte
      const totalItems = items.length;
      const totalValue = items.reduce((sum, item) => sum + (item.quantity * (item.cost || 0)), 0);
      const lowStockItems = items.filter(item => item.quantity <= (item.minStock || 0)).length;
      const expiringSoon = items.filter(item => {
        if (!item.expirationDate) return false;
        const expirationDate = item.expirationDate.toDate();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expirationDate <= thirtyDaysFromNow;
      }).length;

      // Simular datos adicionales
      const mockReportData: ReportData = {
        totalItems,
        totalValue,
        lowStockItems,
        expiringSoon,
        monthlyMovement: 245,
        topCategories: [
          { name: 'Fertilizantes', count: 12, value: 15420.50 },
          { name: 'Semillas', count: 8, value: 9850.75 },
          { name: 'Pesticidas', count: 6, value: 7230.25 },
          { name: 'Herramientas', count: 15, value: 5680.00 },
          { name: 'Equipos', count: 4, value: 25340.80 }
        ],
        stockStatus: [
          { status: 'Stock Normal', count: totalItems - lowStockItems, percentage: ((totalItems - lowStockItems) / totalItems) * 100 },
          { status: 'Stock Bajo', count: lowStockItems, percentage: (lowStockItems / totalItems) * 100 }
        ]
      };

      setReportData(mockReportData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type: 'inventory' | 'purchases' | 'movements') => {
    switch (type) {
      case 'inventory':
        const inventoryData = [
          {
            id: '1',
            name: 'Semillas de Maíz Premium',
            category: 'Semillas',
            quantity: 150,
            unit: 'kg',
            price: 45,
            location: 'Almacén A - Sector 1',
            status: 'disponible' as const,
            lastUpdated: new Date()
          },
          {
            id: '2',
            name: 'Fertilizante NPK 20-20-20',
            category: 'Fertilizantes',
            quantity: 8,
            unit: 'sacos',
            price: 89,
            location: 'Almacén B - Sector 2',
            status: 'bajo_stock' as const,
            lastUpdated: new Date()
          },
          {
            id: '3',
            name: 'Pesticida Orgánico',
            category: 'Pesticidas',
            quantity: 0,
            unit: 'litros',
            price: 125,
            location: 'Almacén C - Sector 1',
            status: 'agotado' as const,
            lastUpdated: new Date()
          },
          {
            id: '4',
            name: 'Herramientas de Cultivo',
            category: 'Herramientas',
            quantity: 25,
            unit: 'piezas',
            price: 35,
            location: 'Almacén D - Sector 3',
            status: 'disponible' as const,
            lastUpdated: new Date()
          }
        ];
        PDFExportService.exportInventoryReport(inventoryData);
        break;
      
      case 'purchases':
        const purchasesData = [
          {
            id: '1',
            supplier: 'AgroSupplies SA',
            items: [
              { name: 'Semillas de Maíz', quantity: 100, price: 45, total: 4500 },
              { name: 'Fertilizante', quantity: 20, price: 89, total: 1780 }
            ],
            total: 6280,
            date: new Date(),
            status: 'completado' as const
          },
          {
            id: '2',
            supplier: 'FarmTech Solutions',
            items: [
              { name: 'Pesticida Orgánico', quantity: 50, price: 125, total: 6250 }
            ],
            total: 6250,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            status: 'pendiente' as const
          },
          {
            id: '3',
            supplier: 'Distribuidora Agrícola Norte',
            items: [
              { name: 'Herbicida Selectivo', quantity: 30, price: 78, total: 2340 },
              { name: 'Fungicida Preventivo', quantity: 15, price: 156, total: 2340 }
            ],
            total: 4680,
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            status: 'completado' as const
          }
        ];
        PDFExportService.exportPurchasesReport(purchasesData);
        break;
      
      case 'movements':
        const movementsData = [
          {
            id: '1',
            itemName: 'Semillas de Maíz Premium',
            type: 'entrada' as const,
            quantity: 100,
            reason: 'Compra nueva mercancía',
            date: new Date(),
            user: 'Juan Pérez'
          },
          {
            id: '2',
            itemName: 'Fertilizante NPK',
            type: 'salida' as const,
            quantity: 15,
            reason: 'Aplicación en campo norte',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            user: 'María González'
          },
          {
            id: '3',
            itemName: 'Pesticida Orgánico',
            type: 'ajuste' as const,
            quantity: -5,
            reason: 'Ajuste por inventario físico',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            user: 'Carlos Rodríguez'
          },
          {
            id: '4',
            itemName: 'Herramientas de Cultivo',
            type: 'entrada' as const,
            quantity: 10,
            reason: 'Reposición de herramientas',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            user: 'Ana Martínez'
          },
          {
            id: '5',
            itemName: 'Semillas de Tomate',
            type: 'salida' as const,
            quantity: 25,
            reason: 'Siembra temporada alta',
            date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            user: 'Luis Silva'
          }
        ];
        PDFExportService.exportMovementsReport(movementsData);
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Error al cargar los datos del reporte</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Reportes de Inventario
              </h1>
              <p className="text-gray-600 mt-1">Análisis y estadísticas del inventario</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Botón principal de Inventario */}
              <button
                onClick={() => exportReport('inventory')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Package className="w-5 h-5" />
                <span className="hidden sm:inline">Exportar Inventario</span>
                <span className="sm:hidden">Inventario</span>
              </button>
              
              {/* Botón de Compras */}
              <button
                onClick={() => exportReport('purchases')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <DollarSign className="w-5 h-5" />
                <span className="hidden sm:inline">Exportar Compras</span>
                <span className="sm:hidden">Compras</span>
              </button>
              
              {/* Botón de Movimientos */}
              <button
                onClick={() => exportReport('movements')}
                className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="hidden sm:inline">Exportar Movimientos</span>
                <span className="sm:hidden">Movimientos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="overview">Vista General</option>
              <option value="stock">Análisis de Stock</option>
              <option value="financial">Análisis Financiero</option>
              <option value="movement">Movimientos</option>
            </select>
            
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
            </select>
            
            <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros avanzados
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalItems}</p>
                <p className="text-xs text-green-600 mt-1">↑ 5.2% vs mes anterior</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">${reportData.totalValue.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">↑ 12.8% vs mes anterior</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Stock Bajo</p>
                <p className="text-2xl font-bold text-red-600">{reportData.lowStockItems}</p>
                <p className="text-xs text-red-600 mt-1">↑ 2 items esta semana</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Por Vencer</p>
                <p className="text-2xl font-bold text-orange-600">{reportData.expiringSoon}</p>
                <p className="text-xs text-orange-600 mt-1">Próximos 30 días</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Categories Chart */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Categorías por Valor</h3>
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {reportData.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                      index === 0 ? 'from-green-400 to-green-600' :
                      index === 1 ? 'from-blue-400 to-blue-600' :
                      index === 2 ? 'from-purple-400 to-purple-600' :
                      index === 3 ? 'from-yellow-400 to-yellow-600' :
                      'from-red-400 to-red-600'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.count} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${category.value.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Estado del Stock</h3>
              <PieChart className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {reportData.stockStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status.status === 'Stock Normal' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{status.status}</p>
                      <p className="text-sm text-gray-500">{status.count} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{status.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stock Óptimo</span>
                <span className="text-green-600 font-medium">85.7%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Stock repuesto: Fertilizante NPK</p>
                <p className="text-xs text-gray-500">Hace 2 horas • +50 unidades</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Stock bajo: Semillas de Tomate</p>
                <p className="text-xs text-gray-500">Hace 1 día • 8 unidades restantes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Nuevo item agregado: Herbicida Premium</p>
                <p className="text-xs text-gray-500">Hace 3 días • 25 unidades iniciales</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
