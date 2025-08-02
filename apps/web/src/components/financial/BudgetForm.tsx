import React, { useState } from 'react';
import { X, Save, Target } from 'lucide-react';
import { financialService, type Budget } from '../../services/financialService';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetCreated: (budget: Budget) => void;
  editBudget?: Budget | null;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  isOpen,
  onClose,
  onBudgetCreated,
  editBudget = null
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editBudget?.name || '',
    description: editBudget?.description || '',
    type: editBudget?.type || 'annual' as 'annual' | 'seasonal' | 'project',
    startDate: editBudget?.startDate ? editBudget.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: editBudget?.endDate ? editBudget.endDate.toISOString().split('T')[0] : '',
    totalBudget: editBudget?.totalBudget?.toString() || '',
    status: editBudget?.status || 'draft' as 'draft' | 'active' | 'completed' | 'archived'
  });

  const budgetTypes = [
    { value: 'annual', label: 'Anual' },
    { value: 'seasonal', label: 'Temporal/Estacional' },
    { value: 'project', label: 'Proyecto Específico' }
  ];

  const budgetStatuses = [
    { value: 'draft', label: 'Borrador' },
    { value: 'active', label: 'Activo' },
    { value: 'completed', label: 'Completado' },
    { value: 'archived', label: 'Archivado' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const budgetData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        totalBudget: parseFloat(formData.totalBudget),
        currency: 'USD',
        status: formData.status,
        actualSpent: 0,
        actualIncome: 0,
        variance: 0
      };

      const newBudget = await financialService.createBudget('demo-user', budgetData);
      onBudgetCreated(newBudget);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'annual',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        totalBudget: '',
        status: 'draft'
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Error al crear el presupuesto. Se ha guardado offline.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular fecha de fin automáticamente basada en el tipo
  const handleTypeChange = (type: string) => {
    const startDate = new Date(formData.startDate);
    let endDate = new Date(startDate);

    switch (type) {
      case 'annual':
        endDate.setFullYear(startDate.getFullYear() + 1);
        endDate.setDate(endDate.getDate() - 1); // Un día antes del próximo año
        break;
      case 'seasonal':
        endDate.setMonth(startDate.getMonth() + 6); // 6 meses
        break;
      case 'project':
        endDate.setMonth(startDate.getMonth() + 3); // 3 meses por defecto
        break;
    }

    setFormData({
      ...formData,
      type: type as any,
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del presupuesto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Presupuesto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Presupuesto Cultivo Maíz 2024"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción detallada del presupuesto..."
            />
          </div>

          {/* Tipo de presupuesto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Presupuesto
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {budgetTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              La fecha de fin se calculará automáticamente según el tipo seleccionado.
            </p>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  // Recalcular fecha de fin
                  handleTypeChange(formData.type);
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Presupuesto total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presupuesto Total (USD)
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {budgetStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {/* Información del período */}
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Información del Período</h4>
              <p className="text-xs text-blue-600">
                Duración: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} días
              </p>
              {formData.totalBudget && (
                <p className="text-xs text-blue-600">
                  Promedio mensual: ${(parseFloat(formData.totalBudget) / Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))).toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                'Guardando...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editBudget ? 'Actualizar' : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
