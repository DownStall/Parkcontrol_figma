import React from "react";
import { Card } from "./figma/ui/card";
import {
  LogIn,
  LogOut,
  Car,
  DollarSign,
  BarChart3,
  User,
} from "lucide-react";
import type { Screen } from "../App";

interface DashboardProps {
  navigate: (screen: Screen) => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  gradient: string;
}

function MenuItem({ icon, label, onClick, gradient }: MenuItemProps) {
  return (
    <Card 
      className="h-32 flex flex-col items-center justify-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
      onClick={onClick}
    >
      <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center shadow-md`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <span className="text-gray-700 text-center">{label}</span>
    </Card>
  );
}

export function Dashboard({ navigate }: DashboardProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-600 to-blue-700">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Bienvenido de vuelta</p>
            <h1 className="text-white">Juan Pérez</h1>
          </div>
          <button
            onClick={() => navigate('user-profile')}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            <User size={24} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
            <p className="text-blue-100 text-sm mb-1">Vehículos Hoy</p>
            <p className="text-white">24</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
            <p className="text-blue-100 text-sm mb-1">Ingresos Hoy</p>
            <p className="text-white">$1,240</p>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 bg-gray-50 rounded-t-3xl px-6 pt-8 pb-6 overflow-y-auto">
        <h2 className="text-gray-900 mb-4">Menú Principal</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <MenuItem
            icon={<LogIn size={28} />}
            label="Registrar Entrada"
            onClick={() => navigate('register-entry')}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
          
          <MenuItem
            icon={<LogOut size={28} />}
            label="Registrar Salida"
            onClick={() => navigate('register-exit')}
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          />
          
          <MenuItem
            icon={<Car size={28} />}
            label="Ver Vehículos"
            onClick={() => navigate('view-vehicles')}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          
          <MenuItem
            icon={<DollarSign size={28} />}
            label="Gestionar Tarifas"
            onClick={() => navigate('manage-rates')}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          
          <MenuItem
            icon={<BarChart3 size={28} />}
            label="Reportes"
            onClick={() => navigate('reports')}
            gradient="bg-gradient-to-br from-pink-500 to-pink-600"
          />
          
          <MenuItem
            icon={<User size={28} />}
            label="Perfil de Usuario"
            onClick={() => navigate('user-profile')}
            gradient="bg-gradient-to-br from-gray-600 to-gray-700"
          />
        </div>
      </div>
    </div>
  );
}
