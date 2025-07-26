import { useState } from 'react';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MapPin, Users, Wheat, Edit, Trash2 } from 'lucide-react';
import { farmsService } from '@/services/farmsService';
import { toast } from '@/components/ui/Toaster';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatArea } from '@campo360/lib';
import type { Farm } from '@campo360/lib';

const farmSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  location: z.string().min(5, 'La ubicación debe tener al menos 5 caracteres'),
  totalArea: z.number().min(0.01, 'El área debe ser mayor a 0'),
  description: z.string().optional(),
});

type FarmForm = z.infer<typeof farmSchema>;

export default function FarmsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query para obtener fincas
  const { data: farms, isLoading, refetch } = useQuery('farms', farmsService.getFarms);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FarmForm>({
    resolver: zodResolver(farmSchema),
  });

  const onSubmit = async (data: FarmForm) => {
    setIsSubmitting(true);
    try {
      if (editingFarm) {
        await farmsService.updateFarm(editingFarm.id, {
          ...data,
          totalArea: Number(data.totalArea),
        });
        toast.success('¡Finca actualizada!', 'Los cambios han sido guardados exitosamente');
        setEditingFarm(null);
      } else {
        await farmsService.createFarm({
          ...data,
          totalArea: Number(data.totalArea),
        });
        toast.success('¡Finca creada!', 'La finca ha sido registrada exitosamente');
        setShowCreateForm(false);
      }
      
      reset();
      refetch();
    } catch (error: any) {
      toast.error(
        editingFarm ? 'Error al actualizar finca' : 'Error al crear finca',
        error.response?.data?.message || 'Ha ocurrido un error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setValue('name', farm.name);
    setValue('location', farm.location);
    setValue('totalArea', farm.totalArea);
    setValue('description', farm.description || '');
    setShowCreateForm(true);
  };

  const handleDelete = async (farm: Farm) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la finca "${farm.name}"?`)) {
      return;
    }

    try {
      await farmsService.deleteFarm(farm.id);
      toast.success('Finca eliminada', 'La finca ha sido eliminada exitosamente');
      refetch();
    } catch (error: any) {
      toast.error('Error al eliminar finca', error.response?.data?.message || 'Ha ocurrido un error');
    }
  };

  const handleCancelEdit = () => {
    setEditingFarm(null);
    setShowCreateForm(false);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando fincas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Fincas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y administra todas tus propiedades agrícolas
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Finca
        </button>
      </div>

      {/* Formulario de creación/edición */}
      {showCreateForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {editingFarm ? 'Editar Finca' : 'Registrar Nueva Finca'}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre de la Finca</label>
                <input
                  {...register('name')}
                  type="text"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Ej: Finca Los Cafetales"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label className="label">Ubicación</label>
                <input
                  {...register('location')}
                  type="text"
                  className={`input ${errors.location ? 'input-error' : ''}`}
                  placeholder="Ej: Quindío, Colombia"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-error-600">{errors.location.message}</p>
                )}
              </div>
              
              <div>
                <label className="label">Área Total (hectáreas)</label>
                <input
                  {...register('totalArea', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`input ${errors.totalArea ? 'input-error' : ''}`}
                  placeholder="Ej: 25.5"
                />
                {errors.totalArea && (
                  <p className="mt-1 text-sm text-error-600">{errors.totalArea.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="label">Descripción (opcional)</label>
              <textarea
                {...register('description')}
                rows={3}
                className="input resize-none"
                placeholder="Características especiales, tipos de suelo, acceso, etc."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelEdit}
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
                    {editingFarm ? 'Actualizando...' : 'Guardando...'}
                  </div>
                ) : (
                  editingFarm ? 'Actualizar Finca' : 'Registrar Finca'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de fincas */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tabla de Fincas Registradas</h3>
          <div className="text-sm text-gray-600">
            {farms?.length || 0} finca{(farms?.length || 0) !== 1 ? 's' : ''} registrada{(farms?.length || 0) !== 1 ? 's' : ''}
          </div>
        </div>
        
        {(!farms || farms.length === 0) ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes fincas registradas
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza registrando tu primera finca para comenzar a gestionar tus cultivos
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primera Finca
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm: Farm) => (
              <div key={farm.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{farm.name}</h4>
                      <p className="text-sm text-gray-600">{farm.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(farm)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar finca"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(farm)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar finca"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Área Total</span>
                    <span className="font-medium text-gray-900">{formatArea(farm.totalArea)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cultivos</span>
                    <div className="flex items-center">
                      <Wheat className="w-4 h-4 text-green-600 mr-1" />
                      <span className="font-medium text-gray-900">{farm.crops?.length || 0}</span>
                    </div>
                  </div>
                  
                  {farm.description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{farm.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="w-3 h-3 mr-1" />
                    <span>Registrado el {new Date(farm.createdAt).toLocaleDateString('es-CO')}</span>
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
