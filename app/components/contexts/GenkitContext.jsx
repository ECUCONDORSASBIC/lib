'use client';

import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import {
  analyzeHealthRisk,
  generateRiskProjection,
  sendAINotification,
  checkAIServicesStatus
} from '@/services/unifiedAIService';

// Contexto para la integración con GenKit
const GenkitContext = createContext(null);

export const GenkitProvider = ({ children }) => {
  // Changed from a single boolean to an object for granular loading states
  const [loadingStates, setLoadingStates] = useState({
    analyzeHealth: false,
    calculateFutureRisk: false,
    notifyPatient: false,
    notifyDoctor: false,
    checkStatus: false
  });
  const [apiError, setApiError] = useState(null);
  const [servicesStatus, setServicesStatus] = useState(null);
  const [preferredProvider, setPreferredProvider] = useState('genkit'); // Default to genkit

  // Helper function to update specific loading states
  const setLoadingState = useCallback((operation, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [operation]: isLoading }));
  }, []);

  // Check AI services status on component mount
  useEffect(() => {
    const checkServices = async () => {
      setLoadingState('checkStatus', true);
      try {
        const status = await checkAIServicesStatus();
        setServicesStatus(status);

        // Set preferred provider based on availability
        if (status.recommendedProvider) {
          setPreferredProvider(status.recommendedProvider);
        }
      } catch (error) {
        console.error('Error checking AI services status:', error);
        setApiError({
          message: error.message || 'Error checking AI services status',
          type: 'StatusCheckError'
        });
      } finally {
        setLoadingState('checkStatus', false);
      }
    };

    checkServices();

    // Check services every 5 minutes
    const interval = setInterval(checkServices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setLoadingState]);

  /**
   * Calls backend API to analyze health data.
   * @param {object} patientData - The patient data to analyze.
   * @returns {Promise<{success: boolean, error?: string, ...responseData}>}
   */
  const analyzeHealthData = useCallback(async (patientData) => {
    setLoadingState('analyzeHealth', true);
    setApiError(null);
    try {
      // Get auth token - in a real implementation, you would get this from your auth context
      const token = null; // Replace with actual token

      // Use unified service for health analysis
      const result = await analyzeHealthRisk(
        patientData,
        token,
        preferredProvider === 'vertex'
      );

      return { success: true, ...result };
    } catch (error) {
      setApiError({
        message: error.message || 'Error desconocido analizando datos de salud',
        type: 'HealthAnalysisError'
      });
      return { success: false, error: error.message || 'Error desconocido analizando datos de salud' };
    } finally {
      setLoadingState('analyzeHealth', false);
    }
  }, [setLoadingState, preferredProvider]);

  /**
   * Calls backend API to calculate future risk.
   * @param {object} patientData - Patient's data.
   * @param {object} currentRiskAnalysis - Current risk analysis.
   * @returns {Promise<{success: boolean, error?: string, ...responseData}>}
   */
  const calculateFutureRisk = useCallback(async (patientData, currentRiskAnalysis) => {
    setLoadingState('calculateFutureRisk', true);
    setApiError(null);
    try {
      // Get auth token - in a real implementation, you would get this from your auth context
      const token = null; // Replace with actual token

      // Use unified service for risk projection
      const result = await generateRiskProjection(
        patientData,
        currentRiskAnalysis,
        token,
        preferredProvider === 'vertex'
      );

      return { success: true, ...result };
    } catch (error) {
      setApiError({
        message: error.message || 'Error desconocido calculando riesgo futuro',
        type: 'FutureRiskError'
      });
      return { success: false, error: error.message || 'Error desconocido calculando riesgo futuro' };
    } finally {
      setLoadingState('calculateFutureRisk', false);
    }
  }, [setLoadingState, preferredProvider]);

  /**
   * Calls backend API to send notification to patient.
   * @param {object} patientData - Patient's data.
   * @param {object} riskAnalysis - Current risk analysis.
   * @param {object} futureRisk - Calculated future risk.
   * @returns {Promise<{success: boolean, error?: string, ...responseData}>}
   */
  const notifyPatient = useCallback(async (patientData, riskAnalysis, futureRisk) => {
    setLoadingState('notifyPatient', true);
    setApiError(null);
    try {
      // Get auth token - in a real implementation, you would get this from your auth context
      const token = null; // Replace with actual token

      // Use unified service for patient notification
      const result = await sendAINotification(
        { patientData, riskAnalysis, futureRisk },
        patientData.id,
        'patient',
        token,
        preferredProvider === 'vertex'
      );

      return { success: true, ...result };
    } catch (error) {
      setApiError({
        message: error.message || 'Error desconocido al notificar al paciente',
        type: 'NotifyPatientError'
      });
      return { success: false, error: error.message || 'Error desconocido al notificar al paciente' };
    } finally {
      setLoadingState('notifyPatient', false);
    }
  }, [setLoadingState, preferredProvider]);

  /**
   * Calls backend API to send notification to doctor.
   * @param {object} patientData - Patient's data.
   * @param {object} riskAnalysis - Current risk analysis.
   * @param {object} futureRisk - Calculated future risk.
   * @param {string} [doctorId='default'] - The ID of the doctor to notify.
   * @returns {Promise<{success: boolean, error?: string, ...responseData}>}
   */
  const notifyDoctor = useCallback(async (patientData, riskAnalysis, futureRisk, doctorId = 'default') => {
    setLoadingState('notifyDoctor', true);
    setApiError(null);
    try {
      // Get auth token - in a real implementation, you would get this from your auth context
      const token = null; // Replace with actual token

      // Use unified service for doctor notification
      const result = await sendAINotification(
        { patientData, riskAnalysis, futureRisk, doctorId },
        doctorId,
        'doctor',
        token,
        preferredProvider === 'vertex'
      );

      return { success: true, ...result };
    } catch (error) {
      setApiError({
        message: error.message || 'Error desconocido al notificar al doctor',
        type: 'NotifyDoctorError'
      });
      return { success: false, error: error.message || 'Error desconocido al notificar al doctor' };
    } finally {
      setLoadingState('notifyDoctor', false);
    }
  }, [setLoadingState, preferredProvider]);

  const clearApiError = useCallback(() => {
    setApiError(null);
  }, []);

  // Method to manually change the preferred provider
  const setProvider = useCallback((provider) => {
    if (provider === 'genkit' || provider === 'vertex') {
      setPreferredProvider(provider);
      // Persist the preference
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('prefer_vertex_ai', provider === 'vertex' ? 'true' : 'false');
      }
    }
  }, []);

  // Derived global processing state
  const isProcessing = Object.values(loadingStates).some(state => state === true);

  return (
    <GenkitContext.Provider value={{
      analyzeHealthData,
      calculateFutureRisk,
      notifyPatient,
      notifyDoctor,
      isProcessing, // This is now a derived value
      loadingStates, // Expose granular states
      apiError,
      clearApiError,
      servicesStatus,
      preferredProvider,
      setProvider
    }}>
      {children}
    </GenkitContext.Provider>
  );
};

export const useGenkit = () => {
  const context = useContext(GenkitContext);
  if (!context) {
    throw new Error('useGenkit debe usarse dentro de un GenkitProvider');
  }
  return context;
};
