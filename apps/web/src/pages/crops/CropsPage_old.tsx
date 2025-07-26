import { useState } from 'react';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Wheat, MapPin, Calendar } from 'lucide-react';
import { cropsService, farmsService, Crop } from '@/services/firebaseService';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { toast } from '@/components/ui/Toaster';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Timestamp } from 'firebase/firestore';

const cropSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  variety: z.string().min(2, 'La variedad debe tener al menos 2 caracteres'),
  plantingDate: z.string().min(1, 'La fecha de siembra es requerida'),
  expectedHarvestDate: z.string().optional(),
  area: z.number().min(0.01, 'El área debe ser mayor a 0'),
  notes: z.string().optional(),
  farmId: z.string().min(1, 'Debes seleccionar una finca'),
});

type CropForm = z.infer<typeof cropSchema>;

export default function CropsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: crops, isLoading: cropsLoading, refetch: refetchCrops } = useQuery(
    'crops',
    () => cropsService.getCrops()
  );
  
  const { data: farms, isLoading: farmsLoading } = useQuery('farms', farmsService.getFarms);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CropForm>({
    resolver: zodResolver(cropSchema),
  });

  const onSubmit = async (data: CropForm) => {
    setIsSubmitting(true);
    try {
      await cropsService.createCrop({
        ...data,
        area: Number(data.area),
      });
      
      toast.success('¡Cultivo creado!', 'El cultivo ha sido registrado exitosamente');
      reset();
      setShowCreateForm(false);
      refetchCrops();
    } catch (error: any) {
      toast.error('Error al crear cultivo', error.response?.data?.message || 'Ha ocurrido un error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PLANNED: 'badge-gray',
      PLANTED: 'badge-info',
      GROWING: 'badge-success',
      HARVESTED: 'badge-warning',
      FAILED: 'badge-error',
    };
    
    const labels = {
      PLANNED: 'Planificado',
      PLANTED: 'Plantado',
      GROWING: 'En Crecimiento',
      HARVESTED: 'Cosechado',
      FAILED: 'Fallido',
    };

    return (
      <span className={`badge ${badges[status as keyof typeof badges] || 'badge-gray'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (cropsLoading || farmsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando cultivos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cultivos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y monitorea todos tus cultivos
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Cultivo
        </button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Registrar Nuevo Cultivo</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre del Cultivo</label>
                <select
                  {...register('name')}
                  className={`input ${errors.name ? 'input-error' : ''}`}
                >
                  <option value="">Selecciona un cultivo</option>
                  {CROP_TYPES.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
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
                  placeholder="Ej: Caturra, Hass, etc."
                />
                {errors.variety && (
                  <p className="mt-1 text-sm text-error-600">{errors.variety.message}</p>
                )}
              </div>
              
              <div>
                <label className="label">Fecha de Siembra</label>
                <input
                  {...register('plantingDate')}
                  type="date"
                  className={`input ${errors.plantingDate ? 'input-error' : ''}`}
                />
                {errors.plantingDate && (
                  <p className="mt-1 text-sm text-error-600">{errors.plantingDate.message}</p>
                )}
              </div>
              
              <div>
                <label className="label">Fecha Esperada de Cosecha</label>
                <input
                  {...register('expectedHarvestDate')}
                  type="date"
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">Área (hectáreas)</label>
                <input
                  {...register('area', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`input ${errors.area ? 'input-error' : ''}`}
                  placeholder="Ej: 2.5"
                />
                {errors.area && (
                  <p className="mt-1 text-sm text-error-600">{errors.area.message}</p>
                )}
              </div>
              
              <div>
                <label className="label">Finca</label>
                <select
                  {...register('farmId')}
                  className={`input ${errors.farmId ? 'input-error' : ''}`}
                >
                  <option value="">Selecciona una finca</option>
                  {farms?.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
                {errors.farmId && (
                  <p className="mt-1 text-sm text-error-600">{errors.farmId.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="label">Notas (opcional)</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="input resize-none"
                placeholder="Observaciones, cuidados especiales, etc."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Guardando...
                  </div>
                ) : (
                  'Registrar Cultivo'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de cultivos */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mis Cultivos</h3>
        </div>
        
        {(!crops || crops.length === 0) ? (
          <div className="text-center py-12">
            <Wheat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes cultivos registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza registrando tu primer cultivo para llevar un mejor control
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primer Cultivo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop: Crop) => (
              <div key={crop.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Wheat className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{crop.name}</h4>
                      <p className="text-sm text-gray-600">{crop.variety}</p>
                    </div>
                  </div>
                  {getStatusBadge(crop.status)}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{crop.farm.name} • {formatArea(crop.area)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Sembrado: {formatDate(crop.plantingDate)}</span>
                  </div>
                  {crop.expectedHarvestDate && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Cosecha: {formatDate(crop.expectedHarvestDate)}</span>
                    </div>
                  )}
                </div>
                
                {crop.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    {crop.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
