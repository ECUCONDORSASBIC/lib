import { jest } from '@jest/globals';
import * as aiSelector from './aiSelector';

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        })
    };
})();

const sessionStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        })
    };
})();

// Mock fetch
global.fetch = jest.fn();

describe('AI Selector Utility', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.resetAllMocks();

        // Set up localStorage and sessionStorage mocks
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

        // Reset environment variables
        process.env.NEXT_PUBLIC_USE_GENKIT = 'true';

        // Mock console.error to prevent test output noise
        console.error = jest.fn();

        // Mock window.gtag
        window.gtag = jest.fn();
    });

    describe('getConversationAIRoute', () => {
        test('returns primary implementation when conditions met', () => {
            const route = aiSelector.getConversationAIRoute();
            expect(route).toBe('/api/genkit/conversation');
        });

        test('returns alternative implementation when forced', () => {
            const route = aiSelector.getConversationAIRoute(true);
            expect(route).toBe('/api/genkit/conversation-alt');
        });

        test('returns alternative implementation when env var is not set', () => {
            process.env.NEXT_PUBLIC_USE_GENKIT = '';
            const route = aiSelector.getConversationAIRoute();
            expect(route).toBe('/api/genkit/conversation-alt');
        });
    });

    describe('getHealthRiskAnalysisRoute', () => {
        test('returns genkit route by default', () => {
            const route = aiSelector.getHealthRiskAnalysisRoute();
            expect(route).toBe('/api/genkit/analyze-health');
        });

        test('returns vertex AI route when forced', () => {
            const route = aiSelector.getHealthRiskAnalysisRoute(true);
            expect(route).toBe('/api/ai/analyze-health');
        });
    });

    describe('getFutureRiskProjectionRoute', () => {
        test('returns genkit route by default', () => {
            const route = aiSelector.getFutureRiskProjectionRoute();
            expect(route).toBe('/api/genkit/risk-projection');
        });

        test('returns vertex AI route when forced', () => {
            const route = aiSelector.getFutureRiskProjectionRoute(true);
            expect(route).toBe('/api/ai/future-risk');
        });
    });

    describe('getAnamnesisQuestionRoute', () => {
        test('returns genkit route by default', () => {
            const route = aiSelector.getAnamnesisQuestionRoute();
            expect(route).toBe('/api/genkit/generate-anamnesis-question');
        });

        test('returns vertex AI route when forced', () => {
            const route = aiSelector.getAnamnesisQuestionRoute(true);
            expect(route).toBe('/api/ai/generate-anamnesis-question');
        });
    });

    describe('getAINotificationRoute', () => {
        test('returns genkit route by default', () => {
            const route = aiSelector.getAINotificationRoute();
            expect(route).toBe('/api/genkit/notification');
        });

        test('returns vertex AI route when forced', () => {
            const route = aiSelector.getAINotificationRoute(true);
            expect(route).toBe('/api/ai/notification');
        });
    });

    describe('shouldUseAlternativeImplementation', () => {
        test('returns false by default', () => {
            const result = aiSelector.shouldUseAlternativeImplementation();
            expect(result).toBe(false);
        });

        test('returns true when genkit failures exceed threshold', () => {
            localStorageMock.getItem.mockReturnValueOnce('3');
            const result = aiSelector.shouldUseAlternativeImplementation();
            expect(result).toBe(true);
        });

        test('returns true when vertex AI is preferred', () => {
            sessionStorageMock.getItem.mockReturnValueOnce('true');
            const result = aiSelector.shouldUseAlternativeImplementation();
            expect(result).toBe(true);
        });
    });

    describe('recordGenkitFailure', () => {
        test('increments the failure counter in localStorage', () => {
            localStorageMock.getItem.mockReturnValueOnce('1');
            aiSelector.recordGenkitFailure();
            expect(localStorageMock.setItem).toHaveBeenCalledWith('genkit_failures', '2');
        });

        test('logs telemetry when threshold is reached', () => {
            localStorageMock.getItem.mockReturnValueOnce('1');
            aiSelector.recordGenkitFailure();
            expect(window.gtag).toHaveBeenCalled();
        });
    });

    describe('resetGenkitFailures', () => {
        test('resets the failure counter in localStorage', () => {
            aiSelector.resetGenkitFailures();
            expect(localStorageMock.setItem).toHaveBeenCalledWith('genkit_failures', '0');
        });
    });

    describe('recordVertexAIFailure', () => {
        test('increments the failure counter in localStorage', () => {
            localStorageMock.getItem.mockReturnValueOnce('1');
            aiSelector.recordVertexAIFailure();
            expect(localStorageMock.setItem).toHaveBeenCalledWith('vertex_ai_failures', '2');
        });

        test('logs telemetry when threshold is reached', () => {
            localStorageMock.getItem.mockReturnValueOnce('1');
            aiSelector.recordVertexAIFailure();
            expect(window.gtag).toHaveBeenCalled();
        });
    });

    describe('setPreferredAIService', () => {
        test('sets vertex_ai as preferred in sessionStorage', () => {
            aiSelector.setPreferredAIService('vertex_ai');
            expect(sessionStorageMock.setItem).toHaveBeenCalledWith('prefer_vertex_ai', 'true');
        });

        test('sets genkit as preferred in sessionStorage', () => {
            aiSelector.setPreferredAIService('genkit');
            expect(sessionStorageMock.setItem).toHaveBeenCalledWith('prefer_vertex_ai', 'false');
        });
    });

    describe('getAIServicesStatus', () => {
        test('returns status when API call is successful', async () => {
            const mockResponse = {
                status: 'ok',
                genkitImportTest: { success: true },
                aiStatus: { googleAI: true },
                timestamp: '2023-01-01T00:00:00Z'
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await aiSelector.getAIServicesStatus();

            expect(result.status).toBe('ok');
            expect(result.genkitAvailable).toBe(true);
            expect(result.vertexAIAvailable).toBe(true);
            expect(result.recommendedService).toBe('genkit');
        });

        test('handles API call failure', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Internal Server Error'
            });

            const result = await aiSelector.getAIServicesStatus();

            expect(result.status).toBe('error');
            expect(result.genkitAvailable).toBe(false);
            expect(result.vertexAIAvailable).toBe(false);
        });

        test('handles exceptions during fetch', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await aiSelector.getAIServicesStatus();

            expect(result.status).toBe('error');
            expect(result.message).toContain('Network error');
        });
    });

    describe('logAIServiceTelemetry', () => {
        test('logs to console in development environment', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            console.log = jest.fn();

            aiSelector.logAIServiceTelemetry('genkit', 'success', { latency: 200 });

            expect(console.log).toHaveBeenCalled();

            process.env.NODE_ENV = originalEnv;
        });

        test('sends event to gtag when available', () => {
            aiSelector.logAIServiceTelemetry('genkit', 'success', { latency: 200 });

            expect(window.gtag).toHaveBeenCalledWith('event', 'ai_success', {
                ai_service: 'genkit',
                latency: 200
            });
        });

        test('stores telemetry in localStorage', () => {
            localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([]));

            aiSelector.logAIServiceTelemetry('genkit', 'success', { latency: 200 });

            expect(localStorageMock.setItem).toHaveBeenCalled();
            expect(localStorageMock.setItem.mock.calls[0][0]).toBe('ai_telemetry_log');
        });
    });
});
