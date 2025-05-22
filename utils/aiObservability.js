/**
 * AI Observability Module
 * 
 * Provides real-time monitoring, metrics collection, and visualization tools
 * for AI service performance and reliability tracking.
 */

// Import dependencies dynamically to handle missing packages gracefully
let firebase = null;
let LogRocket = null;
let Sentry = null;

// Try loading Firebase
try {
    firebase = require('firebase/app');
    require('firebase/firestore');
} catch (e) {
    console.warn('Firebase not available. Firestore logging disabled.');
}

// Try loading LogRocket
try {
    LogRocket = require('logrocket').default;
} catch (e) {
    console.warn('LogRocket not available. Session replay disabled.');
}

// Try loading Sentry
try {
    Sentry = require('@sentry/browser');
} catch (e) {
    console.warn('Sentry not available. Error tracking disabled.');
}

// Globals to track performance
let isInitialized = false;
let metricsBuffer = [];
const FLUSH_INTERVAL = 10000; // 10 seconds
const MAX_BUFFER_SIZE = 50;

/**
 * Initialize the observability tools
 */
export function initializeObservability(config = {}) {
    if (isInitialized) return;

    // Initialize Firebase if config provided and library available
    if (config.firebase && firebase) {
        try {
            firebase.initializeApp(config.firebase);
            console.log('Firebase initialized for AI metrics');
        } catch (error) {
            console.error('Failed to initialize Firebase:', error);
        }
    }

    // Initialize LogRocket if provided and library available
    if (config.logRocket && LogRocket) {
        try {
            LogRocket.init(config.logRocket.appId, {
                release: config.logRocket.version,
                console: {
                    shouldAggregateConsoleErrors: true
                }
            });
            console.log('LogRocket initialized for AI monitoring');
        } catch (error) {
            console.error('Failed to initialize LogRocket:', error);
        }
    }

    // Initialize Sentry if provided and library available
    if (config.sentry && Sentry) {
        try {
            Sentry.init({
                dsn: config.sentry.dsn,
                environment: config.sentry.environment || 'production',
                tracesSampleRate: 0.2,
            });
            console.log('Sentry initialized for AI error tracking');
        } catch (error) {
            console.error('Failed to initialize Sentry:', error);
        }
    }

    // Set up periodic flush of metrics
    if (typeof window !== 'undefined') {
        setInterval(flushMetricsBuffer, FLUSH_INTERVAL);
    }

    isInitialized = true;
}

/**
 * Track AI service request performance
 * @param {Object} metrics - Performance metrics object
 */
export function trackAIMetrics(metrics) {
    if (!metrics || typeof metrics !== 'object') return;

    const enhancedMetrics = {
        ...metrics,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.pathname : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    // Add to buffer for batch processing
    metricsBuffer.push(enhancedMetrics);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[AI Metrics]', enhancedMetrics);
    }

    // Optionally track in LogRocket immediately
    if (LogRocket && LogRocket.track) {
        LogRocket.track(`AI_${metrics.service}_${metrics.eventType}`, enhancedMetrics);
    }

    // Flush if buffer is getting large
    if (metricsBuffer.length >= MAX_BUFFER_SIZE) {
        flushMetricsBuffer();
    }
}

/**
 * Flush metrics buffer to permanent storage
 */
async function flushMetricsBuffer() {
    if (metricsBuffer.length === 0) return;

    const metricsToSend = [...metricsBuffer];
    metricsBuffer = [];

    try {
        // Store in Firestore if available
        if (firebase) {
            const db = firebase.firestore();
            if (db) {
                const batch = metricsToSend.map(metric =>
                    db.collection('ai_metrics').add(metric)
                );
                await Promise.all(batch);
            }
        }

        // Also store in localStorage for local dashboards
        if (typeof localStorage !== 'undefined') {
            const storedMetrics = JSON.parse(localStorage.getItem('ai_metrics_history') || '[]');
            const combinedMetrics = [...storedMetrics, ...metricsToSend].slice(-500); // Keep last 500
            localStorage.setItem('ai_metrics_history', JSON.stringify(combinedMetrics));
        }
    } catch (error) {
        console.error('Failed to flush AI metrics:', error);

        // Report to Sentry if available
        if (Sentry && Sentry.captureException) {
            Sentry.captureException(error);
        }
    }
}

/**
 * Record a successful AI service call
 * @param {string} service - Service name (genkit, vertex_ai)
 * @param {string} endpoint - API endpoint used
 * @param {number} latencyMs - Request latency in milliseconds
 * @param {Object} additionalData - Any additional data to record
 */
export function recordSuccessfulCall(service, endpoint, latencyMs, additionalData = {}) {
    trackAIMetrics({
        service,
        endpoint,
        eventType: 'success',
        latencyMs,
        timestamp: new Date().toISOString(),
        ...additionalData
    });
}

