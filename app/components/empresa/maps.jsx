"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Importar react-leaflet dinámicamente para evitar problemas de SSR
const MapWithNoSSR = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-[600px] bg-gray-100">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }
);

const ProfessionalsMap = ({ initialCenter = [-34.6037, -58.3816], initialZoom = 12, professionals = [] }) => {
  const [filteredProfessionals, setFilteredProfessionals] = useState(professionals);
  const [filters, setFilters] = useState({
    specialty: 'all',
    availability: 'all',
    distance: 100 // km
  });

  // Handle specialty filter change
  const handleSpecialtyChange = (e) => {
    const specialty = e.target.value;
    setFilters(prev => ({ ...prev, specialty }));

    if (specialty === 'all') {
      setFilteredProfessionals(professionals);
    } else {
      setFilteredProfessionals(professionals.filter(prof => prof.specialty === specialty));
    }
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-md">
      {/* Filter controls */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="specialty" className="block mb-1 text-sm font-medium text-gray-700">
              Especialidad
            </label>
            <select
              id="specialty"
              name="specialty"
              value={filters.specialty}
              onChange={handleSpecialtyChange}
              className="w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las especialidades</option>
              <option value="Cardiología">Cardiología</option>
              <option value="Neurología">Neurología</option>
              <option value="Pediatría">Pediatría</option>
              <option value="Enfermería">Enfermería</option>
              <option value="Radiología">Radiología</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="availability" className="block mb-1 text-sm font-medium text-gray-700">
              Disponibilidad
            </label>
            <select
              id="availability"
              name="availability"
              value={filters.availability}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Cualquier disponibilidad</option>
              <option value="full-time">Tiempo completo</option>
              <option value="part-time">Tiempo parcial</option>
              <option value="on-call">Guardias</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="distance" className="block mb-1 text-sm font-medium text-gray-700">
              Distancia máxima
            </label>
            <select
              id="distance"
              name="distance"
              value={filters.distance}
              onChange={(e) => setFilters(prev => ({ ...prev, distance: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-[600px]">
        <MapWithNoSSR
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          professionals={filteredProfessionals}
        />
      </div>

      {/* Results count */}
      <div className="p-4 border-t">
        <p className="text-sm text-gray-600">
          {filteredProfessionals.length} profesional{filteredProfessionals.length !== 1 ? 'es' : ''} encontrado{filteredProfessionals.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default ProfessionalsMap;
