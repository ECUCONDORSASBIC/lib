import React from 'react';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente para mostrar la lista de pacientes
 */
const PatientList = ({ patients = [], onPatientClick = () => { } }) => {
  if (!patients.length) {
    return (
      <div className="py-4 text-center text-gray-500">No hay pacientes asignados</div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {patients.map((patient) => (
        <li
          key={patient.id}
          className="py-3 cursor-pointer hover:bg-gray-50"
          onClick={() => onPatientClick(patient.id)}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {patient.photoURL ? (
                <img
                  className="w-10 h-10 rounded-full"
                  src={patient.photoURL}
                  alt={patient.displayName || patient.fullName || 'Paciente'}
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <span className="text-blue-800 text-sm font-medium">
                    {(patient.displayName || patient.fullName || 'P')
                      .substring(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {patient.displayName || patient.fullName || 'Paciente sin nombre'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                ID: {patient.id}
                {patient.lastActivity && (
                  <span className="ml-1">
                    • Última actividad: {formatDistance(new Date(patient.lastActivity), new Date(), { locale: es, addSuffix: true })}
                  </span>
                )}
              </p>
            </div>
            <div className="flex-shrink-0">
              {patient.riskLevel && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${getRiskLevelColorClass(patient.riskLevel)}`}>
                  {getRiskLevelText(patient.riskLevel)}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

// Helper para determinar la clase de color según el nivel de riesgo
const getRiskLevelColorClass = (riskLevel) => {
  switch (riskLevel) {
    case 1: return 'bg-green-100 text-green-800';
    case 2: return 'bg-blue-100 text-blue-800';
    case 3: return 'bg-yellow-100 text-yellow-800';
    case 4: return 'bg-orange-100 text-orange-800';
    case 5: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper para determinar el texto según el nivel de riesgo
const getRiskLevelText = (riskLevel) => {
  switch (riskLevel) {
    case 1: return 'Bajo';
    case 2: return 'Leve';
    case 3: return 'Moderado';
    case 4: return 'Alto';
    case 5: return 'Crítico';
    default: return 'Sin definir';
  }
};

export default PatientList;
