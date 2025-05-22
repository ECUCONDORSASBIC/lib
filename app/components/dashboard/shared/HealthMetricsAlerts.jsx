'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Component to display alerts for critical health metrics
 *
 * @param {Object} props
 * @param {Object} props.metrics - Object containing health metrics data
 * @param {string} props.patientId - ID of the patient
 * @param {string} props.patientName - Name of the patient
 */
const HealthMetricsAlerts = ({ metrics, patientId, patientName }) => {
  const [alerts, setAlerts] = useState([]);
  const router = useRouter();

  // Define thresholds for different metrics
  const thresholds = {
    bloodPressure: {
      systolicHigh: 140,
      systolicVeryHigh: 180,
      diastolicHigh: 90,
      diastolicVeryHigh: 110
    },
    glucose: {
      high: 180,
      veryHigh: 250,
      low: 70,
      veryLow: 55
    },
    lipidProfile: {
      totalCholesterolHigh: 200,
      ldlHigh: 130,
      hdlLow: 40,
      triglyceridesHigh: 150
    }
  };

  useEffect(() => {
    if (!metrics) return;

    const newAlerts = [];

    // Check blood pressure
    if (metrics.bloodPressure) {
      const { systolic, diastolic } = metrics.bloodPressure;

      if (systolic >= thresholds.bloodPressure.systolicVeryHigh) {
        newAlerts.push({
          id: 'bp-systolic-very-high',
          type: 'critical',
          message: `Presión sistólica muy elevada (${systolic} mmHg)`,
          metric: 'bloodPressure'
        });
      } else if (systolic >= thresholds.bloodPressure.systolicHigh) {
        newAlerts.push({
          id: 'bp-systolic-high',
          type: 'warning',
          message: `Presión sistólica elevada (${systolic} mmHg)`,
          metric: 'bloodPressure'
        });
      }

      if (diastolic >= thresholds.bloodPressure.diastolicVeryHigh) {
        newAlerts.push({
          id: 'bp-diastolic-very-high',
          type: 'critical',
          message: `Presión diastólica muy elevada (${diastolic} mmHg)`,
          metric: 'bloodPressure'
        });
      } else if (diastolic >= thresholds.bloodPressure.diastolicHigh) {
        newAlerts.push({
          id: 'bp-diastolic-high',
          type: 'warning',
          message: `Presión diastólica elevada (${diastolic} mmHg)`,
          metric: 'bloodPressure'
        });
      }
    }

    // Check glucose
    if (metrics.glucose) {
      const value = metrics.glucose.value;

      if (value >= thresholds.glucose.veryHigh) {
        newAlerts.push({
          id: 'glucose-very-high',
          type: 'critical',
          message: `Nivel de glucosa muy elevado (${value} mg/dL)`,
          metric: 'glucose'
        });
      } else if (value >= thresholds.glucose.high) {
        newAlerts.push({
          id: 'glucose-high',
          type: 'warning',
          message: `Nivel de glucosa elevado (${value} mg/dL)`,
          metric: 'glucose'
        });
      } else if (value <= thresholds.glucose.veryLow) {
        newAlerts.push({
          id: 'glucose-very-low',
          type: 'critical',
          message: `Nivel de glucosa muy bajo (${value} mg/dL)`,
          metric: 'glucose'
        });
      } else if (value <= thresholds.glucose.low) {
        newAlerts.push({
          id: 'glucose-low',
          type: 'warning',
          message: `Nivel de glucosa bajo (${value} mg/dL)`,
          metric: 'glucose'
        });
      }
    }

    // Check lipid profile
    if (metrics.lipidProfile) {
      const { total, ldl, hdl, triglycerides } = metrics.lipidProfile;

      if (total >= thresholds.lipidProfile.totalCholesterolHigh) {
        newAlerts.push({
          id: 'cholesterol-high',
          type: 'warning',
          message: `Colesterol total elevado (${total} mg/dL)`,
          metric: 'lipidProfile'
        });
      }

      if (ldl >= thresholds.lipidProfile.ldlHigh) {
        newAlerts.push({
          id: 'ldl-high',
          type: 'warning',
          message: `LDL Colesterol elevado (${ldl} mg/dL)`,
          metric: 'lipidProfile'
        });
      }

      if (hdl <= thresholds.lipidProfile.hdlLow) {
        newAlerts.push({
          id: 'hdl-low',
          type: 'warning',
          message: `HDL Colesterol bajo (${hdl} mg/dL)`,
          metric: 'lipidProfile'
        });
      }

      if (triglycerides && triglycerides >= thresholds.lipidProfile.triglyceridesHigh) {
        newAlerts.push({
          id: 'triglycerides-high',
          type: 'warning',
          message: `Triglicéridos elevados (${triglycerides} mg/dL)`,
          metric: 'lipidProfile'
        });
      }
    }

    setAlerts(newAlerts);
  }, [metrics]);

  const handleViewMetric = (metricType) => {
    router.push(`/dashboard/medico/pacientes/${patientId}/metricas-salud?tab=${metricType}`);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="mb-6">
      <div className={`p-4 rounded-lg ${alerts.some(a => a.type === 'critical') ? 'bg-red-50' : 'bg-yellow-50'}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {alerts.some(a => a.type === 'critical') ? (
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${alerts.some(a => a.type === 'critical') ? 'text-red-800' : 'text-yellow-800'}`}>
              Alertas de métricas de salud para {patientName || 'el paciente'}
            </h3>
            <div className="mt-2 text-sm text-gray-700">
              <ul className="list-disc pl-5 space-y-1">
                {alerts.map((alert) => (
                  <li key={alert.id} className={alert.type === 'critical' ? 'text-red-700' : 'text-yellow-700'}>
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                {alerts.filter(a => a.metric === 'bloodPressure').length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleViewMetric('bloodPressure')}
                    className="ml-2 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Ver presión arterial
                  </button>
                )}
                {alerts.filter(a => a.metric === 'glucose').length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleViewMetric('glucose')}
                    className="ml-2 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Ver glucemia
                  </button>
                )}
                {alerts.filter(a => a.metric === 'lipidProfile').length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleViewMetric('lipidProfile')}
                    className="ml-2 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Ver perfil lipídico
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMetricsAlerts;
