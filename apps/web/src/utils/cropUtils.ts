import { Timestamp } from 'firebase/firestore';

export type CropStatus = 'planted' | 'growing' | 'ready' | 'harvested';

/**
 * Calcula automáticamente el estado de un cultivo basado en las fechas
 * @param plantedDate Fecha de siembra
 * @param expectedHarvestDate Fecha esperada de cosecha
 * @param currentStatus Estado actual (para respetar "harvested" manual)
 * @returns Estado calculado del cultivo
 */
export function calculateCropStatus(
  plantedDate: Timestamp | Date,
  expectedHarvestDate: Timestamp | Date,
  currentStatus?: CropStatus
): CropStatus {
  // Si ya hay un estado manual definido, respetarlo (excepto para el estado inicial 'planted')
  // Solo calculamos automáticamente si el estado es 'planted' o no existe
  if (currentStatus && currentStatus !== 'planted') {
    return currentStatus;
  }

  const now = new Date();
  const planted = plantedDate instanceof Timestamp ? plantedDate.toDate() : plantedDate;
  const harvest = expectedHarvestDate instanceof Timestamp ? expectedHarvestDate.toDate() : expectedHarvestDate;
  
  // Si aún no se ha sembrado (fecha futura)
  if (planted > now) {
    return 'planted';
  }

  const totalDays = Math.ceil((harvest.getTime() - planted.getTime()) / (1000 * 3600 * 24));
  const daysSincePlanted = Math.ceil((now.getTime() - planted.getTime()) / (1000 * 3600 * 24));
  
  // Fases del cultivo basadas en porcentaje del ciclo
  const progressPercentage = (daysSincePlanted / totalDays) * 100;
  
  if (progressPercentage < 0) {
    return 'planted';
  } else if (progressPercentage <= 25) {
    return 'planted';        // Primeros 25% - Recién sembrado
  } else if (progressPercentage <= 80) {
    return 'growing';        // 25-80% - Creciendo
  } else {
    return 'ready';          // 80%+ - Listo para cosecha
  }
}

/**
 * Obtiene información detallada sobre el progreso del cultivo
 */
export function getCropProgress(
  plantedDate: Timestamp | Date,
  expectedHarvestDate: Timestamp | Date
) {
  const now = new Date();
  const planted = plantedDate instanceof Timestamp ? plantedDate.toDate() : plantedDate;
  const harvest = expectedHarvestDate instanceof Timestamp ? expectedHarvestDate.toDate() : expectedHarvestDate;
  
  const totalDays = Math.ceil((harvest.getTime() - planted.getTime()) / (1000 * 3600 * 24));
  const daysSincePlanted = Math.max(0, Math.ceil((now.getTime() - planted.getTime()) / (1000 * 3600 * 24)));
  const daysUntilHarvest = Math.max(0, Math.ceil((harvest.getTime() - now.getTime()) / (1000 * 3600 * 24)));
  
  const progressPercentage = Math.min(100, Math.max(0, (daysSincePlanted / totalDays) * 100));
  
  return {
    totalDays,
    daysSincePlanted,
    daysUntilHarvest,
    progressPercentage: Math.round(progressPercentage),
    isOverdue: now > harvest
  };
}

/**
 * Obtiene el color del estado para la UI
 */
export function getStatusColor(status: CropStatus): string {
  switch (status) {
    case 'planted': 
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'growing': 
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ready': 
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'harvested': 
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default: 
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
}

/**
 * Obtiene la etiqueta en español del estado
 */
export function getStatusLabel(status: CropStatus): string {
  switch (status) {
    case 'planted': return 'Sembrado';
    case 'growing': return 'Creciendo';
    case 'ready': return 'Listo para cosecha';
    case 'harvested': return 'Cosechado';
    default: return 'Sembrado';
  }
}

/**
 * Obtiene un icono emoji para el estado
 */
export function getStatusIcon(status: CropStatus): string {
  switch (status) {
    case 'planted': return '🌱';
    case 'growing': return '🌿';
    case 'ready': return '🌾';
    case 'harvested': return '📦';
    default: return '🌱';
  }
}

/**
 * Obtiene mensaje descriptivo del estado actual
 */
export function getStatusMessage(
  status: CropStatus,
  progress: ReturnType<typeof getCropProgress>
): string {
  switch (status) {
    case 'planted':
      return `Sembrado hace ${progress.daysSincePlanted} días`;
    case 'growing':
      return `Creciendo - ${progress.progressPercentage}% completado`;
    case 'ready':
      if (progress.isOverdue) {
        return `Listo para cosecha - ${Math.abs(progress.daysUntilHarvest)} días de retraso`;
      }
      return 'Listo para cosecha';
    case 'harvested':
      return 'Cultivo cosechado';
    default:
      return 'Estado desconocido';
  }
}
