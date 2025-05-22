'use client';

import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { useAnamnesisForm } from '@/hooks/useAnamnesisForm';
import { useEffect, useRef, useState } from 'react';

export default function StableAnamnesisProvider({
  children,
  patientId,
  user,
  formSteps,
  minStabilityTimeMs = 1500,
  maxWaitTimeMs = 10000 // Tiempo máximo de espera antes de mostrar el formulario de todos modos
}) {
  const anamnesisForm = useAnamnesisForm(patientId, user, formSteps);
  const [isStable, setIsStable] = useState(false);
  const [hasMinimumData, setHasMinimumData] = useState(false);
  const { loading, formData, error, effectiveUserId } = anamnesisForm;

  const stabilityTimerRef = useRef(null);
  const forceRenderTimerRef = useRef(null);
  const initialLoadTimeRef = useRef(Date.now());

  // Verificar si tenemos los datos mínimos necesarios para renderizar
  useEffect(() => {
    // Condición más flexible - o tenemos un ID de usuario efectivo y algún dato en formData
    // o hemos esperado demasiado tiempo
    if (
      (effectiveUserId && formData && Object.keys(formData).length > 0) ||
      (Date.now() - initialLoadTimeRef.current > maxWaitTimeMs && !loading)
    ) {
      console.log("[StableAnamnesisProvider] Detected minimum required data or max wait time reached");
      setHasMinimumData(true);
    }
  }, [formData, effectiveUserId, loading, maxWaitTimeMs]);

  // Timer de estabilidad para prevenir parpadeo de UI
  useEffect(() => {
    // Limpiar cualquier timer existente
    if (stabilityTimerRef.current) {
      clearTimeout(stabilityTimerRef.current);
      stabilityTimerRef.current = null;
    }

    // Force render después del tiempo máximo de espera
    if (!forceRenderTimerRef.current) {
      forceRenderTimerRef.current = setTimeout(() => {
        console.log('[StableAnamnesisProvider] Maximum wait time reached, forcing render');
        setIsStable(true);
      }, maxWaitTimeMs);
    }

    if (!loading && hasMinimumData) {
      console.log("[StableAnamnesisProvider] Starting stability timer");
      stabilityTimerRef.current = setTimeout(() => {
        console.log('[StableAnamnesisProvider] Form data considered stable');
        setIsStable(true);
      }, minStabilityTimeMs);
    }

    return () => {
      if (stabilityTimerRef.current) {
        clearTimeout(stabilityTimerRef.current);
      }
    };
  }, [loading, hasMinimumData, minStabilityTimeMs, maxWaitTimeMs]);

  // Limpiar el timer de forzado al desmontar
  useEffect(() => {
    return () => {
      if (forceRenderTimerRef.current) {
        clearTimeout(forceRenderTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Log para depuración para ver si estamos atascados en un ciclo
    console.log('[StableAnamnesisProvider] State:', {
      loading,
      hasMinimumData,
      isStable,
      hasData: formData && Object.keys(formData).length > 0,
      hasUser: Boolean(effectiveUserId),
      elapsedTime: Date.now() - initialLoadTimeRef.current
    });
  }, [loading, hasMinimumData, isStable, formData, effectiveUserId]);

  if (error) {
    return (
      <div className="p-8 rounded-lg bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[200px] max-w-lg mx-auto text-center">
          <div className="h-10 w-10 text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar el formulario</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => setIsStable(true)}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
            >
              Continuar de todos modos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isStable) {
    const getLoadingMessage = () => {
      if (loading) return "Cargando datos de anamnesis...";
      if (!effectiveUserId) return "Verificando autenticación...";
      if (!hasMinimumData) return "Preparando estructura del formulario...";
      return "Estabilizando datos del formulario...";
    };

    const elapsedTime = Date.now() - initialLoadTimeRef.current;
    const showSkipButton = elapsedTime > 5000; // Mostrar botón para saltarse la espera después de 5 segundos

    return (
      <div className="p-8 rounded-lg bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <LoadingIndicator
            message={getLoadingMessage()}
            size="medium"
            variant="primary"
          />
          <p className="text-gray-500 text-sm mt-4 max-w-xs text-center">
            Esto puede tomar algunos segundos mientras aseguramos que todos los datos estén disponibles
          </p>

          {showSkipButton && (
            <button
              onClick={() => setIsStable(true)}
              className="mt-6 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Continuar sin esperar
            </button>
          )}
        </div>
      </div>
    );
  }

  // Proporcionar los datos del formulario a los hijos
  return children(anamnesisForm);
}
