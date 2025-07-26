import { useState } from 'react';
import { Edit2, Trash2, Calendar, Package, Receipt, DollarSign } from 'lucide-react';
import { Purchase } from '../../services/firebaseService';
import { Link } from 'react-router-dom';

interface PurchasesListProps {
  purchases: Purchase[];
  onRefresh: () => void;
}

export function PurchasesList({ purchases, onRefresh }: PurchasesListProps) {
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'item'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const sortedPurchases = [...purchases].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'date':
        return (a.purchaseDate.toMillis() - b.purchaseDate.toMillis()) * multiplier;
      case 'amount':
        return (a.totalCost - b.totalCost) * multiplier;
      case 'item':
        return a.itemName.localeCompare(b.itemName) * multiplier;
      default:
        return 0;
    }
  });

  const handleSelectPurchase = (purchaseId: string) => {
    setSelectedPurchases(prev => 
      prev.includes(purchaseId) 
        ? prev.filter(id => id !== purchaseId)
        : [...prev, purchaseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPurchases.length === purchases.length) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(purchases.map(purchase => purchase.id!));
    }
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Acciones en lote */}
      {selectedPurchases.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-800">
              {selectedPurchases.length} compra{selectedPurchases.length > 1 ? 's' : ''} seleccionada{selectedPurchases.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center space-x-2">
              <button className="btn btn-sm btn-secondary">
                Exportar
              </button>
              <button className="btn btn-sm btn-error">
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedPurchases.length === purchases.length && purchases.length > 0}
              onChange={handleSelectAll}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Seleccionar todos ({purchases.length})
            </span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <button
            onClick={() => handleSort('date')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'date' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Fecha {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('amount')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'amount' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Monto {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('item')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'item' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Item {sortBy === 'item' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Lista de compras */}
      <div className="space-y-4">
        {sortedPurchases.map((purchase) => (
          <div
            key={purchase.id}
            className={`card hover:shadow-md transition-shadow duration-200 ${
              selectedPurchases.includes(purchase.id!) ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Checkbox */}
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={selectedPurchases.includes(purchase.id!)}
                  onChange={() => handleSelectPurchase(purchase.id!)}
                  className="rounded"
                />
              </div>

              {/* Icono de categoría */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{getCategoryIcon(purchase.category)}</span>
                </div>
              </div>

              {/* Información principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {purchase.itemName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(purchase.category)}`}>
                        {getCategoryLabel(purchase.category)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        <span>{purchase.quantity} {purchase.unit}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>{formatCurrency(purchase.unitCost)} por {purchase.unit}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{purchase.purchaseDate.toDate().toLocaleDateString('es-CO')}</span>
                      </div>
                      {purchase.supplier && (
                        <div className="flex items-center">
                          <span>🏪 {purchase.supplier}</span>
                        </div>
                      )}
                    </div>

                    {purchase.invoiceNumber && (
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Receipt className="w-4 h-4 mr-1" />
                        <span>Factura: {purchase.invoiceNumber}</span>
                      </div>
                    )}

                    {purchase.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 italic">"{purchase.notes}"</p>
                      </div>
                    )}
                  </div>

                  {/* Precio total */}
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(purchase.totalCost)}
                    </p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <div className="flex items-center space-x-2">
                <Link
                  to={`/inventory/purchase/${purchase.id}/edit`}
                  className="text-blue-600 hover:text-blue-500 p-2 hover:bg-blue-50 rounded"
                  title="Editar compra"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  className="text-red-600 hover:text-red-500 p-2 hover:bg-red-50 rounded"
                  title="Eliminar compra"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres eliminar esta compra?')) {
                      // Aquí iría la lógica para eliminar
                      onRefresh();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to={`/inventory/${purchase.itemId}`}
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  Ver item →
                </Link>
                <Link
                  to={`/inventory/purchase/${purchase.id}`}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Detalles
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {purchases.length > 10 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            Anterior
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Página 1 de 1
          </span>
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
