import { useState, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export function useConversationalAnalysis() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const analyzeConversation = useCallback(async (conversation, patientId) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/genkit/analyze-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation,
          patientId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al analizar la conversación');
      }

      const data = await response.json();
      return data.structuredData;
    } catch (err) {
      console.error('Error en análisis de conversación:', err);
      setError(err.message || 'Error en el análisis');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  return { 
    analyzeConversation,
    isProcessing,
    error
  };
}