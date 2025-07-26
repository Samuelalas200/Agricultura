import { AlertTriangle, RefreshCw, ShoppingCart, Package } from 'lucide-react';
import { InventoryItem } from '../../services/firebaseService';
import { Link } from 'react-router-dom';

interface LowStockAlertProps {
  items: InventoryItem[];
  onRefresh: () => void;
}

export function LowStockAlert({ items, onRefresh }: LowStockAlertProps) {
  if (items.length === 0) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seeds': return '🌱';
      case 'fertilizers': return '🧪';
      case 'pesticides': return '🚫';
      case 'tools': return '🔧';
      case 'machinery': return '🚜';
      default: return '📦';
    }
  };

  const totalReorderValue = items.reduce((sum, item) => {
    // Calculamos cuánto necesitamos para llegar al doble del stock mínimo
    const neededQuantity = Math.max(0, (item.minStock * 2) - item.quantity);
    return sum + (neededQuantity * item.cost);
  }, 0);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Alerta de Stock Bajo ({items.length} items)
              </h3>
              <p className="text-red-700 text-sm">
                Los siguientes items requieren reposición inmediata
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onRefresh}
                className="p-2 text-red-600 hover:text-red-500 transition-colors"
                title="Actualizar"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link
                to="/inventory/purchase-plan"
                className="btn btn-sm btn-primary"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Plan de Compras
              </Link>
            </div>
          </div>

          {/* Resumen financiero */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{items.length}</p>
                <p className="text-sm text-gray-600">Items críticos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalReorderValue)}
                </p>
                <p className="text-sm text-gray-600">Valor estimado reposición</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {items.filter(item => item.quantity === 0).length}
                </p>
                <p className="text-sm text-gray-600">Sin stock</p>
              </div>
            </div>
          </div>

          {/* Lista de items críticos */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => {
              const neededQuantity = Math.max(0, (item.minStock * 2) - item.quantity);
              const reorderCost = neededQuantity * item.cost;
              const urgencyLevel = item.quantity === 0 ? 'critical' : 
                                 item.quantity < item.minStock * 0.5 ? 'high' : 'medium';
              
              const urgencyColors = {
                critical: 'border-l-red-600 bg-red-50',
                high: 'border-l-orange-500 bg-orange-50',
                medium: 'border-l-yellow-500 bg-yellow-50'
              };

              const urgencyLabels = {
                critical: 'CRÍTICO',
                high: 'URGENTE',
                medium: 'MEDIO'
              };

              return (
                <div key={item.id} className={`border-l-4 p-4 rounded-r-lg ${urgencyColors[urgencyLevel]}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-lg mr-3">{getCategoryIcon(item.category)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                            urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {urgencyLabels[urgencyLevel]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Stock: {item.quantity} {item.unit}</span>
                          <span>Mín: {item.minStock} {item.unit}</span>
                          <span>Necesita: {neededQuantity} {item.unit}</span>
                          {item.supplier && <span>Proveedor: {item.supplier}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(reorderCost)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Link
                          to={`/inventory/${item.id}/purchase`}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Comprar
                        </Link>
                        <Link
                          to={`/inventory/${item.id}`}
                          className="text-xs text-blue-600 hover:text-blue-500"
                        >
                          Ver
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Acciones rápidas */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-4">
              <Link
                to="/inventory/reports?filter=lowstock"
                className="text-sm text-red-600 hover:text-red-500 font-medium"
              >
                Ver reporte detallado →
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn btn-sm btn-secondary">
                <Package className="w-4 h-4 mr-2" />
                Exportar lista
              </button>
              <Link
                to="/inventory/bulk-purchase"
                className="btn btn-sm btn-primary"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Compra masiva
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
