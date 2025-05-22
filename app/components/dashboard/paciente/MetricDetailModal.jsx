'use client';

import { ArrowPathIcon, ChartBarIcon, InformationCircleIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

// Placeholder for a charting library or custom SVG chart
const MetricChartPlaceholder = ({ metricName }) => {
  return (
    <div className="flex items-center justify-center w-full h-40 mb-4 text-sm text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-md">
      <ChartBarIcon className="w-8 h-8 mr-2 text-gray-400" />
      Gráfico de tendencia para {metricName} (Próximamente)
    </div>
  );
};

const MetricDetailModal = ({ metric, isOpen, onClose }) => {
  // Moved useState calls to the top, before any conditional returns.
  const [newValue, setNewValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen || !metric) return null;

  // Mock data - replace with actual data fetching and props
  const mockHistory = {
    'Presión Arterial': [
      { date: '2023-07-15 09:00', value: '122/79 mmHg' },
      { date: '2023-07-14 18:30', value: '125/81 mmHg' },
      { date: '2023-07-14 09:15', value: '120/78 mmHg' },
      { date: '2023-07-13 19:00', value: '128/82 mmHg' },
      { date: '2023-07-13 08:45', value: '124/80 mmHg' },
    ],
    'Glucosa': [
      { date: '2023-07-15 07:30', value: '105 mg/dL' },
      { date: '2023-07-14 07:35', value: '102 mg/dL' },
      { date: '2023-07-13 07:20', value: '108 mg/dL' },
    ],
    'Colesterol': [
      { date: '2023-06-01', value: '185 mg/dL (Total)' },
    ],
    'IMC': [
      { date: '2023-05-01', value: '24.5' },
    ],
  };

  const referenceRanges = {
    'Presión Arterial': 'Normal: <120/80 mmHg, Elevada: 120-129/<80 mmHg, HTA1: 130-139/80-89 mmHg, HTA2: >=140/>=90 mmHg',
    'Glucosa': 'Ayunas: 70-100 mg/dL, Postprandial (2h): <140 mg/dL',
    'Colesterol': 'Total: <200 mg/dL, LDL: <100 mg/dL, HDL: >40 mg/dL (hombres), >50 mg/dL (mujeres)',
    'IMC': 'Bajo peso: <18.5, Normal: 18.5-24.9, Sobrepeso: 25-29.9, Obesidad: >=30',
  };

  const metricExplanations = {
    'Presión Arterial': 'Mide la fuerza de la sangre contra las paredes de las arterias. Importante para la salud cardiovascular.',
    'Glucosa': 'Nivel de azúcar en sangre. Clave para el manejo de la diabetes y el metabolismo energético.',
    'Colesterol': 'Sustancia grasa necesaria para el cuerpo, pero niveles altos pueden aumentar el riesgo cardíaco.',
    'IMC': 'Índice de Masa Corporal. Relación entre peso y altura, usada para evaluar el peso saludable.',
  };

  const history = mockHistory[metric.name] || [];
  const reference = referenceRanges[metric.name] || 'No disponible.';
  const explanation = metricExplanations[metric.name] || 'Información no disponible.';

  const handleRecordNewValue = () => {
    if (!newValue.trim()) {
      alert('Por favor, ingrese un valor.');
      return;
    }
    setIsRecording(true);
    // Simulate API call
    setTimeout(() => {
      console.log(`Nueva lectura para ${metric.name}: ${newValue}`);
      // Here you would typically update state or refetch data
      alert(`Nueva lectura registrada: ${newValue} para ${metric.name}. (Simulado)`);
      setNewValue('');
      setIsRecording(false);
      // onClose(); // Optionally close modal after recording
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl p-5 mx-auto bg-white shadow-2xl rounded-xl">
        <button
          onClick={onClose}
          className="absolute p-1 text-gray-400 transition-colors rounded-full top-3 right-3 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Cerrar modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="mb-1 text-2xl font-semibold text-gray-800">{metric.name}</h2>
        <p className="mb-4 text-sm text-gray-500">Valor actual: <span className="font-medium text-gray-700">{metric.data?.value || 'N/A'} {metric.data?.unit || ''}</span></p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column: Chart & Explanation */}
          <div className="space-y-4">
            <MetricChartPlaceholder metricName={metric.name} />
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-700">¿Qué significa esta métrica?</h3>
              <p className="text-xs leading-relaxed text-gray-600">
                <InformationCircleIcon className="inline w-3.5 h-3.5 mr-1 align-text-bottom text-blue-500" />
                {explanation}
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-700">Valores de Referencia</h3>
              <p className="text-xs text-gray-600">{reference}</p>
            </div>
          </div>

          {/* Right Column: History & New Reading */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Últimas Lecturas ({history.length})</h3>
              {history.length > 0 ? (
                <ul className="space-y-1.5 text-xs max-h-40 overflow-y-auto pr-2 border rounded-md p-2 bg-gray-50">
                  {history.map((entry, index) => (
                    <li key={index} className="flex justify-between pb-1 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-600">{entry.date}:</span>
                      <span className="font-medium text-gray-700">{entry.value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No hay historial de lecturas disponible.</p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Registrar Nueva Lectura</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={metric.name === 'Presión Arterial' ? 'Ej: 120/80' : 'Ej: 98'}
                  className="flex-grow px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isRecording}
                />
                <button
                  onClick={handleRecordNewValue}
                  disabled={isRecording || !newValue.trim()}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                >
                  {isRecording ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PencilSquareIcon className="w-4 h-4 mr-1.5" />}
                  {isRecording ? '' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricDetailModal;
