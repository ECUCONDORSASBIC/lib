import { useState } from 'react';
import { useGenkit } from '../contexts/GenkitContext';
import FutureRiskProjection from './FutureRiskProjection';
import NotificationSystem from './NotificationSystem';
import RiskAssessmentResult from './RiskAssessmentResult';

// Paso 1: Recopilación de datos del paciente (puedes personalizar este formulario)
function PatientDataForm({ onSubmit, initialData }) {
  const [form, setForm] = useState(initialData || {
    name: '',
    age: '',
    bmi: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    glucose: '',
    cholesterol: '',
    smoker: false,
    physicalActivity: 'moderate',
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validación simple
    if (!form.name || !form.age || !form.bmi || !form.bloodPressureSystolic || !form.bloodPressureDiastolic || !form.glucose || !form.cholesterol) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    setError(null);
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="mb-4 text-xl font-semibold text-center text-gray-800">Datos del Paciente</h2>
      {error && <div className="p-2 text-red-700 bg-red-100 rounded">{error}</div>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border rounded text-gray-900" required />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Edad</label>
          <input type="number" name="age" value={form.age} onChange={handleChange} className="w-full px-3 py-2 border rounded text-gray-900" required />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">IMC</label>
          <input type="number" step="0.1" name="bmi" value={form.bmi} onChange={handleChange} className="w-full px-3 py-2 border rounded text-gray-900" required />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Presión Sistólica</label>
          <input type="number" name="bloodPressureSystolic" value={form.bloodPressureSystolic} onChange={handleChange} className="w-full px-3 py-2 border rounded text-gray-900" required />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Presión Diastólica</label>
          <input type="number" name="bloodPressureDiastolic" value={form.bloodPressureDiastolic} onChange={handleChange} className="w-full px-3 py-2 border rounded text-gray-900" required />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Glucosa (mg/dL)</label>
          <input type="number" name="glucose" value={form.glucose} onChange={handleChange} className="w-full px-3 py-2 border rounded text-gray-900" required />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Colesterol (mg/dL)</label>
          <input type="number" name="cholesterol" value={form.cholesterol} onChange={handleChange} className="w-full px-3 py-2 border rounded text-gray-900" required />
        </div>
        <div className="flex items-center mt-6">
          <input type="checkbox" name="smoker" checked={form.smoker} onChange={handleChange} className="mr-2" />
          <label className="text-sm text-gray-700">Fumador</label>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Actividad física</label>
          <select name="physicalActivity" value={form.physicalActivity} onChange={handleChange} className="w-full px-3 py-2 border rounded">
            <option value="low">Baja</option>
            <option value="moderate">Moderada</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Siguiente</button>
      </div>
    </form>
  );
}

const RiskAssessmentFlow = ({ patientId, onComplete }) => {
  const { analyzeHealthData, isProcessing, apiError } = useGenkit(); // Changed analyzeRisk to analyzeHealthData
  const [step, setStep] = useState(0);
  const [patientData, setPatientData] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [futureRisk, setFutureRisk] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Paso 1: Formulario de datos
  if (step === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-xl">
        <PatientDataForm
          initialData={patientData} // Pre-fill if coming back
          onSubmit={async (formData) => {
            setPatientData(formData);
            setRiskAnalysis(null); // Clear previous analysis
            setLocalError(null);   // Clear previous local errors

            if (typeof analyzeHealthData !== 'function') {
              console.error("analyzeHealthData function is not available from useGenkit.");
              setLocalError('El servicio de análisis de riesgo no está disponible actualmente. Por favor, intente más tarde.');
              return;
            }

            try {
              const analysisPayload = { ...formData, patientId };
              const result = await analyzeHealthData(analysisPayload);

              if (result && result.success) {
                const { success, ...analysisData } = result; // Destructure to get actual analysis data
                setRiskAnalysis(analysisData); // Store data like riskGroups, overallRisk
                setStep(1); // Proceed to next step only on success
              } else {
                const errorMessage = result?.error || result?.message || 'La evaluación de riesgo no se completó correctamente o devolvió datos inesperados.';
                console.error("Risk analysis failed or returned unexpected data:", result);
                setLocalError(errorMessage);
                // Stay on step 0 to show error with the form
              }
            } catch (error) {
              console.error("Error during analyzeHealthData API call:", error);
              setLocalError(error.message || 'Ocurrió un error inesperado durante el análisis de riesgo. Por favor, intente de nuevo.');
              // Stay on step 0
            }
          }}
        />
        {/* Display local error for step 0 */}
        {localError && (
          <div className="p-3 mt-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">
            {localError}
          </div>
        )}
        {/* Display processing state for step 0 */}
        {isProcessing && (
          <div className="mt-4 text-center text-blue-600">Analizando datos, por favor espere...</div>
        )}
      </div>
    );
  }

  // Paso 2: Resultados de riesgo
  if (step === 1 && riskAnalysis) {
    return (
      <RiskAssessmentResult
        patientData={patientData}
        riskAnalysis={riskAnalysis}
        onNext={() => setStep(2)}
        onBack={() => {
          setStep(0);
          setLocalError(null); // Clear local error when going back
        }}
      />
    );
  }

  // Paso 3: Proyección de riesgo a futuro
  if (step === 2 && riskAnalysis) {
    return (
      <FutureRiskProjection
        patientData={patientData}
        riskAnalysis={riskAnalysis}
        onNext={(future) => {
          setFutureRisk(future);
          setStep(3);
        }}
        onBack={() => setStep(1)}
      />
    );
  }

  // Paso 4: Notificaciones
  if (step === 3 && riskAnalysis && futureRisk) {
    return (
      <NotificationSystem
        patientData={patientData}
        riskAnalysis={riskAnalysis}
        futureRisk={futureRisk}
        onBack={() => setStep(2)}
        onComplete={onComplete}
      />
    );
  }

  // Cargando o error general (fallback if no step condition is met)
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
      {isProcessing ? (
        <div className="text-lg text-blue-600">Procesando su solicitud...</div>
      ) : apiError ? (
        <div className="w-full max-w-md p-4 text-red-700 bg-red-100 border border-red-300 rounded-md">
          <p className="text-lg font-semibold text-center">Error en la Aplicación</p>
          <p className="mt-2 text-center">{typeof apiError === 'string' ? apiError : 'Ha ocurrido un error procesando su solicitud. Por favor, intente más tarde.'}</p>
        </div>
      ) : (
        <div className="text-gray-700">
          <p>No se puede mostrar el contenido solicitado en este momento.</p>
          <button
            onClick={() => {
              setStep(0);
              setPatientData(null);
              setRiskAnalysis(null);
              setFutureRisk(null);
              setLocalError(null);
            }}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reiniciar Flujo
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentFlow;
