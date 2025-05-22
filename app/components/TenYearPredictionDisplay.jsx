
import { CalendarDaysIcon, ChartBarIcon, HeartIcon, SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const TenYearPredictionDisplay = ({ predictionData }) => {
  if (!predictionData) {
    return (
      <div className="space-y-3">
        <h2 className="flex items-center text-xl font-semibold text-gray-800">
          <CalendarDaysIcon className="w-6 h-6 mr-2 text-purple-600" />
          Predicción de Salud a 10 Años
        </h2>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="mb-3 text-gray-400">
              <ChartBarIcon className="w-10 h-10" />
            </div>
            <p className="text-sm text-gray-600">No hay suficientes datos para generar una predicción personalizada.</p>
            <p className="mt-2 text-xs text-gray-500">Complete su anamnesis para obtener una proyección de salud a 10 años.</p>
          </div>
        </div>
      </div>
    );
  }

  // Destructure prediction data with default values to prevent errors
  const {
    resumenPrediccion = '',
    prediccionesEspecificas = [],
    impactoPotencialIntervenciones = [],
    consejosProactivosGenerales = [],
    fechaCalculo = null
  } = predictionData;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center text-xl font-semibold text-gray-800">
          <CalendarDaysIcon className="w-6 h-6 mr-2 text-purple-600" />
          Predicción de Salud a 10 Años
        </h2>
        {fechaCalculo && (
          <p className="text-xs text-gray-500">
            Calculado: {new Date(fechaCalculo.toDate ? fechaCalculo.toDate() : fechaCalculo).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Resumen de predicción */}
      {resumenPrediccion && (
        <div className="p-3 border border-purple-200 rounded-md bg-purple-50">
          <p className="text-sm text-purple-800">{resumenPrediccion}</p>
        </div>
      )}

      {/* Predicciones específicas */}
      {prediccionesEspecificas.length > 0 && (
        <div className="mt-4">
          <h3 className="flex items-center mb-3 text-base font-medium text-gray-700">
            <ChartBarIcon className="w-5 h-5 mr-1.5 text-blue-600" />
            Predicciones Específicas
          </h3>
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
            {prediccionesEspecificas.map((pred, index) => (
              <div 
                key={`pred-${index}`} 
                className="p-3 border border-blue-200 rounded-lg bg-blue-50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start mb-2">
                  <HeartIcon className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">{pred.condicion}</h4>
                    <p className="text-xs text-blue-700 font-medium mt-0.5">
                      Probabilidad a 10 años: <span className="font-bold">{pred.probabilidad10AnosBase}</span>
                    </p>
                  </div>
                </div>
                
                {pred.factoresInfluyentes?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 font-medium">Factores influyentes:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pred.factoresInfluyentes.map((factor, i) => (
                        <span key={`factor-${i}`} className="text-xs bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {pred.proyeccionValoresClave?.length > 0 && (
                  <div className="mt-2 border-t border-blue-100 pt-2">
                    <p className="text-xs text-gray-700 font-medium">Proyección a 10 años:</p>
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {pred.proyeccionValoresClave.map((val, i) => (
                        <div key={`val-${i}`} className="text-xs bg-white p-1.5 rounded border border-blue-100">
                          <span className="font-medium text-blue-800">{val.parametro}:</span> 
                          <span className="text-blue-700">{val.valorProyectado}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impacto Potencial de Intervenciones */}
      {impactoPotencialIntervenciones.length > 0 && (
        <div className="mt-5">
          <h3 className="flex items-center mb-3 text-base font-medium text-gray-700">
            <SparklesIcon className="w-5 h-5 mr-1.5 text-green-600" />
            Impacto de Intervenciones Sugeridas
          </h3>
          <div className="space-y-3">
            {impactoPotencialIntervenciones.map((intervencion, index) => (
              <div 
                key={`interv-${index}`} 
                className="p-3 border border-green-200 rounded-lg bg-green-50"
              >
                <h4 className="text-sm font-semibold text-green-800 flex items-center">
                  <SparklesIcon className="w-4 h-4 mr-1.5 text-green-600" />
                  {intervencion.intervencionSugerida}
                </h4>
                
                {intervencion.reduccionEstimadaRiesgoECV && (
                  <div className="mt-2 inline-block bg-white text-green-800 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
                    Reducción de riesgo: {intervencion.reduccionEstimadaRiesgoECV}
                  </div>
                )}
                
                {intervencion.mejoraProyectadaValores?.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-green-100">
                    <p className="text-xs text-green-800 font-medium">Beneficios esperados:</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {intervencion.mejoraProyectadaValores.map((val, i) => (
                        <span key={`mejora-${i}`} className="text-xs bg-white text-green-700 px-2 py-1 rounded border border-green-200">
                          {val.parametro}: {val.mejoraEstimada}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consejos Proactivos */}
      {consejosProactivosGenerales.length > 0 && (
        <div className="mt-5 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="flex items-center mb-2 text-base font-medium text-gray-700">
            <InformationCircleIcon className="w-5 h-5 mr-1.5 text-indigo-600" />
            Consejos Proactivos Generales
          </h3>
          <div className="mt-2 space-y-2">
            {consejosProactivosGenerales.map((consejo, index) => (
              <div key={`consejo-${index}`} className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 mt-1.5 mr-2 bg-indigo-500 rounded-full"></span>
                <p className="text-xs text-gray-700">{consejo}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Nota de IA */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 italic">
          Esta predicción es generada por un modelo de IA y debe ser validada por un profesional médico. 
          Los resultados pueden variar según factores no considerados en el análisis.  
        </p>
      </div>
    </div>
  );
};

export default TenYearPredictionDisplay;
