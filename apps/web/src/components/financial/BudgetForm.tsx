import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

export interface Budget {
  id?: string;
  name: string;
  description: string;
  totalAmount: number;
  spentAmount: number;
  remainingAmount: number;
  category: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  farmId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BudgetFormProps {
  budget?: Budget;
  onSubmit: (budget: Budget) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  budget,
  onSubmit,
  onCancel,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    totalAmount: 0,
    spentAmount: 0,
    remainingAmount: 0,
    category: '',
    startDate: '',
    endDate: '',
    status: 'active',
    farmId: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        description: budget.description,
        totalAmount: budget.totalAmount,
        spentAmount: budget.spentAmount,
        remainingAmount: budget.remainingAmount,
        category: budget.category,
        startDate: budget.startDate,
        endDate: budget.endDate,
        status: budget.status,
        farmId: budget.farmId
      });
    }
  }, [budget]);

  useEffect(() => {
    // Calculate remaining amount when total or spent amount changes
    const remaining = formData.totalAmount - formData.spentAmount;
    if (remaining !== formData.remainingAmount) {
      setFormData(prev => ({
        ...prev,
        remainingAmount: remaining
      }));
    }
  }, [formData.totalAmount, formData.spentAmount]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.totalAmount <= 0) {
      newErrors.totalAmount = 'El monto total debe ser mayor a 0';
    }

    if (formData.spentAmount < 0) {
      newErrors.spentAmount = 'El monto gastado no puede ser negativo';
    }

    if (formData.spentAmount > formData.totalAmount) {
      newErrors.spentAmount = 'El monto gastado no puede ser mayor al monto total';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (!formData.farmId) {
      newErrors.farmId = 'Debe seleccionar una finca';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const budgetData: Budget = {
        ...formData,
        id: budget?.id || `budget_${Date.now()}`,
        createdAt: budget?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSubmit(budgetData);
    } catch (error) {
      console.error('Error saving budget:', error);
      setErrors({ submit: 'Error al guardar el presupuesto' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar Presupuesto' : 'Crear Nuevo Presupuesto'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Presupuesto *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ej: Presupuesto Temporada 2024"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Descripción detallada del presupuesto..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Monto Total *
            </label>
            <input
              type="number"
              id="totalAmount"
              value={formData.totalAmount}
              onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.totalAmount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.totalAmount && <p className="mt-1 text-sm text-red-600">{errors.totalAmount}</p>}
          </div>

          <div>
            <label htmlFor="spentAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Monto Gastado
            </label>
            <input
              type="number"
              id="spentAmount"
              value={formData.spentAmount}
              onChange={(e) => handleInputChange('spentAmount', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.spentAmount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.spentAmount && <p className="mt-1 text-sm text-red-600">{errors.spentAmount}</p>}
          </div>

          <div>
            <label htmlFor="remainingAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Monto Restante
            </label>
            <input
              type="number"
              id="remainingAmount"
              value={formData.remainingAmount}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar categoría</option>
            <option value="semillas">Semillas</option>
            <option value="fertilizantes">Fertilizantes</option>
            <option value="pesticidas">Pesticidas</option>
            <option value="maquinaria">Maquinaria</option>
            <option value="mano-obra">Mano de Obra</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="otros">Otros</option>
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin *
            </label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.endDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'completed' | 'paused')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
            <option value="completed">Completado</option>
          </select>
        </div>

        {/* Farm ID - This would typically be a select with actual farms */}
        <div>
          <label htmlFor="farmId" className="block text-sm font-medium text-gray-700 mb-2">
            Finca *
          </label>
          <input
            type="text"
            id="farmId"
            value={formData.farmId}
            onChange={(e) => handleInputChange('farmId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.farmId ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="ID de la finca"
          />
          {errors.farmId && <p className="mt-1 text-sm text-red-600">{errors.farmId}</p>}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2 inline" />
                {isEdit ? 'Actualizar' : 'Crear'} Presupuesto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;
