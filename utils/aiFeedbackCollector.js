/**
 * AI Feedback Collection Module
 * 
 * Provides structured feedback collection mechanisms for AI responses
 * to improve prompting patterns and model fine-tuning over time.
 */

// Try loading Firebase dynamically to handle missing package
let firebase = null;
try {
    firebase = require('firebase/app');
    require('firebase/firestore');
} catch (e) {
    console.warn('Firebase not available. Firestore feedback collection disabled.');
}

// Simple UUID generator function without external dependencies
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Local storage key for feedback
const FEEDBACK_STORAGE_KEY = 'ai_feedback_collection';
const FEEDBACK_SESSION_KEY = 'ai_feedback_session';

/**
 * Initialize a feedback collection session
 * @param {Object} sessionInfo - Information about the current user session
 * @returns {string} Session ID
 */
export function initFeedbackSession(sessionInfo = {}) {
    try {
        const sessionId = generateUUID();

        const sessionData = {
            sessionId,
            startTime: new Date().toISOString(),
            ...sessionInfo,
            feedbackCount: 0
        };

        // Store in sessionStorage for temporary tracking
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(FEEDBACK_SESSION_KEY, JSON.stringify(sessionData));
        }

        return sessionId;
    } catch (error) {
        console.error('Failed to initialize feedback session:', error);
        return generateUUID(); // Fallback to just returning an ID
    }
}

/**
 * Get the current feedback session or create one if it doesn't exist
 * @returns {Object} Session data
 */
export function getCurrentSession() {
    try {
        if (typeof sessionStorage !== 'undefined') {
            const sessionData = sessionStorage.getItem(FEEDBACK_SESSION_KEY);
            if (sessionData) {
                return JSON.parse(sessionData);
            }
        }

        // Create a new session if one doesn't exist
        const sessionId = initFeedbackSession();
        return { sessionId, startTime: new Date().toISOString(), feedbackCount: 0 };
    } catch (error) {
        console.error('Error retrieving feedback session:', error);
        return { sessionId: generateUUID(), startTime: new Date().toISOString(), feedbackCount: 0 };
    }
}

/**
 * Record feedback for an AI interaction
 * @param {Object} feedbackData - The collected feedback data
 * @returns {Promise<string>} Feedback ID
 */
