import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { purchasesService, inventoryService } from '../../services/firebaseService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { PurchasesList } from '../../components/inventory/PurchasesList';
import { PurchasesStats } from '../../components/inventory/PurchasesStats';
import { toast } from '../../components/ui/Toaster';

export default function PurchasesPage() {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedItemId, setSelectedItemId] = useState('all');

  // Verificar si hay un itemId en los parámetros de URL
  useEffect(() => {
    const itemId = searchParams.get('itemId');
    if (itemId) {
      setSelectedItemId(itemId);
      toast.info('Nueva compra', `Registrando compra para el item seleccionado`);
    }
  }, [searchParams]);

  // Queries
  const { data: purchases = [], isLoading: purchasesLoading, refetch: refetchPurchases } = useQuery(
    ['purchases', currentUser?.uid],
    () => currentUser ? purchasesService.getPurchases(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );

  const { data: inventoryItems = [] } = useQuery(
    ['inventory', currentUser?.uid],
    () => currentUser ? inventoryService.getInventoryItems(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );

  // Filtros
  const getFilteredPurchases = () => {
    let filtered = purchases;

    // Filtro por período
    if (selectedPeriod !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (selectedPeriod) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(purchase => 
        purchase.purchaseDate.toDate() >= startDate
      );
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPurchases = getFilteredPurchases();

  const totalSpent = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  const averagePurchase = filteredPurchases.length > 0 ? totalSpent / filteredPurchases.length : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const periods = [
    { value: 'all', label: 'Todo el tiempo' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Últimos 3 meses' },
    { value: 'year', label: 'Este año' },
  ];

  if (purchasesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando compras...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <ShoppingCart className="w-8 h-8 inline mr-3 text-green-600" />
            Historial de Compras
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredPurchases.length} de {purchases.length} compras
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/inventory/reports"
            className="btn btn-secondary"
          >
            <FileText className="w-4 h-4 mr-2" />
            Reportes
          </Link>
          <button
            onClick={() => {
              const itemId = searchParams.get('itemId');
              if (itemId) {
                toast.info('Próximamente', `Funcionalidad de nueva compra para item específico estará disponible pronto`);
              } else {
                toast.info('Próximamente', 'Funcionalidad de nueva compra estará disponible pronto');
              }
            }}
            className={`btn ${searchParams.get('itemId') ? 'btn-success' : 'btn-primary'}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            {searchParams.get('itemId') ? 'Registrar Compra del Item' : 'Nueva Compra'}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <PurchasesStats 
        purchases={filteredPurchases}
        totalSpent={totalSpent}
        averagePurchase={averagePurchase}
        period={selectedPeriod}
      />

      {/* Filtros */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por item, proveedor o factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input"
            />
          </div>

          {/* Filtro por período */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="pl-10 input"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* Resumen rápido */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm text-gray-600">Total gastado</p>
              <p className="font-bold text-green-600">{formatCurrency(totalSpent)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{filteredPurchases.length}</p>
            <p className="text-sm text-gray-600">Compras</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(averagePurchase)}</p>
            <p className="text-sm text-gray-600">Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {new Set(filteredPurchases.map(p => p.supplier)).size}
            </p>
            <p className="text-sm text-gray-600">Proveedores</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {new Set(filteredPurchases.map(p => p.category)).size}
            </p>
            <p className="text-sm text-gray-600">Categorías</p>
          </div>
        </div>
      </div>

      {/* Lista de compras */}
      <PurchasesList 
        purchases={filteredPurchases}
        onRefresh={refetchPurchases}
      />

      {/* Empty State */}
      {filteredPurchases.length === 0 && purchases.length > 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron compras</h3>
          <p className="text-gray-500 mb-4">
            Ajusta los filtros para mostrar más compras
          </p>
          <button
            onClick={() => {
              setSelectedPeriod('all');
              setSearchTerm('');
            }}
            className="btn btn-secondary"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Empty State Inicial */}
      {purchases.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay compras registradas</h3>
          <p className="text-gray-500 mb-4">
            Comienza registrando tu primera compra de insumos
          </p>
          <button
            onClick={() => {
              const itemId = searchParams.get('itemId');
              if (itemId) {
                toast.info('Próximamente', `Funcionalidad de nueva compra para item específico estará disponible pronto`);
              } else {
                toast.info('Próximamente', 'Funcionalidad de nueva compra estará disponible pronto');
              }
            }}
            className={`btn ${searchParams.get('itemId') ? 'btn-success' : 'btn-primary'}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            {searchParams.get('itemId') ? 'Registrar Compra del Item' : 'Registrar primera compra'}
          </button>
        </div>
      )}

      {/* Acciones rápidas */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => alert('Compra masiva - Funcionalidad próximamente')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Compra Masiva</p>
              <p className="text-sm text-gray-600">Registrar múltiples items</p>
            </div>
          </button>
          
          <button
            onClick={() => alert('Gestión de proveedores - Funcionalidad próximamente')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ShoppingCart className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Gestionar Proveedores</p>
              <p className="text-sm text-gray-600">Contactos y precios</p>
            </div>
          </button>
          
          <Link
            to="/inventory/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Análisis de Gastos</p>
              <p className="text-sm text-gray-600">Reportes y tendencias</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
