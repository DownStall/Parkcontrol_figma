import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Lock, LogOut, ShieldAlert, KeyRound, CheckCircle2, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export const UserProfile: React.FC<{ onBack: () => void; onLogout?: () => void }> = ({ onBack, onLogout }) => {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getUserProfile();
      setProfile(data);
    } catch (err) {
      console.error('Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleOpenPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      setErrorMsg('Debe ingresar su contraseña actual.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    setUpdating(true);
    setErrorMsg('');

    try {
      await api.changePassword({ currentPassword, newPassword });

      await api.addAuditLog(
        'CAMBIO_PASSWORD',
        profile?.username || 'admin',
        `El usuario ${profile?.fullName || 'Administrador'} cambió exitosamente su contraseña`
      );

      alert('Contraseña actualizada correctamente.');
      setShowPasswordModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cambiar la contraseña');
    } finally {
      setUpdating(false);
    }
  };

  const memberSinceFormatted = profile?.createdAtMillis
    ? new Date(profile.createdAtMillis).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
    : 'Enero 2024';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 size={20} className="animate-spin text-blue-500" />
          <span className="text-xs">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Perfil de Usuario</h1>
          <p className="text-xs text-slate-400">Información de la cuenta, estadísticas y credenciales</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-950 border-2 border-blue-500/30 flex items-center justify-center text-blue-400">
            <User size={40} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">{profile?.fullName || 'Administrador ParkControl'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{profile?.role || 'Administrador'}</p>
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300">
            {profile?.email || 'admin@parkcontrol.com'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Información de la Cuenta</h3>

          <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800">
            <span className="text-slate-400 font-medium">Nombre completo</span>
            <strong className="text-slate-100">{profile?.fullName || 'Administrador ParkControl'}</strong>
          </div>

          <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800">
            <span className="text-slate-400 font-medium">Email</span>
            <strong className="text-slate-100">{profile?.email || 'admin@parkcontrol.com'}</strong>
          </div>

          <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800">
            <span className="text-slate-400 font-medium">Rol de sistema</span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {profile?.role || 'Administrador'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs py-2">
            <span className="text-slate-400 font-medium">Miembro desde</span>
            <strong className="text-slate-100 capitalize">{memberSinceFormatted}</strong>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Estadísticas de Actividad Global</h3>

          <div className="grid grid-cols-2 gap-3 text-center pt-1">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Entradas Registradas</span>
              <p className="text-2xl font-black text-blue-400 mt-1">
                {(profile?.totalEntries || 0).toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Salidas Registradas</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {(profile?.totalExits || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleOpenPasswordModal}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Lock size={16} className="text-amber-400" />
            <span>Cambiar Contraseña</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-amber-400">
              <KeyRound size={20} />
              <h3 className="font-bold text-white text-base">Cambiar Contraseña</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  placeholder="Ingrese contraseña actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 4 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Repita la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  <span>{updating ? 'Verificando...' : 'Actualizar Contraseña'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;