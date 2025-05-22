import { jest } from '@jest/globals';
import * as aiSelector from '../../utils/aiSelector';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage and sessionStorage
const mockStorage = () => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
};

Object.defineProperty(window, 'localStorage', { value: mockStorage() });
Object.defineProperty(window, 'sessionStorage', { value: mockStorage() });

// Mock client-side fetch
async function mockFetch(url, options = {}) {
    // Mock various API responses
    const MOCK_RESPONSES = {
        // Genkit Success Responses
        '/api/genkit/conversation': {
            success: true,
            data: { message: 'Genkit conversation response' }
        },
        '/api/genkit/analyze-health': {
            success: true,
            data: { riskScore: 0.35, factors: ['Factor 1', 'Factor 2'] }
        },

        // Vertex AI Success Responses
        '/api/ai/analyze-health': {
            success: true,
            data: { riskScore: 0.38, factors: ['Factor A', 'Factor B'] }
        },
        '/api/ai/generate-anamnesis-question': {
            success: true,
            data: { question: 'How would you describe your sleeping patterns?' }
        },

        // Error response
        'error': {
            success: false,
            error: 'Service unavailable'
        }
    };

    // Get the expected response or default to error
    const mockResult = MOCK_RESPONSES[url] || MOCK_RESPONSES['error'];

    // Handle 'failing' routes
    if (options.shouldFail) {
        return {
            ok: false,
            status: 500,
            json: async () => ({ success: false, error: 'Internal Server Error' })
        };
    }

    // Mock successful response
    return {
        ok: true,
        status: 200,
        json: async () => mockResult
    };
}

describe('AI Services End-to-End Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.localStorage.clear();
        window.sessionStorage.clear();

        // Reset environment variables
        process.env.NEXT_PUBLIC_USE_GENKIT = 'true';
    });

    describe('Fallback Scenarios', () => {
        test('switches from Genkit to Vertex AI after failures', async () => {
            // Simulate Genkit failures
            const failingFetch = jest.fn().mockImplementation((url, options) =>
                mockFetch(url, { ...options, shouldFail: url.includes('/api/genkit/') })
            );
            global.fetch = failingFetch;

            // First call - should fail with Genkit
            const healthRoute1 = aiSelector.getHealthRiskAnalysisRoute();
            expect(healthRoute1).toBe('/api/genkit/analyze-health');

            const response1 = await fetch(healthRoute1);
            expect(response1.ok).toBe(false);

            // Record the failure
            aiSelector.recordGenkitFailure();
            aiSelector.recordGenkitFailure();
            aiSelector.recordGenkitFailure();

            // Second call - should switch to Vertex AI
            const healthRoute2 = aiSelector.getHealthRiskAnalysisRoute();
            expect(healthRoute2).toBe('/api/ai/analyze-health');

            // Mock a successful call to Vertex AI
            global.fetch = jest.fn().mockImplementation((url) => mockFetch(url));

            const response2 = await fetch(healthRoute2);
            expect(response2.ok).toBe(true);

            const data = await response2.json();
            expect(data.success).toBe(true);
        });

        test('recovers back to Genkit after reset', async () => {
            // Set Genkit as failed
            window.localStorage.setItem('genkit_failures', '3');

            // Should initially use Vertex AI
            const route1 = aiSelector.getAnamnesisQuestionRoute();
            expect(route1).toBe('/api/ai/generate-anamnesis-question');

            // Reset failures
            aiSelector.resetGenkitFailures();

            // Should now use Genkit
            const route2 = aiSelector.getAnamnesisQuestionRoute();
            expect(route2).toBe('/api/genkit/generate-anamnesis-question');
        });
    });

    describe('Manual Provider Selection', () => {
        test('respects user preference for Vertex AI', async () => {
            // Set preference for Vertex AI
            aiSelector.setPreferredAIService('vertex_ai');

            // Should use Vertex AI regardless of failure status
            const route = aiSelector.getFutureRiskProjectionRoute();
            expect(route).toBe('/api/ai/future-risk');
        });

        test('allows overriding to genkit if needed', async () => {
            // Set preference for Vertex AI
            aiSelector.setPreferredAIService('vertex_ai');

            // Explicitly request genkit routes via the force parameter
            const route = aiSelector.getAINotificationRoute(false);
            expect(route).toBe('/api/genkit/notification');
        });
    });

    describe('Service Availability Check', () => {
        test('correctly detects when both services are available', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    status: 'ok',
                    genkitImportTest: { success: true },
                    aiStatus: { googleAI: true },
                    timestamp: new Date().toISOString()
                })
            });

            const status = await aiSelector.getAIServicesStatus();

            expect(status.genkitAvailable).toBe(true);
            expect(status.vertexAIAvailable).toBe(true);
            expect(status.recommendedService).toBe('genkit');
        });

        test('correctly detects when only Vertex AI is available', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    status: 'partial',
                    genkitImportTest: { success: false, error: 'Module not found' },
                    aiStatus: { googleAI: true },
                    timestamp: new Date().toISOString()
                })
            });

            const status = await aiSelector.getAIServicesStatus();

            expect(status.genkitAvailable).toBe(false);
            expect(status.vertexAIAvailable).toBe(true);
            expect(status.recommendedService).toBe('vertex_ai');
        });

        test('gracefully handles when both services are unavailable', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    status: 'error',
                    genkitImportTest: { success: false },
                    aiStatus: { googleAI: false },
                    timestamp: new Date().toISOString()
                })
            });

            const status = await aiSelector.getAIServicesStatus();

            expect(status.genkitAvailable).toBe(false);
            expect(status.vertexAIAvailable).toBe(false);
            expect(status.recommendedService).toBe(null);
        });
    });

    describe('Telemetry Logging', () => {
        test('properly logs service usage telemetry', async () => {
            // Mock gtag
            window.gtag = jest.fn();

            // Log an event
            aiSelector.logAIServiceTelemetry('genkit', 'latency', {
                value: 250,
                endpoint: '/api/genkit/conversation'
            });

            expect(window.gtag).toHaveBeenCalledWith('event', 'ai_latency', {
                ai_service: 'genkit',
                value: 250,
                endpoint: '/api/genkit/conversation'
            });

            // Verify localStorage logging
            expect(window.localStorage.setItem).toHaveBeenCalled();
        });
    });
});
