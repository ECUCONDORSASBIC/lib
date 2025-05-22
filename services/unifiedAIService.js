/**
 * Unified AI Service
 * 
 * Provides a unified interface to AI capabilities with built-in
 * observability, fallback mechanisms, and feedback collection.
 */

import * as aiSelector from '../utils/aiSelector';
import * as aiObservability from '../utils/aiObservability';
import * as aiFeedbackCollector from '../utils/aiFeedbackCollector';

// Initialize components with default configuration
let isInitialized = false;

/**
 * Initialize the unified AI service with configuration options
 * @param {Object} config - Configuration options
 */
export function initialize(config = {}) {
    if (isInitialized) return;

    // Initialize observability
    aiObservability.initializeObservability(config.observability || {});

    // Initialize feedback session
    aiFeedbackCollector.initFeedbackSession({
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        location: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        ...config.session
    });

    isInitialized = true;
}

/**
 * Ensure the service is initialized
 */
function ensureInitialized() {
    if (!isInitialized) {
        initialize();
    }
}

/**
 * Generate a unique response ID
 * @returns {string} Unique response ID
 */
function generateResponseId() {
    return `resp_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Start a conversation with AI
 * @param {Array} messages - Conversation messages
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Response with AI message
 */
export async function startConversation(messages, options = {}) {
    ensureInitialized();

    try {
        const endpoint = aiSelector.getConversationAIRoute(options.forceAltImplementation);
        const responseId = options.includeResponseId !== false ? generateResponseId() : null;
        const startTime = Date.now();

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                ...(responseId ? { responseId } : {})
            })
        });

        const latency = Date.now() - startTime;

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Record successful telemetry
        const provider = endpoint.includes('alt') ? 'vertex_ai' : 'genkit';
        aiObservability.recordSuccessfulCall(
            provider,
            'conversation',
            latency,
            { responseId }
        );

        return {
            ...data,
            responseId,
            provider,
            latency
        };
    } catch (error) {
        // If primary implementation fails, try fallback
        if (!options.noFallback && !options.forceAltImplementation) {
            // Try with alternative implementation
            return startConversation(messages, {
                ...options,
                forceAltImplementation: true
            });
        }

        throw error;
    }
}

/**
 * Analyze health risks
 * @param {Object} healthData - Health data to analyze
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeHealthRisks(healthData, options = {}) {
    ensureInitialized();

    try {
        const endpoint = aiSelector.getHealthRiskAnalysisRoute(options.forceVertexAI);
        const responseId = options.includeResponseId !== false ? generateResponseId() : null;
        const startTime = Date.now();

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                healthData,
                ...(responseId ? { responseId } : {})
            })
        });

        const latency = Date.now() - startTime;

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Record successful telemetry
        const provider = endpoint.includes('/api/ai/') ? 'vertex_ai' : 'genkit';
        aiObservability.recordSuccessfulCall(
            provider,
            'analyze-health',
            latency,
            { responseId }
        );

        return {
            ...data,
            responseId,
            provider,
            latency
        };
    } catch (error) {
        // If primary implementation fails, try fallback
        if (!options.noFallback && !options.forceVertexAI) {
            // Try with Vertex AI
            return analyzeHealthRisks(healthData, {
                ...options,
                forceVertexAI: true
            });
        }

        throw error;
    }
}

/**
 * Project future risks
 * @param {Object} patientData - Patient data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Risk projection results
 */
export async function projectFutureRisks(patientData, options = {}) {
    ensureInitialized();

    try {
        const endpoint = aiSelector.getFutureRiskProjectionRoute(options.forceVertexAI);
        const responseId = options.includeResponseId !== false ? generateResponseId() : null;
        const startTime = Date.now();

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientData,
                ...(responseId ? { responseId } : {})
            })
        });

        const latency = Date.now() - startTime;

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Record successful telemetry
        const provider = endpoint.includes('/api/ai/') ? 'vertex_ai' : 'genkit';
        aiObservability.recordSuccessfulCall(
            provider,
            'risk-projection',
            latency,
            { responseId }
        );

        return {
            ...data,
            responseId,
            provider,
            latency
        };
    } catch (error) {
        // If primary implementation fails, try fallback
        if (!options.noFallback && !options.forceVertexAI) {
            // Try with Vertex AI
            return projectFutureRisks(patientData, {
                ...options,
                forceVertexAI: true
            });
        }

        throw error;
    }
}

/**
 * Generate anamnesis questions
 * @param {Object} patientContext - Patient context
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Generated questions
 */
export async function generateAnamnesisQuestion(patientContext, options = {}) {
    ensureInitialized();

    try {
        const endpoint = aiSelector.getAnamnesisQuestionRoute(options.forceVertexAI);
        const responseId = options.includeResponseId !== false ? generateResponseId() : null;
        const startTime = Date.now();

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientContext,
                ...(responseId ? { responseId } : {})
            })
        });

        const latency = Date.now() - startTime;

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Record successful telemetry
        const provider = endpoint.includes('/api/ai/') ? 'vertex_ai' : 'genkit';
        aiObservability.recordSuccessfulCall(
            provider,
            'anamnesis-question',
            latency,
            { responseId }
        );

        return {
            ...data,
            responseId,
            provider,
            latency
        };
    } catch (error) {
        // If primary implementation fails, try fallback
        if (!options.noFallback && !options.forceVertexAI) {
            // Try with Vertex AI
            return generateAnamnesisQuestion(patientContext, {
                ...options,
                forceVertexAI: true
            });
        }

        throw error;
    }
}

/**
 * Process notifications with AI
 * @param {Object} notificationData - Notification data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Processed notification
 */
export async function sendAINotification(notificationData, options = {}) {
    ensureInitialized();

    try {
        const endpoint = aiSelector.getAINotificationRoute(options.forceVertexAI);
        const responseId = options.includeResponseId !== false ? generateResponseId() : null;
        const startTime = Date.now();

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notificationData,
                ...(responseId ? { responseId } : {})
            })
        });

        const latency = Date.now() - startTime;

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Record successful telemetry
        const provider = endpoint.includes('/api/ai/') ? 'vertex_ai' : 'genkit';
        aiObservability.recordSuccessfulCall(
            provider,
            'notification',
            latency,
            { responseId }
        );

        return {
            ...data,
            responseId,
            provider,
            latency
        };
    } catch (error) {
        // If primary implementation fails, try fallback
        if (!options.noFallback && !options.forceVertexAI) {
            // Try with Vertex AI
            return sendAINotification(notificationData, {
                ...options,
                forceVertexAI: true
            });
        }

        throw error;
    }
}

/**
 * Get AI service status information
 * @returns {Promise<Object>} Status of AI services
 */
export async function checkAIServicesStatus() {
    ensureInitialized();
    return aiSelector.getAIServicesStatus();
}

/**
 * Provide feedback on an AI response
 * @param {string} responseId - ID of the response
 * @param {number} rating - Rating (1-5)
 * @param {string} comment - Optional comment
 * @returns {Promise<string>} Feedback ID
 */
export async function provideFeedback(responseId, rating, comment = '') {
    ensureInitialized();
    return aiFeedbackCollector.rateResponse(responseId, rating, comment);
}

/**
 * Flag an issue with an AI response
 * @param {string} responseId - ID of the response
 * @param {string} issueType - Type of issue
 * @param {string} details - Issue details
 * @returns {Promise<string>} Feedback ID
 */
export async function reportIssue(responseId, issueType, details = '') {
    ensureInitialized();
    return aiFeedbackCollector.flagResponse(responseId, issueType, details);
}

/**
 * Get performance metrics for AI services
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Performance metrics
 */
export async function getPerformanceMetrics(options = {}) {
    ensureInitialized();

    const metrics = await aiObservability.getHistoricalMetrics(options);
    const summary = aiObservability.calculatePerformanceSummary(metrics);

    return {
        metrics,
        summary,
        timestamp: new Date().toISOString()
    };
}

/**
 * Get feedback summary for AI improvements
 * @returns {Object} Feedback summary
 */
export function getFeedbackSummary() {
    ensureInitialized();
    return aiFeedbackCollector.generateFeedbackSummary();
}

// Exportamos todas las funciones
export default {
    initialize,
    startConversation,
    analyzeHealthRisks,
    projectFutureRisks,
    generateAnamnesisQuestion,
    sendAINotification,
    checkAIServicesStatus,  // Ahora tiene la coma que faltaba
    provideFeedback,
    reportIssue,
    getPerformanceMetrics,
    getFeedbackSummary
};
