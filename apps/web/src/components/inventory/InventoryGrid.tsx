import { useState } from 'react';
import { Edit2, Trash2, Package, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { InventoryItem } from '../../services/firebaseService';
import { Link } from 'react-router-dom';

interface InventoryGridProps {
  items: InventoryItem[];
  onRefresh: () => void;
}

export function InventoryGrid({ items }: InventoryGridProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'seeds': return 'bg-green-100 text-green-800';
      case 'fertilizers': return 'bg-blue-100 text-blue-800';
      case 'pesticides': return 'bg-red-100 text-red-800';
      case 'tools': return 'bg-yellow-100 text-yellow-800';
      case 'machinery': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      seeds: 'Semillas',
      fertilizers: 'Fertilizantes',
      pesticides: 'Pesticidas',
      tools: 'Herramientas',
      machinery: 'Maquinaria',
      other: 'Otros'
    };
    return labels[category] || category;
  };

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.quantity / item.minStock) * 100;
    if (item.quantity <= item.minStock) {
      return { label: 'Stock Bajo', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (percentage <= 150) {
      return { label: 'Stock Medio', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
      return { label: 'Stock Alto', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  const isExpiringSoon = (item: InventoryItem) => {
    if (!item.expirationDate) return false;
    const now = new Date();
    const expiration = item.expirationDate.toDate();
    const daysUntilExpiration = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
  };

  const isExpired = (item: InventoryItem) => {
    if (!item.expirationDate) return false;
    const now = new Date();
    const expiration = item.expirationDate.toDate();
    return expiration < now;
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id!));
    }
  };

  return (
    <div className="space-y-4">
      {/* Acciones en lote */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-800">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} seleccionado{selectedItems.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center space-x-2">
              <button className="btn btn-sm btn-secondary">
                Exportar
              </button>
              <button className="btn btn-sm btn-warning">
                Editar en lote
              </button>
              <button className="btn btn-sm btn-error">
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controles de selección */}
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedItems.length === items.length}
              onChange={handleSelectAll}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Seleccionar todos ({items.length})
            </span>
          </label>
        </div>
      )}

      {/* Grid de items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => {
          const stockStatus = getStockStatus(item);
          const expiringSoon = isExpiringSoon(item);
          const expired = isExpired(item);
          
          return (
            <div
              key={item.id}
              className={`card hover:shadow-lg transition-shadow duration-200 relative ${
                selectedItems.includes(item.id!) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Checkbox de selección */}
              <div className="absolute top-4 left-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id!)}
                  onChange={() => handleSelectItem(item.id!)}
                  className="rounded"
                />
              </div>

              {/* Alertas */}
              <div className="absolute top-4 right-4 flex space-x-1">
                {item.quantity <= item.minStock && (
                  <div className="w-3 h-3 bg-red-500 rounded-full" title="Stock bajo" />
                )}
                {expiringSoon && (
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Expira pronto" />
                )}
                {expired && (
                  <div className="w-3 h-3 bg-red-600 rounded-full" title="Expirado" />
                )}
              </div>

              {/* Contenido de la tarjeta */}
              <div className="pt-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getCategoryIcon(item.category)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                {item.brand && (
                  <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Min:</span>
                    <span className="text-sm text-gray-900">
                      {item.minStock} {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valor:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.cost)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(item.quantity * item.cost)}
                    </span>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="space-y-1 mb-4">
                  {item.supplier && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Package className="w-3 h-3 mr-1" />
                      {item.supplier}
                    </div>
                  )}
                  
                  {item.location && (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {item.location}
                    </div>
                  )}

                  {item.expirationDate && (
                    <div className={`flex items-center text-xs ${
                      expired ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      Exp: {item.expirationDate.toDate().toLocaleDateString('es-CO')}
                    </div>
                  )}
                </div>

                {/* Alertas de estado */}
                {(item.quantity <= item.minStock || expiringSoon || expired) && (
                  <div className="mb-4">
                    {item.quantity <= item.minStock && (
                      <div className="flex items-center text-xs text-red-600 mb-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Stock bajo - Requiere reposición
                      </div>
                    )}
                    {expiringSoon && (
                      <div className="flex items-center text-xs text-yellow-600 mb-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Expira en menos de 30 días
                      </div>
                    )}
                    {expired && (
                      <div className="flex items-center text-xs text-red-600 mb-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Producto expirado
                      </div>
                    )}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Link
                    to={`/inventory/${item.id}/edit`}
                    className="text-blue-600 hover:text-blue-500 p-1"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/inventory/${item.id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    Ver detalles
                  </Link>
                  <button
                    className="text-red-600 hover:text-red-500 p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
