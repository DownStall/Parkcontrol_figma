import { Button } from './figma/ui/button';
import { Card } from './figma/ui/card';
import { ArrowLeft, DollarSign, TrendingUp, Car, Download } from 'lucide-react';
import type { Screen } from '../App';
import { BarChart, Bar,  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportsProps {
  navigate: (screen: Screen) => void;
}

const dailyData = [
  { day: 'Lun', revenue: 850 },
  { day: 'Mar', revenue: 920 },
  { day: 'Mié', revenue: 1100 },
  { day: 'Jue', revenue: 980 },
  { day: 'Vie', revenue: 1240 },
  { day: 'Sáb', revenue: 1450 },
  { day: 'Dom', revenue: 890 },
];

const vehicleTypeData = [
  { name: 'Automóviles', value: 45, color: '#3B82F6' },
  { name: 'Motocicletas', value: 30, color: '#A855F7' },
  { name: 'Bicicletas', value: 25, color: '#10B981' },
];

export function Reports({ navigate }: ReportsProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-700 px-6 pt-6 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('dashboard')}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white flex-1">Reportes</h1>
        </div>

        <p className="text-pink-100 text-sm">Semana del 20 al 26 de Noviembre</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto">
        <div className="space-y-4">
          {/* Revenue Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} />
                <p className="text-green-100 text-sm">Ingresos Diarios</p>
              </div>
              <p className="text-white text-2xl">$1,240</p>
              <p className="text-green-100 text-sm mt-1">+12% vs ayer</p>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} />
                <p className="text-blue-100 text-sm">Ingresos Semanales</p>
              </div>
              <p className="text-white text-2xl">$7,430</p>
              <p className="text-blue-100 text-sm mt-1">+8% vs semana anterior</p>
            </Card>
          </div>

          {/* Daily Revenue Chart */}
          <Card>
            <h3 className="text-gray-900 mb-4">Ingresos Semanales</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`$${value}`, 'Ingresos']}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Vehicle Types */}
          <Card>
            <h3 className="text-gray-900 mb-4">Distribución por Tipo de Vehículo</h3>
            <div className="flex items-center justify-center mb-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={vehicleTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {vehicleTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${value}%`, 'Porcentaje']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {vehicleTypeData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700 text-sm">{item.name}</span>
                  </div>
                  <span className="text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats Card */}
          <Card className="bg-blue-50 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Car size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total de Vehículos</p>
                <p className="text-gray-900 text-2xl">156</p>
              </div>
            </div>
            <p className="text-blue-700 text-sm">Esta semana se atendieron 156 vehículos</p>
          </Card>

          {/* Export Button */}
          <Button fullWidth size="lg" variant="secondary">
            <Download size={20} />
            Exportar Reporte en PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
