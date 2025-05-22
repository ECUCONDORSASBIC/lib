/**
 * Unified AI Service
 * 
 * This service provides a unified interface to all AI capabilities with
 * built-in observability, fallback mechanisms, and feedback collection.
 */

import * as aiSelector from './aiSelector';
import * as aiObservability from './aiObservability';
import * as aiFeedbackCollector from './aiFeedbackCollector';

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
 * Make a request to an AI service with automatic fallback and telemetry
 * @param {string} endpoint - API endpoint to call
 * @param {Object} payload - Request payload
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Response data
 */
export async function makeAIRequest(endpoint, payload, options = {}) {
    ensureInitialized();

    const {
        forceProvider = null,
        includeResponseId = true,
        maxRetries = aiSelector.RETRY_CONFIG.maxRetries,
        timeout = 30000,
        collectTelemetry = true
    } = options;

    // Determine which provider to use
    let primaryProvider = 'genkit';
    let fallbackProvider = 'vertex_ai';

    if (forceProvider === 'vertex_ai') {
        primaryProvider = 'vertex_ai';
        fallbackProvider = null; // No fallback if explicitly specified
    }

    // Start timing for latency measurement
    const startTime = Date.now();

    // Generate response ID for tracking
    const responseId = includeResponseId ? generateResponseId() : null;

    // Determine the API route to use
    let apiRoute;
    switch (endpoint) {
        case 'conversation':
            apiRoute = aiSelector.getConversationAIRoute(primaryProvider === 'vertex_ai');
            break;
        case 'analyze-health':
            apiRoute = aiSelector.getHealthRiskAnalysisRoute(primaryProvider === 'vertex_ai');
            break;
        case 'risk-projection':
            apiRoute = aiSelector.getFutureRiskProjectionRoute(primaryProvider === 'vertex_ai');
            break;
        case 'anamnesis-question':
            apiRoute = aiSelector.getAnamnesisQuestionRoute(primaryProvider === 'vertex_ai');
            break;
        case 'notification':
            apiRoute = aiSelector.getAINotificationRoute(primaryProvider === 'vertex_ai');
            break;
        default:
            throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    // Add response ID to payload if requested
    const requestPayload = {
        ...payload,
        ...(responseId ? { responseId } : {})
    };

    // Try primary provider
    try {
        const response = await makeRequestWithRetry(
            apiRoute,
            requestPayload,
            primaryProvider,
            maxRetries,
            timeout
        );

        const latency = Date.now() - startTime;

        // Record successful telemetry
        if (collectTelemetry) {
            aiObservability.recordSuccessfulCall(
                primaryProvider,
                endpoint,
                latency,
                { responseId }
            );
        }

        return {
            ...response,
            responseId,
            provider: primaryProvider,
            latency
        };
    } catch (primaryError) {
        // Log failure telemetry
        const primaryLatency = Date.now() - startTime;
        if (collectTelemetry) {
            aiObservability.recordFailedCall(
                primaryProvider,
                endpoint,
                primaryError.message,
                primaryLatency,
                { responseId }
            );
        }

        // Record failure for provider selection
        if (primaryProvider === 'genkit') {
            aiSelector.recordGenkitFailure();
        } else {
            aiSelector.recordVertexAIFailure();
        }

        // Only try fallback if one is available
        if (fallbackProvider && !options.noFallback) {
            // Determine fallback route
            let fallbackRoute;
            switch (endpoint) {
                case 'conversation':
                    fallbackRoute = aiSelector.getConversationAIRoute(true); // Force alt implementation
                    break;
                case 'analyze-health':
                    fallbackRoute = aiSelector.getHealthRiskAnalysisRoute(true); // Force Vertex AI
                    break;
                case 'risk-projection':
                    fallbackRoute = aiSelector.getFutureRiskProjectionRoute(true);
                    break;
                case 'anamnesis-question':
                    fallbackRoute = aiSelector.getAnamnesisQuestionRoute(true);
                    break;
                case 'notification':
                    fallbackRoute = aiSelector.getAINotificationRoute(true);
                    break;
                default:
                    throw new Error(`Unknown endpoint: ${endpoint}`);
            }

            // Record fallback event
            if (collectTelemetry) {
                aiObservability.recordFallbackEvent(
                    primaryProvider,
                    fallbackProvider,
                    primaryError.message,
                    { endpoint, responseId }
                );
            }

            // Try fallback provider
            const fallbackStartTime = Date.now();
            try {
                const fallbackResponse = await makeRequestWithRetry(
                    fallbackRoute,
                    requestPayload,
                    fallbackProvider,
                    maxRetries,
                    timeout
                );

                const fallbackLatency = Date.now() - fallbackStartTime;
                const totalLatency = Date.now() - startTime;

                // Record successful fallback telemetry
                if (collectTelemetry) {
                    aiObservability.recordSuccessfulCall(
                        fallbackProvider,
                        endpoint,
                        fallbackLatency,
                        {
                            responseId,
                            isFallback: true,
                            originalError: primaryError.message
                        }
                    );
                }

                return {
                    ...fallbackResponse,
                    responseId,
                    provider: fallbackProvider,
                    latency: fallbackLatency,
                    totalLatency,
                    isFallback: true,
                    originalProvider: primaryProvider,
                    originalError: primaryError.message
                };
            } catch (fallbackError) {
                // Both providers failed
                const fallbackLatency = Date.now() - fallbackStartTime;
                const totalLatency = Date.now() - startTime;

                if (collectTelemetry) {
                    aiObservability.recordFailedCall(
                        fallbackProvider,
                        endpoint,
                        fallbackError.message,
                        fallbackLatency,
                        {
                            responseId,
                            isFallback: true,
                            originalError: primaryError.message
                        }
                    );
                }

                // Throw combined error
                throw new Error(
                    `Both providers failed. Primary (${primaryProvider}): ${primaryError.message}. ` +
                    `Fallback (${fallbackProvider}): ${fallbackError.message}`
                );
            }
        } else {
            // No fallback available or requested, rethrow original error
            throw primaryError;
        }
    }
}

/**
 * Make a request with retry logic
 * @param {string} url - API endpoint URL
 * @param {Object} payload - Request payload
 * @param {string} provider - Provider name for logging
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<Object>} Response data
 */
async function makeRequestWithRetry(url, payload, provider, maxRetries, timeout) {
    let lastError;
    let delay = aiSelector.RETRY_CONFIG.initialDelayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Add abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            lastError = error;

            // Don't retry if this is the last attempt
            if (attempt >= maxRetries) {
                break;
            }

            // Don't retry certain types of errors
            if (error.name === 'AbortError') {
                throw new Error(`Request timed out after ${timeout}ms`);
            }

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(
                delay * aiSelector.RETRY_CONFIG.backoffFactor,
                aiSelector.RETRY_CONFIG.maxDelayMs
            );
        }
    }

    throw lastError || new Error(`Request to ${provider} failed after ${maxRetries} retries`);
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
    return makeAIRequest('conversation', { messages }, options);
}

