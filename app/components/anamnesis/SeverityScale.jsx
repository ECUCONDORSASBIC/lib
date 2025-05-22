'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Componente visual para seleccionar la intensidad de síntomas
 * 
 * @param {Object} props
 * @param {number} props.value - Valor actual (1-10)
 * @param {Function} props.onChange - Función para actualizar el valor
 * @param {string} props.label - Etiqueta para la escala
 * @param {boolean} props.readOnly - Si es true, la escala es de solo lectura
 */
const SeverityScale = ({ 
  value = 5, 
  onChange, 
  label = "Intensidad del dolor", 
  readOnly = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [hoveredValue, setHoveredValue] = useState(null);
  
  // Sincronizar con el valor externo
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Descripción según nivel de intensidad
  const getIntensityDescription = (intensity) => {
    if (intensity <= 2) return "Muy leve";
    if (intensity <= 4) return "Leve";
    if (intensity <= 6) return "Moderado";
    if (intensity <= 8) return "Intenso";
    return "Muy intenso";
  };
  
  // Color según nivel de intensidad
  const getIntensityColor = (intensity) => {
    if (intensity <= 2) return "text-green-500";
    if (intensity <= 4) return "text-green-600";
    if (intensity <= 6) return "text-yellow-500";
    if (intensity <= 8) return "text-orange-500";
    return "text-red-500";
  };
  
  // Emojis para niveles de intensidad
  const emojis = ["😊", "🙂", "🙂", "😐", "😐", "🙁", "🙁", "😣", "😖", "😫"];
  
  // Manejar cambio de valor
  const handleChange = (newValue) => {
    if (readOnly) return;
    
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };
  
  return (
    <div className="severity-scale mt-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center">
          <span className={`text-lg mr-2 ${getIntensityColor(localValue)}`}>
            {emojis[localValue - 1]}
          </span>
          <span className={`text-sm font-medium ${getIntensityColor(localValue)}`}>
            {localValue}/10 - {getIntensityDescription(localValue)}
          </span>
        </div>
      </div>
      
      <div className="relative">
        {/* Barra de fondo */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 ease-out rounded-full"
            style={{ 
              width: `${(localValue / 10) * 100}%`,
              background: `linear-gradient(to right, #10B981, #FBBF24, #F87171)` 
            }}
          />
        </div>
        
        {/* Marcadores */}
        <div className="w-full flex justify-between mt-1 px-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mark) => (
            <div 
              key={mark}
              className="relative"
              onMouseEnter={() => !readOnly && setHoveredValue(mark)}
              onMouseLeave={() => setHoveredValue(null)}
            >
              <motion.button
                type="button"
                disabled={readOnly}
                className={`w-5 h-5 rounded-full ${readOnly ? 'cursor-default' : 'cursor-pointer'} flex items-center justify-center`}
                onClick={() => handleChange(mark)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={{ 
                  scale: (hoveredValue === mark || localValue === mark) ? 1.2 : 1,
                }}
              >
                <span 
                  className={`w-3 h-3 rounded-full ${
                    localValue === mark 
                      ? 'bg-blue-600 ring-2 ring-blue-300'
                      : hoveredValue === mark
                        ? 'bg-gray-400' 
                        : 'bg-gray-300'
                  }`}
                />
              </motion.button>
              {(hoveredValue === mark || localValue === mark) && (
                <motion.span 
                  className="absolute left-1/2 transform -translate-x-1/2 -bottom-6 text-xs font-medium text-gray-800 bg-white px-1.5 py-0.5 rounded-md shadow-sm border border-gray-200"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {mark}
                </motion.span>
              )}
            </div>
          ))}
        </div>
        
        {/* Etiquetas de intensidad */}
        <div className="flex justify-between text-xs text-gray-500 mt-4">
          <span>Mínimo</span>
          <span>Moderado</span>
          <span>Severo</span>
        </div>
      </div>
      
      {!readOnly && (
        <p className="text-xs text-gray-500 mt-2 italic">
          Haga clic en la escala para seleccionar el nivel de intensidad
        </p>
      )}
    </div>
  );
};

export default SeverityScale;
