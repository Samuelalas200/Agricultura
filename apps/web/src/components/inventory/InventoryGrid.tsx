import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Package, AlertTriangle, Calendar, MapPin, FileText } from 'lucide-react';
import { InventoryItem, inventoryService } from '../../services/firebaseService';
import { PDFExportService } from '../../services/pdfExportService';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { toast } from '../ui/Toaster';

interface InventoryGridProps {
  items: InventoryItem[];
  onRefresh: () => void;
}

export function InventoryGrid({ items, onRefresh }: InventoryGridProps) {
  const { currentUser } = useAuth();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Exportar items seleccionados a PDF
  const handleExportSelected = () => {
    const selectedInventoryItems = items.filter(item => selectedItems.includes(item.id!));
    
    if (selectedInventoryItems.length === 0) {
      toast.warning('Sin selección', 'No hay items seleccionados para exportar');
      return;
    }

    // Convertir al formato esperado por PDFExportService
    const pdfItems = selectedInventoryItems.map(item => ({
      id: item.id!,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.cost, // usar cost como price
      location: item.location || '',
      status: item.quantity <= item.minStock ? 'bajo_stock' as const : 'disponible' as const,
      lastUpdated: new Date()
    }));

    PDFExportService.exportInventoryReport(pdfItems);
    toast.success('PDF generado', `Se exportaron ${selectedInventoryItems.length} items`);
  };

  // Eliminar items seleccionados
  const handleDeleteSelected = async () => {
    if (!currentUser) return;
    
    const confirmMessage = `¿Estás seguro de eliminar ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''}?\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      // Eliminar cada item seleccionado
      const deletePromises = selectedItems.map(itemId => 
        inventoryService.deleteInventoryItem(itemId)
      );
      
      await Promise.all(deletePromises);
      
      toast.success('Items eliminados', `Se eliminaron ${selectedItems.length} items exitosamente`);
      setSelectedItems([]); // Limpiar selección
      onRefresh(); // Refrescar la lista
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'No se pudieron eliminar algunos items');
    } finally {
      setIsDeleting(false);
    }
  };

  // Editar en lote (por ahora solo mostramos mensaje)
  const handleBulkEdit = () => {
    toast.info('Próximamente', 'La funcionalidad de edición en lote estará disponible pronto');
  };

  // Eliminar un item individual
  const handleDeleteItem = async (item: InventoryItem) => {
    if (!currentUser) return;
    
    if (!confirm(`¿Estás seguro de eliminar "${item.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await inventoryService.deleteInventoryItem(item.id!);
      toast.success('Item eliminado', `"${item.name}" fue eliminado exitosamente`);
      onRefresh(); // Refrescar la lista
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'No se pudo eliminar el item');
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
              <button 
                onClick={handleExportSelected}
                className="btn btn-sm btn-secondary flex items-center gap-1"
                title="Exportar items seleccionados a PDF"
              >
                <FileText className="w-4 h-4" />
                Exportar
              </button>
              <button 
                onClick={handleBulkEdit}
                className="btn btn-sm btn-warning"
                title="Editar múltiples items"
              >
                Editar en lote
              </button>
              <button 
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="btn btn-sm btn-error flex items-center gap-1"
                title="Eliminar items seleccionados"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
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
                    className="text-blue-600 hover:text-blue-500 p-1 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/inventory/${item.id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Ver detalles
                  </Link>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="text-red-600 hover:text-red-500 p-1 transition-colors"
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