/**
 * Analyze health risks
 * @param {Object} healthData - Health data to analyze
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeHealthRisks(healthData, options = {}) {
    return makeAIRequest('analyze-health', { healthData }, options);
}

/**
 * Project future risks
 * @param {Object} patientData - Patient data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Risk projection results
 */
export async function projectFutureRisks(patientData, options = {}) {
    return makeAIRequest('risk-projection', { patientData }, options);
}

/**
 * Generate anamnesis questions
 * @param {Object} patientContext - Patient context
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Generated questions
 */
export async function generateAnamnesisQuestions(patientContext, options = {}) {
    return makeAIRequest('anamnesis-question', { patientContext }, options);
}

/**
 * Process notifications with AI
 * @param {Object} notificationData - Notification data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Processed notification
 */
export async function processNotification(notificationData, options = {}) {
    return makeAIRequest('notification', { notificationData }, options);
}

/**
 * Get AI service status information
 * @returns {Promise<Object>} Status of AI services
 */
export async function getServiceStatus() {
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
 * Suggest an improvement to an AI response
 * @param {string} responseId - ID of the response
 * @param {string} originalResponse - Original AI response
 * @param {string} improvedResponse - Suggested improved response
 * @returns {Promise<string>} Feedback ID
 */
export async function suggestImprovement(responseId, originalResponse, improvedResponse) {
    ensureInitialized();
    return aiFeedbackCollector.suggestImprovement(responseId, originalResponse, improvedResponse);
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
