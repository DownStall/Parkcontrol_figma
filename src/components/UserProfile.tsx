import { useState } from "react";
import { Button } from "./figma/ui/button";
import { Input } from "./figma/ui/input";
import { Card } from "./figma/ui/card";
import { ArrowLeft, User, Lock, LogOut, X, CheckCircle2 } from "lucide-react";
import type { Screen } from "../App";

interface UserProfileProps {
  navigate: (screen: Screen) => void;
  onLogout: () => void;
}

export function UserProfile({ navigate, onLogout }: UserProfileProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro que deseas cerrar sesión?")) {
      onLogout();
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Completa todos los campos.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    setShowPasswordModal(false);
    setShowSuccess(true);

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 pt-6 pb-14">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 transition-colors hover:bg-white/30"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>

          <h1 className="text-2xl font-bold text-white">Perfil de Usuario</h1>
        </div>

        {/* Perfil */}
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/10">
            <User size={40} className="text-white" />
          </div>

          <h2 className="text-2xl font-semibold text-white">Juanchopala Pérez</h2>
          <p className="mt-1 text-gray-300">Administrador</p>

          <div className="mt-3 rounded-xl bg-white/10 px-4 py-2">
            <p className="text-sm text-white">juan.perez@parkingapp.com</p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="-mt-8 rounded-t-3xl bg-gray-100 px-6 pt-6 pb-10">
        <div className="space-y-4">
          {/* Información */}
          <Card className="rounded-2xl bg-white p-5 shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Información del Usuario
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <span className="text-gray-600">Nombre completo</span>
                <span className="text-gray-900">Juan Pérez</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <span className="text-gray-600">Email</span>
                <span className="text-sm text-gray-900">
                  juan.perez@parkingapp.com
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <span className="text-gray-600">Rol</span>
                <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                  Administrador
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Miembro desde</span>
                <span className="text-gray-900">Enero 2024</span>
              </div>
            </div>
          </Card>

          {/* Estadísticas */}
          <Card className="rounded-2xl border border-blue-300 bg-[#EAF3FF] p-5 shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-blue-800">
              Estadísticas de Actividad
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-sm text-blue-700">Entradas Registradas</p>
                <p className="text-2xl font-bold text-blue-900">1,234</p>
              </div>

              <div>
                <p className="mb-1 text-sm text-blue-700">Salidas Registradas</p>
                <p className="text-2xl font-bold text-blue-900">1,189</p>
              </div>
            </div>
          </Card>

          {/* Acciones */}
          <div className="space-y-3">
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              <Lock size={18} />
              Cambiar Contraseña
            </Button>

            <Button
              fullWidth
              size="lg"
              variant="danger"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Modal cambiar contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Cambiar Contraseña
              </h2>

              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200"
              >
                <X size={20} className="text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Contraseña actual"
                type="password"
                placeholder="Ingresa tu contraseña actual"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                required
              />

              <Input
                label="Nueva contraseña"
                type="password"
                placeholder="Ingresa tu nueva contraseña"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
              />

              <Input
                label="Confirmar nueva contraseña"
                type="password"
                placeholder="Confirma tu nueva contraseña"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancelar
                </Button>

                <Button type="submit" fullWidth>
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-xs rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              ¡Contraseña Actualizada!
            </h3>

            <p className="text-gray-600">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}