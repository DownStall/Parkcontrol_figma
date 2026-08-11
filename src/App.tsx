import { useState } from 'react';
import { Login } from './components/Login';
import { RegisterEntry } from './components/RegisterEntry';
import { RegisterExit } from './components/RegisterExit';
import { ManageRates } from './components/ManageRates';
import { Subscribers } from './components/Subscribers';
import { CashShift } from './components/CashShift';
import { Reports } from './components/Reports';
import { AuditLogs } from './components/AuditLogs';
import { BusinessConfig } from './components/BusinessConfig';
import { UserProfile } from './components/UserProfile';
import { ParkingMap } from './components/ParkingMap';
import { ViewVehicles } from './components/ViewVehicles';
import {
  Car,
  LogIn,
  LogOut,
  DollarSign,
  Users,
  Wallet,
  BarChart3,
  ShieldCheck,
  Building2,
  User,
  Power,
  LayoutGrid,
  Eye
} from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('admin');
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <Car size={22} />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight">ParkControl</h1>
            <p className="text-[10px] text-slate-400 font-medium">Gestión de Estacionamiento</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('user-profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <User size={15} className="text-blue-400" />
            <span className="hidden sm:inline">{currentUser}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
            title="Cerrar Sesión"
          >
            <Power size={18} />
          </button>
        </div>
      </header>

      {/* VISTAS Y MÓDULOS */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Panel Principal</h2>
              <p className="text-xs text-slate-400">Seleccione un módulo para operar la plataforma</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setCurrentView('register-entry')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogIn size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Registrar Entrada</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Ingreso de vehículos y asignación de plaza</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('register-exit')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogOut size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Registrar Salida y Cobro</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Liquidación de tiempo y medios de pago</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('view-vehicles')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Ver Vehículos Activos</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Listado e inspección de vehículos en parqueadero</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('parking-map')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Mapa de Plazas</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Visualización gráfica de ocupación de espacios</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('cash-shift')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Caja y Arqueo de Turno</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Base inicial, egresos y cierre contable</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('manage-rates')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Gestionar Tarifas</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Valores por tipo de vehículo y modalidad</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('subscribers')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Abonados Mensuales</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Control de clientes y fechas de vigencia</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('reports')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Reportes e Informes</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Métricas de recaudo y exportación en PDF</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('audit-logs')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Registro de Auditoría</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Trazabilidad e historial de operaciones</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('business-config')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Datos del Negocio</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Información fiscal para recibos y PDF</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('user-profile')}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Perfil de Usuario</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Credenciales y estadísticas de actividad</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {currentView === 'register-entry' && <RegisterEntry onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'register-exit' && <RegisterExit onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'view-vehicles' && <ViewVehicles onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'parking-map' && <ParkingMap onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'cash-shift' && <CashShift onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'manage-rates' && <ManageRates onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'subscribers' && <Subscribers onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'reports' && <Reports onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'audit-logs' && <AuditLogs onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'business-config' && <BusinessConfig onBack={() => setCurrentView('dashboard')} />}
        {currentView === 'user-profile' && (
          <UserProfile onBack={() => setCurrentView('dashboard')} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}

export default App;