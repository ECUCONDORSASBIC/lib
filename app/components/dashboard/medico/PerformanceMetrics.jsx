
const PerformanceMetrics = ({ metrics = {} }) => {
  const metricItems = [
    {
      label: 'Registro Profesional',
      value: metrics.registration ? 'Verificado' : 'Pendiente de Verificación',
      bgColor: metrics.registration ? 'bg-green-50' : 'bg-yellow-50',
      textColor: metrics.registration ? 'text-green-700' : 'text-yellow-700',
      borderColor: metrics.registration ? 'border-green-200' : 'border-yellow-200',
    },
    {
      label: 'Evaluación de Pacientes',
      value: metrics.patientReviews || 'N/A',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Frecuencia Videollamadas (30d)',
      value: metrics.videoCallFrequency || 'N/A',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
    },
    {
      label: 'Índice Altamedica',
      value: metrics.altamedicaIndex || 'No Calculado',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
    },
  ];

  return (
    // Removed bg-white, rounded, shadow, p-4. Styling is now handled by InfoCard.
    <div>
      {/* <h3 className="text-lg font-semibold mb-3 text-gray-700">Métricas Clave</h3> No es necesario, InfoCard ya tiene título */}
      <div className="space-y-3">
        {metricItems.map((metric, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border ${metric.borderColor} ${metric.bgColor}`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${metric.textColor}`}>{metric.label}</span>
              <span className={`text-sm font-semibold ${metric.textColor}`}>{metric.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceMetrics;
