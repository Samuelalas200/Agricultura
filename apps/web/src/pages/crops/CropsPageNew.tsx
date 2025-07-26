import { useState } from 'react';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Wheat, Calendar } from 'lucide-react';
import { cropsService, farmsService, Crop } from '../../services/firebaseService';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { toast } from '../../components/ui/Toaster';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: crops = [], isLoading: cropsLoading, refetch: refetchCrops } = useQuery(
    ['crops', currentUser?.uid],
    () => currentUser ? cropsService.getCrops(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );
  
  const { data: farms = [], isLoading: farmsLoading } = useQuery(
    ['farms', currentUser?.uid], 
    () => currentUser ? farmsService.getFarms(currentUser.uid) : Promise.resolve([]),
    { enabled: !!currentUser }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CropForm>({
    resolver: zodResolver(cropSchema),
  });

  const onSubmit = async (data: CropForm) => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      const plantedDate = Timestamp.fromDate(new Date(data.plantedDate));
      const expectedHarvestDate = Timestamp.fromDate(new Date(data.expectedHarvestDate));
      
      const cropData = {
        name: data.name,
        variety: data.variety,
        plantedDate: plantedDate,
        expectedHarvestDate: expectedHarvestDate,
        farmId: data.farmId,
        userId: currentUser.uid,
        status: 'planted' as const,
      };
      
      await cropsService.createCrop(cropData);
      
      toast.success('¡Cultivo creado!', 'El cultivo ha sido registrado exitosamente');
      reset();
      setShowCreateForm(false);
      refetchCrops();
    } catch (error: any) {
      toast.error('Error al crear cultivo', error.message || 'Ha ocurrido un error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    try {
      return timestamp.toDate().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return 'bg-blue-100 text-blue-800';
      case 'growing': return 'bg-green-100 text-green-800';
      case 'ready': return 'bg-yellow-100 text-yellow-800';
      case 'harvested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planted': return 'Sembrado';
      case 'growing': return 'Creciendo';
      case 'ready': return 'Listo para cosecha';
      case 'harvested': return 'Cosechado';
      default: return 'Sembrado';
    }
  };

  if (cropsLoading || farmsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <Wheat className="w-8 h-8 inline mr-3 text-green-600" />
            Gestión de Cultivos
          </h1>
          <p className="text-gray-600 mt-1">
            {crops.length || 0} cultivo{(crops.length || 0) !== 1 ? 's' : ''} registrado{(crops.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
          disabled={farms.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cultivo
        </button>
      </div>

      {farms.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Necesitas crear al menos una finca antes de poder registrar cultivos.
          </p>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nuevo Cultivo</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Nombre del Cultivo</label>
                <input
                  {...register('name')}
                  type="text"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Ej: Café, Maíz, Tomate"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Variedad</label>
                <input
                  {...register('variety')}
                  type="text"
                  className={`input ${errors.variety ? 'input-error' : ''}`}
                  placeholder="Ej: Caturra, Criollo, Cherry"
                />
                {errors.variety && (
                  <p className="mt-1 text-sm text-error-600">{errors.variety.message}</p>
                )}
              </div>

              <div>
                <label className="label">Finca</label>
                <select
                  {...register('farmId')}
                  className={`input ${errors.farmId ? 'input-error' : ''}`}
                >
                  <option value="">Selecciona una finca</option>
                  {farms.map((farm: any) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
                {errors.farmId && (
                  <p className="mt-1 text-sm text-error-600">{errors.farmId.message}</p>
                )}
              </div>

              <div>
                <label className="label">Fecha de Siembra</label>
                <input
                  {...register('plantedDate')}
                  type="date"
                  className={`input ${errors.plantedDate ? 'input-error' : ''}`}
                />
                {errors.plantedDate && (
                  <p className="mt-1 text-sm text-error-600">{errors.plantedDate.message}</p>
                )}
              </div>

              <div>
                <label className="label">Fecha Estimada de Cosecha</label>
                <input
                  {...register('expectedHarvestDate')}
                  type="date"
                  className={`input ${errors.expectedHarvestDate ? 'input-error' : ''}`}
                />
                {errors.expectedHarvestDate && (
                  <p className="mt-1 text-sm text-error-600">{errors.expectedHarvestDate.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    reset();
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Creando...' : 'Crear Cultivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crops List */}
      <div className="space-y-4">
        {(!crops || crops.length === 0) ? (
          <div className="text-center py-12">
            <Wheat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cultivos registrados</h3>
            <p className="text-gray-500 mb-4">Comienza registrando tu primer cultivo</p>
            {farms.length > 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cultivo
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {crops.map((crop: Crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                    <p className="text-sm text-gray-600">{crop.variety}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
                    {getStatusLabel(crop.status)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Sembrado: {formatDate(crop.plantedDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Cosecha: {formatDate(crop.expectedHarvestDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
