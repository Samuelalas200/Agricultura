import React, { useState } from 'react';
import { X, Save, DollarSign } from 'lucide-react';
import { financialService, type Transaction } from '../../services/financialService';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionCreated: (transaction: Transaction) => void;
  editTransaction?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onTransactionCreated,
  editTransaction = null
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: editTransaction?.type || 'income' as 'income' | 'expense',
    category: editTransaction?.category || '',
    amount: editTransaction?.amount?.toString() || '',
    description: editTransaction?.description || '',
    date: editTransaction?.date ? editTransaction.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    paymentMethod: editTransaction?.paymentMethod || 'efectivo',
    paymentStatus: editTransaction?.paymentStatus || 'paid' as 'pending' | 'paid' | 'overdue' | 'cancelled',
    tags: editTransaction?.tags?.join(', ') || '',
    notes: editTransaction?.notes || ''
  });

  const incomeCategories = [
    'Venta de Cosecha',
    'Venta de Productos',
    'Subsidios',
    'Servicios Agrícolas',
    'Alquiler de Terrenos',
    'Otros Ingresos'
  ];

  const expenseCategories = [
    'Semillas',
    'Fertilizantes',
    'Pesticidas',
    'Combustible',
    'Maquinaria',
    'Mano de Obra',
    'Servicios',
    'Mantenimiento',
    'Seguros',
    'Impuestos',
    'Otros Gastos'
  ];

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'financiamiento', label: 'Financiamiento' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transactionData = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        currency: 'USD',
        description: formData.description,
        date: new Date(formData.date),
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        notes: formData.notes
      };

      const newTransaction = await financialService.createTransaction('demo-user', transactionData);
      onTransactionCreated(newTransaction);
      
      // Reset form
      setFormData({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'efectivo',
        paymentStatus: 'paid',
        tags: '',
        notes: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error al crear la transacción. Se ha guardado offline.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de transacción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Transacción
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="mr-2"
                />
                <span className="text-green-600 font-medium">Ingreso</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="mr-2"
                />
                <span className="text-red-600 font-medium">Gasto</span>
              </label>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar categoría</option>
              {(formData.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción de la transacción"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>

          {/* Estado de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Pago
            </label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="paid">Pagado</option>
              <option value="pending">Pendiente</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="etiqueta1, etiqueta2"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales..."
            />
          </div>

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
                  {editTransaction ? 'Actualizar' : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
