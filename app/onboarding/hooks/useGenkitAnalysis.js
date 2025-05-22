/**
 * Hook para la integración con servicios de IA para análisis médico
 *
 * Este hook provee funciones para:
 * 1. Análisis de datos médicos estructurados (analyzeData)
 * 2. Análisis conversacional para anamnesis (analyzeConversation)
 *
 * La función analyzeConversation soporta:
 * - Comunicación con los endpoints de Genkit y Vertex AI
 * - Manejo de timeouts y errores
 * - Adaptación a preferencias de accesibilidad
 * - Gestión automática de tokens de autenticación
 * - Selección dinámica de implementación (principal o alternativa)
 */
import { useAuth } from '@/app/contexts/AuthContext';
import { getConversationAIRoute, recordGenkitFailure, resetGenkitFailures, shouldUseAlternativeImplementation } from '@/utils/aiSelector';
import { useCallback, useEffect, useState } from 'react';

export function useGenkitAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Helper function to handle API responses consistently
  const handleApiResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
      console.error('API error response:', data);
      throw new Error(data.error || data.details || 'Error en la comunicación con el servidor');
    }

    return data;
  };

  const analyzeData = useCallback(async (formData, patientId) => {
    setIsAnalyzing(true);
    setError(null);
    setInsights(null); // Clear previous insights

    try {
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error("User not authenticated.");
      }

      const response = await fetch('/api/genkit/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          formData,
          patientId
        })
      });

      const data = await handleApiResponse(response);

      setInsights(data.insights);
      return data.insights;
    } catch (err) {
      console.error('Error en análisis:', err);
      setError(err.message || 'Error en el análisis');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user]);  // Track whether to use the alternative implementation
  const [useAltImplementation, setUseAltImplementation] = useState(false);

  // Check if we should use the alternative implementation on mount and token changes
  useEffect(() => {
    setUseAltImplementation(shouldUseAlternativeImplementation());
  }, [user]);

  const analyzeConversation = useCallback(async (conversationContext, patientId) => {
    setIsAnalyzing(true);
    setError(null);
    // Note: setInsights might not be relevant here, as the response structure is different
    // and typically handled directly by the ConversationalAnamnesis component.
    // However, if you want to store raw conversation analysis results, you can adapt this.

    try {
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error("User not authenticated.");
      }

      // Using AbortController for timeout handling on the frontend
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      // Enriquecer el contexto de la conversación con información del navegador
      const enhancedContext = {
        ...conversationContext,
        userAgent: navigator.userAgent,
        // Añadir preferencias de accesibilidad si están disponibles
        accessibilityPreferences: {
          simplified: localStorage.getItem('accessibility_simplified') === 'true',
          voiceEnabled: localStorage.getItem('accessibility_voice') === 'true' ||
            (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        }
      };

      // Get the appropriate API route based on current state
      const apiRoute = getConversationAIRoute(useAltImplementation);

      try {
        const response = await fetch(apiRoute, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationContext: enhancedContext,
            patientId
          }),
          signal: controller.signal
        });

        clearTimeout(timeout); // Clear the timeout if the request completes
        const result = await handleApiResponse(response);

        // If successful with primary implementation, reset failure counter
        if (!useAltImplementation) {
          resetGenkitFailures();
        }

        return result;
      } catch (fetchError) {
        clearTimeout(timeout);

        // If using primary implementation and it failed, record the failure
        // and try the alternative implementation as a fallback
        if (!useAltImplementation) {
          recordGenkitFailure();

          // If this was the primary implementation that failed, try the alternative
          console.log("Primary implementation failed, trying alternative...");
          setUseAltImplementation(true);

          // Try the alternative implementation immediately as fallback
          const altApiRoute = getConversationAIRoute(true);

          try {
            const altController = new AbortController();
            const altTimeout = setTimeout(() => altController.abort(), 15000);

            const altResponse = await fetch(altApiRoute, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                conversationContext: enhancedContext,
                patientId
              }),
              signal: altController.signal
            });

            clearTimeout(altTimeout);
            return await handleApiResponse(altResponse);
          } catch (altFetchError) {
            // Both implementations failed
            if (altFetchError.name === 'AbortError') {
              throw new Error('La solicitud de conversación excedió el tiempo límite. Por favor, inténtelo de nuevo.');
            }
            throw altFetchError;
          }
        }

        if (fetchError.name === 'AbortError') {
          throw new Error('La solicitud de conversación excedió el tiempo límite. Por favor, inténtelo de nuevo.');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Error en análisis de conversación:', err);
      setError(err.message || 'Error en el análisis de la conversación');
      throw err; // Re-throw to be caught by the calling component
    } finally {
      setIsAnalyzing(false);
    }
  }, [user]);

  return { analyzeData, analyzeConversation, isAnalyzing, insights, error };
}
