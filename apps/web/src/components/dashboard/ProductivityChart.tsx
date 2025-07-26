import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { Crop, Farm } from '../../services/firebaseService';

interface ProductivityChartProps {
  farms: Farm[];
  crops: Crop[];
}

export function ProductivityChart({ farms, crops }: ProductivityChartProps) {
  const productivityData = useMemo(() => {
    if (!farms || !crops) return [];

    return farms.map(farm => {
      const farmCrops = crops.filter(crop => crop.farmId === farm.id);
      const activeCrops = farmCrops.filter(crop => crop.status === 'growing' || crop.status === 'ready');
      const harvestedCrops = farmCrops.filter(crop => crop.status === 'harvested');
      
      return {
        name: farm.name.length > 15 ? farm.name.substring(0, 15) + '...' : farm.name,
        fullName: farm.name,
        activeCrops: activeCrops.length,
        harvestedCrops: harvestedCrops.length,
        totalCrops: farmCrops.length,
        productivity: harvestedCrops.length > 0 ? Math.round((harvestedCrops.length / farmCrops.length) * 100) : 0,
        area: farm.size
      };
    });
  }, [farms, crops]);

  const totalActiveCrops = productivityData.reduce((sum, farm) => sum + farm.activeCrops, 0);
  const totalHarvestedCrops = productivityData.reduce((sum, farm) => sum + farm.harvestedCrops, 0);
  const averageProductivity = productivityData.length > 0 
    ? Math.round(productivityData.reduce((sum, farm) => sum + farm.productivity, 0) / productivityData.length)
    : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.fullName}</p>
          <p className="text-xs text-gray-600 mb-2">Área: {data.area} ha</p>
          <div className="space-y-1">
            <p className="text-xs text-green-600">
              Cultivos Activos: {data.activeCrops}
            </p>
            <p className="text-xs text-blue-600">
              Cultivos Cosechados: {data.harvestedCrops}
            </p>
            <p className="text-xs text-purple-600">
              Productividad: {data.productivity}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!productivityData || productivityData.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Productividad por Finca
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay datos de productividad disponibles</p>
          <p className="text-sm">Registra fincas y cultivos para ver estadísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Productividad por Finca
          </h3>
          <div className="text-sm text-gray-600">
            Productividad promedio: {averageProductivity}%
          </div>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{totalActiveCrops}</p>
          <p className="text-xs text-gray-600">Cultivos Activos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{totalHarvestedCrops}</p>
          <p className="text-xs text-gray-600">Cosechados</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{averageProductivity}%</p>
          <p className="text-xs text-gray-600">Productividad</p>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="activeCrops" fill="#16a34a" name="Cultivos Activos" />
            <Bar dataKey="harvestedCrops" fill="#2563eb" name="Cosechados" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de área de productividad */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Porcentaje de Productividad</h4>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={productivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }} 
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="productivity" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
                name="Productividad (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
