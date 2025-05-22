import { useRouter } from 'next/router';
import { useState } from 'react';
import { evaluateHealthRisks, generateTenYearPrediction } from '../services/genkitService';
import { notifyAvailableDoctor, notifyPatient } from '../services/notificationService';
import NotificationStep from './RiskAssessment/NotificationStep';
import PatientDataCollection from './RiskAssessment/PatientDataCollection';
import RiskEvaluation from './RiskAssessment/RiskEvaluation';
import TenYearPredictionDisplay from './TenYearPredictionDisplay';

/**
 * Componente principal que orquesta el flujo completo de evaluación de riesgos
 * utilizando GenKit para análisis e IA generativa
 */
const RiskAssessmentFlow = ({ patientId = null }) => {
  const router = useRouter();

  // Estados para los diferentes pasos del flujo
  const [currentStep, setCurrentStep] = useState('data-collection');
  const [patientData, setPatientData] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [notificationResults, setNotificationResults] = useState(null);

  // Estados para manejar carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Maneja la recopilación de datos del paciente y avanza al paso de evaluación de riesgos
   */
  const handleDataCollected = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Guardamos los datos recopilados
      const completePatientData = {
        ...data,
        id: patientId || `temp_patient_${Date.now()}`
      };

      setPatientData(completePatientData);

      // Llamamos a GenKit para evaluar riesgos
      const risks = await evaluateHealthRisks(completePatientData);
      setRiskAssessment(risks);

      // Avanzamos al siguiente paso
      setCurrentStep('risk-evaluation');
    } catch (err) {
      console.error('Error evaluating health risks:', err);
      setError(`Error al evaluar riesgos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la confirmación de evaluación de riesgos y avanza al paso de predicciones a 10 años
   */
  const handleRiskEvaluationConfirmed = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamamos a GenKit para generar predicción a 10 años
      const tenYearForecast = await generateTenYearPrediction(patientData, riskAssessment);
      setPrediction(tenYearForecast);

      // Avanzamos al siguiente paso
      setCurrentStep('ten-year-prediction');
    } catch (err) {
      console.error('Error generating prediction:', err);
      setError(`Error al generar predicción: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la confirmación de predicción y avanza al paso de notificaciones
   */
  const handlePredictionConfirmed = async () => {
    setCurrentStep('notification');
  };

  /**
   * Maneja el envío de notificaciones al paciente y al médico disponible
   */
  const handleSendNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generar mensaje personalizado para el paciente (en una app real se llamaría al servicio)
      const patientMessage = "Hemos completado su evaluación de riesgos de salud. " +
        "Por favor revise los resultados y recomendaciones en su portal de paciente.";

      // Notificar al paciente
      const patientNotification = await notifyPatient(patientData.id, patientMessage, {
        type: 'risk_assessment',
        assessmentId: `assessment_${Date.now()}`
      });

      // Crear resumen para el médico
      const doctorSummary = {
        patientId: patientData.id,
        patientName: patientData.name,
        assessmentDate: new Date().toISOString(),
        riskFactors: riskAssessment.riskFactors || [],
        riskGroups: riskAssessment.riskGroups || [],
        tenYearRisk: prediction.cardiovascularRisk || {},
        recommendedInterventions: prediction.recommendations || []
      };

      // Notificar a un médico disponible
      const doctorNotification = await notifyAvailableDoctor(
        { id: patientData.id, name: patientData.name },
        doctorSummary
      );

      // Guardar resultados de notificaciones
      setNotificationResults({
        patient: patientNotification,
        doctor: doctorNotification
      });

      setSuccess(true);
    } catch (err) {
      console.error('Error sending notifications:', err);
      setError(`Error al enviar notificaciones: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reinicia el flujo para realizar una nueva evaluación
   */
  const handleReset = () => {
    setCurrentStep('data-collection');
    setPatientData(null);
    setRiskAssessment(null);
    setPrediction(null);
    setNotificationResults(null);
    setError(null);
    setSuccess(false);
  };

  /**
   * Maneja la navegación a la página de paciente
   */
  const handleViewPatientDashboard = () => {
    if (patientId) {
      // Add a small delay to prevent navigation throttling
      setTimeout(() => {
        router.push(`/dashboard/paciente/${patientId}`);
      }, 100);
    } else {
      // Si no hay ID de paciente, volvemos al listado
      router.push('/dashboard/paciente');
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
          Evaluación de Riesgo y Predicción de Salud
        </h1>
        <p className="mt-2 text-gray-600">
          Analice factores de riesgo y obtenga predicciones personalizadas para los próximos 10 años.
        </p>
      </div>

      {/* Indicador de progreso */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between px-2">
          <div className={`flex items-center ${currentStep === 'data-collection' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`flex items-center justify-center w-8 h-8 mr-2 rounded-full ${currentStep === 'data-collection' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>1</div>
            <span className="hidden sm:inline">Recopilación de datos</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div className={`h-1 bg-blue-600 ${currentStep !== 'data-collection' ? 'w-full' : 'w-0'} transition-all duration-500`}></div>
          </div>
          <div className={`flex items-center ${currentStep === 'risk-evaluation' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`flex items-center justify-center w-8 h-8 mr-2 rounded-full ${currentStep === 'risk-evaluation' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>2</div>
            <span className="hidden sm:inline">Evaluación de riesgos</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div className={`h-1 bg-blue-600 ${currentStep === 'ten-year-prediction' || currentStep === 'notification' ? 'w-full' : 'w-0'} transition-all duration-500`}></div>
          </div>
          <div className={`flex items-center ${currentStep === 'ten-year-prediction' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`flex items-center justify-center w-8 h-8 mr-2 rounded-full ${currentStep === 'ten-year-prediction' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>3</div>
            <span className="hidden sm:inline">Predicción a 10 años</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div className={`h-1 bg-blue-600 ${currentStep === 'notification' ? 'w-full' : 'w-0'} transition-all duration-500`}></div>
          </div>
          <div className={`flex items-center ${currentStep === 'notification' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`flex items-center justify-center w-8 h-8 mr-2 rounded-full ${currentStep === 'notification' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}>4</div>
            <span className="hidden sm:inline">Notificaciones</span>
          </div>
        </div>
      </div>

      {/* Contenedor principal con mensajes de error/carga */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <span className="ml-3 text-lg text-gray-700">Procesando...</span>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-700">Se ha producido un error</h3>
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="px-4 py-2 text-sm text-red-700 bg-transparent rounded hover:bg-red-50 focus:bg-red-50"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Paso 1: Recopilación de datos del paciente */}
            {currentStep === 'data-collection' && (
              <PatientDataCollection
                patientId={patientId}
                onDataCollected={handleDataCollected}
              />
            )}

            {/* Paso 2: Evaluación de riesgos */}
            {currentStep === 'risk-evaluation' && riskAssessment && (
              <RiskEvaluation
                patientData={patientData}
                riskAssessment={riskAssessment}
                onConfirm={handleRiskEvaluationConfirmed}
                onBack={() => setCurrentStep('data-collection')}
              />
            )}

            {/* Paso 3: Predicción a 10 años */}
            {currentStep === 'ten-year-prediction' && prediction && (
              <div className="space-y-6">
                <TenYearPredictionDisplay predictionData={prediction} />
                <button
                  onClick={handlePredictionConfirmed}
                  className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Confirmar Predicción y Proceder a Notificaciones'}
                </button>
              </div>
            )}

            {/* Paso 4: Notificaciones */}
            {currentStep === 'notification' && (
              <NotificationStep
                patientData={patientData}
                riskAssessment={riskAssessment}
                prediction={prediction}
                notificationResults={notificationResults}
                onSendNotifications={handleSendNotifications}
                onBack={() => setCurrentStep('ten-year-prediction')}
                success={success}
              />
            )}
          </>
        )}
      </div>

      {/* Botones de acción inferiores */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Iniciar nueva evaluación
        </button>

        {success && (
          <button
            onClick={handleViewPatientDashboard}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Ver dashboard del paciente
          </button>
        )}
      </div>
    </div>
  );
};

export default RiskAssessmentFlow;
