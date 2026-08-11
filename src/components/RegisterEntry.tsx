import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const RegisterEntry: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const ALL_SPOTS = [
    'A-01', 'A-02', 'A-03', 'A-04', 'A-05',
    'B-01', 'B-02', 'B-03', 'B-04', 'B-05',
    'C-01', 'C-02', 'C-03', 'C-04', 'C-05'
  ];

  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Automóvil');
  const [rateType, setRateType] = useState('Por Hora');
  const [spotName, setSpotName] = useState('');
  const [availableSpots, setAvailableSpots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAvailableSpots = async () => {
    try {
      const activeSessions = await api.getActiveSessions();
      const occupiedSpotNames = activeSessions.map((s: any) => s.spotName);
      const freeSpots = ALL_SPOTS.filter(spot => !occupiedSpotNames.includes(spot));

      setAvailableSpots(freeSpots);
      if (freeSpots.length > 0) {
        setSpotName(freeSpots[0]);
      } else {
        setSpotName('');
      }
    } catch (err) {
      console.error('Error cargando plazas:', err);
    }
  };

  useEffect(() => {
    loadAvailableSpots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !spotName) return;

    setErrorMsg('');
    setLoading(true);
    try {
      await api.registerEntry({
        plate: plate.toUpperCase().trim(),
        vehicleType,
        rateType,
        spotName,
      });

      await api.addAuditLog(
        'ENTRADA_VEHICULO',
        'admin',
        `Vehículo ${plate.toUpperCase().trim()} (${vehicleType}) ingresó a plaza ${spotName}`
      );

      alert(`Entrada registrada exitosamente para la placa: ${plate.toUpperCase().trim()}`);
      setPlate('');
      loadAvailableSpots();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <LogIn size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Registrar Entrada</h1>
            <p className="text-xs text-slate-400">Validación de plazas y duplicados en vivo</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Placa del Vehículo</label>
          <input
            type="text"
            placeholder="EJ: ABC1234"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold uppercase tracking-wider text-emerald-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Vehículo</label>
          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm">
            <option value="Automóvil">Automóvil</option>
            <option value="Motocicleta">Motocicleta</option>
            <option value="Bicicleta">Bicicleta</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Tarifa</label>
          <select value={rateType} onChange={(e) => setRateType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm">
            <option value="Por Hora">Por Hora</option>
            <option value="Tarifa Fija">Tarifa Fija</option>
            <option value="Por Día">Por Día</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Plaza Asignada (Disponibles: {availableSpots.length})</label>
          {availableSpots.length > 0 ? (
            <select value={spotName} onChange={(e) => setSpotName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm">
              {availableSpots.map((spot) => (
                <option key={spot} value={spot}>{spot}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              ¡Parqueadero Lleno! No hay plazas disponibles.
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || availableSpots.length === 0}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} />
          <span>{loading ? 'Guardando...' : 'Confirmar e Ingresar'}</span>
        </button>
      </form>
    </div>
  );
};