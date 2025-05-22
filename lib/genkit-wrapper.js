/**
 * Genkit API wrapper to handle browser compatibility
 * This module provides a safe way to use Genkit in both server and client contexts
 */

import { getConversationAIRoute, shouldUseAlternativeImplementation } from '@/utils/aiSelector';

// Only import Genkit on the server side
let Genkit;
let GoogleAI;
let isServer = typeof window === 'undefined';

// Dynamically import only on the server side
if (isServer) {
  try {
    const GenKitLib = require('@genkit-ai/core');
    const GoogleAILib = require('@genkit-ai/googleai');
    Genkit = GenKitLib.Genkit;
    GoogleAI = GoogleAILib.GoogleAI;
  } catch (error) {
    console.error('Failed to import Genkit libraries:', error);
  }
}

/**
 * Creates a server-compatible Genkit instance
 * @returns {Object} Genkit instance or mock for client-side
 */
export function createGenkitInstance() {
  // On the server, return a real Genkit instance
  if (isServer && Genkit && GoogleAI) {
    return new Genkit({
      provider: new GoogleAI({
        apiKey: process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY,
      }),
    });
  }

  // On the client, return a mock object that will delegate to API routes
  return createClientGenkitMock();
}

/**
 * Creates a client-side mock for Genkit that delegates to API routes
 * @returns {Object} A mock Genkit instance for client-side use
 */
function createClientGenkitMock() {
  return {
    action: () => ({
      run: async (actionName, params) => {
        // Determine which API route to use based on our selector
        const shouldUseAlternative = shouldUseAlternativeImplementation();
        const apiPath = shouldUseAlternative ? '/api/ai/analyze' : '/api/genkit/analyze';

        // Call the appropriate API route for genkit actions
        const response = await fetch(apiPath, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: actionName,
            params,
          }),
        });

        if (!response.ok) {
          // Record the failure if it's from the primary Genkit implementation
          if (!shouldUseAlternative) {
            recordGenkitFailure();
          }
          throw new Error(`Genkit API error: ${response.statusText}`);
        }

        return await response.json();
      },
    }),
    prompt: async (params) => {
      // Use the AI selector utility to determine the route
      const route = getConversationAIRoute();

      // Call the appropriate API route for genkit prompts
      const response = await fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        // Record the failure if appropriate
        if (!route.includes('-alt')) {
          recordGenkitFailure();
        }
        throw new Error(`Genkit API error: ${response.statusText}`);
      }

      return await response.json();
    },
    // Additional methods to mirror the real Genkit API...
  };
}

/**
 * Records a failure with the Genkit implementation in localStorage
 */
function recordGenkitFailure() {
  try {
    if (typeof localStorage !== 'undefined') {
      const failures = parseInt(localStorage.getItem('genkit_failures') || '0', 10);
      localStorage.setItem('genkit_failures', (failures + 1).toString());
    }
  } catch (error) {
    console.error('Failed to record Genkit failure:', error);
  }
}

export default createGenkitInstance;
