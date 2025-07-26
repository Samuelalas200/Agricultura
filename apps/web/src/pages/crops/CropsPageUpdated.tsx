import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Wheat } from 'lucide-react';
import { cropsService, farmsService, Crop } from '@/services/firebaseService';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { toast } from '@/components/ui/Toaster';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CropCard } from '@/components/crops/CropCard';
import { CropStatus } from '@/utils/cropUtils';
import { Timestamp } from 'firebase/firestore';

const cropSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  variety: z.string().min(2, 'La variedad debe tener al menos 2 caracteres'),
  plantedDate: z.string(),
  expectedHarvestDate: z.string(),
  farmId: z.string().min(1, 'Debes seleccionar una finca'),
});

type CropForm = z.infer<typeof cropSchema>;

export default function CropsPage() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

  // Queries
  const { data: crops = [], isLoading: cropsLoading } = useQuery(
    ['crops', currentUser?.uid],
    () => currentUser ? cropsService.getCrops(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );
  
  const { data: farms = [], isLoading: farmsLoading } = useQuery(
    ['farms', currentUser?.uid], 
    () => currentUser ? farmsService.getFarms(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );

  // Mutations
  const createCropMutation = useMutation(cropsService.createCrop, {
    onSuccess: () => {
      queryClient.invalidateQueries(['crops']);
      toast.success('Cultivo creado exitosamente');
      setShowCreateForm(false);
      reset();
    },
    onError: (error) => {
      console.error('Error creating crop:', error);
      toast.error('Error al crear el cultivo');
    }
  });

  const updateStatusMutation = useMutation(
    ({ cropId, status }: { cropId: string; status: CropStatus }) => 
      cropsService.updateCropStatus(cropId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['crops']);
        toast.success('Estado actualizado exitosamente');
      },
      onError: (error) => {
        console.error('Error updating crop status:', error);
        toast.error('Error al actualizar el estado');
      }
    }
  );

  const deleteCropMutation = useMutation(cropsService.deleteCrop, {
    onSuccess: () => {
      queryClient.invalidateQueries(['crops']);
      toast.success('Cultivo eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting crop:', error);
      toast.error('Error al eliminar el cultivo');
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CropForm>({
    resolver: zodResolver(cropSchema),
  });

  const onSubmit = async (data: CropForm) => {
    if (!currentUser) return;

    try {
      const cropData = {
        name: data.name,
        variety: data.variety,
        plantedDate: Timestamp.fromDate(new Date(data.plantedDate)),
        expectedHarvestDate: Timestamp.fromDate(new Date(data.expectedHarvestDate)),
        farmId: data.farmId,
        userId: currentUser.uid,
        status: 'planted' as const,
      };

      if (editingCrop) {
        await cropsService.updateCrop(editingCrop.id!, cropData);
        queryClient.invalidateQueries(['crops']);
        toast.success('Cultivo actualizado exitosamente');
        setEditingCrop(null);
      } else {
        createCropMutation.mutate(cropData);
      }
      
      setShowCreateForm(false);
      reset();
    } catch (error) {
      console.error('Error saving crop:', error);
      toast.error('Error al guardar el cultivo');
    }
  };

  const handleStatusChange = async (cropId: string, newStatus: CropStatus) => {
    updateStatusMutation.mutate({ cropId, status: newStatus });
  };

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setValue('name', crop.name);
    setValue('variety', crop.variety);
    setValue('plantedDate', crop.plantedDate.toDate().toISOString().split('T')[0]);
    setValue('expectedHarvestDate', crop.expectedHarvestDate.toDate().toISOString().split('T')[0]);
    setValue('farmId', crop.farmId);
    setShowCreateForm(true);
  };

  const handleDelete = (crop: Crop) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el cultivo "${crop.name}"?`)) {
      deleteCropMutation.mutate(crop.id!);
    }
  };

  const getFarmName = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    return farm?.name || 'Finca desconocida';
  };

  if (cropsLoading || farmsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Wheat className="w-8 h-8 inline mr-3 text-green-600" />
            Gestión de Cultivos
          </h1>
          <p className="text-gray-600 mt-2">
            Administra tus cultivos y monitorea su progreso automáticamente
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCrop(null);
            setShowCreateForm(true);
            reset();
          }}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cultivo
        </button>
      </div>

      {/* Formulario de creación/edición */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {editingCrop ? 'Editar Cultivo' : 'Crear Nuevo Cultivo'}
            </h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditingCrop(null);
                reset();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Cultivo
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Maíz amarillo"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variedad
                </label>
                <input
                  {...register('variety')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Híbrido DK-390"
                />
                {errors.variety && (
                  <p className="text-red-500 text-sm mt-1">{errors.variety.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Siembra
                </label>
                <input
                  {...register('plantedDate')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.plantedDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.plantedDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Estimada de Cosecha
                </label>
                <input
                  {...register('expectedHarvestDate')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.expectedHarvestDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.expectedHarvestDate.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Finca
                </label>
                <select
                  {...register('farmId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar finca</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} - {farm.location}
                    </option>
                  ))}
                </select>
                {errors.farmId && (
                  <p className="text-red-500 text-sm mt-1">{errors.farmId.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingCrop(null);
                  reset();
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createCropMutation.isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {createCropMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    {editingCrop ? 'Actualizar' : 'Crear'} Cultivo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de cultivos */}
      {crops.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
          <Wheat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No tienes cultivos registrados</h3>
          <p className="text-gray-500 mb-6">
            Comienza creando tu primer cultivo para monitorear su progreso
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Crear Primer Cultivo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              farmName={getFarmName(crop.farmId)}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Estadísticas rápidas */}
      {crops.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Resumen de Cultivos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {crops.filter(c => c.status === 'planted').length}
              </div>
              <div className="text-sm text-blue-600">🌱 Sembrados</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {crops.filter(c => c.status === 'growing').length}
              </div>
              <div className="text-sm text-green-600">🌿 Creciendo</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {crops.filter(c => c.status === 'ready').length}
              </div>
              <div className="text-sm text-yellow-600">🌾 Listos</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {crops.filter(c => c.status === 'harvested').length}
              </div>
              <div className="text-sm text-gray-600">📦 Cosechados</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
