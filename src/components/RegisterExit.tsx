import React, { useState } from 'react';
import { Button } from './figma/ui/button';
import { Input } from './figma/ui/input';
import { Card } from './figma/ui/card';
import { ArrowLeft, Search, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import type { Screen } from '../App';

interface RegisterExitProps {
  navigate: (screen: Screen) => void;
}

export function RegisterExit({ navigate }: RegisterExitProps) {
  const [searchPlate, setSearchPlate] = useState('');
  const [vehicleFound, setVehicleFound] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock data
  const vehicleData = {
    plate: 'ABC-1234',
    entryTime: '08:30 AM',
    elapsedTime: '3 horas 45 minutos',
    totalAmount: '$45.00'
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPlate.length > 0) {
      setVehicleFound(true);
    }
  };

  const handleConfirmExit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setVehicleFound(false);
      setSearchPlate('');
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('dashboard')}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white flex-1">Registrar Salida</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="space-y-3">
          <Input
            type="text"
            placeholder="Buscar por placa (ej: ABC-1234)"
            icon={<Search size={20} />}
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
          <Button type="submit" fullWidth variant="secondary">
            Buscar Vehículo
          </Button>
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto">
        {!vehicleFound ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={48} className="text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">Busca un vehículo</h3>
            <p className="text-gray-600">
              Ingresa la placa del vehículo en el campo de búsqueda para ver los detalles de estacionamiento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Vehicle Info Card */}
            <Card className="border-2 border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">Placa del Vehículo</p>
                <p className="text-gray-900">{vehicleData.plate}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Hora de Entrada</p>
                    <p className="text-gray-900">{vehicleData.entryTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Tiempo Transcurrido</p>
                    <p className="text-gray-900">{vehicleData.elapsedTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-orange-700 text-sm">Total a Pagar</p>
                    <p className="text-orange-900 text-2xl">{vehicleData.totalAmount}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method Info */}
            <Card className="bg-blue-50 border-2 border-blue-100">
              <p className="text-blue-900 mb-1">Método de Pago</p>
              <p className="text-blue-700 text-sm">
                El cliente puede pagar en efectivo o con tarjeta en la caja.
              </p>
            </Card>

            {/* Confirm Button */}
            <Button fullWidth size="lg" onClick={handleConfirmExit}>
              Confirmar Salida y Pago
            </Button>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-8 max-w-xs w-full text-center animate-scale-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-2">¡Salida Confirmada!</h3>
              <p className="text-gray-600 mb-4">
                El vehículo {vehicleData.plate} ha salido del estacionamiento.
              </p>
              <p className="text-gray-900">
                Total cobrado: {vehicleData.totalAmount}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