export async function recordFeedback(feedbackData) {
    if (!feedbackData || typeof feedbackData !== 'object') {
        throw new Error('Invalid feedback data');
    }

    try {
        const session = getCurrentSession();
        const feedbackId = generateUUID();

        // Update session feedback count
        if (typeof sessionStorage !== 'undefined') {
            session.feedbackCount = (session.feedbackCount || 0) + 1;
            sessionStorage.setItem(FEEDBACK_SESSION_KEY, JSON.stringify(session));
        }

        // Construct the complete feedback record
        const feedback = {
            id: feedbackId,
            sessionId: session.sessionId,
            timestamp: new Date().toISOString(),
            ...feedbackData
        };

        // Store in Firestore if available
        if (firebase) {
            try {
                const db = firebase.firestore();
                if (db) {
                    await db.collection('ai_feedback').add({
                        ...feedback,
                        serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            } catch (firestoreError) {
                console.error('Failed to store feedback in Firestore:', firestoreError);
            }
        }

        // Always store locally as backup
        if (typeof localStorage !== 'undefined') {
            const storedFeedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
            storedFeedback.push(feedback);

            // Keep only the latest 100 feedback items to avoid exceeding storage limits
            if (storedFeedback.length > 100) {
                storedFeedback.shift();
            }

            localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(storedFeedback));
        }

        return feedbackId;
    } catch (error) {
        console.error('Failed to record feedback:', error);
        throw error;
    }
}

/**
 * Rate an AI response on a 1-5 scale
 * @param {string} responseId - ID of the AI response
 * @param {number} rating - Rating from 1 to 5
 * @param {string} comment - Optional comment explaining the rating
 * @returns {Promise<string>} Feedback ID
 */
export async function rateResponse(responseId, rating, comment = '') {
    if (!responseId) throw new Error('Response ID is required');
    if (typeof rating !== 'number' || rating < 1 || rating > 5) throw new Error('Rating must be a number from 1 to 5');

    return recordFeedback({
        type: 'rating',
        responseId,
        rating,
        comment
    });
}

/**
 * Flag an AI response for specific issues
 * @param {string} responseId - ID of the AI response
 * @param {string} issueType - Type of issue (hallucination, inappropriate, incorrect, other)
 * @param {string} details - Details about the issue
 * @returns {Promise<string>} Feedback ID
 */
export async function flagResponse(responseId, issueType, details = '') {
    if (!responseId) throw new Error('Response ID is required');
    if (!issueType) throw new Error('Issue type is required');

    const validIssueTypes = ['hallucination', 'inappropriate', 'incorrect', 'irrelevant', 'other'];
    if (!validIssueTypes.includes(issueType)) {
        throw new Error(`Issue type must be one of: ${validIssueTypes.join(', ')}`);
    }

    return recordFeedback({
        type: 'issue_flag',
        responseId,
        issueType,
        details
    });
}

/**
 * Record improvements to an AI response
 * @param {string} responseId - ID of the AI response
 * @param {string} originalResponse - The AI's original response
 * @param {string} improvedResponse - User's suggested improved response
 * @returns {Promise<string>} Feedback ID
 */
export async function suggestImprovement(responseId, originalResponse, improvedResponse) {
    if (!responseId) throw new Error('Response ID is required');
    if (!originalResponse) throw new Error('Original response is required');
    if (!improvedResponse) throw new Error('Improved response is required');

    return recordFeedback({
        type: 'improvement',
        responseId,
        originalResponse,
        improvedResponse
    });
}

/**
 * Record context about prompt effectiveness
 * @param {string} responseId - ID of the AI response
 * @param {string} originalPrompt - Original prompt sent to the AI
 * @param {string} effectivenessScore - Score from 1-5 on prompt effectiveness
 * @param {string} suggestedPrompt - User's suggested improved prompt
 * @returns {Promise<string>} Feedback ID
 */
export async function recordPromptFeedback(responseId, originalPrompt, effectivenessScore, suggestedPrompt = '') {
    if (!responseId) throw new Error('Response ID is required');
    if (!originalPrompt) throw new Error('Original prompt is required');
    if (typeof effectivenessScore !== 'number' || effectivenessScore < 1 || effectivenessScore > 5) {
        throw new Error('Effectiveness score must be a number from 1 to 5');
    }

    return recordFeedback({
        type: 'prompt_feedback',
        responseId,
        originalPrompt,
        effectivenessScore,
        suggestedPrompt
    });
}

/**
 * Get locally stored feedback for analysis
 * @param {Object} options - Filter options
 * @returns {Array} Collected feedback data
 */
export function getLocalFeedback(options = {}) {
    try {
        if (typeof localStorage === 'undefined') return [];

        const allFeedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');

        // Apply filters if provided
        let filteredFeedback = [...allFeedback];

        if (options.type) {
            filteredFeedback = filteredFeedback.filter(f => f.type === options.type);
        }

        if (options.minRating) {
            filteredFeedback = filteredFeedback.filter(f =>
                f.rating && f.rating >= options.minRating
            );
        }

        if (options.maxRating) {
            filteredFeedback = filteredFeedback.filter(f =>
                f.rating && f.rating <= options.maxRating
            );
        }

        if (options.sessionId) {
            filteredFeedback = filteredFeedback.filter(f => f.sessionId === options.sessionId);
        }

        // Sort by timestamp if requested
        if (options.sort === 'newest') {
            filteredFeedback.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else if (options.sort === 'oldest') {
            filteredFeedback.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }

        // Apply limit if provided
        if (options.limit && typeof options.limit === 'number') {
            return filteredFeedback.slice(0, options.limit);
        }

        return filteredFeedback;
    } catch (error) {
        console.error('Failed to get local feedback:', error);
        return [];
    }
}

/**
 * Generate a summary of feedback for improving AI performance
 * @returns {Object} Summary statistics and insights
 */
export function generateFeedbackSummary() {
    try {
        const allFeedback = getLocalFeedback();
        if (!allFeedback.length) return null;

        // Count by feedback type
        const typeCount = allFeedback.reduce((acc, item) => {
            const type = item.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        // Calculate average ratings if available
        const ratings = allFeedback.filter(f => f.type === 'rating' && typeof f.rating === 'number');
        const avgRating = ratings.length
            ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
            : null;

        // Count issue types
        const issueFlags = allFeedback.filter(f => f.type === 'issue_flag');
        const issueTypes = issueFlags.reduce((acc, item) => {
            const issueType = item.issueType || 'unknown';
            acc[issueType] = (acc[issueType] || 0) + 1;
            return acc;
        }, {});

        // Count improvement suggestions
        const improvements = allFeedback.filter(f => f.type === 'improvement').length;

        // Calculate prompt effectiveness if available
        const promptFeedback = allFeedback.filter(f =>
            f.type === 'prompt_feedback' && typeof f.effectivenessScore === 'number'
        );

        const avgPromptEffectiveness = promptFeedback.length
            ? promptFeedback.reduce((sum, item) => sum + item.effectivenessScore, 0) / promptFeedback.length
            : null;

        return {
            totalFeedbackCount: allFeedback.length,
            feedbackByType: typeCount,
            averageRating: avgRating !== null ? avgRating.toFixed(2) : null,
            issueTypeCounts: issueTypes,
            improvementSuggestionCount: improvements,
            averagePromptEffectiveness: avgPromptEffectiveness !== null
                ? avgPromptEffectiveness.toFixed(2)
                : null,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Failed to generate feedback summary:', error);
        return null;
    }
}
