import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Package, FileText, Eye, Plus, ArrowLeft } from 'lucide-react';
import { inventoryService, InventoryItem } from '../../services/firebaseService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface Movement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  date: Date;
  user: string;
  notes?: string;
}

export default function MovementsPage() {
  const { id: itemId } = useParams<{ id: string }>(); // Para cuando vienen desde detalles de item
  const [movements, setMovements] = useState<Movement[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const items = await inventoryService.getInventoryItems('user-id');
      setInventoryItems(items);
      
      // Si hay un itemId específico, cargar ese item
      if (itemId) {
        const item = await inventoryService.getInventoryItem(itemId);
        setCurrentItem(item);
        setSelectedItem(itemId); // Filtrar automáticamente por este item
      }
      
      // Simular datos de movimientos por ahora
      const mockMovements: Movement[] = [
        {
          id: '1',
          itemId: 'item1',
          itemName: 'Fertilizante NPK',
          type: 'entrada',
          quantity: 50,
          previousStock: 100,
          newStock: 150,
          reason: 'Compra',
          reference: 'COMP-001',
          date: new Date('2024-01-15'),
          user: 'Juan Pérez',
          notes: 'Compra regular mensual'
        },
        {
          id: '2',
          itemId: 'item1',
          itemName: 'Fertilizante NPK',
          type: 'salida',
          quantity: 25,
          previousStock: 150,
          newStock: 125,
          reason: 'Uso en campo',
          reference: 'TAREA-005',
          date: new Date('2024-01-18'),
          user: 'María García'
        },
        {
          id: '3',
          itemId: 'item2',
          itemName: 'Semillas de Maíz',
          type: 'ajuste',
          quantity: -5,
          previousStock: 105,
          newStock: 100,
          reason: 'Ajuste por inventario físico',
          date: new Date('2024-01-20'),
          user: 'Carlos López',
          notes: 'Se encontró diferencia en conteo físico'
        },
        {
          id: '4',
          itemId: 'item3',
          itemName: 'Herbicida',
          type: 'entrada',
          quantity: 30,
          previousStock: 45,
          newStock: 75,
          reason: 'Compra',
          reference: 'COMP-002',
          date: new Date('2024-01-22'),
          user: 'Ana Rodríguez'
        }
      ];
      setMovements(mockMovements);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || movement.type === selectedType;
    const matchesItem = selectedItem === 'all' || movement.itemId === selectedItem;
    
    let matchesDate = true;
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const movementDate = new Date(movement.date);
      
      switch (selectedDateRange) {
        case 'today':
          matchesDate = movementDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = movementDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = movementDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesItem && matchesDate;
  });

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <ArrowDownRight className="w-5 h-5 text-green-600" />;
      case 'salida':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'ajuste':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'entrada':
        return 'text-green-600 bg-green-100';
      case 'salida':
        return 'text-red-600 bg-red-100';
      case 'ajuste':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const totalEntradas = filteredMovements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0);
  const totalSalidas = filteredMovements.filter(m => m.type === 'salida').reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  const totalAjustes = filteredMovements.filter(m => m.type === 'ajuste').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
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
              {currentItem ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <Link 
                      to={`/inventory/${currentItem.id}`}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Movimientos de {currentItem.name}
                    </h1>
                  </div>
                  <p className="text-gray-600">Historial completo de movimientos para este item</p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Movimientos de Inventario
                  </h1>
                  <p className="text-gray-600 mt-1">Historial de entradas, salidas y ajustes de inventario</p>
                </>
              )}
            </div>
            <button
              onClick={() => alert('Nuevo movimiento - Funcionalidad próximamente')}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Nuevo Movimiento
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Movimientos</p>
                <p className="text-2xl font-bold text-purple-600">{filteredMovements.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Entradas</p>
                <p className="text-2xl font-bold text-green-600">{totalEntradas}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ArrowDownRight className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Salidas</p>
                <p className="text-2xl font-bold text-red-600">{totalSalidas}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ajustes</p>
                <p className="text-2xl font-bold text-blue-600">{totalAjustes}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar movimientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todos los tipos</option>
              <option value="entrada">Entradas</option>
              <option value="salida">Salidas</option>
              <option value="ajuste">Ajustes</option>
            </select>
            
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
            
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todos los items</option>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            
            <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Más filtros
            </button>
          </div>
        </div>

        {/* Movements Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stock Anterior</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stock Nuevo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movement.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.type)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMovementColor(movement.type)}`}>
                          {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{movement.itemName}</div>
                      {movement.reference && (
                        <div className="text-xs text-gray-500">Ref: {movement.reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.previousStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {movement.newStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => alert('Ver detalles del movimiento')}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredMovements.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay movimientos registrados</h3>
              <p className="text-gray-500">Los movimientos de inventario aparecerán aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
