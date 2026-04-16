import React, { useState } from 'react';
import { Button } from './figma/ui/button';
import { Input } from './figma/ui/input';
import { Card } from './figma/ui/card';
import { ArrowLeft, Plus, Edit2, Trash2, X, Car, Bike } from 'lucide-react';
import type { Screen } from "../App";


interface ManageRatesProps {
  navigate: (screen: Screen) => void;
}

interface Rate {
  id: number;
  vehicleType: string;
  vehicleTypeLabel: string;
  pricePerHour: number;
  icon: React.ReactNode;
}

const initialRates: Rate[] = [
  { id: 1, vehicleType: 'car', vehicleTypeLabel: 'Automóvil', pricePerHour: 15, icon: <Car size={24} className="text-blue-600" /> },
  { id: 2, vehicleType: 'motorcycle', vehicleTypeLabel: 'Motocicleta', pricePerHour: 10, icon: <Bike size={24} className="text-purple-600" /> },
];

export function ManageRates({ navigate }: ManageRatesProps) {
  const [rates, setRates] = useState<Rate[]>(initialRates);
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [formData, setFormData] = useState({ vehicleTypeLabel: '', pricePerHour: '' });

  const handleAddRate = () => {
    setEditingRate(null);
    setFormData({ vehicleTypeLabel: '', pricePerHour: '' });
    setShowModal(true);
  };

  const handleEditRate = (rate: Rate) => {
    setEditingRate(rate);
    setFormData({ vehicleTypeLabel: rate.vehicleTypeLabel, pricePerHour: rate.pricePerHour.toString() });
    setShowModal(true);
  };

  const handleDeleteRate = (id: number) => {
    setRates(rates.filter(rate => rate.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRate) {
      setRates(rates.map(rate =>
        rate.id === editingRate.id
          ? { ...rate, vehicleTypeLabel: formData.vehicleTypeLabel, pricePerHour: parseFloat(formData.pricePerHour) }
          : rate
      ));
    } else {
      const newRate: Rate = {
        id: Math.max(...rates.map(r => r.id)) + 1,
        vehicleType: 'custom',
        vehicleTypeLabel: formData.vehicleTypeLabel,
        pricePerHour: parseFloat(formData.pricePerHour),
        icon: <Car size={24} className="text-gray-600" />
      };
      setRates([...rates, newRate]);
    }
    setShowModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('dashboard')}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white flex-1">Gestionar Tarifas</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
          <p className="text-purple-100 text-sm">Total de tarifas configuradas</p>
          <p className="text-white text-2xl">{rates.length}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto">
        <div className="space-y-3 mb-4">
          {rates.map((rate) => (
            <Card key={rate.id}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {rate.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1">{rate.vehicleTypeLabel}</p>
                  <p className="text-purple-600">${rate.pricePerHour} / hora</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditRate(rate)}
                    className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteRate(rate.id)}
                    className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button fullWidth size="lg" onClick={handleAddRate}>
          <Plus size={20} />
          Agregar Nueva Tarifa
        </Button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-[360px] p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">
                {editingRate ? 'Editar Tarifa' : 'Nueva Tarifa'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Tipo de Vehículo"
                placeholder="Ej: Camioneta"
                value={formData.vehicleTypeLabel}
                onChange={(e) => setFormData({ ...formData, vehicleTypeLabel: e.target.value })}
                required
              />

              <Input
                label="Precio por Hora ($)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                required
              />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" fullWidth>
                  {editingRate ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}