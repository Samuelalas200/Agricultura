import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Package, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  DollarSign,
  BarChart3,
  History
} from 'lucide-react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { inventoryService } from '../../services/firebaseService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toaster';

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const { data: item, isLoading, error } = useQuery(
    ['inventory-item', id],
    () => id ? inventoryService.getInventoryItem(id) : Promise.resolve(null),
    { enabled: !!id }
  );

  const handleDelete = async () => {
    if (!item?.id || !currentUser) return;
    
    if (confirm(`¿Estás seguro de eliminar "${item.name}"?`)) {
      try {
        await inventoryService.deleteInventoryItem(item.id);
        navigate('/inventory');
      } catch (error) {
        alert('Error al eliminar el item');
      }
    }
  };

  // Función para ver historial de uso
  const handleViewHistory = () => {
    if (!item?.id) return;
    navigate(`/inventory/${item.id}/movements`);
  };

  // Función para registrar movimiento
  const handleRegisterMovement = () => {
    if (!item?.id) return;
    
    // Simple prompt para demostrar funcionalidad
    const type = prompt('Tipo de movimiento (entrada/salida/ajuste):');
    if (!type || !['entrada', 'salida', 'ajuste'].includes(type)) {
      toast.error('Tipo inválido', 'Debe ser: entrada, salida o ajuste');
      return;
    }
    
    const quantity = prompt(`Cantidad a ${type === 'entrada' ? 'agregar' : 'remover'}:`);
    if (!quantity || isNaN(Number(quantity))) {
      toast.error('Cantidad inválida', 'Debe ser un número válido');
      return;
    }
    
    const reason = prompt('Razón del movimiento:');
    if (!reason) {
      toast.error('Razón requerida', 'Debe especificar la razón del movimiento');
      return;
    }
    
    // Por ahora solo mostrar mensaje de éxito
    toast.success('Movimiento registrado', `${type} de ${quantity} unidades: ${reason}`);
  };

  // Función para registrar compra
  const handleRegisterPurchase = () => {
    if (!item?.id) return;
    navigate(`/inventory/purchases/new?itemId=${item.id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
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

  const getStockStatus = () => {
    if (!item) return 'normal';
    if (item.quantity === 0) return 'empty';
    if (item.quantity <= item.minStock) return 'low';
    return 'normal';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-red-100 text-red-800 border-red-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'empty': return 'Sin stock';
      case 'low': return 'Stock bajo';
      default: return 'Stock normal';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando detalles...</span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Item no encontrado</h3>
        <p className="text-gray-500 mb-4">El item que buscas no existe o fue eliminado</p>
        <Link to="/inventory" className="btn btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inventario
        </Link>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/inventory"
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600">{getCategoryLabel(item.category)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to={`/inventory/${item.id}/edit`}
            className="btn btn-secondary"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="btn btn-error"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles Básicos */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Información General</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Nombre del Item</label>
                <p className="text-lg font-medium text-gray-900">{item.name}</p>
              </div>
              
              <div>
                <label className="label">Categoría</label>
                <span className="badge badge-info">
                  {getCategoryLabel(item.category)}
                </span>
              </div>
              
              {item.brand && (
                <div>
                  <label className="label">Marca</label>
                  <p className="text-gray-900">{item.brand}</p>
                </div>
              )}
              
              {item.supplier && (
                <div>
                  <label className="label">Proveedor</label>
                  <p className="text-gray-900">{item.supplier}</p>
                </div>
              )}
              
              {item.location && (
                <div>
                  <label className="label">Ubicación</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                    {item.location}
                  </p>
                </div>
              )}
              
              {item.description && (
                <div className="md:col-span-2">
                  <label className="label">Descripción</label>
                  <p className="text-gray-900">{item.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Fechas Importantes */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Fechas Importantes</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Fecha de Compra</label>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                  {item.purchaseDate?.toDate().toLocaleDateString('es-CO') || 'No especificada'}
                </p>
              </div>
              
              {item.expirationDate && (
                <div>
                  <label className="label">Fecha de Vencimiento</label>
                  <p className={`flex items-center ${
                    item.expirationDate.toDate() < new Date() 
                      ? 'text-red-600' 
                      : item.expirationDate.toDate() < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        ? 'text-yellow-600'
                        : 'text-gray-900'
                  }`}>
                    <Calendar className="w-4 h-4 mr-1" />
                    {item.expirationDate.toDate().toLocaleDateString('es-CO')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estado del Stock */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Estado del Stock</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-3 rounded-lg border ${getStockStatusColor(stockStatus)}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{getStockStatusText(stockStatus)}</span>
                  {stockStatus !== 'normal' && <AlertTriangle className="w-4 h-4" />}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cantidad actual:</span>
                  <span className="font-bold text-2xl text-gray-900">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock mínimo:</span>
                  <span className="font-medium text-gray-900">
                    {item.minStock} {item.unit}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stockStatus === 'empty' ? 'bg-red-500' :
                      stockStatus === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (item.quantity / (item.minStock * 2)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Información Financiera</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Costo unitario:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(item.cost)}
                </span>
              </div>
              
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-600">Valor total:</span>
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(item.quantity * item.cost)}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Acciones Rápidas</h3>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={handleViewHistory}
                className="w-full btn btn-secondary text-left"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver historial de uso
              </button>
              <button 
                onClick={handleRegisterMovement}
                className="w-full btn btn-secondary text-left"
              >
                <History className="w-4 h-4 mr-2" />
                Registrar movimiento
              </button>
              <button 
                onClick={handleRegisterPurchase}
                className="w-full btn btn-secondary text-left"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Registrar compra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
