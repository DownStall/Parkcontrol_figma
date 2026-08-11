import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, PlusCircle, Lock, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const CashShift: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [shiftData, setShiftData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [initialCashInput, setInitialCashInput] = useState('');

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [declaredCash, setDeclaredCash] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const loadShiftState = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveShift();
      setShiftData(data);
    } catch (err) {
      console.error('Error cargando turno:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShiftState();
  }, []);

  // 1. Abrir Turno con Base Inicial Personalizada
  const handleConfirmOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const cash = parseFloat(initialCashInput);
    if (isNaN(cash) || cash < 0) {
      setErrorMsg('Ingrese un valor válido mayor o igual a $0.');
      return;
    }

    try {
      await api.openShift({ initialCash: cash, operatorUsername: 'admin' });

      // Registro en Auditoría
      await api.addAuditLog(
        'APERTURA_CAJA',
        'admin',
        `Apertura de turno de caja realizada con base inicial de $${cash.toLocaleString()}`
      );

      setShowOpenModal(false);
      setInitialCashInput('');
      setErrorMsg('');
      loadShiftState();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // 2. Registrar Gasto
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0 || !expenseReason.trim()) {
      setErrorMsg('Ingrese un monto válido y el motivo del gasto.');
      return;
    }

    try {
      await api.addExpense(amt);

      // Registro en Auditoría
      await api.addAuditLog(
        'GASTO_CAJA',
        'admin',
        `Gasto registrado de $${amt.toLocaleString()}. Motivo: ${expenseReason.trim()}`
      );

      setShowExpenseModal(false);
      setExpenseAmount('');
      setExpenseReason('');
      setErrorMsg('');
      loadShiftState();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // 3. Arqueo y Cierre de Turno
  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const declared = parseFloat(declaredCash);
    if (isNaN(declared) || declared < 0) {
      setErrorMsg('Ingrese el monto físico contado en caja.');
      return;
    }

    const initial = shiftData?.initialCash || 0;
    const sales = shiftData?.systemCash || 0;
    const expenses = shiftData?.expenses || 0;
    const expected = initial + sales - expenses;
    const diff = declared - expected;

    let statusText = 'Cuadrada';
    if (diff > 0) statusText = `Sobrante +$${diff.toLocaleString()}`;
    if (diff < 0) statusText = `Faltante -$${Math.abs(diff).toLocaleString()}`;

    try {
      await api.closeShift(declared);

      // Registro en Auditoría
      await api.addAuditLog(
        'CIERRE_CAJA',
        'admin',
        `Cierre de turno realizado. Esperado: $${expected.toLocaleString()}, Contado: $${declared.toLocaleString()} (${statusText})`
      );

      alert(`Turno cerrado exitosamente. Resultado de Arqueo: ${statusText}`);
      setShowCloseModal(false);
      setDeclaredCash('');
      setErrorMsg('');
      loadShiftState();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const isOpen = shiftData?.isOpen || false;
  const initialCash = shiftData?.initialCash || 0;
  const systemCash = shiftData?.systemCash || 0;
  const expenses = shiftData?.expenses || 0;
  const expectedCash = initialCash + systemCash - expenses;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Caja y Arqueo de Turno</h1>
            <p className="text-xs text-slate-400">Control de base inicial, egresos y cierres en tiempo real</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs text-slate-400 font-semibold">Estado de Caja</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {isOpen ? '● ABIERTO' : '● CERRADO'}
            </span>
          </div>

          <div className="flex justify-between text-sm"><span>Base Inicial:</span><strong className="text-slate-100">${initialCash.toLocaleString()}</strong></div>
          <div className="flex justify-between text-sm"><span>Cobros Efectivo:</span><strong className="text-emerald-400">+${systemCash.toLocaleString()}</strong></div>
          <div className="flex justify-between text-sm"><span>Gastos de Caja:</span><strong className="text-red-400">-${expenses.toLocaleString()}</strong></div>
          
          <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-800">
            <span>Esperado en Caja:</span>
            <span className="text-emerald-400 text-lg">${expectedCash.toLocaleString()}</span>
          </div>
        </div>

        {isOpen ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setErrorMsg(''); setShowExpenseModal(true); }}
              className="py-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} /> Registrar Gasto
            </button>
            <button
              onClick={() => { setErrorMsg(''); setShowCloseModal(true); }}
              className="py-3 rounded-xl bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Lock size={16} /> Arqueo y Cierre
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setErrorMsg(''); setShowOpenModal(true); }}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 size={18} /> Abrir Turno
          </button>
        )}
      </div>

      {/* MODAL: ABRIR TURNO */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowOpenModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-emerald-400">
              <Wallet size={20} />
              <h3 className="font-bold text-white text-base">Apertura de Caja</h3>
            </div>

            <form onSubmit={handleConfirmOpenShift} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monto de Base Inicial ($)</label>
                <input
                  type="number"
                  placeholder="Ej: 50000"
                  value={initialCashInput}
                  onChange={(e) => setInitialCashInput(e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                >
                  Confirmar Apertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR GASTO */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowExpenseModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-white text-base">Registrar Gasto de Caja</h3>

            <form onSubmit={handleAddExpense} className="space-y-3">
              {errorMsg && <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>}

              <input
                type="number"
                placeholder="Monto ($)"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm font-bold focus:outline-none focus:border-amber-500"
              />

              <input
                type="text"
                placeholder="Motivo / Concepto del Gasto"
                value={expenseReason}
                onChange={(e) => setExpenseReason(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ARQUEO Y CIERRE */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowCloseModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-white text-base">Cierre y Arqueo de Caja</h3>

            <form onSubmit={handleCloseShift} className="space-y-3">
              {errorMsg && <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Efectivo Físico Contado ($)</label>
                <input
                  type="number"
                  placeholder="Ej: 155000"
                  value={declaredCash}
                  onChange={(e) => setDeclaredCash(e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm font-bold focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white"
                >
                  Confirmar Cierre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};