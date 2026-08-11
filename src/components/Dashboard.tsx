import React from 'react';
import { 
  LogIn, LogOut, Car, DollarSign, BarChart3, 
  ShieldCheck, Wallet, Building2, Users, LayoutGrid, User 
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
  userRole?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, userRole = 'Administrador' }) => {
  const isAdmin = userRole === 'Administrador';

  const menuItems = [
    { id: 'register-entry', label: 'Registrar Entrada', icon: LogIn, color: 'from-emerald-500 to-teal-600', roleRequired: false },
    { id: 'register-exit', label: 'Registrar Salida', icon: LogOut, color: 'from-amber-500 to-orange-600', roleRequired: false },
    { id: 'view-vehicles', label: 'Ver Vehículos', icon: Car, color: 'from-blue-500 to-indigo-600', roleRequired: false },
    { id: 'parking-map', label: 'Mapa de Plazas', icon: LayoutGrid, color: 'from-teal-500 to-emerald-600', roleRequired: false },
    { id: 'cash-shift', label: 'Caja y Turnos', icon: Wallet, color: 'from-emerald-600 to-green-700', roleRequired: false },
    { id: 'subscribers', label: 'Abonados', icon: Users, color: 'from-purple-500 to-indigo-600', roleRequired: false },
    { id: 'manage-rates', label: 'Gestionar Tarifas', icon: DollarSign, color: 'from-violet-500 to-purple-600', roleRequired: true },
    { id: 'reports', label: 'Reportes e Informes', icon: BarChart3, color: 'from-pink-500 to-rose-600', roleRequired: true },
    { id: 'audit-logs', label: 'Auditoría', icon: ShieldCheck, color: 'from-blue-600 to-cyan-600', roleRequired: true },
    { id: 'business-config', label: 'Datos Negocio', icon: Building2, color: 'from-indigo-600 to-blue-700', roleRequired: true },
    { id: 'user-profile', label: 'Perfil de Usuario', icon: User, color: 'from-slate-700 to-slate-800', roleRequired: false },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">PARKCONTROL</h1>
            <p className="text-xs text-slate-400">Control e Inspección de Estacionamiento</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {userRole}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {menuItems
            .filter(item => !item.roleRequired || isAdmin)
            .map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left flex flex-col justify-between h-32 group"
                >
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} w-fit text-white shadow-lg group-hover:scale-105 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <span className="font-bold text-sm text-slate-200 group-hover:text-white">{item.label}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};