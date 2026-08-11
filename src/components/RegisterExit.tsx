import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Search, Clock, DollarSign, CheckCircle2, AlertTriangle, XCircle, AlertCircle, Tag } from 'lucide-react';
import { api } from '../services/api';

export const RegisterExit: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia'>('Efectivo');
  
  // Modal de Anulación
  const [showAnnulModal, setShowAnnulModal] = useState(false);
  const [annulmentReason, setAnnulmentReason] = useState('');
  const [annulError, setAnnulError] = useState('');

  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [sessionsData, ratesData] = await Promise.all([
        api.getActiveSessions(),
        api.getRates()
      ]);
      setActiveSessions(sessionsData);
      setRates(ratesData);
    } catch (err) {
      console.error('Error cargando datos de salida:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSessions = activeSessions.filter(session =>
    session.plate.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // CÁLCULO DINÁMICO SEGÚN TARIFAS EN BASE DE DATOS
  const calculateBilling = (session: any) => {
    const entryTime = session.entryTimeMillis;
    const now = Date.now();
    const diffMillis = now - entryTime;
    
    const minutesTotal = Math.max(1, Math.floor(diffMillis / (1000 * 60)));
    const hours = Math.floor(minutesTotal / 60);
    const minutesRem = minutesTotal % 60;

    // Buscar la tarifa correspondiente en la base de datos
    const matchedRate = rates.find(
      (r) => r.vehicleType?.toLowerCase().trim() === session.vehicleType?.toLowerCase().trim()
    );

    const price = matchedRate ? matchedRate.pricePerHour : 3500;
    const modality = matchedRate?.rateType || session.rateType || 'Por Hora';

    let totalAmount = price;

    if (modality === 'Tarifa Fija') {
      totalAmount = price;
    } else if (modality === 'Por Día') {
      const daysToBill = Math.max(1, Math.ceil(minutesTotal / (60 * 24)));
      totalAmount = daysToBill * price;
    } else {
      // Por Hora (Mínimo 1 hora)
      const hoursToBill = Math.max(1, Math.ceil(minutesTotal / 60));
      totalAmount = hoursToBill * price;
    }

    return {
      timeFormatted: hours > 0 ? `${hours}h ${minutesRem}m` : `${minutesTotal} min`,
      totalAmount,
      modality,
      unitPrice: price,
      entryTimeString: new Date(entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleConfirmExit = async () => {
    if (!selectedSession) return;
    const billing = calculateBilling(selectedSession);
    setLoading(true);

    try {
      await api.registerExit({
        id: selectedSession.id,
        totalAmount: billing.totalAmount,
        paymentMethod
      });

      await api.addAuditLog(
        'SALIDA_VEHICULO',
        'admin',
        `Salida registrada para vehículo ${selectedSession.plate} (${selectedSession.vehicleType}). Cobro: $${billing.totalAmount.toLocaleString()} (${paymentMethod})`
      );

      alert(`Salida exitosa. Cobro de $${billing.totalAmount.toLocaleString()} realizado en ${paymentMethod}.`);
      setSelectedSession(null);
      setSearchQuery('');
      loadData();
    } catch (err: any) {
      alert(`Error al registrar salida: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAnnulment = async () => {
    if (!annulmentReason.trim()) {
      setAnnulError('Debe ingresar un motivo para anular la sesión.');
      return;
    }

    setLoading(true);
    setAnnulError('');
    try {
      await api.annulSession({
        id: selectedSession.id,
        annulmentReason: annulmentReason.trim()
      });

      await api.addAuditLog(
        'ANULACION',
        'admin',
        `Vehículo ${selectedSession.plate} anulado. Motivo: ${annulmentReason.trim()}`
      );

      alert(`Tiquete anulado correctamente.`);
      setShowAnnulModal(false);
      setAnnulmentReason('');
      setSelectedSession(null);
      setSearchQuery('');
      loadData();
    } catch (err: any) {
      setAnnulError(err.message);
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
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <LogOut size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Registrar Salida y Cobro</h1>
            <p className="text-xs text-slate-400">Liquidación dinámica sincronizada con tarifas configuradas</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        {/* BUSCADOR DE PLACAS */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por placa (Ej: ABC1234)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedSession(null);
            }}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* RESULTADOS BÚSQUEDA */}
        {searchQuery && !selectedSession && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 max-h-52 overflow-y-auto space-y-1">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-between"
                >
                  <div>
                    <strong className="text-white text-sm tracking-wider">{s.plate}</strong>
                    <span className="text-xs text-slate-400 ml-2">({s.vehicleType})</span>
                  </div>
                  <span className="text-xs bg-orange-500/20 text-orange-400 font-semibold px-2 py-0.5 rounded">
                    Plaza: {s.spotName || 'N/A'}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-3">No hay vehículos activos con esa placa.</p>
            )}
          </div>
        )}

        {/* DETALLE Y LIQUIDACIÓN */}
        {selectedSession && (() => {
          const billing = calculateBilling(selectedSession);
          return (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-slate-400 font-semibold">Placa del Vehículo</span>
                  <h2 className="text-2xl font-black text-orange-400 tracking-wider">{selectedSession.plate}</h2>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 block mb-1">
                    {selectedSession.vehicleType}
                  </span>
                  <span className="text-[10px] text-violet-400 font-bold flex items-center justify-end gap-1">
                    <Tag size={12} /> {billing.modality} (${billing.unitPrice.toLocaleString()})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  <div>
                    <p className="text-slate-400">Hora de Entrada</p>
                    <strong className="text-slate-200 text-sm">{billing.entryTimeString}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Clock size={16} className="text-purple-400" />
                  <div>
                    <p className="text-slate-400">Tiempo Transcurrido</p>
                    <strong className="text-slate-200 text-sm">{billing.timeFormatted}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-400">
                  <DollarSign size={22} />
                  <span className="font-bold text-sm">Total a Cobrar</span>
                </div>
                <span className="text-2xl font-black text-white">${billing.totalAmount.toLocaleString()}</span>
              </div>

              {/* MÉTODOS DE PAGO */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Efectivo')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === 'Efectivo'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Transferencia')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === 'Transferencia'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    💳 Transferencia
                  </button>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleConfirmExit}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  <span>{loading ? 'Procesando...' : 'Confirmar Cobro y Salida'}</span>
                </button>

                <button
                  onClick={() => setShowAnnulModal(true)}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={15} />
                  <span>Anular Tiquete por Error</span>
                </button>
              </div>
            </div>
          );
        })()}

        {!selectedSession && !searchQuery && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
            <AlertCircle size={24} className="mx-auto text-slate-500" />
            <p className="text-xs text-slate-400">
              Busca una placa para procesar su cobro en efectivo/transferencia o anular el ingreso.
            </p>
          </div>
        )}
      </div>

      {/* MODAL ANULACIÓN */}
      {showAnnulModal && selectedSession && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={20} />
              <h3 className="font-bold text-white text-base">Anular Tiquete: {selectedSession.plate}</h3>
            </div>
            
            <p className="text-xs text-slate-400">
              Esta acción cancelará la sesión sin registrar ingreso de dinero y creará un evento en la tabla de auditoría inmutable.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo de Anulación (Obligatorio)</label>
              <textarea
                rows={3}
                placeholder="Ej: Placa mal digitada por el operador / Registro duplicado"
                value={annulmentReason}
                onChange={(e) => setAnnulmentReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {annulError && <p className="text-xs text-red-400 font-semibold">{annulError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAnnulModal(false);
                  setAnnulError('');
                  setAnnulmentReason('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAnnulment}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1"
              >
                <XCircle size={15} /> Confirmar Anulación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};