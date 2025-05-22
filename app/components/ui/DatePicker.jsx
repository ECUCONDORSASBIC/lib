'use client';

import { format, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { forwardRef, useEffect, useState } from 'react';

// Simple DatePicker component that doesn't rely on external libraries
const DatePicker = forwardRef(({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className = "",
  dateFormat = "dd/MM/yyyy",
  minDate,
  maxDate,
  label,
  errorMessage,
  ...props
}, ref) => {
  const [inputValue, setInputValue] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState(null);

  // Update input value when the value prop changes
  useEffect(() => {
    if (value) {
      const date = value instanceof Date ? value : new Date(value);
      if (isValid(date)) {
        setSelectedDate(date);
        setInputValue(format(date, dateFormat, { locale: es }));
      }
    } else {
      setSelectedDate(null);
      setInputValue('');
    }
  }, [value, dateFormat]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (!newValue) {
      setSelectedDate(null);
      onChange(null);
      setError(null);
      return;
    }

    // Try to parse the input value
    try {
      const parsedDate = parse(newValue, dateFormat, new Date(), { locale: es });
      if (isValid(parsedDate)) {
        setSelectedDate(parsedDate);
        onChange(parsedDate);
        setError(null);
      } else {
        setError(`Formato inválido. Use ${dateFormat}`);
      }
    } catch (err) {
      setError(`Formato inválido. Use ${dateFormat}`);
    }
  };

  // For a basic implementation, we're just using a simple input
  // You can enhance this with a calendar popup if needed
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-md border border-gray-300 py-2 pl-3 pr-10
            shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1
            focus:ring-blue-500 sm:text-sm ${error ? 'border-red-500' : ''}`}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
});

DatePicker.displayName = "DatePicker";

export default DatePicker;
