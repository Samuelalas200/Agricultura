import { Package, DollarSign, AlertTriangle, ShoppingCart } from 'lucide-react';
import { InventoryItem, Purchase } from '../../services/firebaseService';

interface InventoryStatsProps {
  items: InventoryItem[];
  lowStockCount: number;
  totalValue: number;
  recentPurchases: Purchase[];
}

export function InventoryStats({ items, lowStockCount, totalValue, recentPurchases }: InventoryStatsProps) {
  const totalItems = items.length;
  const recentPurchasesValue = recentPurchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);

  const getCategoryStats = () => {
    const stats = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const categoryStats = getCategoryStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const stats = [
    {
      name: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+2 este mes'
    },
    {
      name: 'Valor Total',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: formatCurrency(recentPurchasesValue) + ' últimas compras'
    },
    {
      name: 'Stock Bajo',
      value: lowStockCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: lowStockCount > 0 ? 'Requiere atención' : 'Todo normal'
    },
    {
      name: 'Compras Recientes',
      value: recentPurchases.length,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: 'Últimos 30 días'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribución por categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Distribución por Categorías</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => {
              const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;
              const categoryLabels: Record<string, string> = {
                seeds: 'Semillas',
                fertilizers: 'Fertilizantes',
                pesticides: 'Pesticidas',
                tools: 'Herramientas',
                machinery: 'Maquinaria',
                other: 'Otros'
              };
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {categoryLabels[category] || category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
            
            {Object.keys(categoryStats).length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Compras Recientes</h3>
          </div>
          <div className="space-y-3">
            {recentPurchases.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{purchase.itemName}</p>
                  <p className="text-sm text-gray-600">
                    {purchase.quantity} {purchase.unit} • {purchase.supplier || 'Sin proveedor'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(purchase.totalCost)}</p>
                  <p className="text-xs text-gray-500">
                    {purchase.purchaseDate.toDate().toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>
            ))}
            
            {recentPurchases.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay compras recientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
