import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { api } from '../services/api';

export const BusinessConfig: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [nit, setNit] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getBusinessConfig().then((data) => {
      if (data) {
        setName(data.name || '');
        setNit(data.nit || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setReceiptFooter(data.receiptFooter || '');
      }
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateBusinessConfig({ name, nit, address, phone, receiptFooter });
      await api.addAuditLog('DATOS_NEGOCIO', 'admin', 'Información del negocio actualizada');
      alert('Datos del negocio guardados correctamente.');
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
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
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Datos del Negocio</h1>
            <p className="text-xs text-slate-400">Información para encabezados de PDF y tiquetes impresos</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Parqueadero</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">NIT / Identificación Fiscal</label>
          <input
            type="text"
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Mensaje en Pie de Tiquete</label>
          <input
            type="text"
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Save size={18} />
          <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </form>
    </div>
  );
};