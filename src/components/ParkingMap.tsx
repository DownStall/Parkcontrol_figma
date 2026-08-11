import React, { useState, useEffect } from 'react';
import { ArrowLeft, LayoutGrid, Car, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const ParkingMap: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const SPOTS = [
    'A1', 'A2', 'A3', 'A4', 'A5',
    'B1', 'B2', 'B3', 'B4', 'B5',
    'C1', 'C2', 'C3', 'C4', 'C5',
    'D1', 'D2', 'D3', 'D4', 'D5'
  ];

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveSessions();
      setSessions(data);
    } catch (err) {
      console.error('Error al cargar mapa de plazas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Función de limpieza para coincidencia universal de plaza
  const cleanSpotStr = (s: any) => {
    if (!s) return '';
    let str = String(s).toUpperCase().trim();
    str = str.replace(/\b(PLAZA|SPOT|ESPACIO|LUGAR|PARQUEADERO|NUM|NO|NRO)\b/gi, '');
    str = str.replace(/[^A-Z0-9]/g, '');
    str = str.replace(/([A-Z])0+(\d+)/g, '$1$2');
    str = str.replace(/^0+(\d+)/g, '$1');
    return str;
  };

  const isSpotMatched = (sessionSpot: any, spotCode: string, spotIndex: number) => {
    if (!sessionSpot) return false;
    const cleanSession = cleanSpotStr(sessionSpot);
    const cleanCode = cleanSpotStr(spotCode);

    if (!cleanSession) return false;

    // 1. Coincidencia directa (ej: "A1" === "A1", "PLAZA A1" -> "A1")
    if (cleanSession === cleanCode) return true;

    // 2. Coincidencia numérica por índice (ej: "1" o "Plaza 1" -> posición 0 = A1, "7" -> posición 6 = B2)
    if (/^\d+$/.test(cleanSession)) {
      const num = parseInt(cleanSession, 10);
      if (num === spotIndex + 1) return true;
      if (/^\d+$/.test(cleanCode) && parseInt(cleanCode, 10) === num) return true;
    }

    return false;
  };

  // Identificar las sesiones asignadas a la cuadrícula de 20 espacios
  const matchedSessionIds = new Set<number>();

  SPOTS.forEach((spotCode, spotIndex) => {
    const session = sessions.find(s => isSpotMatched(s.spotName, spotCode, spotIndex));
    if (session && session.id) {
      matchedSessionIds.add(session.id);
    }
  });

  const totalOccupied = sessions.length;
  const mappedOccupiedCount = matchedSessionIds.size;
  const freeCount = Math.max(0, SPOTS.length - mappedOccupiedCount);

  // Sesiones activas sin plaza asignada o con identificador fuera de cuadrícula
  const unassignedSessions = sessions.filter(s => !matchedSessionIds.has(s.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mapa de Plazas</h1>
              <p className="text-xs text-slate-400">Visualización interactiva del estado de ocupación de espacios</p>
            </div>
          </div>
        </div>

        <button onClick={loadSessions} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-teal-400 hover:bg-slate-800">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* MÉTRICAS SUPERIORES */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Total Plazas</span>
            <p className="text-3xl font-black text-white">{SPOTS.length}</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-xs text-emerald-400 font-semibold block mb-1">Disponibles</span>
            <p className="text-3xl font-black text-emerald-400">{freeCount}</p>
          </div>

          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
            <span className="text-xs text-red-400 font-semibold block mb-1">Ocupadas</span>
            <p className="text-3xl font-black text-red-400">{totalOccupied}</p>
          </div>
        </div>

        {/* CUADRÍCULA DE ESPACIOS */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {SPOTS.map((spotCode, spotIndex) => {
              const occupiedSession = sessions.find(s => isSpotMatched(s.spotName, spotCode, spotIndex));

              return (
                <div
                  key={spotCode}
                  className={`p-4 rounded-2xl border flex flex-col justify-between h-32 transition-all relative ${
                    occupiedSession
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black text-sm text-white">{spotCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        occupiedSession
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {occupiedSession ? 'OCUPADO' : 'LIBRE'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-1 text-center">
                    {occupiedSession ? (
                      <>
                        <Car size={22} className="text-red-400 mb-1 animate-pulse" />
                        <strong className="text-white text-xs font-bold tracking-wider block">
                          {occupiedSession.plate}
                        </strong>
                        <span className="text-[10px] text-red-300 font-medium block truncate max-w-[100px]">
                          {occupiedSession.vehicleType}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={22} className="text-emerald-500/40 mb-1" />
                        <span className="text-xs text-emerald-400/80 font-semibold">Disponible</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* VEHÍCULOS SIN PLAZA ESPECÍFICA */}
        {unassignedSessions.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle size={18} />
              <h3 className="font-bold text-white text-sm">Vehículos Activos en Otras Ubicaciones ({unassignedSessions.length})</h3>
            </div>
            <p className="text-xs text-slate-400">
              Vehículos estacionados con identificadores de plaza especiales o sin ubicación asignada en la cuadrícula principal:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {unassignedSessions.map((s) => (
                <div key={s.id} className="p-3 bg-slate-950 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white font-bold tracking-wider block">{s.plate}</strong>
                    <span className="text-slate-400 text-[11px]">{s.vehicleType}</span>
                  </div>
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-semibold text-[10px] border border-amber-500/20">
                    Plaza: {s.spotName || 'S/N'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingMap;