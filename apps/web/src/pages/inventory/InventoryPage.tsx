import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  ShoppingCart,
  History,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { inventoryService, purchasesService } from '../../services/firebaseService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { InventoryStats } from '../../components/inventory/InventoryStats';
import { InventoryGrid } from '../../components/inventory/InventoryGrid';
import { LowStockAlert } from '../../components/inventory/LowStockAlert';

export default function InventoryPage() {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  // Queries
  const { data: inventoryItems = [], isLoading: inventoryLoading, refetch: refetchInventory } = useQuery(
    ['inventory', currentUser?.uid],
    () => currentUser ? inventoryService.getInventoryItems(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );

  const { data: lowStockItems = [], isLoading: lowStockLoading } = useQuery(
    ['lowStock', currentUser?.uid],
    () => currentUser ? inventoryService.getLowStockItems(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );

  const { data: recentPurchases = [], isLoading: purchasesLoading } = useQuery(
    ['purchases', currentUser?.uid],
    () => currentUser ? purchasesService.getPurchases(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );

  // Filtros
  const categories = [
    { value: 'all', label: 'Todos', icon: Package },
    { value: 'seeds', label: 'Semillas', icon: Package },
    { value: 'fertilizers', label: 'Fertilizantes', icon: Package },
    { value: 'pesticides', label: 'Pesticidas', icon: Package },
    { value: 'tools', label: 'Herramientas', icon: Package },
    { value: 'machinery', label: 'Maquinaria', icon: Package },
    { value: 'other', label: 'Otros', icon: Package },
  ];

  const filteredItems = inventoryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !showLowStock || item.quantity <= item.minStock;
    
    return matchesCategory && matchesSearch && matchesLowStock;
  });

  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

  if (inventoryLoading || lowStockLoading || purchasesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando inventario...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <Package className="w-8 h-8 inline mr-3 text-green-600" />
            Gestión de Inventario
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredItems.length} de {inventoryItems.length} items
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/inventory/purchases"
            className="btn btn-secondary"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Compras
          </Link>
          <Link
            to="/inventory/movements"
            className="btn btn-secondary"
          >
            <History className="w-4 h-4 mr-2" />
            Movimientos
          </Link>
          <Link
            to="/inventory/reports"
            className="btn btn-secondary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Reportes
          </Link>
          <Link
            to="/inventory/new"
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Item
          </Link>
        </div>
      </div>

      {/* Alertas de Stock Bajo */}
      {lowStockItems.length > 0 && (
        <LowStockAlert 
          items={lowStockItems} 
          onRefresh={refetchInventory}
        />
      )}

      {/* Estadísticas */}
      <InventoryStats 
        items={inventoryItems}
        lowStockCount={lowStockItems.length}
        totalValue={totalValue}
        recentPurchases={recentPurchases.slice(0, 5)}
      />

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, marca o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input"
            />
          </div>

          {/* Filtro por categoría */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 input"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtros adicionales */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                Solo stock bajo
              </span>
            </label>
          </div>
        </div>

        {/* Categorías rápidas */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map(category => {
            const Icon = category.icon;
            const count = category.value === 'all' 
              ? inventoryItems.length 
              : inventoryItems.filter(item => item.category === category.value).length;
            
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-1" />
                {category.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Inventario */}
      <InventoryGrid 
        items={filteredItems}
        onRefresh={refetchInventory}
      />

      {/* Empty State */}
      {filteredItems.length === 0 && inventoryItems.length > 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron items</h3>
          <p className="text-gray-500 mb-4">
            Ajusta los filtros para mostrar más items
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
              setShowLowStock(false);
            }}
            className="btn btn-secondary"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Empty State Inicial */}
      {inventoryItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay items en el inventario</h3>
          <p className="text-gray-500 mb-4">
            Comienza registrando tus primeros insumos y herramientas
          </p>
          <Link
            to="/inventory/new"
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar primer item
          </Link>
        </div>
      )}
    </div>
  );
}
