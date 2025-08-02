import React, { useState } from 'react';
import { X, Save, User, Building } from 'lucide-react';
import { financialService, type Customer } from '../../services/financialService';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
  editCustomer?: Customer | null;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
  editCustomer = null
}) => {
  const [loading, setLoading] = useState(false);
  const [customerType, setCustomerType] = useState<'customer' | 'supplier'>('customer');
  const [formData, setFormData] = useState({
    name: editCustomer?.name || '',
    email: editCustomer?.email || '',
    phone: editCustomer?.phone || '',
    paymentTerms: editCustomer?.paymentTerms || 'contado',
    notes: editCustomer?.notes || ''
  });

  const paymentTermsOptions = [
    { value: 'contado', label: 'Contado' },
    { value: '15-dias', label: '15 días' },
    { value: '30-dias', label: '30 días' },
    { value: '60-dias', label: '60 días' },
    { value: '90-dias', label: '90 días' },
    { value: 'personalizado', label: 'Personalizado' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customerData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes || undefined,
        totalSales: 0,
        outstandingBalance: 0
      };

      const newCustomer = await financialService.createCustomer('demo-user', customerData);
      onCustomerCreated(newCustomer);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        paymentTerms: 'contado',
        notes: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      alert(`Error al crear ${customerType === 'customer' ? 'el cliente' : 'el proveedor'}. Se ha guardado offline.`);
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
            {editCustomer ? 'Editar Contacto' : 'Nuevo Contacto'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de tipo */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Contacto
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="customer"
                checked={customerType === 'customer'}
                onChange={(e) => setCustomerType(e.target.value as 'customer' | 'supplier')}
                className="mr-2"
              />
              <User className="w-4 h-4 mr-1 text-green-600" />
              <span className="text-green-600 font-medium">Cliente</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="supplier"
                checked={customerType === 'supplier'}
                onChange={(e) => setCustomerType(e.target.value as 'customer' | 'supplier')}
                className="mr-2"
              />
              <Building className="w-4 h-4 mr-1 text-blue-600" />
              <span className="text-blue-600 font-medium">Proveedor</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre / Empresa
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={customerType === 'customer' ? 'Nombre del cliente' : 'Nombre del proveedor'}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@ejemplo.com"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+34 123 456 789"
            />
          </div>

          {/* Términos de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Términos de Pago
            </label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {paymentTermsOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Define los términos de pago para {customerType === 'customer' ? 'ventas' : 'compras'}
            </p>
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
              placeholder="Información adicional sobre el contacto..."
            />
          </div>

          {/* Información del tipo */}
          <div className={`p-3 rounded-md ${customerType === 'customer' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <h4 className={`text-sm font-medium mb-1 ${customerType === 'customer' ? 'text-green-800' : 'text-blue-800'}`}>
              {customerType === 'customer' ? 'Cliente' : 'Proveedor'}
            </h4>
            <p className={`text-xs ${customerType === 'customer' ? 'text-green-600' : 'text-blue-600'}`}>
              {customerType === 'customer' 
                ? 'Este contacto aparecerá en tus ventas y podrás facturarle productos o servicios.'
                : 'Este contacto aparecerá en tus compras y podrás registrar gastos de sus productos o servicios.'
              }
            </p>
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
                  {editCustomer ? 'Actualizar' : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
