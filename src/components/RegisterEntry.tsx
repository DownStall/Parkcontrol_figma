import React, { useState } from 'react';
import { Button } from './figma/ui/button';
import { Input } from './figma/ui/input';
import { Select } from './figma/ui/select';
import { ArrowLeft, Car, CheckCircle2 } from 'lucide-react';
import type { Screen } from "../App";


interface RegisterEntryProps {
  navigate: (screen: Screen) => void;
}

export function RegisterEntry({ navigate }: RegisterEntryProps) {
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [rateType, setRateType] = useState('hourly');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setPlate('');
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('dashboard')}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white flex-1">Registrar Entrada</h1>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center">
            <Car size={40} className="text-white" />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="text"
              label="Placa del Vehículo"
              placeholder="ABC-1234"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              required
            />
            <p className="mt-2 text-gray-600 text-sm">Ingrese la placa sin espacios ni guiones</p>
          </div>

          <Select
            label="Tipo de Vehículo"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            options={[
              { value: 'car', label: 'Automóvil' },
              { value: 'motorcycle', label: 'Motocicleta' }
            ]}
          />

          <Select
            label="Tipo de Tarifa"
            value={rateType}
            onChange={(e) => setRateType(e.target.value)}
            options={[
              { value: 'hourly', label: 'Por hora' },
              { value: 'daily', label: 'Día completo' },
              { value: 'monthly', label: 'Mensual' }
            ]}
          />

          {/* Info Card */}
          <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4">
            <p className="text-blue-900 mb-1">Información</p>
            <p className="text-blue-700 text-sm">
              Al registrar la entrada, se iniciará el conteo de tiempo para calcular el costo del estacionamiento.
            </p>
          </div>

          <Button type="submit" fullWidth size="lg" variant="primary">
            Registrar Entrada
          </Button>
        </form>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-8 max-w-xs w-full text-center animate-scale-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-2">¡Entrada Registrada!</h3>
              <p className="text-gray-600">
                El vehículo {plate} ha sido registrado exitosamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}