/**
 * Record a failed AI service call
 * @param {string} service - Service name (genkit, vertex_ai)
 * @param {string} endpoint - API endpoint used
 * @param {string} errorMessage - Error message
 * @param {number} latencyMs - Request latency in milliseconds
 * @param {Object} additionalData - Any additional data to record
 */
export function recordFailedCall(service, endpoint, errorMessage, latencyMs, additionalData = {}) {
    const metrics = {
        service,
        endpoint,
        eventType: 'failure',
        errorMessage,
        latencyMs,
        timestamp: new Date().toISOString(),
        ...additionalData
    };

    trackAIMetrics(metrics);

    // Report to Sentry if available
    if (Sentry && Sentry.captureEvent) {
        Sentry.captureEvent({
            message: `AI Service Failure: ${service}`,
            level: 'error',
            extra: metrics
        });
    }
}

/**
 * Record a fallback event (switching from one service to another)
 * @param {string} fromService - Original service that failed
 * @param {string} toService - Fallback service
 * @param {string} reason - Reason for fallback
 * @param {Object} additionalData - Any additional data to record
 */
export function recordFallbackEvent(fromService, toService, reason, additionalData = {}) {
    trackAIMetrics({
        eventType: 'fallback',
        fromService,
        toService,
        reason,
        timestamp: new Date().toISOString(),
        ...additionalData
    });
}

/**
 * Get historical metrics for dashboard visualization
 * @param {Object} options - Filter and sort options
 * @returns {Promise<Array>} Array of historical metrics
 */
export async function getHistoricalMetrics(options = {}) {
    const { limit: resultLimit = 100, service, eventType, startDate, endDate } = options;

    try {
        // Try to get from Firestore first if available
        if (firebase) {
            const db = firebase.firestore();
            if (db) {
                let metricsRef = db.collection('ai_metrics');

                // Apply filters if needed
                if (service) {
                    metricsRef = metricsRef.where('service', '==', service);
                }

                if (eventType) {
                    metricsRef = metricsRef.where('eventType', '==', eventType);
                }

                // Get the data
                const snapshot = await metricsRef
                    .orderBy('timestamp', 'desc')
                    .limit(resultLimit)
                    .get();

                const results = [];
                snapshot.forEach(doc => {
                    results.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                return results;
            }
        }

        // Fall back to localStorage if Firestore not available
        if (typeof localStorage !== 'undefined') {
            let metrics = JSON.parse(localStorage.getItem('ai_metrics_history') || '[]');

            // Apply filters
            if (service) {
                metrics = metrics.filter(m => m.service === service);
            }

            if (eventType) {
                metrics = metrics.filter(m => m.eventType === eventType);
            }

            if (startDate) {
                const startDateObj = new Date(startDate);
                metrics = metrics.filter(m => new Date(m.timestamp) >= startDateObj);
            }

            if (endDate) {
                const endDateObj = new Date(endDate);
                metrics = metrics.filter(m => new Date(m.timestamp) <= endDateObj);
            }

            // Sort by timestamp descending and limit
            return metrics
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, resultLimit);
        }

        return [];
    } catch (error) {
        console.error('Failed to get historical metrics:', error);
        return [];
    }
}

/**
 * Calculate performance summary metrics
 * @param {Array} metrics - Array of metrics records
 * @returns {Object} Summary statistics
 */
export function calculatePerformanceSummary(metrics = []) {
    if (!metrics.length) return null;

    // Group by service
    const byService = metrics.reduce((acc, metric) => {
        const service = metric.service || 'unknown';
        if (!acc[service]) {
            acc[service] = [];
        }
        acc[service].push(metric);
        return acc;
    }, {});

    const summary = {};

    // Calculate stats for each service
    Object.entries(byService).forEach(([service, serviceMetrics]) => {
        // Success rate
        const total = serviceMetrics.length;
        const successful = serviceMetrics.filter(m => m.eventType === 'success').length;
        const successRate = total > 0 ? (successful / total) * 100 : 0;

        // Latency stats (only from successful calls with latencyMs)
        const latencies = serviceMetrics
            .filter(m => m.latencyMs && typeof m.latencyMs === 'number')
            .map(m => m.latencyMs);

        let avgLatency = 0;
        let p95Latency = 0;

        if (latencies.length > 0) {
            avgLatency = latencies.reduce((sum, val) => sum + val, 0) / latencies.length;

            // Calculate p95 latency
            const sortedLatencies = [...latencies].sort((a, b) => a - b);
            const p95Index = Math.floor(sortedLatencies.length * 0.95);
            p95Latency = sortedLatencies[p95Index] || sortedLatencies[sortedLatencies.length - 1];
        }

        summary[service] = {
            totalCalls: total,
            successfulCalls: successful,
            failedCalls: total - successful,
            successRate: successRate.toFixed(2),
            avgLatencyMs: avgLatency.toFixed(2),
            p95LatencyMs: p95Latency.toFixed(2),
            fallbackCount: serviceMetrics.filter(m => m.eventType === 'fallback').length
        };
    });

    return summary;
}
