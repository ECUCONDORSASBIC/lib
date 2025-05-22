'use client';

import { db } from '@/lib/firebase/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// Iconos (opcional, puedes usar los que prefieras o SVGs en línea)
import {
  ExclamationTriangleIcon,
  EyeIcon, // Salud Óptima (Nivel 1)
  InformationCircleIcon, // Riesgos Graves (Nivel 4)
  PhoneIcon
} from '@heroicons/react/24/outline';

const RiskNotificationDisplay = ({ patientId, riskLevel, riskDetails, riskTitle }) => {
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback for riskTitle if not provided
  const currentRiskTitle = riskTitle || "Evaluación de Riesgo";

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      setError('Patient ID no proporcionado.');
      return;
    }

    const fetchRiskAssessment = async () => {
      setLoading(true);
      setError(null);
      try {
        const assessmentRef = doc(db, 'patients', patientId, 'medical', 'riskAssessment');
        const docSnap = await getDoc(assessmentRef);

        if (docSnap.exists()) {
          setRiskAssessment({ id: docSnap.id, ...docSnap.data() });
        } else {
          setRiskAssessment(null); // No hay evaluación encontrada
        }
      } catch (err) {
        console.error("Error fetching risk assessment:", err);
        setError('Error al cargar la evaluación de riesgo.');
      } finally {
        setLoading(false);
      }
    };

    fetchRiskAssessment();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-white border rounded-lg shadow-md min-h-[150px]">
        <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
        <p className="ml-3 text-gray-600">Cargando evaluación de riesgo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-md">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
          <p className="font-semibold">Error</p>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  if (!riskLevel) {
    return (
      <div className="p-4 border-l-4 border-gray-300 rounded-md shadow-sm bg-gray-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{currentRiskTitle}</p>
            <p className="mt-1 text-sm text-gray-600">No hay datos de riesgo disponibles actualmente.</p>
          </div>
        </div>
      </div>
    );
  }

  let bgColor = 'bg-green-100';
  let textColor = 'text-green-800';
  let borderColor = 'border-green-500';
  let riskTextLabel = 'Riesgo Bajo';

  if (riskLevel === 'medium') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    borderColor = 'border-yellow-500';
    riskTextLabel = 'Riesgo Medio';
  } else if (riskLevel === 'high') {
    bgColor = 'bg-orange-100';
    textColor = 'text-orange-800';
    borderColor = 'border-orange-500';
    riskTextLabel = 'Riesgo Alto';
  } else if (riskLevel === 'critical') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    borderColor = 'border-red-500';
    riskTextLabel = 'Riesgo Crítico';
  }

  const isHighOrCriticalRisk = riskLevel === 'high' || riskLevel === 'critical';

  return (
    <div className={`p-4 border-l-4 ${borderColor} ${bgColor} rounded-md shadow-sm`}>
      <div className="flex">
        <div className="flex-grow ml-3">
          <p
            className={`text-sm font-semibold ${textColor}`}
          >
            {currentRiskTitle}: {riskTextLabel}
          </p>
          {riskDetails && <p className={`mt-1 text-sm ${textColor}`}>{riskDetails}</p>}

          {isHighOrCriticalRisk && (
            <div className="mt-3 space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => alert('Acción: Contactar equipo médico (funcionalidad simulada).')}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${riskLevel === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${riskLevel === 'critical' ? 'focus:ring-red-500' : 'focus:ring-orange-500'}`}
              >
                <PhoneIcon className="w-4 h-4 mr-1.5" />
                Contactar Equipo Médico
              </button>
              <button
                onClick={() => alert('Acción: Ver recomendaciones urgentes (funcionalidad simulada).')}
                className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColor} ${riskLevel === 'critical' ? 'border-red-600 hover:bg-red-200' : 'border-orange-600 hover:bg-orange-200'} ${riskLevel === 'critical' ? 'focus:ring-red-500' : 'focus:ring-orange-500'}`}
              >
                <EyeIcon className="w-4 h-4 mr-1.5" />
                Ver Recomendaciones
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskNotificationDisplay;
