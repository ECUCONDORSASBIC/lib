import React, { useState } from 'react';

const IntensitySlider = ({
  value = 5, // Default value if none provided
  onChange,
  min = 1,
  max = 10,
  className = '',
  label = "Nivel de intensidad",
  showDescription = true,
  showValue = true,
}) => {
  const [localValue, setLocalValue] = useState(value);

  React.useEffect(() => {
    setLocalValue(value); // Sync with parent component value prop
  }, [value]);

  const handleSliderChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const getIntensityDescription = (val) => {
    if (val <= min + (max - min) * 0.2) return 'Muy leve';
    if (val <= min + (max - min) * 0.4) return 'Leve';
    if (val <= min + (max - min) * 0.6) return 'Moderado';
    if (val <= min + (max - min) * 0.8) return 'Intenso';
    return 'Muy intenso';
  };

  // Calculate background gradient for the track
  const getTrackBackground = () => {
    const percentage = ((localValue - min) / (max - min)) * 100;
    return `linear-gradient(to right, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%)`;
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative py-1">
        <input
          type="range"
          min={min}
          max={max}
          value={localValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
          style={{ background: getTrackBackground() }}
          aria-label={label || "Nivel de intensidad"}
        />

        <div className="flex justify-between text-xs text-gray-500 px-1 mt-1.5">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      {(showDescription || showValue) && (
        <div className="mt-1.5 flex items-center justify-between">
          {showDescription && <span className="text-sm font-medium text-gray-700">{getIntensityDescription(localValue)}</span>}
          {showValue && (
            <span className={`inline-flex items-center justify-center w-10 h-6 bg-blue-100 text-blue-800 text-xs font-semibold rounded ${!showDescription ? 'ml-auto' : ''}`}>
              {localValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default IntensitySlider;
