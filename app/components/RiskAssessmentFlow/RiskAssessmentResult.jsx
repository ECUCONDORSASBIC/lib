
const RiskAssessmentResult = ({ patientData, riskAnalysis, onNext, onBack }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultado de Evaluación de Riesgo</h2>
      <div className="mb-6">
        <p className="text-gray-700 mb-2"><span className="font-medium">Paciente:</span> {patientData?.name}</p>
        <p className="text-gray-700 mb-2"><span className="font-medium">Edad:</span> {patientData?.age}</p>
        {/* Puedes mostrar más datos relevantes aquí */}
      </div>
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">Riesgo Calculado</h3>
        <div className="p-4 bg-gray-50 rounded border">
          {/* Muestra el análisis de riesgo, ajusta según tu estructura */}
          <p className="text-lg font-bold text-orange-600">{riskAnalysis?.riskLevel || 'Desconocido'}</p>
          <p className="text-gray-600 mt-2">{riskAnalysis?.description || 'Sin descripción disponible.'}</p>
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Volver
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default RiskAssessmentResult;
