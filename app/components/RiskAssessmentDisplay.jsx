const RiskAssessmentDisplay = ({ riskAssessmentData }) => {
  // Helper function to determine color based on risk level string
  const getRiskColor = (level) => {
    if (!level) return 'gray';
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('alto') || lowerLevel.includes('crítica')) return 'red';
    if (lowerLevel.includes('medio')) return 'yellow';
    if (lowerLevel.includes('bajo')) return 'green';
    return 'gray';
  };

  if (!riskAssessmentData) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Evaluación de Riesgo</h2>
        <p className="text-gray-600">No hay datos de evaluación de riesgo disponibles.</p>
      </div>
    );
  }

  const {
    resumenGeneralRiesgo,
    factoresRiesgoIdentificados,
    gruposRiesgoPertenencia,
    recomendacionesPersonalizadas,
    alertasCriticas
  } = riskAssessmentData;

  const overallRiskColor = getRiskColor(resumenGeneralRiesgo);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Evaluación de Riesgo General</h2>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-5 h-5 rounded-full bg-${overallRiskColor}-500`}></div>
          <span className="text-lg font-medium text-gray-700">{resumenGeneralRiesgo || 'Nivel de riesgo no especificado'}</span>
        </div>
      </div>

      {alertasCriticas && alertasCriticas.length > 0 && (
        <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Alertas Críticas</h3>
          <ul className="list-disc list-inside space-y-1 text-red-600">
            {alertasCriticas.map((alerta, index) => (
              <li key={index}>{alerta}</li>
            ))}
          </ul>
        </div>
      )}

      {factoresRiesgoIdentificados && factoresRiesgoIdentificados.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Factores de Riesgo Identificados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {factoresRiesgoIdentificados.map((factor, index) => (
              <div key={index} className={`p-4 rounded-lg shadow border-l-4 bg-gray-50 border-${getRiskColor(factor.nivelRiesgoFactor)}-500`}>
                <h4 className="font-semibold text-gray-800">{factor.factor}</h4>
                <p className="text-sm text-gray-600"><span className="font-medium">Valor:</span> {factor.valorPaciente}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Nivel de Riesgo:</span> {factor.nivelRiesgoFactor}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Impacto:</span> {factor.descripcionImpacto}</p>
                {factor.condicionesAsociadas && factor.condicionesAsociadas.length > 0 && (
                  <p className="text-sm text-gray-600"><span className="font-medium">Condiciones Asociadas:</span> {factor.condicionesAsociadas.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {gruposRiesgoPertenencia && gruposRiesgoPertenencia.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Pertenencia a Grupos de Riesgo</h3>
          <div className="flex flex-wrap gap-2">
            {gruposRiesgoPertenencia.map((grupo, index) => (
              <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {grupo}
              </span>
            ))}
          </div>
        </div>
      )}

      {recomendacionesPersonalizadas && recomendacionesPersonalizadas.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Recomendaciones Personalizadas</h3>
          <div className="space-y-4">
            {recomendacionesPersonalizadas.map((rec, index) => (
              <div key={index} className="p-4 rounded-lg shadow bg-green-50 border-l-4 border-green-500">
                <h4 className="font-semibold text-gray-800">{rec.recomendacion} ({rec.prioridad || 'Prioridad no especificada'})</h4>
                <p className="text-sm text-gray-600"><span className="font-medium">Acción:</span> {rec.detalleAccion}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Objetivo:</span> {rec.objetivo}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentDisplay;
