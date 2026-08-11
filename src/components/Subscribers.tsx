import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, PlusCircle, Calendar, Phone, Car, X, ShieldAlert, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface Subscriber {
  id: number;
  clientName: string;
  phone: string;
  plate: string;
  vehicleType: string;
  startDate: string;
  endDate: string;
  monthlyFee: number;
  paymentMethod?: string;
}

export const Subscribers: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados Formulario
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Automóvil');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia'>('Efectivo');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextMonthStr);
  const [fee, setFee] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [deletingSub, setDeletingSub] = useState<Subscriber | null>(null);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const data = await api.getSubscribers();
      setSubscribers(data);
    } catch (err) {
      console.error('Error cargando abonados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleOpenModal = () => {
    setName('');
    setPhone('');
    setPlate('');
    setVehicleType('Automóvil');
    setPaymentMethod('Efectivo');
    setStartDate(todayStr);
    setEndDate(nextMonthStr);
    setFee('');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedFee = parseFloat(fee);

    if (!name.trim() || !plate.trim() || isNaN(parsedFee) || parsedFee <= 0) {
      setErrorMsg('Complete los campos obligatorios.');
      return;
    }

    try {
      await api.createSubscriber({
        clientName: name.trim(),
        phone: phone.trim(),
        plate: plate.toUpperCase().trim(),
        vehicleType,
        startDate,
        endDate,
        monthlyFee: parsedFee,
        paymentMethod,
      });

      await api.addAuditLog(
        'NUEVO_ABONADO',
        'admin',
        `Abonado ${name.trim()} (${plate.toUpperCase().trim()}) pagó $${parsedFee.toLocaleString()} via ${paymentMethod}`
      );

      setShowModal(false);
      loadSubscribers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar abonado');
    }
  };

  const handleDeleteSubscriber = async () => {
    if (!deletingSub) return;
    try {
      await api.deleteSubscriber(deletingSub.id);
      await api.addAuditLog(
        'NUEVO_ABONADO',
        'admin',
        `Abono de ${deletingSub.clientName} (${deletingSub.plate}) eliminado`
      );
      setDeletingSub(null);
      loadSubscribers();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const getSubscriberStatus = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'VENCIDO', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    } else if (diffDays <= 3) {
      return { text: `POR VENCER (${diffDays}d)`, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { text: 'ACTIVO', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Abonados Mensuales</h1>
              <p className="text-xs text-slate-400">Gestión de clientes y mensualidades</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20"
        >
          <PlusCircle size={16} /> Nuevo Abonado
        </button>
      </div>

      <div className="grid gap-3 max-w-4xl mx-auto">
        {subscribers.map((sub) => {
          const status = getSubscriberStatus(sub.endDate);
          return (
            <div key={sub.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{sub.clientName}</h3>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${status.color}`}>
                    {status.text}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {sub.paymentMethod || 'Efectivo'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Car size={13} /> <strong className="text-slate-200">{sub.plate}</strong> ({sub.vehicleType})</span>
                  <span className="flex items-center gap-1"><Phone size={13} /> {sub.phone || 'Sin teléfono'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                <div className="text-xs text-slate-400 space-y-0.5">
                  <div className="flex items-center gap-1"><Calendar size={13} className="text-blue-400" /> Inicia: <strong className="text-slate-200">{sub.startDate}</strong></div>
                  <div className="flex items-center gap-1"><Calendar size={13} className="text-purple-400" /> Vence: <strong className="text-slate-200">{sub.endDate}</strong></div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="text-xs text-slate-400">Tarifa Mensual</span>
                    <p className="text-sm font-bold text-purple-400">${sub.monthlyFee.toLocaleString()}</p>
                  </div>

                  <button
                    onClick={() => setDeletingSub(sub)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL NUEVO ABONADO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-3 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Users size={20} />
              <h3 className="font-bold text-white text-base">Nuevo Abonado</h3>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-3">
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <input
                type="text"
                placeholder="Nombre del Cliente"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Placa del Vehículo"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-purple-500"
                />

                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="Automóvil">Automóvil</option>
                  <option value="Motocicleta">Motocicleta</option>
                  <option value="Bicicleta">Bicicleta</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Inicio</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Vencimiento</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Efectivo')}
                    className={`py-2 rounded-xl border text-xs font-bold ${
                      paymentMethod === 'Efectivo'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Transferencia')}
                    className={`py-2 rounded-xl border text-xs font-bold ${
                      paymentMethod === 'Transferencia'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    💳 Transferencia
                  </button>
                </div>
              </div>

              <input
                type="number"
                placeholder="Valor Mensual ($)"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-bold focus:outline-none focus:border-purple-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/20"
                >
                  Registrar Abonado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINAR */}
      {deletingSub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-white text-base">Eliminar Abonado</h3>
            <p className="text-xs text-slate-300">
              ¿Está seguro de eliminar a <strong className="text-white">{deletingSub.clientName}</strong> ({deletingSub.plate})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteSubscriber}
                className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white"
              >
                Confirmar Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};