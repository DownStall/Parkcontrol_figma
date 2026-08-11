import React, { useState, useEffect } from 'react';
import { ArrowLeft, Car, Search, Clock, RefreshCw, MapPin, Tag } from 'lucide-react';
import { api } from '../services/api';

export const ViewVehicles: React.FC<{ onBack: () => void; onNavigateExit?: () => void }> = ({ onBack, onNavigateExit }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveSessions();
      setSessions(data);
    } catch (err) {
      console.error('Error al cargar vehículos dentro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter(s =>
    s.plate.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    (s.spotName || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    s.vehicleType.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const formatElapsed = (entryMillis: number) => {
    const diff = Date.now() - entryMillis;
    const totalMinutes = Math.max(1, Math.floor(diff / (1000 * 60)));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${totalMinutes} min`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Car size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Vehículos en Parqueadero</h1>
              <p className="text-xs text-slate-400">Listado en tiempo real de vehículos actualmente estacionados</p>
            </div>
          </div>
        </div>

        <button onClick={loadSessions} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 hover:bg-slate-800">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* BUSCADOR Y MÉTRICAS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por placa, plaza o tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span>Vehículos Estacionados:</span>
            <span className="text-sm font-black text-blue-400">{sessions.length}</span>
          </div>
        </div>

        {/* LISTADO DE VEHÍCULOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSessions.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
              {searchQuery ? 'No se encontraron vehículos que coincidan con la búsqueda.' : 'No hay vehículos estacionados actualmente.'}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div key={session.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{session.vehicleType}</span>
                    <h3 className="text-xl font-black text-blue-400 tracking-wider">{session.plate}</h3>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1">
                    <MapPin size={12} className="text-orange-400" />
                    Plaza: {session.spotName || 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={14} className="text-blue-400" />
                    <span>Entrada: <strong className="text-slate-200">{new Date(session.entryTimeMillis).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Tag size={14} className="text-purple-400" />
                    <span>Tiempo: <strong className="text-slate-200">{formatElapsed(session.entryTimeMillis)}</strong></span>
                  </div>
                </div>

                {onNavigateExit && (
                  <button
                    onClick={onNavigateExit}
                    className="w-full py-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-orange-400 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Ir a Cobrar Salida</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewVehicles;