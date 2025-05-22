import { useEffect, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LinearScale } from 'chart.js';
import LoadingIndicator from '../ui/LoadingIndicator';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, LinearScale);

const RiskVisualization = ({ 
  riskData, 
  isLoading, 
  error,
  timeframe = '10 años'
}) => {
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);

  // Convertir datos de riesgo al formato para Chart.js
  useEffect(() => {
    if (riskData && !isLoading) {
      // Extraer categorías de riesgo y sus valores
      const categories = Object.keys(riskData.riskGroups || {});
      const values = categories.map(cat => riskData.riskGroups[cat]?.riskPercentage || 0);
      
      // Colores para las diferentes categorías de riesgo
      const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',  // Rojo (cardiovascular)
        'rgba(54, 162, 235, 0.7)',  // Azul (diabetes)
        'rgba(255, 206, 86, 0.7)',  // Amarillo (cerebrovascular)
        'rgba(75, 192, 192, 0.7)',  // Verde (renal)
        'rgba(153, 102, 255, 0.7)'  // Morado (otros)
      ];
      
      // Colores para el borde
      const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));
      
      // Crear datos del gráfico
      setChartData({
        labels: categories.map(cat => {
          // Convertir snake_case a texto legible
          return cat.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }),
        datasets: [{
          data: values,
          backgroundColor: backgroundColors.slice(0, categories.length),
          borderColor: borderColors.slice(0, categories.length),
          borderWidth: 1,
        }]
      });
    }
  }, [riskData, isLoading]);

  // Opciones para el gráfico circular
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `Riesgo: ${value.toFixed(1)}%`;
          }
        }
      }
    }
  };

  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] bg-white rounded-lg shadow">
        <LoadingIndicator message="Analizando datos y calculando riesgos..." />
        <p className="mt-4 text-sm text-gray-500">
          Nuestro sistema de IA está procesando su información médica para una evaluación precisa.
        </p>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg shadow border border-red-200">
        <h3 className="text-lg font-medium text-red-700 mb-2">Error en el análisis</h3>
        <p className="text-red-600">{error}</p>
        <p className="mt-3 text-sm text-gray-700">
          Por favor, inténtelo de nuevo. Si el problema persiste, contacte con soporte técnico.
        </p>
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!riskData || !chartData) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow text-center">
        <p className="text-gray-700">No hay datos de riesgo disponibles para visualizar.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Evaluación de Riesgo a {timeframe}
      </h3>
      
      {/* Resumen del riesgo global */}
      <div className="mb-6 text-center p-4 bg-gray-50 rounded-lg">
        <h4 className="text-lg font-medium mb-2">Riesgo global</h4>
        <div className="flex justify-center items-center">
          <div className={`text-2xl font-bold px-4 py-2 rounded-full ${
            getRiskLevelClass(riskData.overallRisk?.riskLevel || 'moderate')
          }`}>
            {riskData.overallRisk?.riskPercentage?.toFixed(1) || 0}%
          </div>
          <span className="ml-2 text-gray-700">
            Nivel: <span className="font-medium">{formatRiskLevel(riskData.overallRisk?.riskLevel || 'moderate')}</span>
          </span>
        </div>
      </div>
      
      {/* Gráfico de riesgos por categoría */}
      <div className="h-[250px] mb-6">
        <Doughnut 
          data={chartData} 
          options={chartOptions}
          ref={chartRef}
        />
      </div>
      
      {/* Leyenda de categorías con detalles */}
      <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2">
        {Object.entries(riskData.riskGroups || {}).map(([category, data]) => (
          <div 
            key={category} 
            className="p-3 border rounded-lg flex flex-col"
            style={{ borderLeft: `4px solid ${getCategoryColor(category)}` }}
          >
            <div className="flex justify-between items-center mb-1">
              <h5 className="font-medium">
                {formatCategory(category)}
              </h5>
              <span className={`px-2 py-1 rounded-full text-sm ${getRiskLevelClass(data.riskLevel)}`}>
                {data.riskPercentage?.toFixed(1) || 0}%
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {data.description || `Evaluación de riesgo para ${formatCategory(category).toLowerCase()}.`}
            </p>
            {data.keyFactors && data.keyFactors.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-medium text-gray-500">Factores clave:</span>
                <ul className="text-xs text-gray-600 mt-1 ml-4 list-disc">
                  {data.keyFactors.map((factor, idx) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Recomendaciones basadas en el análisis */}
      {riskData.recommendations && riskData.recommendations.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-medium mb-3 text-gray-800">Recomendaciones</h4>
          <ul className="space-y-2">
            {riskData.recommendations.map((rec, idx) => (
              <li key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <span className="text-blue-700 mr-2">•</span>
                  <div>
                    <p className="text-sm text-gray-800">{rec.text}</p>
                    {rec.impact && (
                      <span className="text-xs font-medium text-blue-700 mt-1 inline-block">
                        Impacto: {rec.impact}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Nota de precaución */}
      <div className="mt-8 text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
        <p><strong>Nota:</strong> Esta evaluación de riesgo está basada en los datos proporcionados y modelos predictivos de IA. 
          No sustituye el diagnóstico médico profesional. Consulte siempre con su médico.
        </p>
      </div>
    </div>
  );
};

// Funciones auxiliares para formateo y estilos

// Convertir nivel de riesgo a clase CSS para colores
function getRiskLevelClass(level) {
  switch(level?.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'very_high':
    case 'very high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Formatear nivel de riesgo para visualización
function formatRiskLevel(level) {
  switch(level?.toLowerCase()) {
    case 'low':
      return 'Bajo';
    case 'moderate':
      return 'Moderado';
    case 'high':
      return 'Alto';
    case 'very_high':
    case 'very high':
      return 'Muy Alto';
    default:
      return 'Desconocido';
  }
}

// Formatear categoría para visualización
function formatCategory(category) {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Obtener color para categoría según su posición
function getCategoryColor(category) {
  const colorMap = {
    'cardiovascular': 'rgb(255, 99, 132)',
    'diabetes': 'rgb(54, 162, 235)',
    'stroke': 'rgb(255, 206, 86)',
    'renal': 'rgb(75, 192, 192)',
    'pulmonary': 'rgb(153, 102, 255)',
    'cancer': 'rgb(255, 159, 64)'
  };
  
  // Buscar la categoría por nombre o fragmento
  for (const [key, color] of Object.entries(colorMap)) {
    if (category.toLowerCase().includes(key)) {
      return color;
    }
  }
  
  // Color por defecto
  return 'rgb(201, 203, 207)';
}

export default RiskVisualization;
