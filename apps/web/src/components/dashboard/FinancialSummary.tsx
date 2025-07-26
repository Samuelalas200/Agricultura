import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { Crop, Farm, Task } from '../../services/firebaseService';

interface FinancialSummaryProps {
  farms: Farm[];
  crops: Crop[];
  tasks: Task[];
}

interface FinancialData {
  totalInvestment: number;
  estimatedRevenue: number;
  operationalCosts: number;
  profitMargin: number;
  costBreakdown: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
  monthlyProjection: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
}

export function FinancialSummary({ farms, crops, tasks }: FinancialSummaryProps) {
  const financialData: FinancialData = useMemo(() => {
    // Cálculos simulados basados en los datos reales
    const totalArea = farms.reduce((sum, farm) => sum + farm.size, 0);
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    
    // Estimaciones por hectárea (valores aproximados para diferentes cultivos)
    const costPerHectare = 1500000; // COP por hectárea
    const revenuePerHectare = 2200000; // COP por hectárea
    
    const totalInvestment = totalArea * costPerHectare;
    const estimatedRevenue = totalArea * revenuePerHectare;
    const operationalCosts = completedTasks * 50000; // Costo estimado por tarea completada
    
    const profitMargin = totalInvestment > 0 ? ((estimatedRevenue - totalInvestment - operationalCosts) / estimatedRevenue) * 100 : 0;

    const costBreakdown = [
      { category: 'Semillas', amount: totalInvestment * 0.25, color: '#10b981' },
      { category: 'Fertilizantes', amount: totalInvestment * 0.35, color: '#3b82f6' },
      { category: 'Mano de Obra', amount: totalInvestment * 0.30, color: '#f59e0b' },
      { category: 'Maquinaria', amount: totalInvestment * 0.10, color: '#ef4444' }
    ];

    const monthlyProjection = [
      { month: 'Ene', income: estimatedRevenue * 0.05, expenses: totalInvestment * 0.15, profit: 0 },
      { month: 'Feb', income: estimatedRevenue * 0.08, expenses: totalInvestment * 0.12, profit: 0 },
      { month: 'Mar', income: estimatedRevenue * 0.12, expenses: totalInvestment * 0.18, profit: 0 },
      { month: 'Abr', income: estimatedRevenue * 0.15, expenses: totalInvestment * 0.20, profit: 0 },
      { month: 'May', income: estimatedRevenue * 0.20, expenses: totalInvestment * 0.15, profit: 0 },
      { month: 'Jun', income: estimatedRevenue * 0.25, expenses: totalInvestment * 0.10, profit: 0 }
    ].map(month => ({
      ...month,
      profit: month.income - month.expenses
    }));

    return {
      totalInvestment,
      estimatedRevenue,
      operationalCosts,
      profitMargin,
      costBreakdown,
      monthlyProjection
    };
  }, [farms, crops, tasks]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.payload.category}</p>
          <p className="text-xs text-gray-600">{formatCurrency(data.value)}</p>
          <p className="text-xs text-gray-500">
            {((data.value / financialData.totalInvestment) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (!farms.length) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Resumen Financiero
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Calculator className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay datos financieros disponibles</p>
          <p className="text-sm">Registra fincas y cultivos para ver el análisis financiero</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Resumen Financiero
        </h3>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialData.totalInvestment)}</p>
          <p className="text-xs text-gray-600">Inversión Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{formatCurrency(financialData.estimatedRevenue)}</p>
          <p className="text-xs text-gray-600">Ingresos Estimados</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(financialData.operationalCosts)}</p>
          <p className="text-xs text-gray-600">Costos Operacionales</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center">
            <p className={`text-2xl font-bold ${financialData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financialData.profitMargin.toFixed(1)}%
            </p>
            {financialData.profitMargin >= 0 ? (
              <TrendingUp className="w-4 h-4 ml-1 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 ml-1 text-red-600" />
            )}
          </div>
          <p className="text-xs text-gray-600">Margen de Ganancia</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de distribución de costos */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Distribución de Costos</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialData.costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="amount"
                >
                  {financialData.costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {financialData.costBreakdown.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proyección mensual */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Proyección 6 Meses</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData.monthlyProjection} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill="#10b981" name="Ingresos" />
                <Bar dataKey="expenses" fill="#ef4444" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resumen de rentabilidad */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-green-800 mb-2">💰 Ganancia Proyectada</h5>
          <p className="text-lg font-bold text-green-900">
            {formatCurrency(financialData.estimatedRevenue - financialData.totalInvestment - financialData.operationalCosts)}
          </p>
          <p className="text-xs text-green-700">En el ciclo completo</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-blue-800 mb-2">📊 ROI Estimado</h5>
          <p className="text-lg font-bold text-blue-900">
            {financialData.totalInvestment > 0 
              ? (((financialData.estimatedRevenue - financialData.totalInvestment) / financialData.totalInvestment) * 100).toFixed(1)
              : 0}%
          </p>
          <p className="text-xs text-blue-700">Retorno sobre inversión</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-yellow-800 mb-2">⏱️ Punto de Equilibrio</h5>
          <p className="text-lg font-bold text-yellow-900">
            {financialData.estimatedRevenue > 0 
              ? Math.ceil((financialData.totalInvestment / financialData.estimatedRevenue) * 12)
              : 0
            } meses
          </p>
          <p className="text-xs text-yellow-700">Tiempo para recuperar inversión</p>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-800 mb-2">💡 Recomendaciones Financieras</h5>
        <ul className="text-xs text-gray-700 space-y-1">
          {financialData.profitMargin > 20 && (
            <li>• Excelente margen de ganancia. Considera expandir la operación.</li>
          )}
          {financialData.profitMargin < 10 && (
            <li>• Margen bajo. Revisa los costos operacionales y busca optimizaciones.</li>
          )}
          <li>• Monitorea los precios del mercado para ajustar las proyecciones.</li>
          <li>• Considera diversificar cultivos para reducir riesgos financieros.</li>
          <li>• Implementa un sistema de control de gastos más detallado.</li>
        </ul>
      </div>
    </div>
  );
}
