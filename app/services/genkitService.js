/**
 * Servicio para integrar funcionalidades de Genkit AI para análisis médico
 * 
 * Este servicio proporciona métodos para:
 * - Análisis de anamnesis y conversaciones médicas
 * - Evaluación de riesgos de salud
 * - Proyecciones de riesgo a futuro
 * - Gestión de timeout y errores de API
 */

// Funciones para formatear y preparar datos
const formatAnalysisRequest = (data) => {
  return {
    ...data,
    timestamp: new Date().toISOString(),
    clientInfo: {
      platform: typeof window !== 'undefined' ? window.navigator.platform : 'server',
      language: typeof window !== 'undefined' ? window.navigator.language : 'es-ES',
    }
  };
};

/**
 * Analiza datos de anamnesis mediante la API de Genkit
 * @param {Object} options - Opciones del análisis
 * @param {string} options.patientId - ID del paciente
 * @param {string} options.text - Texto de la conversación
 * @param {Object} options.context - Contexto adicional (datos anteriores)
 * @returns {Promise<Object>} - Resultados del análisis
 */
export const analyzeAnamnesisData = async ({ patientId, text, context = {} }) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout

  try {
    const formattedData = formatAnalysisRequest({
      patientId,
      text,
      context,
    });

    const response = await fetch('/api/genkit/analyze-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en análisis de anamnesis:', errorData);
      return {
        error: errorData.error || 'Error en el servidor al analizar la anamnesis',
        errorDetails: errorData.details || null,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error('Error en analyzeAnamnesisData:', error);
    
    // Manejar específicamente errores de timeout
    if (error.name === 'AbortError') {
      return {
        error: 'El análisis tomó demasiado tiempo. Por favor, inténtelo de nuevo.',
        errorCode: 'TIMEOUT',
      };
    }
    
    return {
      error: error.message || 'Error al comunicarse con el servicio de análisis',
      errorCode: 'CONNECTION_ERROR',
    };
  }
};

/**
 * Analiza datos de salud para evaluación de riesgo
 * @param {Object} healthData - Datos de salud del paciente
 * @param {string} patientId - ID del paciente
 * @param {string} [accessToken] - Token de autenticación opcional
 * @returns {Promise<Object>} - Resultados de la evaluación de riesgo
 */
export const analyzeHealthRisk = async (healthData, patientId, accessToken = null) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos de timeout para análisis completo

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const formattedData = formatAnalysisRequest({
      ...healthData,
      patientId,
    });

    const response = await fetch('/api/genkit/analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify({ formData: formattedData, patientId }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en análisis de riesgo:', errorData);
      return {
        success: false,
        error: errorData.error || 'Error en el servidor al analizar el riesgo',
        errorDetails: errorData.details || null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      ...data.insights,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error('Error en analyzeHealthRisk:', error);
    
    // Manejar específicamente errores de timeout
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'El análisis de riesgo tomó demasiado tiempo. Por favor, inténtelo de nuevo.',
        errorCode: 'TIMEOUT',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Error al comunicarse con el servicio de análisis de riesgo',
      errorCode: 'CONNECTION_ERROR',
    };
  }
};

/**
 * Genera proyecciones de riesgo a futuro basadas en cambios de hábitos
 * @param {Object} currentData - Datos actuales del paciente
 * @param {Object} modifications - Modificaciones propuestas (cambios de hábitos)
 * @param {string} patientId - ID del paciente
 * @returns {Promise<Object>} - Proyecciones de riesgo
 */
export const generateRiskProjection = async (currentData, modifications, patientId) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('/api/genkit/risk-projection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentData,
        modifications,
        patientId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Error al generar proyecciones de riesgo',
      };
    }

    const data = await response.json();
    return {
      success: true,
      ...data.projection,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'La generación de proyecciones tomó demasiado tiempo',
        errorCode: 'TIMEOUT',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Error al generar proyecciones de riesgo',
      errorCode: 'CONNECTION_ERROR',
    };
  }
};

/**
 * Verifica el estado de disponibilidad de los servicios de IA
 * @returns {Promise<Object>} - Estado de los servicios
 */
export const checkAIServicesStatus = async () => {
  try {
    const response = await fetch('/api/genkit/status', {
      method: 'GET',
    });

    if (!response.ok) {
      return {
        available: false,
        fallbackAvailable: false,
        error: 'Los servicios de IA no están disponibles',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al verificar estado de servicios IA:', error);
    return {
      available: false,
      fallbackAvailable: false,
      error: error.message || 'Error al verificar servicios de IA',
    };
  }
};

/**
 * Envía notificación médica basada en análisis de IA
 * @param {Object} notificationData - Datos de la notificación
 * @param {string} recipientId - ID del destinatario
 * @param {string} recipientType - Tipo de destinatario ('patient', 'doctor')
 * @returns {Promise<Object>} - Resultado del envío
 */
export const sendAINotification = async (notificationData, recipientId, recipientType) => {
  try {
    const response = await fetch('/api/genkit/notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationData,
        recipientId,
        recipientType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Error al enviar notificación',
      };
    }

    const data = await response.json();
    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error('Error en sendAINotification:', error);
    return {
      success: false,
      error: error.message || 'Error al enviar la notificación',
    };
  }
};
