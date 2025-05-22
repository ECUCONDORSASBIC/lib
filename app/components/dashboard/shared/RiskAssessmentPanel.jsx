"use client";

import TenYearPredictionDisplay from '@/app/components/TenYearPredictionDisplay';
import { db, ensureFirebase } from '@/lib/firebase/firebaseClient';
import { BeakerIcon, CalendarDaysIcon, ChatBubbleBottomCenterTextIcon, ClockIcon, DocumentTextIcon, ExclamationTriangleIcon, HeartIcon, InformationCircleIcon, LightBulbIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { doc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Helper function to map Spanish risk levels to English keys for styling
const mapRiskLevel = (level) => {
  if (!level) return 'unknown';
  const lowerLevel = String(level).toLowerCase(); // Ensure level is a string
  if (lowerLevel.includes('alto') || lowerLevel.includes('crítico') || lowerLevel.includes('high') || lowerLevel.includes('critical')) return 'high';
  if (lowerLevel.includes('moderado') || lowerLevel.includes('medio') || lowerLevel.includes('moderate') || lowerLevel.includes('medium')) return 'moderate';
  if (lowerLevel.includes('bajo') || lowerLevel.includes('low')) return 'low';
  return 'unknown'; // Default or unknown level
};

// Updated getRiskIcon - this is a placeholder and might need more sophisticated logic
const getRiskIcon = (factor) => {
  // Si factor es de formato antiguo (basado en type)
  if (factor && factor.type) {
    switch (factor.type.toLowerCase()) {
      case 'cardiovascular':
        return <HeartIcon className="w-6 h-6 text-red-500" />;
      case 'mental':
        return <BeakerIcon className="w-6 h-6 text-purple-500" />;
      case 'respiratory':
        return <ClockIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
    }
  }

  // Si factor es de formato nuevo (basado en factor.factor o condiciones)
  const factorText = factor && factor.factor ? String(factor.factor).toLowerCase() : '';
  const condiciones = factor && factor.condicionesAsociadas ? factor.condicionesAsociadas.join(' ').toLowerCase() : '';

  if (factorText.includes('cardio') || factorText.includes('corazón') || condiciones.includes('cardio') || condiciones.includes('corazón')) {
    return <HeartIcon className="w-6 h-6 text-red-500" />;
  }
  if (factorText.includes('diabetes') || factorText.includes('glucosa') || condiciones.includes('diabetes') || condiciones.includes('glucosa')) {
    return <BeakerIcon className="w-6 h-6 text-purple-500" />;
  }
  if (factorText.includes('hipertensión') || factorText.includes('presión arterial') || condiciones.includes('hipertensión') || condiciones.includes('presión arterial')) {
    return <ClockIcon className="w-6 h-6 text-blue-500" />;
  }
  if (factorText.includes('colesterol') || condiciones.includes('colesterol')) {
    return <SparklesIcon className="w-6 h-6 text-yellow-500" />;
  }
  if (factorText.includes('imc') || factorText.includes('peso') || factorText.includes('obesidad') || condiciones.includes('imc') || condiciones.includes('peso') || condiciones.includes('obesidad')) {
    return <InformationCircleIcon className="w-6 h-6 text-green-500" />;
  }

  return <ExclamationTriangleIcon className="w-6 h-6 text-gray-500" />; // Default
};

// Función para convertir datos del formato antiguo al nuevo
const convertOldDataToNewFormat = (oldData) => {
  if (!oldData) return { riskAssessmentData: null, tenYearPredictionData: null };

  // Si ya tiene el formato nuevo, simplemente lo devolvemos
  if (oldData.riskAssessmentData || oldData.tenYearPredictionData) {
    return oldData;
  }

  // Si tiene 'factors', convertimos al formato nuevo
  if (oldData.factors && Array.isArray(oldData.factors)) {
    // Construir una estructura que imite el nuevo formato
    const riskAssessmentData = {
      resumenGeneralRiesgo: "Evaluación de riesgos basada en datos de anamnesis",
      factoresRiesgoIdentificados: oldData.factors.map(factor => ({
        factor: factor.description || "Factor de riesgo",
        valorPaciente: "Valor no disponible en formato antiguo",
        nivelRiesgoFactor: factor.level || "desconocido",
        descripcionImpacto: factor.recommendation || "",
        condicionesAsociadas: [factor.type] || []
      })),
      gruposRiesgoPertenencia: [...new Set(oldData.factors.map(f => f.type || "general"))],
      recomendacionesPersonalizadas: oldData.factors.map(factor => ({
        recomendacion: factor.recommendation || "No hay recomendación específica",
        detalleAccion: "",
        objetivo: "Reducir riesgo de " + (factor.type || "complicaciones de salud"),
        prioridad: factor.level === "high" ? "Alta" : factor.level === "moderate" ? "Media" : "Baja"
      })),
      alertasCriticas: oldData.factors
        .filter(f => f.level === "high")
        .map(f => f.description)
    };

    return {
      riskAssessmentData,
      tenYearPredictionData: null, // No hay datos de predicción en formato antiguo
      calculatedAt: oldData.calculatedAt,
      source: oldData.source || 'converted-from-legacy'
    };
  }

  return { riskAssessmentData: null, tenYearPredictionData: null };
};

const RiskAssessmentPanel = ({ patientId }) => {
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      setError("Patient ID no proporcionado.");
      return;
    }

    // Initialize Firebase and validate db
    const initFirebase = async () => {
      try {
        await ensureFirebase();

        // Validar que db esté disponible
        if (!db) {
          console.error("La base de datos de Firestore no está inicializada correctamente");
          setLoading(false);
          setError("Error de conexión a la base de datos. Por favor, recargue la página.");
          return false;
        }
        return true;
      } catch (error) {
        console.error("Error initializing Firebase:", error);
        setLoading(false);
        setError("Error initializing database connection. Please reload the page.");
        return false;
      }
    }; let unsubscribe = () => { };

    initFirebase().then(success => {
      if (!success) return;

      try {
        const riskRef = doc(db, `patients/${patientId}/medical/riskAssessment`);

        unsubscribe = onSnapshot(
          riskRef,
          (docSnapshot) => {
            setLoading(false);
            if (docSnapshot.exists()) {
              // Guardamos los datos sin procesar
              setRawData(docSnapshot.data());
              setError(null);
            } else {
              setRawData(null);
            }
          },
          (err) => {
            console.error("Error al obtener datos de riesgo y predicción:", err);
            setError(err.message || "Error al cargar datos.");
            setLoading(false);
            setRawData(null);
          }
        );
      } catch (error) {
        console.error("Error al configurar listener de Firestore:", error);
        setError("Error de conexión a la base de datos: " + (error.message || "Error desconocido"));
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [patientId]);

  // Convertir datos del formato antiguo al nuevo si es necesario
  const fullRiskData = rawData ? convertOldDataToNewFormat(rawData) : null;

  // Extraemos los datos específicos que necesitamos
  const riskAssessmentData = fullRiskData?.riskAssessmentData;
  const tenYearPredictionData = fullRiskData?.tenYearPredictionData;
  const calculatedAt = fullRiskData?.calculatedAt || rawData?.calculatedAt;

  const getRiskLevelStyles = (levelKey) => { // levelKey is 'high', 'moderate', 'low'
    switch (levelKey) {
      case 'high':
        return 'bg-red-50 border-red-400 text-red-700';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      case 'low':
        return 'bg-green-50 border-green-400 text-green-700';
      default: // unknown or other
        return 'bg-gray-50 border-gray-300 text-gray-700';
    }
  };

  const getPriorityStyles = (priority) => {
    if (!priority) return 'border-gray-300';
    const lowerPriority = String(priority).toLowerCase();
    if (lowerPriority.includes('alta') || lowerPriority.includes('high')) return 'border-red-500';
    if (lowerPriority.includes('media') || lowerPriority.includes('medium')) return 'border-yellow-500';
    if (lowerPriority.includes('baja') || lowerPriority.includes('low')) return 'border-green-500';
    return 'border-gray-300';
  };

  // También comprobar si existen datos directos de factores que no hayan sido convertidos
  const hasLegacyFactors = rawData && rawData.factors && Array.isArray(rawData.factors) && rawData.factors.length > 0;
  const hasRiskData = riskAssessmentData || hasLegacyFactors;

  if (loading) {
    return (
      <div className="p-4 bg-white border border-gray-200 shadow-lg sm:p-6 rounded-xl">
        <h3 className="flex items-center mb-3 text-xl font-semibold text-gray-800">
          <ShieldCheckIcon className="w-6 h-6 mr-2 text-blue-600" />
          Análisis de Salud Integral
        </h3>
        <div className="mt-4 space-y-4 animate-pulse">
          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
          <div className="w-4/5 h-4 mt-2 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white border border-red-200 shadow-lg sm:p-6 rounded-xl">
        <h3 className="flex items-center mb-3 text-xl font-semibold text-gray-800">
          <ShieldCheckIcon className="w-6 h-6 mr-2 text-blue-600" />
          Análisis de Salud Integral
        </h3>
        <div className="p-3 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
          <ExclamationTriangleIcon className="w-5 h-5 inline mr-1.5" />
          Error al cargar los datos: {error}
        </div>
      </div>
    );
  }

  // PARA DEPURACIÓN: Mostrar los datos en bruto en la consola
  console.log("RiskAssessmentPanel - Raw Data:", rawData);
  console.log("RiskAssessmentPanel - Processed Data:", fullRiskData);

  if (!hasRiskData && !tenYearPredictionData) {
    return (
      <div className="p-4 bg-white border border-gray-200 shadow-lg sm:p-6 rounded-xl">
        <h3 className="flex items-center mb-3 text-xl font-semibold text-gray-800">
          <ShieldCheckIcon className="w-6 h-6 mr-2 text-blue-600" />
          Análisis de Salud Integral
        </h3>
        <div className="p-3 text-sm text-blue-700 border border-blue-200 rounded-md bg-blue-50">
          <InformationCircleIcon className="w-5 h-5 inline mr-1.5" />
          No hay datos de análisis de salud disponibles para este paciente o aún no se han procesado.
        </div>
      </div>
    );
  }

  // Preparamos los factores de riesgo - ya sea del formato nuevo o antiguo
  const factorsToRender = riskAssessmentData?.factoresRiesgoIdentificados ||
    (rawData?.factors && rawData.factors.map(f => ({
      factor: f.description,
      nivelRiesgoFactor: f.level,
      descripcionImpacto: f.recommendation,
      condicionesAsociadas: [f.type]
    })));

  // Preparamos las recomendaciones personalizadas
  const recommendationsToRender = riskAssessmentData?.recomendacionesPersonalizadas ||
    (rawData?.factors && rawData.factors.map(f => ({
      recomendacion: f.recommendation || "No hay recomendación específica",
      detalleAccion: "",
      objetivo: `Reducir riesgo de ${f.type || "complicaciones de salud"}`,
      prioridad: f.level === "high" ? "Alta" : f.level === "moderate" ? "Media" : "Baja"
    })));

  return (
    <div className="p-4 space-y-8 bg-white border border-gray-200 shadow-lg sm:p-6 rounded-xl">
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="flex items-center text-2xl font-semibold text-gray-800">
            <ShieldCheckIcon className="w-8 h-8 mr-3 text-blue-600" />
            Análisis de Salud Integral
          </h3>
          {calculatedAt && (
            <p className="mt-1 text-xs text-gray-500 whitespace-nowrap">
              <CalendarDaysIcon className="inline w-4 h-4 mr-1 text-gray-400" />
              Actualizado: {new Date(calculatedAt.toDate ? calculatedAt.toDate() : calculatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Risk Assessment Section */}
        {hasRiskData && (
          <div className="p-4 mb-8 border border-gray-200 rounded-lg bg-slate-50">
            <h4 className="flex items-center mb-3 text-xl font-semibold text-gray-700">
              <DocumentTextIcon className="w-6 h-6 mr-2 text-indigo-600" />
              Evaluación de Riesgos Actual
            </h4>
            {/* Resumen General */}
            {riskAssessmentData?.resumenGeneralRiesgo && (
              <div className="p-3 mb-4 border border-indigo-200 rounded-md bg-indigo-50">
                <h5 className="mb-1 text-sm font-semibold text-indigo-700">Resumen General del Riesgo</h5>
                <p className="text-sm text-indigo-600">{riskAssessmentData.resumenGeneralRiesgo}</p>
              </div>
            )}

            {/* Factores de Riesgo Identificados */}
            {factorsToRender && factorsToRender.length > 0 && (
              <div className="mb-4">
                <h5 className="flex items-center mb-2 text-sm font-semibold text-gray-700">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-1.5 text-yellow-600" />
                  Factores de Riesgo Clave
                </h5>
                <div className="space-y-2.5">
                  {factorsToRender.map((factor, index) => (
                    <div
                      key={`factor-${index}`}
                      className={`rounded-md border p-2.5 ${getRiskLevelStyles(mapRiskLevel(factor.nivelRiesgoFactor))}`}
                    >
                      <div className="flex items-start mb-1">
                        <span className="mr-2 pt-0.5 shrink-0">{getRiskIcon(factor)}</span>
                        <div className="flex-grow">
                          <p className="text-xs font-medium">{factor.factor}</p>
                          {factor.valorPaciente && <p className="text-xs opacity-80">Valor: {factor.valorPaciente}</p>}
                        </div>
                        <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full opacity-90 whitespace-nowrap ${getRiskLevelStyles(mapRiskLevel(factor.nivelRiesgoFactor))}`}>
                          {factor.nivelRiesgoFactor || 'N/A'}
                        </span>
                      </div>
                      {factor.descripcionImpacto && <p className="text-xs opacity-90 pl-7">{factor.descripcionImpacto}</p>}
                      {factor.condicionesAsociadas && factor.condicionesAsociadas.length > 0 && (
                        <div className="mt-1 pl-7">
                          <p className="text-xs font-medium opacity-70">Asociado con:</p>
                          <ul className="text-xs list-disc list-inside opacity-70">
                            {factor.condicionesAsociadas.map((cond, i) => <li key={`cond-${i}`}>{cond}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grupos de Riesgo de Pertenencia */}
            {riskAssessmentData?.gruposRiesgoPertenencia && riskAssessmentData.gruposRiesgoPertenencia.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 mr-1.5 text-gray-500" />
                  Grupos de Riesgo
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {riskAssessmentData.gruposRiesgoPertenencia.map((grupo, index) => (
                    <span key={`grupo-${index}`} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full border border-gray-300">
                      {grupo}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendaciones Personalizadas */}
            {recommendationsToRender && recommendationsToRender.length > 0 && (
              <div className="mb-4">
                <h5 className="flex items-center mb-2 text-sm font-semibold text-gray-700">
                  <LightBulbIcon className="w-5 h-5 mr-1.5 text-green-600" />
                  Recomendaciones Clave
                </h5>
                <div className="space-y-2.5">
                  {recommendationsToRender.map((rec, index) => (
                    <div key={`rec-${index}`} className={`p-2.5 border-l-4 rounded-r-md bg-gray-50 ${getPriorityStyles(rec.prioridad)}`}>
                      <p className="text-xs font-medium text-gray-800">{rec.recomendacion}</p>
                      {rec.detalleAccion && <p className="text-xs text-gray-600 mt-0.5">{rec.detalleAccion}</p>}
                      {rec.objetivo && <p className="text-xs text-gray-500 mt-0.5"><strong>Objetivo:</strong> {rec.objetivo}</p>}
                      {rec.prioridad && <p className="mt-1 text-xs font-semibold">Prioridad: {rec.prioridad}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alertas Críticas */}
            {riskAssessmentData?.alertasCriticas && riskAssessmentData.alertasCriticas.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-red-700 mb-1.5 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-1.5" />
                  Alertas Críticas
                </h5>
                <div className="space-y-2">
                  {riskAssessmentData.alertasCriticas.map((alerta, index) => (
                    <div key={`alerta-${index}`} className="p-2.5 bg-red-50 text-red-700 border border-red-300 rounded-md text-xs">
                      {alerta}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ten Year Prediction Section */}
        {tenYearPredictionData ? (
          <div className="p-4 border border-gray-200 rounded-lg bg-slate-50">
            {/* TenYearPredictionDisplay will handle its own title and structure */}
            <TenYearPredictionDisplay predictionData={tenYearPredictionData} />
          </div>
        ) : (
          <div className="p-4 border border-gray-200 rounded-lg bg-slate-50">
            <h2 className="flex items-center mb-3 text-xl font-semibold text-gray-700">
              <CalendarDaysIcon className="w-6 h-6 mr-2 text-purple-600" />
              Predicción de Salud a 10 Años
            </h2>
            <p className="text-sm text-gray-500">No hay datos de predicción a 10 años disponibles.</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          href={`/dashboard/paciente/${patientId}/evaluacion-riesgo-completa`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          Ver evaluación completa y detallada
        </Link>
      </div>

      <div className="pt-4 mt-6 text-xs text-gray-500 border-t border-gray-200">
        <p className="flex items-center">
          <ChatBubbleBottomCenterTextIcon className="w-4 h-4 mr-1.5" />
          Este análisis es generado por un sistema de IA y no reemplaza el criterio médico profesional. Consulte siempre a su médico.
        </p>
      </div>
    </div>
  );
};

export default RiskAssessmentPanel;
