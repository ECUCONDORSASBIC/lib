// Factores de riesgo para el paciente
import React from 'react';

const PatientRiskAlerts = ({ risks = [] }) => (
  <div className="p-4 mb-6 bg-white rounded shadow">
    <h3 className="mb-2 text-lg font-semibold">Tus Factores de Riesgo</h3>
    {risks.length === 0 ? (
      <div className="text-gray-500">No se han detectado factores de riesgo.</div>
    ) : (
      <ul className="divide-y divide-gray-200">
        {risks.map((risk, idx) => (
          <li key={idx} className="flex flex-col py-2">
            <span className="font-medium text-red-600">{risk.riskFactor}</span>
            <span className="text-xs text-gray-400">{risk.date}</span>
            <span className="text-sm text-gray-700">{risk.recommendation}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default PatientRiskAlerts;
