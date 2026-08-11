import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, PlusCircle, Edit2, Trash2, X, Car, Bike, ShieldAlert, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface Rate {
  id: number;
  vehicleType: string;
  rateType: string;
  pricePerHour: number;
}

export const ManageRates: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado Modal Crear / Editar
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [vehicleType, setVehicleType] = useState('Automóvil');
  const [rateType, setRateType] = useState('Por Hora');
  const [pricePerHour, setPricePerHour] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estado Modal Eliminar (Reemplaza window.confirm)
  const [deletingRate, setDeletingRate] = useState<Rate | null>(null);

  const loadRates = async () => {
    setLoading(true);
    try {
      const data = await api.getRates();
      setRates(data);
    } catch (err) {
      console.error('Error cargando tarifas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRate(null);
    setVehicleType('Automóvil');
    setRateType('Por Hora');
    setPricePerHour('');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (rate: Rate) => {
    setEditingRate(rate);
    setVehicleType(rate.vehicleType || 'Automóvil');
    setRateType(rate.rateType || 'Por Hora');
    setPricePerHour(rate.pricePerHour.toString());
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(pricePerHour);

    if (isNaN(price) || price <= 0) {
      setErrorMsg('Ingrese un valor mayor a $0.');
      return;
    }

    try {
      if (editingRate) {
        await api.updateRate(editingRate.id, {
          vehicleType,
          rateType,
          pricePerHour: price
        });

        await api.addAuditLog(
          'CAMBIO_TARIFA',
          'admin',
          `Tarifa de ${vehicleType} actualizada a ${rateType} ($${price.toLocaleString()})`
        );
      } else {
        await api.createRate({
          vehicleType,
          rateType,
          pricePerHour: price
        });

        await api.addAuditLog(
          'CAMBIO_TARIFA',
          'admin',
          `Nueva tarifa creada para ${vehicleType} (${rateType}) en $${price.toLocaleString()}`
        );
      }

      setShowModal(false);
      loadRates();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la tarifa');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRate) return;

    try {
      await api.deleteRate(deletingRate.id);
      await api.addAuditLog(
        'CAMBIO_TARIFA',
        'admin',
        `Tarifa para ${deletingRate.vehicleType} (${deletingRate.rateType || 'Por Hora'}) eliminada`
      );
      setDeletingRate(null);
      loadRates();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const getVehicleIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('moto') || t.includes('bici')) return <Bike size={22} className="text-purple-400" />;
    return <Car size={22} className="text-blue-400" />;
  };

  const formatRateLabel = (type?: string) => {
    if (!type) return 'Hora';
    if (type === 'Por Día') return 'Día';
    if (type === 'Tarifa Fija') return 'Fijo';
    return 'Hora';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <DollarSign size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Gestionar Tarifas</h1>
              <p className="text-xs text-slate-400">Parámetros de cobro por vehículo y modalidad</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/20"
        >
          <PlusCircle size={16} /> Nueva Tarifa
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-semibold">Total de Tarifas Configuradas</span>
          <span className="text-2xl font-bold text-violet-400">{rates.length}</span>
        </div>

        <div className="space-y-3">
          {rates.map((rate) => (
            <div key={rate.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  {getVehicleIcon(rate.vehicleType)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{rate.vehicleType}</h3>
                  <p className="text-xs text-violet-400 font-extrabold mt-0.5">
                    ${rate.pricePerHour.toLocaleString()} <span className="text-slate-400 font-normal">/ {formatRateLabel(rate.rateType)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(rate)}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 hover:bg-slate-800 transition-colors"
                  title="Editar Tarifa"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingRate(rate)}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-red-400 hover:bg-slate-800 transition-colors"
                  title="Eliminar Tarifa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CREAR / EDITAR TARIFA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-violet-400">
              <DollarSign size={20} />
              <h3 className="font-bold text-white text-base">
                {editingRate ? 'Editar Tarifa' : 'Nueva Tarifa'}
              </h3>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Vehículo</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-medium focus:outline-none focus:border-violet-500"
                >
                  <option value="Automóvil">Automóvil</option>
                  <option value="Motocicleta">Motocicleta</option>
                  <option value="Bicicleta">Bicicleta</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Tarifa</label>
                <select
                  value={rateType}
                  onChange={(e) => setRateType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-medium focus:outline-none focus:border-violet-500"
                >
                  <option value="Por Hora">Por Hora</option>
                  <option value="Por Día">Por Día</option>
                  <option value="Tarifa Fija">Tarifa Fija</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Valor de la Tarifa ($)</label>
                <input
                  type="number"
                  placeholder="Ej: 3500"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm font-bold focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-lg shadow-violet-600/20 transition-colors"
                >
                  {editingRate ? 'Guardar Cambios' : 'Crear Tarifa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERSONALIZADA DE ELIMINACIÓN */}
      {deletingRate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={20} />
              <h3 className="font-bold text-white text-base">Eliminar Tarifa</h3>
            </div>

            <p className="text-xs text-slate-300">
              ¿Está seguro de que desea eliminar la tarifa para <strong className="text-white">{deletingRate.vehicleType}</strong> ({deletingRate.rateType || 'Por Hora'}) con valor de <strong className="text-violet-400">${deletingRate.pricePerHour.toLocaleString()}</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRate(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/20"
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