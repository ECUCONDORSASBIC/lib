'use client';

import { useState } from 'react';

/**
 * Date Range Selector component for filtering time-series data
 *
 * @param {Object} props
 * @param {Function} props.onDateRangeChange - Callback when date range changes, receives { startDate, endDate }
 * @param {Object} props.initialRange - Optional initial date range with startDate and endDate
 */
const DateRangeSelector = ({ onDateRangeChange, initialRange = null }) => {
  const [startDate, setStartDate] = useState(initialRange?.startDate || '');
  const [endDate, setEndDate] = useState(initialRange?.endDate || '');
  const [selectedPreset, setSelectedPreset] = useState('');

  // Handle applying the selected date range
  const handleApplyRange = () => {
    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      });
    }
  };

  // Handle preset selection (last 7 days, last month, etc)
  const handlePresetChange = (e) => {
    const value = e.target.value;
    setSelectedPreset(value);

    const today = new Date();
    let start = null;
    let end = today;

    switch (value) {
      case 'last7days':
        start = new Date();
        start.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        start = new Date();
        start.setDate(today.getDate() - 30);
        break;
      case 'last90days':
        start = new Date();
        start.setDate(today.getDate() - 90);
        break;
      case 'lastYear':
        start = new Date();
        start.setFullYear(today.getFullYear() - 1);
        break;
      case 'all':
        start = null;
        end = null;
        break;
      default:
        // Custom range or no preset
        return;
    }

    // Format dates to YYYY-MM-DD for input
    const formatDateToInputValue = (date) => {
      if (!date) return '';
      return date.toISOString().split('T')[0];
    };

    setStartDate(formatDateToInputValue(start));
    setEndDate(formatDateToInputValue(end));

    // Also trigger the callback
    if (onDateRangeChange) {
      onDateRangeChange({ startDate: start, endDate: end });
    }
  };

  return (
    <div className="bg-white rounded-md border border-gray-200 p-3 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label htmlFor="date-preset" className="block text-sm font-medium text-gray-700 mb-1">
            Período predefinido
          </label>
          <select
            id="date-preset"
            value={selectedPreset}
            onChange={handlePresetChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">Personalizado</option>
            <option value="last7days">Últimos 7 días</option>
            <option value="last30days">Últimos 30 días</option>
            <option value="last90days">Últimos 90 días</option>
            <option value="lastYear">Último año</option>
            <option value="all">Todo el historial</option>
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha inicial
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha final
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>

        <button
          onClick={handleApplyRange}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};

export default DateRangeSelector;
