/**
 * AI Service Selector Utility
 *
 * This utility helps determine which AI service implementation to use
 * based on availability and configuration preferences.
 */

/**
 * Retry configuration settings for AI service calls
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffFactor: 1.5,
  maxDelayMs: 10000
};

/**
 * Returns the appropriate API route for conversation AI functionality
 * @param {boolean} forceAltImplementation - Force the use of the alternative implementation
 * @returns {string} - The appropriate API route path
 */
export function getConversationAIRoute(forceAltImplementation = false) {
  // Check if we should force the alternative implementation
  // This can be set based on user preferences or system requirements
  if (forceAltImplementation || !process.env.NEXT_PUBLIC_USE_GENKIT || shouldUseAlternativeImplementation()) {
    return '/api/genkit/conversation-alt';
  }

  // Default to the primary implementation
  return '/api/genkit/conversation';
}

/**
 * Returns the appropriate API route for health risk analysis
 * @param {boolean} forceVertexAI - Force the use of Vertex AI
 * @returns {string} - The appropriate API route path
 */
export function getHealthRiskAnalysisRoute(forceVertexAI = false) {
  if (forceVertexAI || shouldUseAlternativeImplementation()) {
    return '/api/ai/analyze-health'; // Vertex AI implementation
  }
  return '/api/genkit/analyze-health'; // Genkit implementation
}

/**
 * Returns the appropriate API route for future risk projection
 * @param {boolean} forceVertexAI - Force the use of Vertex AI
 * @returns {string} - The appropriate API route path
 */
export function getFutureRiskProjectionRoute(forceVertexAI = false) {
  if (forceVertexAI || shouldUseAlternativeImplementation()) {
    return '/api/ai/future-risk'; // Vertex AI implementation
  }
  return '/api/genkit/risk-projection'; // Genkit implementation
}

/**
 * Returns the appropriate API route for anamnesis question generation
 * @param {boolean} forceVertexAI - Force the use of Vertex AI
 * @returns {string} - The appropriate API route path
 */
export function getAnamnesisQuestionRoute(forceVertexAI = false) {
  if (forceVertexAI || shouldUseAlternativeImplementation()) {
    return '/api/ai/generate-anamnesis-question'; // Vertex AI implementation
  }
  return '/api/genkit/generate-anamnesis-question'; // Genkit implementation
}

/**
 * Returns the appropriate API route for AI notification processing
 * @param {boolean} forceVertexAI - Force the use of Vertex AI
 * @returns {string} - The appropriate API route path
 */
export function getAINotificationRoute(forceVertexAI = false) {
  if (forceVertexAI || shouldUseAlternativeImplementation()) {
    return '/api/ai/notification'; // Vertex AI implementation
  }
  return '/api/genkit/notification'; // Genkit implementation
}

/**
 * Detects if running in an environment where Genkit might not work properly
 * @returns {boolean} - Whether to use the alternative implementation
 */
export function shouldUseAlternativeImplementation() {
  // Consider environment factors like browser issues or server issues
  // that might make Genkit unsuitable

  // Example check: see if we've had previous failures with Genkit
  const previousFailures = typeof localStorage !== 'undefined' &&
    localStorage.getItem('genkit_failures');

  if (previousFailures && parseInt(previousFailures, 10) > 2) {
    return true;
  }

  // Check if Vertex AI is explicitly preferred in session storage
  const preferVertexAI = typeof sessionStorage !== 'undefined' &&
    sessionStorage.getItem('prefer_vertex_ai') === 'true';

  if (preferVertexAI) {
    return true;
  }

  return false;
}

/**
 * Records a failure with the Genkit implementation
 */
