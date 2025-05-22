'use client';

import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useGenkit } from '../contexts/GenkitContext';

const FutureRiskProjection = ({ patientData, riskAnalysis, onNext, onBack }) => {
  const { calculateFutureRisk, isProcessing, apiError } = useGenkit();
  const [futureRisk, setFutureRisk] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showDetails, setShowDetails] = useState({});

  const handleCalculateFutureRisk = async () => {
    if (isCalculating || !patientData || !riskAnalysis) return;

    setIsCalculating(true);
    const result = await calculateFutureRisk(patientData, riskAnalysis);
    setIsCalculating(false);

    if (result.success) {
      setFutureRisk(result.futureProjection);
    } else {
      // Manejar error
      console.error("Error al calcular riesgo futuro:", result.error);
    }
  };

  const handleNext = () => {
    if (futureRisk) {
      onNext(futureRisk);
    }
  };

  const toggleDetails = (section) => {
    setShowDetails(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Función para determinar el color basado en el nivel de riesgo
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (risk) => {
    switch (risk) {
      case 'high': return 'bg-red-50';
      case 'moderate': return 'bg-yellow-50';
      case 'low': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="mb-4 text-xl font-semibold text-center text-gray-800">
        Proyección de Riesgo a 10 Años
      </h2>
      <p className="mb-8 text-sm text-center text-gray-600">
        Análisis predictivo de la evolución de factores de riesgo en los próximos 10 años.
      </p>

      {!futureRisk && !apiError && (
        <div className="p-8 mb-6 text-center bg-white rounded-lg shadow-sm">
          <ClockIcon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h3 className="mb-4 text-lg font-medium">Estimación de Riesgo Futuro</h3>
          <p className="mb-6 text-gray-600">
            Basado en sus datos actuales, se calculará la evolución proyectada de sus factores de riesgo
            y las posibles intervenciones preventivas más adecuadas.
          </p>
          <button
            onClick={handleCalculateFutureRisk}
            disabled={isCalculating || isProcessing}
            className="inline-flex items-center justify-center px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isCalculating || isProcessing ? (
              <>Calculando<span className="ml-2 loading loading-dots"></span></>
            ) : (
              <>Calcular Proyección a 10 Años</>
            )}
          </button>
        </div>
      )}

      {apiError && (
        <div className="p-6 mb-6 text-red-700 bg-red-50 rounded-lg">
          <h3 className="mb-2 text-lg font-medium">Error al calcular proyección</h3>
          <p>{apiError}</p>
          <button
            onClick={handleCalculateFutureRisk}
            className="px-4 py-2 mt-4 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {futureRisk && (
        <div className="space-y-6">
          <div className={`p-6 rounded-lg shadow-sm ${getRiskBgColor(futureRisk.overallFutureRisk)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Riesgo Proyectado Global</h3>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getRiskBgColor(futureRisk.overallFutureRisk)} border ${futureRisk.overallFutureRisk === 'high' ? 'border-red-200' : futureRisk.overallFutureRisk === 'moderate' ? 'border-yellow-200' : 'border-green-200'}`}>
                {futureRisk.overallFutureRisk === 'high' ? 'Alto' :
                  futureRisk.overallFutureRisk === 'moderate' ? 'Moderado' : 'Bajo'}
              </span>
            </div>
            <p className="text-gray-700">
              En los próximos {futureRisk.timeframe}, sin intervención médica adecuada,
              su nivel de riesgo proyectado sería <span className={`font-medium ${getRiskColor(futureRisk.overallFutureRisk)}`}>
                {futureRisk.overallFutureRisk === 'high' ? 'alto' :
                  futureRisk.overallFutureRisk === 'moderate' ? 'moderado' : 'bajo'}
              </span>.
            </p>
          </div>

          {/* Valores proyectados */}
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Valores Proyectados</h3>
              <CalendarIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Glucosa</span>
                  <span className="text-lg font-medium">{futureRisk.projectedValues.glucose} mg/dL</span>
                </div>
                <div className="w-full h-2 mt-2 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className={`h-full ${futureRisk.projectedValues.glucose > 125 ? 'bg-red-500' :
                      futureRisk.projectedValues.glucose > 100 ? 'bg-yellow-500' :
                        'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (futureRisk.projectedValues.glucose / 200) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Presión Arterial</span>
                  <span className="text-lg font-medium">
                    {futureRisk.projectedValues.bloodPressureSystolic}/{futureRisk.projectedValues.bloodPressureDiastolic}
                  </span>
                </div>
                <div className="w-full h-2 mt-2 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className={`h-full ${futureRisk.projectedValues.bloodPressureSystolic > 140 ||
                      futureRisk.projectedValues.bloodPressureDiastolic > 90 ? 'bg-red-500' :
                      futureRisk.projectedValues.bloodPressureSystolic > 120 ||
                        futureRisk.projectedValues.bloodPressureDiastolic > 80 ? 'bg-yellow-500' :
                        'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (futureRisk.projectedValues.bloodPressureSystolic / 180) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Colesterol</span>
                  <span className="text-lg font-medium">{futureRisk.projectedValues.cholesterol} mg/dL</span>
                </div>
                <div className="w-full h-2 mt-2 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className={`h-full ${futureRisk.projectedValues.cholesterol > 240 ? 'bg-red-500' :
                      futureRisk.projectedValues.cholesterol > 200 ? 'bg-yellow-500' :
                        'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (futureRisk.projectedValues.cholesterol / 300) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">IMC</span>
                  <span className="text-lg font-medium">{futureRisk.projectedValues.bmi}</span>
                </div>
                <div className="w-full h-2 mt-2 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className={`h-full ${futureRisk.projectedValues.bmi >= 30 ? 'bg-red-500' :
                      futureRisk.projectedValues.bmi >= 25 ? 'bg-yellow-500' :
                        'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (futureRisk.projectedValues.bmi / 40) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Intervenciones Recomendadas */}
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Intervenciones Recomendadas</h3>
            {futureRisk.interventions.length === 0 ? (
              <p className="p-4 text-green-700 bg-green-50 rounded-md">
                ¡Felicidades! Sus proyecciones no requieren intervenciones específicas. Continúe con sus hábitos saludables actuales.
              </p>
            ) : (
              <div className="space-y-4">
                {futureRisk.interventions.map((intervention, index) => (
                  <div key={index} className="p-4 border-l-4 rounded-r-md bg-gray-50"
                    style={{
                      borderLeftColor: intervention.urgency === 'high' ? '#ef4444' :
                        intervention.urgency === 'moderate' ? '#f59e0b' : '#10b981'
                    }}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-medium capitalize">{intervention.condition}</h4>
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full
                        ${intervention.urgency === 'high' ? 'bg-red-100 text-red-800' :
                          intervention.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'}`}>
                        {intervention.urgency === 'high' ? 'Alta Prioridad' :
                          intervention.urgency === 'moderate' ? 'Prioridad Media' : 'Monitorización'}
                      </span>
                    </div>
                    <ul className="pl-5 mt-2 space-y-1 text-sm list-disc text-gray-700">
                      {intervention.actions.map((action, actionIdx) => (
                        <li key={actionIdx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progresión de Riesgo */}
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Detalle de Progresión de Riesgo</h3>
              <button
                onClick={() => toggleDetails('progression')}
                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                {showDetails.progression ? 'Ocultar Detalles' : 'Mostrar Detalles'}
              </button>
            </div>            {showDetails.progression && (
              <div className="mt-4 space-y-4">
                {Object.entries(futureRisk.riskProgression).map(([condition, data]) => (
                  <div key={condition} className="p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-medium capitalize">{condition}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${getRiskBgColor(data.currentRisk)} border ${data.currentRisk === 'high' ? 'border-red-300' : data.currentRisk === 'moderate' ? 'border-yellow-300' : 'border-green-300'}`}></span>
                        <span className="text-xs text-gray-500">&rarr;</span>
                        <span className={`inline-block w-3 h-3 rounded-full ${getRiskBgColor(data.projectedRisk)} border ${data.projectedRisk === 'high' ? 'border-red-300' : data.projectedRisk === 'moderate' ? 'border-yellow-300' : 'border-green-300'}`}></span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Factor de progresión:</span>
                      <span className="text-sm font-medium">{data.progressionFactor.toFixed(2)}x</span>
                    </div>
                    <div className="w-full h-2 mt-3 overflow-hidden bg-gray-200 rounded-full">
                      <div
                        className={`h-full ${data.projectedRisk === 'high' ? 'bg-red-500' :
                          data.projectedRisk === 'moderate' ? 'bg-yellow-500' :
                            'bg-green-500'}`}
                        style={{ width: `${Math.min(100, data.progressionFactor * 50)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showDetails.progression && (
              <p className="text-sm text-gray-600">
                Haga clic en &quot;Mostrar Detalles&quot; para ver la progresión de riesgo por condición.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-10">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing || isCalculating}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:bg-gray-100"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Atrás
        </button>
        {futureRisk && (
          <button
            type="button"
            onClick={handleNext}
            disabled={isProcessing || isCalculating}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-300"
          >
            Siguiente
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FutureRiskProjection;
