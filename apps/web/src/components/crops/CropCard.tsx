import { useState } from 'react';
import { MapPin, MoreVertical, Sprout, Wheat } from 'lucide-react';
import { Crop } from '@/services/firebaseService';
import { 
  calculateCropStatus, 
  getCropProgress, 
  getStatusColor, 
  getStatusLabel, 
  getStatusIcon, 
  getStatusMessage,
  CropStatus 
} from '@/utils/cropUtils';

interface CropCardProps {
  crop: Crop;
  farmName?: string;
  onStatusChange: (cropId: string, newStatus: CropStatus) => Promise<void>;
  onEdit?: (crop: Crop) => void;
  onDelete?: (crop: Crop) => void;
}

export function CropCard({ crop, farmName, onStatusChange, onEdit, onDelete }: CropCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Calcular estado automático y progreso
  const calculatedStatus = calculateCropStatus(crop.plantedDate, crop.expectedHarvestDate, crop.status);
  const progress = getCropProgress(crop.plantedDate, crop.expectedHarvestDate);
  const statusMessage = getStatusMessage(calculatedStatus, progress);

  // Usar estado calculado si es diferente al almacenado (excepto si está cosechado manualmente)
  const currentStatus = crop.status === 'harvested' ? crop.status : calculatedStatus;

  const handleStatusChange = async (newStatus: CropStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(crop.id!, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Sin fecha';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressBarColor = (status: CropStatus) => {
    switch (status) {
      case 'planted': return 'bg-blue-500';
      case 'growing': return 'bg-green-500';
      case 'ready': return 'bg-yellow-500';
      case 'harvested': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getStatusIcon(currentStatus)}</div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{crop.name}</h3>
              <p className="text-sm text-gray-600">{crop.variety}</p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(crop);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ✏️ Editar cultivo
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(crop);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      🗑️ Eliminar cultivo
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status Badge y Progreso */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentStatus)}`}>
              {getStatusLabel(currentStatus)}
            </span>
            <span className="text-xs text-gray-500">
              {progress.progressPercentage}% completado
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(currentStatus)}`}
              style={{ width: `${Math.min(100, progress.progressPercentage)}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-600">{statusMessage}</p>
        </div>

        {/* Información de fechas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-gray-500">Sembrado</p>
              <p className="font-medium">{formatDate(crop.plantedDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Wheat className="w-4 h-4 text-yellow-600" />
            <div>
              <p className="text-gray-500">Cosecha</p>
              <p className="font-medium">{formatDate(crop.expectedHarvestDate)}</p>
              {progress.isOverdue && (
                <p className="text-xs text-red-500">
                  {Math.abs(progress.daysUntilHarvest)} días de retraso
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información de la granja */}
        {farmName && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{farmName}</span>
          </div>
        )}

        {/* Métricas adicionales */}
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <p className="font-medium text-gray-700">{progress.daysSincePlanted}</p>
            <p>Días desde siembra</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700">{progress.daysUntilHarvest}</p>
            <p>Días restantes</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700">{progress.totalDays}</p>
            <p>Ciclo total</p>
          </div>
        </div>
      </div>

      {/* Botones de acción de estado */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          {currentStatus !== 'growing' && currentStatus !== 'harvested' && (
            <button
              onClick={() => handleStatusChange('growing')}
              disabled={isUpdating}
              className="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? '⏳' : '🌿'} Marcar Creciendo
            </button>
          )}
          
          {currentStatus !== 'ready' && currentStatus !== 'harvested' && (
            <button
              onClick={() => handleStatusChange('ready')}
              disabled={isUpdating}
              className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? '⏳' : '🌾'} Listo para Cosecha
            </button>
          )}
          
          {currentStatus !== 'harvested' && (
            <button
              onClick={() => handleStatusChange('harvested')}
              disabled={isUpdating}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? '⏳' : '📦'} Cosechado
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
