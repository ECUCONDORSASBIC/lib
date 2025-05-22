"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConversationAIRoute = getConversationAIRoute;
exports.shouldUseAlternativeImplementation = shouldUseAlternativeImplementation;
exports.recordGenkitFailure = recordGenkitFailure;
exports.resetGenkitFailures = resetGenkitFailures;

/**
 * AI Service Selector Utility
 *
 * This utility helps determine which AI service implementation to use
 * based on availability and configuration preferences.
 */

/**
 * Returns the appropriate API route for conversation AI functionality
 * @param {boolean} forceAltImplementation - Force the use of the alternative implementation
 * @returns {string} - The appropriate API route path
 */
function getConversationAIRoute() {
  var forceAltImplementation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  // Check if we should force the alternative implementation
  // This can be set based on user preferences or system requirements
  if (forceAltImplementation || !process.env.NEXT_PUBLIC_USE_GENKIT) {
    return '/api/genkit/conversation-alt';
  } // Default to the primary implementation


  return '/api/genkit/conversation';
}
/**
 * Detects if running in an environment where Genkit might not work properly
 * @returns {boolean} - Whether to use the alternative implementation
 */


function shouldUseAlternativeImplementation() {
  // Consider environment factors like browser issues or server issues
  // that might make Genkit unsuitable
  // Example check: see if we've had previous failures with Genkit
  var previousFailures = typeof localStorage !== 'undefined' && localStorage.getItem('genkit_failures');

  if (previousFailures && parseInt(previousFailures, 10) > 2) {
    return true;
  }

  return false;
}
/**
 * Records a failure with the Genkit implementation
 */


function recordGenkitFailure() {
  try {
    if (typeof localStorage !== 'undefined') {
      var failures = parseInt(localStorage.getItem('genkit_failures') || '0', 10);
      localStorage.setItem('genkit_failures', (failures + 1).toString());
    }
  } catch (e) {
    console.error('Failed to record Genkit failure:', e);
  }
}
/**
 * Resets Genkit failure counter
 */


function resetGenkitFailures() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('genkit_failures', '0');
    }
  } catch (e) {
    console.error('Failed to reset Genkit failures:', e);
  }
}