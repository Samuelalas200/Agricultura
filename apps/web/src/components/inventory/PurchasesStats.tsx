import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';
import { Purchase } from '../../services/firebaseService';

interface PurchasesStatsProps {
  purchases: Purchase[];
  totalSpent: number;
  averagePurchase: number;
  period: string;
}

export function PurchasesStats({ purchases, totalSpent, averagePurchase, period }: PurchasesStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Stats por categoría
  const categoryStats = purchases.reduce((acc, purchase) => {
    acc[purchase.category] = (acc[purchase.category] || 0) + purchase.totalCost;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryStats).map(([category, amount]) => ({
    name: category,
    value: amount,
    count: purchases.filter(p => p.category === category).length
  }));

  // Stats por mes (últimos 6 meses)
  const monthlyStats = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-CO', { month: 'short' });
      const monthPurchases = purchases.filter(purchase => {
        const purchaseDate = purchase.purchaseDate.toDate();
        return purchaseDate.getMonth() === date.getMonth() && 
               purchaseDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: monthName,
        amount: monthPurchases.reduce((sum, p) => sum + p.totalCost, 0),
        count: monthPurchases.length
      });
    }
    
    return months;
  };

  const monthlyData = monthlyStats();

  // Top proveedores
  const supplierStats = purchases.reduce((acc, purchase) => {
    const supplier = purchase.supplier || 'Sin proveedor';
    acc[supplier] = (acc[supplier] || 0) + purchase.totalCost;
    return acc;
  }, {} as Record<string, number>);

  const topSuppliers = Object.entries(supplierStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const CategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-xs text-gray-600">{formatCurrency(data.value)}</p>
          <p className="text-xs text-gray-500">{data.count} compras</p>
        </div>
      );
    }
    return null;
  };

  const MonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-green-600">Gastado: {formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-blue-600">Compras: {payload[1]?.value || 0}</p>
        </div>
      );
    }
    return null;
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today': return 'hoy';
      case 'week': return 'esta semana';
      case 'month': return 'este mes';
      case 'quarter': return 'últimos 3 meses';
      case 'year': return 'este año';
      default: return 'todo el tiempo';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Gastado</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">En {getPeriodLabel(period)}</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Compras</p>
              <p className="text-2xl font-bold text-gray-900">{purchases.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Registradas</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(averagePurchase)}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Por compra</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Proveedores</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(supplierStats).length}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Únicos</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico mensual */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tendencia Mensual</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<MonthlyTooltip />} />
                <Bar dataKey="amount" fill="#16a34a" name="Monto" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución por categoría */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gastos por Categoría</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top proveedores */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top Proveedores</h3>
        </div>
        <div className="space-y-3">
          {topSuppliers.map(([supplier, amount], index) => {
            const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
            return (
              <div key={supplier} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{supplier}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-900 font-medium w-20 text-right">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
            );
          })}
          
          {topSuppliers.length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
}
