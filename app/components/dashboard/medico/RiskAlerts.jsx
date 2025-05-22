import React from 'react';
import InfoCard from '../shared/InfoCard'; // Ajusta la ruta si es necesario

// Icono para Alertas de Riesgo (Ejemplo)
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;

const RiskAlerts = ({ alerts = [], onIntervene, className = '' }) => {
  if (alerts.length === 0) {
    return (
      <InfoCard title="Alertas de Factores de Riesgo" icon={<AlertIcon />} iconBgColor="bg-gray-400" className={className}>
        <p className="text-gray-500">No hay alertas de riesgo activas en este momento.</p>
      </InfoCard>
    );
  }

  return (
    <InfoCard
      title="Alertas Críticas de Riesgo"
      icon={<AlertIcon />}
      iconBgColor="bg-red-500"
      className={`border-2 border-red-500 ${className}`}
    >
      <ul className="mt-4 divide-y divide-gray-200">
        {alerts.map((alert, idx) => (
          <li key={idx} className="flex flex-col py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Paciente: <span className="font-semibold">{alert.patientName}</span></p>
              <p className="text-sm text-red-700">Factor de Riesgo: <span className="font-semibold">{alert.riskFactor}</span></p>
              <p className="text-xs text-gray-500">Fecha: {alert.date}</p>
            </div>
            <button
              className="px-4 py-2 mt-3 text-sm font-medium text-white transition duration-150 ease-in-out bg-red-600 rounded-md sm:mt-0 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => onIntervene(alert)}
            >
              Intervenir Ahora
            </button>
          </li>
        ))}
      </ul>
    </InfoCard>
  );
};

export default RiskAlerts;
