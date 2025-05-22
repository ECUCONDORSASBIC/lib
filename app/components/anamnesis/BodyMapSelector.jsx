'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Componente interactivo de mapa corporal para seleccionar áreas con síntomas
 * 
 * @param {Object} props
 * @param {Function} props.onSelectArea - Función que se llama cuando se selecciona un área
 * @param {Array} props.selectedAreas - Áreas ya seleccionadas
 * @param {boolean} props.readOnly - Si es true, el mapa es de solo lectura
 */
const BodyMapSelector = ({ onSelectArea, selectedAreas = [], readOnly = false }) => {
  const [hoveredArea, setHoveredArea] = useState(null);
  
  // Definición de áreas del cuerpo con sus caminos SVG y nombres
  const bodyAreas = [
    { id: 'cabeza', path: 'M100,25 C120,25 130,45 130,65 C130,85 115,100 100,100 C85,100 70,85 70,65 C70,45 80,25 100,25 Z', label: 'Cabeza' },
    { id: 'torax', path: 'M70,100 L130,100 L130,170 L70,170 Z', label: 'Tórax' },
    { id: 'abdomen', path: 'M70,170 L130,170 L130,220 L70,220 Z', label: 'Abdomen' },
    { id: 'pelvis', path: 'M70,220 L130,220 L130,250 L70,250 Z', label: 'Pelvis' },
    { id: 'brazo_izq', path: 'M70,100 L50,100 L30,170 L50,170 L70,120 Z', label: 'Brazo izquierdo' },
    { id: 'brazo_der', path: 'M130,100 L150,100 L170,170 L150,170 L130,120 Z', label: 'Brazo derecho' },
    { id: 'pierna_izq', path: 'M70,250 L85,250 L85,350 L70,350 Z', label: 'Pierna izquierda' },
    { id: 'pierna_der', path: 'M115,250 L130,250 L130,350 L115,350 Z', label: 'Pierna derecha' },
    { id: 'espalda', path: 'M190,100 L250,100 L250,220 L190,220 Z', label: 'Espalda' },
    { id: 'cuello', path: 'M85,85 L115,85 L115,100 L85,100 Z', label: 'Cuello' }
  ];

  const handleAreaClick = (areaId) => {
    if (readOnly) return;
    onSelectArea(areaId);
  };

  return (
    <div className="body-map-container mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Localice sus síntomas en el mapa corporal:</h4>
      <div className="relative flex justify-center">
        <svg viewBox="0 0 300 400" className="body-map w-64 h-96">
          {/* Silueta base del cuerpo (fondo) */}
          <path 
            d="M100,25 C120,25 130,45 130,65 C130,85 115,100 100,100 C85,100 70,85 70,65 C70,45 80,25 100,25 Z
               M70,100 L130,100 L130,170 L70,170 Z
               M70,170 L130,170 L130,220 L70,220 Z
               M70,220 L130,220 L130,250 L70,250 Z
               M70,250 L85,250 L85,350 L70,350 Z
               M115,250 L130,250 L130,350 L115,350 Z
               M70,100 L50,100 L30,170 L50,170 L70,120 Z
               M130,100 L150,100 L170,170 L150,170 L130,120 Z
               M190,100 L250,100 L250,220 L190,220 Z
               M85,85 L115,85 L115,100 L85,100 Z"
            fill="#f3f4f6" 
            stroke="#d1d5db" 
            strokeWidth="1"
          />
          
          {/* Áreas interactivas */}
          {bodyAreas.map((area) => {
            const isSelected = selectedAreas.includes(area.id);
            const isHovered = hoveredArea === area.id;
            
            return (
              <motion.path
                key={area.id}
                d={area.path}
                className={`cursor-pointer transition-colors duration-200 ${readOnly ? '' : 'hover:fill-blue-200'}`}
                fill={isSelected ? '#3b82f6' : 'transparent'}
                stroke={isSelected || isHovered ? '#2563eb' : '#9ca3af'}
                strokeWidth={isSelected || isHovered ? "2" : "1"}
                onClick={() => handleAreaClick(area.id)}
                onMouseEnter={() => setHoveredArea(area.id)}
                onMouseLeave={() => setHoveredArea(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              />
            );
          })}
        </svg>
        
        {/* Etiquetas emergentes para áreas seleccionadas */}
        {hoveredArea && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md text-xs text-blue-800 font-medium">
            {bodyAreas.find(area => area.id === hoveredArea)?.label}
          </div>
        )}
      </div>
      
      {/* Lista de áreas seleccionadas */}
      {selectedAreas.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Áreas seleccionadas:</p>
          <div className="flex flex-wrap gap-1">
            {selectedAreas.map(areaId => {
              const area = bodyAreas.find(a => a.id === areaId);
              return (
                <span 
                  key={areaId} 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {area?.label}
                  {!readOnly && (
                    <button
                      type="button"
                      className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectArea(areaId, true); // true indica que es una eliminación
                      }}
                    >
                      <span className="sr-only">Eliminar {area?.label}</span>
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMapSelector;
