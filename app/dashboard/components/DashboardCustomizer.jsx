'use client';

import { useState, useEffect } from 'react';
import { useGenkit } from '@/app/contexts/GenkitContext';
import { getPerformanceMetrics, getFeedbackSummary } from '@/services/unifiedAIService';
import AIServiceStatus from '@/app/components/ai/AIServiceStatus';

/**
 * Dashboard customization component that allows users to personalize their view
 * and see AI performance metrics
 */
export default function DashboardCustomizer() {
    const [layout, setLayout] = useState('grid');
    const [metrics, setMetrics] = useState(null);
    const [feedbackSummary, setFeedbackSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('24h');
    const [visibleWidgets, setVisibleWidgets] = useState({
        aiStatus: true,
        performance: true,
        feedback: true,
        recentActivity: true,
    });

    const { servicesStatus, preferredProvider } = useGenkit();

    // Load metrics and feedback data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                // Get metrics based on selected time range
                const options = {};
                switch (timeRange) {
                    case '24h':
                        options.startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                        break;
                    case '7d':
                        options.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                        break;
                    case '30d':
                        options.startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                        break;
                }

                const metricsData = await getPerformanceMetrics(options);
                setMetrics(metricsData);

                // Get feedback summary
                const summary = getFeedbackSummary();
                setFeedbackSummary(summary);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [timeRange]);

    // Toggle widget visibility
    const toggleWidget = (widgetKey) => {
        setVisibleWidgets(prev => ({
            ...prev,
            [widgetKey]: !prev[widgetKey]
        }));
    };

    // Change layout 
    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
        // Store user preference
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('dashboard_layout', newLayout);
        }
    };

    // Load saved preferences on mount
    useEffect(() => {
        if (typeof localStorage !== 'undefined') {
            const savedLayout = localStorage.getItem('dashboard_layout');
            if (savedLayout) {
                setLayout(savedLayout);
            }

            const savedWidgets = localStorage.getItem('dashboard_widgets');
            if (savedWidgets) {
                try {
                    setVisibleWidgets(JSON.parse(savedWidgets));
                } catch (e) {
                    console.error('Error parsing saved widgets:', e);
                }
            }
        }
    }, []);

    // Save widget preferences when they change
    useEffect(() => {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('dashboard_widgets', JSON.stringify(visibleWidgets));
        }
    }, [visibleWidgets]);

    return (
        <div className="dashboard-customizer">
            <div className="dashboard-controls">
                <h2 className="text-xl font-semibold mb-4">Personalizar Dashboard</h2>

                {/* Layout controls */}
                <div className="mb-6">
                    <h3 className="text-md font-medium mb-2">Diseño de Vista</h3>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleLayoutChange('grid')}
                            className={`px-3 py-2 rounded ${layout === 'grid' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        >
                            Cuadrícula
                        </button>
                        <button
                            onClick={() => handleLayoutChange('list')}
                            className={`px-3 py-2 rounded ${layout === 'list' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => handleLayoutChange('compact')}
                            className={`px-3 py-2 rounded ${layout === 'compact' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                        >
                            Compacto
                        </button>
                    </div>
                </div>

                {/* Widget selection */}
                <div className="mb-6">
                    <h3 className="text-md font-medium mb-2">Widgets Visibles</h3>
                    <div className="space-y-2">
                        {Object.entries(visibleWidgets).map(([key, visible]) => (
                            <div key={key} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`widget-${key}`}
                                    checked={visible}
                                    onChange={() => toggleWidget(key)}
                                    className="mr-2"
                                />
                                <label htmlFor={`widget-${key}`} className="capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Time range filter */}
                <div className="mb-6">
                    <h3 className="text-md font-medium mb-2">Rango de Tiempo</h3>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="24h">Últimas 24 horas</option>
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                    </select>
                </div>
            </div>

            {/* Dashboard content */}
            <div className={`dashboard-content mt-6 ${layout}`}>
                {/* AI Service Status Widget */}
                {visibleWidgets.aiStatus && (
                    <div className="dashboard-widget">
                        <h3 className="text-lg font-medium mb-3">Estado de Servicios IA</h3>
                        <AIServiceStatus showControls={true} compact={layout === 'compact'} />
                    </div>
                )}

                {/* Performance Metrics Widget */}
                {visibleWidgets.performance && (
                    <div className="dashboard-widget">
                        <h3 className="text-lg font-medium mb-3">Métricas de Rendimiento</h3>
                        {isLoading ? (
                            <p>Cargando métricas...</p>
                        ) : metrics?.summary ? (
                            <div className="performance-metrics">
                                {Object.entries(metrics.summary).map(([provider, stats]) => (
                                    <div key={provider} className="provider-metrics mb-4 p-3 border rounded">
                                        <h4 className="font-medium capitalize">{provider}</h4>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div>
                                                <p className="text-sm text-gray-600">Tasa de éxito</p>
                                                <p className="text-lg">{stats.successRate}%</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Latencia promedio</p>
                                                <p className="text-lg">{stats.avgLatencyMs} ms</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Llamadas totales</p>
                                                <p className="text-lg">{stats.totalCalls}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Fallbacks</p>
                                                <p className="text-lg">{stats.fallbackCount}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No hay datos de métricas disponibles</p>
                        )}
                    </div>
                )}

                {/* Feedback Summary Widget */}
                {visibleWidgets.feedback && (
                    <div className="dashboard-widget">
                        <h3 className="text-lg font-medium mb-3">Resumen de Feedback</h3>
                        {feedbackSummary ? (
                            <div className="feedback-summary">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 border rounded">
                                        <p className="text-sm text-gray-600">Total feedback</p>
                                        <p className="text-lg">{feedbackSummary.totalFeedbackCount}</p>
                                    </div>
                                    <div className="p-3 border rounded">
                                        <p className="text-sm text-gray-600">Calificación promedio</p>
                                        <p className="text-lg">{feedbackSummary.averageRating || 'N/A'}</p>
                                    </div>
                                </div>

                                {feedbackSummary.issueTypeCounts && Object.keys(feedbackSummary.issueTypeCounts).length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-md font-medium mb-2">Problemas reportados</h4>
                                        <ul className="space-y-1">
                                            {Object.entries(feedbackSummary.issueTypeCounts).map(([issue, count]) => (
                                                <li key={issue} className="flex justify-between">
                                                    <span className="capitalize">{issue}</span>
                                                    <span>{count}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p>No hay datos de feedback disponibles</p>
                        )}
                    </div>
                )}

                {/* Recent Activity Widget */}
                {visibleWidgets.recentActivity && (
                    <div className="dashboard-widget">
                        <h3 className="text-lg font-medium mb-3">Actividad Reciente</h3>
                        {metrics?.metrics && metrics.metrics.length > 0 ? (
                            <div className="recent-activity">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-2">Servicio</th>
                                            <th className="text-left p-2">Evento</th>
                                            <th className="text-left p-2">Tiempo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.metrics.slice(0, 10).map((activity, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                <td className="p-2 capitalize">{activity.service}</td>
                                                <td className="p-2 capitalize">{activity.eventType}</td>
                                                <td className="p-2">
                                                    {new Date(activity.timestamp).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No hay actividad reciente registrada</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