export function recordGenkitFailure() {
  try {
    if (typeof localStorage !== 'undefined') {
      const failures = parseInt(localStorage.getItem('genkit_failures') || '0', 10);
      localStorage.setItem('genkit_failures', (failures + 1).toString());

      // Log to monitoring system if failures exceed threshold
      if (failures + 1 >= 2) {
        logAIServiceTelemetry('genkit', 'failure', {
          count: failures + 1,
          timestamp: new Date().toISOString(),
          location: window.location.pathname
        });
      }
    }
  } catch (e) {
    console.error('Failed to record Genkit failure:', e);
  }
}

/**
 * Resets Genkit failure counter
 */
export function resetGenkitFailures() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('genkit_failures', '0');
    }
  } catch (e) {
    console.error('Failed to reset Genkit failures:', e);
  }
}

/**
 * Records a failure with the Vertex AI implementation
 */
export function recordVertexAIFailure() {
  try {
    if (typeof localStorage !== 'undefined') {
      const failures = parseInt(localStorage.getItem('vertex_ai_failures') || '0', 10);
      localStorage.setItem('vertex_ai_failures', (failures + 1).toString());

      // Log to monitoring system if failures exceed threshold
      if (failures + 1 >= 2) {
        logAIServiceTelemetry('vertex_ai', 'failure', {
          count: failures + 1,
          timestamp: new Date().toISOString(),
          location: window.location.pathname
        });
      }
    }
  } catch (e) {
    console.error('Failed to record Vertex AI failure:', e);
  }
}

/**
 * Sets the preferred AI service
 * @param {string} service - The preferred service ('genkit' or 'vertex_ai')
 */
export function setPreferredAIService(service) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      if (service === 'vertex_ai') {
        sessionStorage.setItem('prefer_vertex_ai', 'true');
      } else {
        sessionStorage.setItem('prefer_vertex_ai', 'false');
      }
    }
  } catch (e) {
    console.error('Failed to set preferred AI service:', e);
  }
}

/**
 * Gets status of both AI services
 * @returns {Promise<Object>} Status information for AI services
 */
export async function getAIServicesStatus() {
  try {
    const response = await fetch('/api/genkit/test', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      return {
        status: 'error',
        message: `Error fetching AI services status: ${response.statusText}`,
        genkitAvailable: false,
        vertexAIAvailable: false,
        timestamp: new Date().toISOString()
      };
    }

    const data = await response.json();

    return {
      status: data.status || 'unknown',
      genkitAvailable: data.genkitImportTest?.success || false,
      vertexAIAvailable: data.aiStatus?.googleAI || false,
      recommendedService: data.genkitImportTest?.success ? 'genkit' : (data.aiStatus?.googleAI ? 'vertex_ai' : null),
      details: data,
      timestamp: data.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error checking AI services status:', error);
    return {
      status: 'error',
      message: `Error checking AI services: ${error.message}`,
      genkitAvailable: false,
      vertexAIAvailable: false,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Logs telemetry data for AI service usage
 * @param {string} service - The AI service name
 * @param {string} eventType - The type of event (success, failure, latency, etc.)
 * @param {Object} data - Additional data to log
 */
export function logAIServiceTelemetry(service, eventType, data = {}) {
  // This could send data to an analytics endpoint or logging service
  // For now we'll just log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AI Telemetry] ${service} - ${eventType}:`, data);
  }

  // In a production environment, you might want to send this to an analytics service
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `ai_${eventType}`, {
        ai_service: service,
        ...data
      });
    }

    // Could also store in localStorage for debugging
    if (typeof localStorage !== 'undefined') {
      const telemetryLog = JSON.parse(localStorage.getItem('ai_telemetry_log') || '[]');
      telemetryLog.push({
        service,
        eventType,
        data,
        timestamp: new Date().toISOString()
      });

      // Keep only the last 50 entries
      if (telemetryLog.length > 50) {
        telemetryLog.shift();
      }

      localStorage.setItem('ai_telemetry_log', JSON.stringify(telemetryLog));
    }
  } catch (e) {
    console.error('Failed to log AI service telemetry:', e);
  }
}
