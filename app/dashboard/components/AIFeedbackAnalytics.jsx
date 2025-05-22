'use client';

import { useState, useEffect } from 'react';
import { getFeedbackSummary } from '@/services/unifiedAIService';

/**
 * Component for displaying and analyzing AI feedback data
 */
export default function AIFeedbackAnalytics() {
    const [feedbackData, setFeedbackData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedView, setSelectedView] = useState('summary');

    // Load feedback data
    useEffect(() => {
        setIsLoading(true);
        try {
            const summary = getFeedbackSummary();
            setFeedbackData(summary);
        } catch (error) {
            console.error('Error loading feedback data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return <div className="p-4 text-center">Cargando datos de feedback...</div>;
    }

    if (!feedbackData) {
        return (
            <div className="p-4 text-center">
                <p>No hay datos de feedback disponibles.</p>
                <p className="text-sm text-gray-500 mt-2">Los datos aparecerán aquí cuando los usuarios proporcionen feedback sobre las respuestas de IA.</p>
            </div>
        );
    }

    return (
        <div className="ai-feedback-analytics">
            {/* View selector */}
            <div className="view-selector mb-4 flex space-x-2">
                <button
                    onClick={() => setSelectedView('summary')}
                    className={`px-3 py-1 rounded ${selectedView === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Resumen
                </button>
                <button
                    onClick={() => setSelectedView('ratings')}
                    className={`px-3 py-1 rounded ${selectedView === 'ratings' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Calificaciones
                </button>
                <button
                    onClick={() => setSelectedView('issues')}
                    className={`px-3 py-1 rounded ${selectedView === 'issues' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Problemas
                </button>
            </div>

            {/* Summary view */}
            {selectedView === 'summary' && (
                <div className="summary-view">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="stat-card p-4 bg-white rounded shadow-sm">
                            <h3 className="text-gray-500 text-sm font-medium">Total Feedback</h3>
                            <p className="text-2xl font-bold">{feedbackData.totalFeedbackCount}</p>
                        </div>
                        <div className="stat-card p-4 bg-white rounded shadow-sm">
                            <h3 className="text-gray-500 text-sm font-medium">Calificación Promedio</h3>
                            <p className="text-2xl font-bold">{feedbackData.averageRating || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h3 className="font-medium mb-2">Distribución por Tipo</h3>
                        <div className="bg-white p-4 rounded shadow-sm">
                            {feedbackData.feedbackByType && Object.keys(feedbackData.feedbackByType).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(feedbackData.feedbackByType).map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center">
                                            <span className="capitalize">{formatFeedbackType(type)}</span>
                                            <div className="flex items-center">
                                                <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{ width: `${(count / feedbackData.totalFeedbackCount) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span>{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No hay datos de tipos de feedback disponibles</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <h3 className="font-medium mb-2">Última Actualización</h3>
                        <p className="text-sm text-gray-600">
                            {new Date(feedbackData.lastUpdated).toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            {/* Ratings view */}
            {selectedView === 'ratings' && (
                <div className="ratings-view">
                    <div className="bg-white p-4 rounded shadow-sm">
                        <h3 className="font-medium mb-4">Análisis de Calificaciones</h3>

                        {feedbackData.averageRating ? (
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="text-3xl font-bold mr-2">{feedbackData.averageRating}</div>
                                    <div className="text-sm text-gray-500">de 5</div>
                                </div>

                                <div className="rating-bars space-y-2">
                                    {[5, 4, 3, 2, 1].map(rating => {
                                        // Calculate approximately how many ratings of each level based on average
                                        // This is a simplification since we don't have the actual distribution
                                        const ratingCount = Math.round(
                                            feedbackData.totalFeedbackCount *
                                            (1 - Math.abs(rating - parseFloat(feedbackData.averageRating)) / 5)
                                        );
                                        const percentage = Math.max(0, Math.min(100,
                                            (ratingCount / feedbackData.totalFeedbackCount) * 100
                                        ));

                                        return (
                                            <div key={rating} className="flex items-center">
                                                <span className="w-4">{rating}</span>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mx-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <p className="mt-4 text-sm text-gray-500">
                                    * La distribución exacta por rating no está disponible, esta es una aproximación basada en el promedio.
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500">No hay datos de calificaciones disponibles</p>
                        )}
                    </div>
                </div>
            )}

            {/* Issues view */}
            {selectedView === 'issues' && (
                <div className="issues-view">
                    <div className="bg-white p-4 rounded shadow-sm">
                        <h3 className="font-medium mb-4">Problemas Reportados</h3>

                        {feedbackData.issueTypeCounts && Object.keys(feedbackData.issueTypeCounts).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(feedbackData.issueTypeCounts).map(([issue, count]) => (
                                    <div key={issue}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="capitalize">{formatIssueType(issue)}</span>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getIssueColor(issue)}`}
                                                style={{
                                                    width: `${(count / Math.max(...Object.values(feedbackData.issueTypeCounts))) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-6">
                                    <h4 className="text-sm font-medium mb-2">Acciones Recomendadas</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                        {getMostCommonIssue(feedbackData.issueTypeCounts) === 'hallucination' && (
                                            <li>Revisar y mejorar las fuentes de datos para reducir alucinaciones</li>
                                        )}
                                        {getMostCommonIssue(feedbackData.issueTypeCounts) === 'incorrect' && (
                                            <li>Evaluar la precisión del modelo y considerar reentrenamiento</li>
                                        )}
                                        {getMostCommonIssue(feedbackData.issueTypeCounts) === 'inappropriate' && (
                                            <li>Revisar los filtros de contenido y mejorar guardrails</li>
                                        )}
                                        {getMostCommonIssue(feedbackData.issueTypeCounts) === 'irrelevant' && (
                                            <li>Mejorar la relevancia ajustando los prompts y las instrucciones del modelo</li>
                                        )}
                                        <li>Recopilar más feedback específico para entender mejor los problemas</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No hay problemas reportados</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    // Helper functions
    function formatFeedbackType(type) {
        const typeMap = {
            'rating': 'Calificación',
            'issue_flag': 'Reporte de problema',
            'improvement': 'Sugerencia de mejora',
            'prompt_feedback': 'Feedback de prompt',
            'unknown': 'Desconocido'
        };

        return typeMap[type] || type;
    }

    function formatIssueType(issue) {
        const issueMap = {
            'hallucination': 'Alucinación',
            'inappropriate': 'Contenido inapropiado',
            'incorrect': 'Información incorrecta',
            'irrelevant': 'Respuesta irrelevante',
            'other': 'Otro problema'
        };

        return issueMap[issue] || issue;
    }

    function getIssueColor(issue) {
        const colorMap = {
            'hallucination': 'bg-amber-500',
            'inappropriate': 'bg-red-500',
            'incorrect': 'bg-orange-500',
            'irrelevant': 'bg-blue-500',
            'other': 'bg-gray-500'
        };

        return colorMap[issue] || 'bg-gray-600';
    }

    function getMostCommonIssue(issueCounts) {
        if (!issueCounts || Object.keys(issueCounts).length === 0) return null;

        return Object.entries(issueCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }
}
