import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, Clock, User, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface AuditLog {
  id: number;
  action: string;
  username: string;
  details: string;
  timestampMillis: number;
}

export const AuditLogs: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error al cargar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const getBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'ANULACION': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'SALIDA_VEHICULO': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ENTRADA_VEHICULO': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CAMBIO_TARIFA': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
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
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Registro de Auditoría</h1>
              <p className="text-xs text-slate-400">Trazabilidad en tiempo real conectada a la BD</p>
            </div>
          </div>
        </div>

        <button onClick={loadAuditLogs} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 hover:bg-slate-800">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-3 max-w-4xl mx-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
            No hay registros de auditoría guardados aún.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeColor(log.action)}`}>
                  {log.action}
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={14} />
                  <span>{new Date(log.timestampMillis).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-sm text-slate-200 font-medium mb-2">{log.details}</p>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <User size={13} />
                <span>Usuario: <strong className="text-slate-300">{log.username || 'admin'}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};