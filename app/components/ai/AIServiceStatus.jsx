'use client';

import { useState, useEffect } from 'react';
import { useGenkit } from '@/app/components/contexts/GenkitContext';
import { checkAIServicesStatus } from '@/services/unifiedAIService';

/**
 * Component that displays the status of AI services and allows changing preferences
 */
export default function AIServiceStatus({ showControls = true, compact = false }) {
    const {
        servicesStatus,
        preferredProvider,
        setProvider,
        loadingStates
    } = useGenkit();

    const [lastChecked, setLastChecked] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Refresh AI service status
    const refreshStatus = async () => {
        setIsRefreshing(true);
        try {
            await checkAIServicesStatus();
            setLastChecked(new Date());
        } catch (error) {
            console.error('Error refreshing AI service status:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Update last checked time when servicesStatus changes
    useEffect(() => {
        if (servicesStatus) {
            setLastChecked(new Date(servicesStatus.lastChecked || Date.now()));
        }
    }, [servicesStatus]);

    if (!servicesStatus) {
        return (
            <div className="bg-gray-100 rounded-md p-2 text-sm text-gray-600">
                {loadingStates?.checkStatus ? 'Verificando estado de servicios de IA...' : 'Estado de servicios de IA no disponible'}
            </div>
        );
    }

    // Determine status appearance
    const getStatusAppearance = () => {
        switch (servicesStatus.status) {
            case 'healthy':
                return { bgColor: 'bg-green-100', textColor: 'text-green-800', icon: '✓' };
            case 'degraded':
                return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: '⚠' };
            case 'unavailable':
                return { bgColor: 'bg-red-100', textColor: 'text-red-800', icon: '✗' };
            default:
                return { bgColor: 'bg-gray-100', textColor: 'text-gray-800', icon: '?' };
        }
    };

    const { bgColor, textColor, icon } = getStatusAppearance();

    if (compact) {
        return (
            <div className={`rounded-md p-2 text-xs flex items-center space-x-2 ${bgColor} ${textColor}`}>
                <span className="font-bold">{icon}</span>
                <span>
                    {servicesStatus.status === 'healthy' ? 'Servicios IA activos' :
                        servicesStatus.status === 'degraded' ? 'Servicios IA degradados' : 'Servicios IA no disponibles'}
                </span>
                {showControls && (
                    <button
                        onClick={refreshStatus}
                        disabled={isRefreshing}
                        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    >
                        ↻
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={`rounded-md p-3 ${bgColor}`}>
            <div className={`flex justify-between items-center ${textColor} font-medium`}>
                <div className="flex items-center space-x-2">
                    <span className="text-lg">{icon}</span>
                    <span>
                        Estado de Servicios de IA:
                        <span className="font-bold ml-1">
                            {servicesStatus.status === 'healthy' ? 'Operativos' :
                                servicesStatus.status === 'degraded' ? 'Degradados' : 'No Disponibles'}
                        </span>
                    </span>
                </div>
                {showControls && (
                    <button
                        onClick={refreshStatus}
                        disabled={isRefreshing}
                        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 text-sm"
                    >
                        {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                    </button>
                )}
            </div>

            <div className="mt-2 text-sm space-y-1">
                <div className="flex justify-between">
                    <span>GenKit API:</span>
                    <span className={servicesStatus.genkitAvailable ? 'text-green-600' : 'text-red-600'}>
                        {servicesStatus.genkitAvailable ? 'Disponible' : 'No Disponible'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Vertex AI:</span>
                    <span className={servicesStatus.vertexAIAvailable ? 'text-green-600' : 'text-red-600'}>
                        {servicesStatus.vertexAIAvailable ? 'Disponible' : 'No Disponible'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Proveedor actual:</span>
                    <span className="font-medium">
                        {preferredProvider === 'genkit' ? 'GenKit' : 'Vertex AI'}
                    </span>
                </div>
            </div>

            {showControls && (
                <div className="mt-3 flex items-center space-x-3 text-sm">
                    <span>Cambiar proveedor:</span>
                    <button
                        onClick={() => setProvider('genkit')}
                        disabled={!servicesStatus.genkitAvailable || preferredProvider === 'genkit'}
                        className={`px-2 py-1 rounded ${preferredProvider === 'genkit'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        GenKit
                    </button>
                    <button
                        onClick={() => setProvider('vertex')}
                        disabled={!servicesStatus.vertexAIAvailable || preferredProvider === 'vertex'}
                        className={`px-2 py-1 rounded ${preferredProvider === 'vertex'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Vertex AI
                    </button>
                </div>
            )}

            <div className="mt-2 text-xs text-gray-500">
                Última verificación: {lastChecked ? new Date(lastChecked).toLocaleString() : 'N/A'}
            </div>
        </div>
    );
}
