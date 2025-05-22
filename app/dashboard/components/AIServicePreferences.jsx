'use client';

import { useState, useEffect } from 'react';
import { useGenkit } from '@/app/contexts/GenkitContext';

/**
 * Component for setting AI service preferences
 */
export default function AIServicePreferences() {
    const { preferredProvider, setProvider, servicesStatus } = useGenkit();
    const [localPreferences, setLocalPreferences] = useState({
        provider: preferredProvider || 'auto',
        fallbackEnabled: true,
        telemetryEnabled: true,
        feedbackCollection: true
    });

    // Update local state when context values change
    useEffect(() => {
        if (preferredProvider) {
            setLocalPreferences(prev => ({ ...prev, provider: preferredProvider }));
        }
    }, [preferredProvider]);

    // Load saved preferences from localStorage
    useEffect(() => {
        if (typeof localStorage !== 'undefined') {
            try {
                const savedPrefs = localStorage.getItem('ai_service_preferences');
                if (savedPrefs) {
                    const parsedPrefs = JSON.parse(savedPrefs);
                    setLocalPreferences(prev => ({ ...prev, ...parsedPrefs }));

                    // Update context if provider preference exists
                    if (parsedPrefs.provider && parsedPrefs.provider !== 'auto') {
                        setProvider(parsedPrefs.provider);
                    }
                }
            } catch (error) {
                console.error('Error loading AI service preferences:', error);
            }
        }
    }, [setProvider]);

    // Save preferences when they change
    const savePreferences = (newPrefs) => {
        const updatedPrefs = { ...localPreferences, ...newPrefs };
        setLocalPreferences(updatedPrefs);

        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('ai_service_preferences', JSON.stringify(updatedPrefs));
            }

            // Update provider in context if changed
            if (newPrefs.provider && newPrefs.provider !== preferredProvider) {
                setProvider(newPrefs.provider === 'auto' ? null : newPrefs.provider);
            }
        } catch (error) {
            console.error('Error saving AI service preferences:', error);
        }
    };

    return (
        <div className="ai-service-preferences">
            <h3 className="text-lg font-medium mb-4">Preferencias de Servicios IA</h3>

            <div className="space-y-6">
                {/* Provider selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proveedor preferido
                    </label>
                    <div className="flex flex-col space-y-2">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="provider"
                                value="auto"
                                checked={localPreferences.provider === 'auto'}
                                onChange={() => savePreferences({ provider: 'auto' })}
                                className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Automático (recomendado)</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="provider"
                                value="genkit"
                                checked={localPreferences.provider === 'genkit'}
                                onChange={() => savePreferences({ provider: 'genkit' })}
                                className="h-4 w-4 text-blue-600"
                                disabled={!servicesStatus?.genkitAvailable}
                            />
                            <span className="ml-2">
                                Genkit
                                {!servicesStatus?.genkitAvailable && (
                                    <span className="ml-2 text-xs text-red-500">(No disponible)</span>
                                )}
                            </span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="provider"
                                value="vertex_ai"
                                checked={localPreferences.provider === 'vertex_ai'}
                                onChange={() => savePreferences({ provider: 'vertex_ai' })}
                                className="h-4 w-4 text-blue-600"
                                disabled={!servicesStatus?.vertexAIAvailable}
                            />
                            <span className="ml-2">
                                Vertex AI
                                {!servicesStatus?.vertexAIAvailable && (
                                    <span className="ml-2 text-xs text-red-500">(No disponible)</span>
                                )}
                            </span>
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        El modo automático selecciona el mejor proveedor según disponibilidad y rendimiento.
                    </p>
                </div>

                {/* Fallback toggle */}
                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                            Habilitar fallback automático
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={localPreferences.fallbackEnabled}
                                onChange={() => savePreferences({ fallbackEnabled: !localPreferences.fallbackEnabled })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Cuando está habilitado, si un proveedor falla, se intentará automáticamente con otro.
                    </p>
                </div>

                {/* Telemetry toggle */}
                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                            Compartir métricas de rendimiento
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={localPreferences.telemetryEnabled}
                                onChange={() => savePreferences({ telemetryEnabled: !localPreferences.telemetryEnabled })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Ayuda a mejorar los servicios compartiendo métricas anónimas de rendimiento.
                    </p>
                </div>

                {/* Feedback collection toggle */}
                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                            Recolección de feedback
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={localPreferences.feedbackCollection}
                                onChange={() => savePreferences({ feedbackCollection: !localPreferences.feedbackCollection })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Permite enviar feedback sobre respuestas de IA para mejorar la calidad.
                    </p>
                </div>
            </div>
        </div>
    );
}
