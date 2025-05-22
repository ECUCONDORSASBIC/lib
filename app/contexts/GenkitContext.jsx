'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.js';
import { useToast } from '../components/ui/Toast';
import {
  analyzeHealthRisk,
  analyzeConversation,
  generateRiskProjection,
  sendAINotification,
  checkAIServicesStatus
} from '@/services/unifiedAIService';

// Crear el contexto
const GenkitContext = createContext(null);

// Hook personalizado para usar el contexto
export const useGenkit = () => {
  const context = useContext(GenkitContext);
  if (!context) {
    throw new Error('useGenkit debe ser usado dentro de un GenkitProvider');
  }
  return context;
};

// Proveedor del contexto de Genkit con implementación completa
export const GenkitProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [servicesStatus, setServicesStatus] = useState(null);
  const [preferredProvider, setPreferredProvider] = useState('genkit'); // 'genkit' o 'vertex'
  const auth = useAuth() || {};
  const user = auth.user;
  const toast = useToast();

  // Verificar el estado de los servicios de IA al cargar
  useEffect(() => {
    const checkServices = async () => {
      try {
        const status = await checkAIServicesStatus();
        setServicesStatus(status);

        // Configurar proveedor preferido basado en disponibilidad
        if (status.recommendedProvider) {
          setPreferredProvider(status.recommendedProvider);
          console.log(`Usando proveedor de IA: ${status.recommendedProvider}`);
        }

        // Mostrar notificación si los servicios están degradados
        if (status.status === 'degraded') {
          toast?.warning?.('Algunos servicios de IA médica están en modo degradado. La respuesta podría ser más lenta.');
        } else if (status.status === 'unavailable') {
          toast?.error?.('Los servicios de IA médica no están disponibles en este momento. Algunas funciones podrían no estar operativas.');
        }
      } catch (err) {
        console.error('Error al verificar servicios de IA:', err);
      }
    };

    checkServices();

    // Verificar servicios cada 5 minutos
    const interval = setInterval(checkServices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [toast]);

  // Método para analizar datos de salud y evaluar riesgos
  const analyzeHealthData = useCallback(async (healthData) => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = user ? await user.getIdToken() : null;

      // Now use the unified service
      const result = await analyzeHealthRisk(healthData, token, preferredProvider === 'vertex');

      if (!result.success) {
        setError(result.error || 'Error en el análisis de riesgo');
        throw new Error(result.error || 'Error en el análisis de riesgo');
      }

      return result;
    } catch (err) {
      console.error('Error en analyzeHealthData:', err);
      setError(err.message || 'Error al analizar datos de salud');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [user, preferredProvider]);

  // Método para analizar conversaciones de anamnesis
  const analyzeConversationData = useCallback(async (conversation, patientId) => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = user ? await user.getIdToken() : null;

      // Use the unified service for conversation analysis
      const result = await analyzeConversation({
        text: conversation.text,
        context: conversation.context || {},
        userInput: conversation.userInput || conversation.text,
        currentTopic: conversation.currentTopic || 'general',
        previousMessages: conversation.previousMessages || []
      }, patientId, token, preferredProvider === 'vertex');

      if (result.error) {
        setError(result.error);
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      console.error('Error en analyzeConversation:', err);
      setError(err.message || 'Error al analizar la conversación');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [user, preferredProvider]);

  // Método para generar proyecciones de riesgo a futuro
  const generateFutureRiskEstimation = useCallback(async (currentData, modifications, patientId) => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = user ? await user.getIdToken() : null;

      // Use the unified service for risk projection
      const result = await generateRiskProjection(
        modifications || currentData,
        currentData,
        token,
        preferredProvider === 'vertex'
      );

      if (!result.success) {
        setError(result.error || 'Error al generar proyección de riesgo');
        throw new Error(result.error || 'Error al generar proyección de riesgo');
      }

      return result;
    } catch (err) {
      console.error('Error en generateFutureRiskEstimation:', err);
      setError(err.message || 'Error al generar estimación de riesgo');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [user, preferredProvider]);

  // Método para notificar a pacientes sobre resultados
  const notifyPatient = useCallback(async (notificationData, patientId) => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = user ? await user.getIdToken() : null;

      // Use the unified service for patient notification
      const result = await sendAINotification(
        notificationData,
        patientId,
        'patient',
        token,
        preferredProvider === 'vertex'
      );

      if (!result.success) {
        setError(result.error || 'Error al notificar al paciente');
        throw new Error(result.error || 'Error al notificar al paciente');
      }

      return result;
    } catch (err) {
      console.error('Error en notifyPatient:', err);
      setError(err.message || 'Error al notificar al paciente');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [user, preferredProvider]);

  // Método para notificar a médicos sobre resultados
  const notifyDoctor = useCallback(async (notificationData, doctorId) => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = user ? await user.getIdToken() : null;

      // Use the unified service for doctor notification
      const result = await sendAINotification(
        notificationData,
        doctorId,
        'doctor',
        token,
        preferredProvider === 'vertex'
      );

      if (!result.success) {
        setError(result.error || 'Error al notificar al médico');
        throw new Error(result.error || 'Error al notificar al médico');
      }

      return result;
    } catch (err) {
      console.error('Error en notifyDoctor:', err);
      setError(err.message || 'Error al notificar al médico');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [user, preferredProvider]);

  // Método para cambiar manualmente el proveedor preferido
  const setProvider = useCallback((provider) => {
    if (provider === 'genkit' || provider === 'vertex') {
      setPreferredProvider(provider);
      // Persist the preference
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('prefer_vertex_ai', provider === 'vertex' ? 'true' : 'false');
      }
    }
  }, []);

  // Valor del contexto con todas las funcionalidades
  const value = {
    isProcessing,
    error,
    servicesStatus,
    preferredProvider,
    setProvider,
    analyzeHealthData,
    analyzeConversation: analyzeConversationData,
    generateFutureRiskEstimation,
    notifyPatient,
    notifyDoctor,
  };

  return <GenkitContext.Provider value={value}>{children}</GenkitContext.Provider>;
};
