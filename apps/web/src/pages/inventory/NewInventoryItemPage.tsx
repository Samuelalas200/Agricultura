import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { inventoryService, farmsService } from '../../services/firebaseService';
import { toast } from '../../components/ui/Toaster';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Timestamp } from 'firebase/firestore';

const inventoryItemSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  category: z.enum(['seeds', 'fertilizers', 'pesticides', 'tools', 'machinery', 'other']),
  brand: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().min(0, 'La cantidad no puede ser negativa'),
  unit: z.string().min(1, 'La unidad es requerida'),
  minStock: z.number().min(0, 'El stock mínimo no puede ser negativo'),
  cost: z.number().min(0, 'El costo no puede ser negativo'),
  supplier: z.string().optional(),
  purchaseDate: z.string().optional(),
  expirationDate: z.string().optional(),
  location: z.string().optional(),
  farmId: z.string().optional(),
});

type InventoryItemForm = z.infer<typeof inventoryItemSchema>;

export default function NewInventoryItemPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query para obtener fincas
  const { data: farms = [], isLoading: farmsLoading } = useQuery(
    ['farms', currentUser?.uid],
    () => currentUser ? farmsService.getFarms(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InventoryItemForm>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      quantity: 0,
      minStock: 1,
      cost: 0,
      unit: 'unidades',
      category: 'other'
    }
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data: InventoryItemForm) => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      // Crear el objeto base sin campos undefined
      const itemData: any = {
        name: data.name,
        category: data.category,
        brand: data.brand || '',
        description: data.description || '',
        quantity: data.quantity,
        unit: data.unit,
        minStock: data.minStock,
        cost: data.cost,
        supplier: data.supplier || '',
        location: data.location || '',
        farmId: data.farmId || '',
        userId: currentUser.uid,
        isActive: true,
      };

      // Solo agregar campos de fecha si tienen valor
      if (data.purchaseDate) {
        itemData.purchaseDate = Timestamp.fromDate(new Date(data.purchaseDate));
      }
      
      if (data.expirationDate) {
        itemData.expirationDate = Timestamp.fromDate(new Date(data.expirationDate));
      }
      
      await inventoryService.createInventoryItem(itemData);
      
      // Invalidar las queries del cache para que se refresquen
      await queryClient.invalidateQueries(['inventory', currentUser.uid]);
      await queryClient.invalidateQueries(['lowStock', currentUser.uid]);
      
      toast.success('¡Item creado!', 'El item ha sido agregado al inventario exitosamente');
      navigate('/inventory');
    } catch (error: any) {
      toast.error('Error al crear item', error.message || 'Ha ocurrido un error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'seeds', label: 'Semillas', icon: '🌱' },
    { value: 'fertilizers', label: 'Fertilizantes', icon: '🧪' },
    { value: 'pesticides', label: 'Pesticidas', icon: '🚫' },
    { value: 'tools', label: 'Herramientas', icon: '🔧' },
    { value: 'machinery', label: 'Maquinaria', icon: '🚜' },
    { value: 'other', label: 'Otros', icon: '📦' },
  ];

  const units = [
    'unidades', 'kg', 'g', 'L', 'mL', 'ton', 'sacos', 'cajas', 'paquetes', 'metros', 'hectáreas'
  ];

  if (farmsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/inventory')}
            className="btn btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <Package className="w-8 h-8 inline mr-3 text-green-600" />
              Nuevo Item de Inventario
            </h1>
            <p className="text-gray-600 mt-1">
              Registra un nuevo item en tu inventario
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Información Básica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Nombre del Item *</label>
                <input
                  {...register('name')}
                  type="text"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Ej: Semilla de Maíz Híbrido"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Categoría *</label>
                <select
                  {...register('category')}
                  className={`input ${errors.category ? 'input-error' : ''}`}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-error-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="label">Marca</label>
                <input
                  {...register('brand')}
                  type="text"
                  className="input"
                  placeholder="Ej: Pioneer, Bayer, Syngenta"
                />
              </div>

              <div>
                <label className="label">Proveedor</label>
                <input
                  {...register('supplier')}
                  type="text"
                  className="input"
                  placeholder="Ej: Agrosur, Casa Agrícola"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Descripción</label>
                <textarea
                  {...register('description')}
                  className="input"
                  rows={3}
                  placeholder="Descripción detallada del item..."
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Cantidad y Stock</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Cantidad Actual *</label>
                <input
                  {...register('quantity', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className={`input ${errors.quantity ? 'input-error' : ''}`}
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-error-600">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="label">Unidad *</label>
                <select
                  {...register('unit')}
                  className={`input ${errors.unit ? 'input-error' : ''}`}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-error-600">{errors.unit.message}</p>
                )}
              </div>

              <div>
                <label className="label">Stock Mínimo *</label>
                <input
                  {...register('minStock', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className={`input ${errors.minStock ? 'input-error' : ''}`}
                  placeholder="1"
                />
                {errors.minStock && (
                  <p className="mt-1 text-sm text-error-600">{errors.minStock.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Información Financiera</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Costo por Unidad *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    {...register('cost', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className={`input pl-8 ${errors.cost ? 'input-error' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.cost && (
                  <p className="mt-1 text-sm text-error-600">{errors.cost.message}</p>
                )}
              </div>

              <div>
                <label className="label">Fecha de Compra</label>
                <input
                  {...register('purchaseDate')}
                  type="date"
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ubicación y Almacenamiento</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Finca</label>
                <select
                  {...register('farmId')}
                  className="input"
                >
                  <option value="">Selecciona una finca (opcional)</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Ubicación de Almacenamiento</label>
                <input
                  {...register('location')}
                  type="text"
                  className="input"
                  placeholder="Ej: Bodega A, Estante 3, Refrigerador"
                />
              </div>

              {(selectedCategory === 'seeds' || selectedCategory === 'fertilizers' || selectedCategory === 'pesticides') && (
                <div>
                  <label className="label">Fecha de Vencimiento</label>
                  <input
                    {...register('expirationDate')}
                    type="date"
                    className="input"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Importante para productos perecederos
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
