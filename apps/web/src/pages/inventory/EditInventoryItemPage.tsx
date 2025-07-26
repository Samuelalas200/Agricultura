import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { inventoryService, InventoryItem } from '../../services/firebaseService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

type EditInventoryItemData = Omit<InventoryItem, 'id' | 'userId' | 'isActive' | 'createdAt' | 'updatedAt'>;

export default function EditInventoryItemPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EditInventoryItemData>({
    name: '',
    category: 'other',
    quantity: 0,
    unit: 'kg',
    minStock: 1,
    cost: 0,
    brand: '',
    supplier: '',
    location: '',
    description: '',
    purchaseDate: undefined,
    expirationDate: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: item, isLoading } = useQuery(
    ['inventory-item', id],
    () => id ? inventoryService.getInventoryItem(id) : Promise.resolve(null),
    { enabled: !!id }
  );

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        minStock: item.minStock,
        cost: item.cost,
        brand: item.brand || '',
        supplier: item.supplier || '',
        location: item.location || '',
        description: item.description || '',
        purchaseDate: item.purchaseDate || undefined,
        expirationDate: item.expirationDate || undefined
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev: EditInventoryItemData) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev: EditInventoryItemData) => ({
      ...prev,
      [name]: value ? new Date(value) : undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !item?.id) return;

    if (!formData.name.trim()) {
      alert('El nombre del item es obligatorio');
      return;
    }

    if (formData.quantity < 0 || formData.minStock < 0 || formData.cost < 0) {
      alert('Los valores numéricos no pueden ser negativos');
      return;
    }

    setIsSubmitting(true);
    try {
      await inventoryService.updateInventoryItem(item.id, formData);
      navigate(`/inventory/${item.id}`);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error al actualizar el item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando item...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Item no encontrado</h3>
        <p className="text-gray-500 mb-4">El item que intentas editar no existe</p>
        <Link to="/inventory" className="btn btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inventario
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/inventory/${item.id}`}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Item</h1>
            <p className="text-gray-600">Modifica la información del item</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Básica */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Información Básica</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="name">
                  Nombre del Item *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: Fertilizante NPK 20-20-20"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="category">
                  Categoría *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="seeds">Semillas</option>
                  <option value="fertilizers">Fertilizantes</option>
                  <option value="pesticides">Pesticidas</option>
                  <option value="tools">Herramientas</option>
                  <option value="machinery">Maquinaria</option>
                  <option value="other">Otros</option>
                </select>
              </div>

              <div>
                <label className="label" htmlFor="brand">
                  Marca
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: Yara, Bayer, etc."
                />
              </div>

              <div>
                <label className="label" htmlFor="supplier">
                  Proveedor
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="input"
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div>
                <label className="label" htmlFor="location">
                  Ubicación de Almacenamiento
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: Bodega A, Estante 3"
                />
              </div>

              <div>
                <label className="label" htmlFor="description">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                  placeholder="Descripción opcional del item"
                />
              </div>
            </div>
          </div>

          {/* Cantidades y Costos */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Cantidades y Costos</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="quantity">
                    Cantidad Actual *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label" htmlFor="unit">
                    Unidad *
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="g">Gramos (g)</option>
                    <option value="l">Litros (L)</option>
                    <option value="ml">Mililitros (mL)</option>
                    <option value="units">Unidades</option>
                    <option value="boxes">Cajas</option>
                    <option value="bags">Sacos</option>
                    <option value="bottles">Botellas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="minStock">
                  Stock Mínimo *
                </label>
                <input
                  type="number"
                  id="minStock"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recibirás alertas cuando el stock esté por debajo de este valor
                </p>
              </div>

              <div>
                <label className="label" htmlFor="cost">
                  Costo Unitario (COP) *
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="purchaseDate">
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  value={formData.purchaseDate ? formData.purchaseDate.toDate().toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('purchaseDate', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label" htmlFor="expirationDate">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  id="expirationDate"
                  value={formData.expirationDate ? formData.expirationDate.toDate().toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('expirationDate', e.target.value)}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opcional. Útil para productos perecederos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Link
            to={`/inventory/${item.id}`}
            className="btn btn-secondary"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
