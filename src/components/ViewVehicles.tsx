import { useState } from "react";
import { ArrowLeft, Search, Filter, Car, Bike, Clock } from 'lucide-react';
import { Input } from "./figma/ui/input";
import { Card } from "./figma/ui/card";
import type { Screen } from '../App';

interface ViewVehiclesProps {
  navigate: (screen: Screen) => void;
}

interface Vehicle {
  id: number;
  plate: string;
  type: 'car' | 'motorcycle';
  entryTime: string;
  duration: string;
}

const mockVehicles: Vehicle[] = [
  { id: 1, plate: 'ABC-1234', type: 'car', entryTime: '08:30 AM', duration: '3h 45m' },
  { id: 2, plate: 'XYZ-5678', type: 'motorcycle', entryTime: '09:15 AM', duration: '3h 00m' },
  { id: 3, plate: 'DEF-9012', type: 'car', entryTime: '10:00 AM', duration: '2h 15m' },
  { id: 4, plate: 'GHI-3456', type: 'motorcycle', entryTime: '10:30 AM', duration: '1h 45m' },
  { id: 5, plate: 'JKL-7890', type: 'car', entryTime: '11:00 AM', duration: '1h 15m' },
  { id: 6, plate: 'MNO-2468', type: 'motorcycle', entryTime: '11:30 AM', duration: '0h 45m' },
];

export function ViewVehicles({ navigate }: ViewVehiclesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'car' | 'motorcycle'>('all');
  const [showFilter, setShowFilter] = useState(false);

  const filteredVehicles = mockVehicles.filter(vehicle => {
    const matchesSearch = vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || vehicle.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <Car size={24} className="text-blue-600" />;
      case 'motorcycle':
        return <Bike size={24} className="text-purple-600" />;
      default:
        return <Car size={24} />;
    }
  };

  const getVehicleLabel = (type: string) => {
    switch (type) {
      case 'car':
        return 'Automóvil';
      case 'motorcycle':
        return 'Motocicleta';
      default:
        return type;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 pt-6 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('dashboard')}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white flex-1">Vehículos Activos</h1>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Filter size={20} className="text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Buscar por placa..."
          icon={<Search size={20} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
        />

        {/* Filter Pills */}
        {showFilter && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('car')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filterType === 'car'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white'
              }`}
            >
              Automóviles
            </button>
            <button
              onClick={() => setFilterType('motorcycle')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filterType === 'motorcycle'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white'
              }`}
            >
              Motocicletas
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-3">
          <p className="text-blue-100 text-sm">Total de vehículos estacionados</p>
          <p className="text-white text-2xl">{filteredVehicles.length}</p>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="flex-1 px-6 pt-4 pb-6 overflow-y-auto">
        <div className="space-y-3">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {getVehicleIcon(vehicle.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1">{vehicle.plate}</p>
                  <p className="text-gray-600 text-sm">{getVehicleLabel(vehicle.type)}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                    <Clock size={14} />
                    <span className="text-sm">{vehicle.entryTime}</span>
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                    {vehicle.duration}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={48} className="text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No se encontraron vehículos</h3>
            <p className="text-gray-600">
              Intenta ajustar tus filtros o realiza otra búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}