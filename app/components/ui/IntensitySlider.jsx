'use client';

import React, { useState } from 'react';

/**
 * Componente de deslizador de intensidad con etiquetas en los extremos
 * @param {Object} props - Propiedades del componente
 * @param {number} props.value - Valor actual del deslizador
 * @param {function} props.onChange - Función que se llama cuando cambia el valor
 * @param {number} props.min - Valor mínimo
 * @param {number} props.max - Valor máximo
 * @param {number} props.step - Incremento por paso
 * @param {string} props.leftLabel - Etiqueta del extremo izquierdo
 * @param {string} props.rightLabel - Etiqueta del extremo derecho
 * @returns {React.ReactElement} El componente IntensitySlider
 */
const IntensitySlider = ({
  value = 0,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  leftLabel = 'Mínimo',
  rightLabel = 'Máximo',
}) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  // Asegurar que el valor esté dentro de los límites
  const safeValue = Math.min(Math.max(localValue, min), max);

  // Calcular el porcentaje de progreso para los estilos
  const progress = ((safeValue - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
          }}
        />
        <div className="absolute left-0 right-0 -bottom-6 flex justify-between text-xs text-gray-500">
          {Array.from({ length: max - min + 1 }).map((_, index) => (
            <span key={index} className={`select-none ${index === safeValue - min ? 'font-bold text-blue-600' : ''}`}>
              {index + min}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-8 flex justify-between text-sm text-gray-600">
        <span className="text-left">{leftLabel}</span>
        <span className="font-medium text-blue-600">Nivel: {safeValue}</span>
        <span className="text-right">{rightLabel}</span>
      </div>
    </div>
  );
};

export default IntensitySlider;
