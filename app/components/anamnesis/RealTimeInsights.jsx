'use client';

import { useGenkitAnalysis } from '@/hooks/useGenkitAnalysis';
import { useCallback, useEffect, useRef, useState } from 'react';

const RealTimeInsights = ({ formData, hasChanged, patientId }) => {
  const [insights, setInsights] = useState(null);
  const [lastAnalyzed, setLastAnalyzed] = useState(null);
  const { analyzeData, isAnalyzing, error } = useGenkitAnalysis();
  const timerRef = useRef(null);
  const lastFormDataRef = useRef(null);

  // Memoizar la función de análisis para evitar recrearla en cada render
  const runAnalysis = useCallback(async () => {
    if (!formData || Object.keys(formData).length === 0) return;

    try {
      // Verificar si los datos han cambiado significativamente antes de analizar
      const currentDataString = JSON.stringify(formData);
      if (lastFormDataRef.current === currentDataString) return;

      lastFormDataRef.current = currentDataString;
      const results = await analyzeData(formData, patientId);
      setInsights(results);
      setLastAnalyzed(new Date());
    } catch (err) {
      console.error("Error al obtener análisis en tiempo real:", err);
    }
  }, [formData, patientId, analyzeData]);

  // Usar useEffect con dependencias controladas y debounce
  useEffect(() => {
    if (!hasChanged) return;

    // Limpiar el timer anterior si existe
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Esperar 2 segundos de inactividad antes de analizar
    timerRef.current = setTimeout(() => {
      runAnalysis();
    }, 2000);

    // Cleanup para evitar memory leaks
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [hasChanged, runAnalysis]);

  if (!insights && !isAnalyzing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Análisis en tiempo real</h3>
        <p className="text-xs text-gray-500">
          Completa más secciones para recibir insights automáticos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Análisis en tiempo real</h3>
        {isAnalyzing && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Analizando...
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 rounded-md mb-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {insights && (
        <div className="space-y-3">
          {insights.observations && insights.observations.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Observaciones clave:</h4>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 pl-1">
                {insights.observations.map((observation, idx) => (
                  <li key={idx} className="leading-relaxed">{observation}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.suggestions && insights.suggestions.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Sugerencias:</h4>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 pl-1">
                {insights.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="leading-relaxed">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {lastAnalyzed && (
            <p className="text-xs text-gray-400 italic pt-2">
              Último análisis: {lastAnalyzed.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeInsights;
