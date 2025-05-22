'use client';

import { useState, useEffect, useRef } from 'react';
import { getPerformanceMetrics } from '@/services/unifiedAIService';

/**
 * Component to visualize AI service metrics with a chart
 */
export default function AIMetricsChart({ timeRange = '24h', metric = 'latency', height = 300 }) {
    const [metricsData, setMetricsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchMetrics() {
            setIsLoading(true);
            try {
                // Calculate start date based on time range
                const options = { limit: 100 };
                const now = new Date();

                switch (timeRange) {
                    case '24h':
                        options.startDate = new Date(now - 24 * 60 * 60 * 1000).toISOString();
                        break;
                    case '7d':
                        options.startDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
                        break;
                    case '30d':
                        options.startDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
                        break;
                }

                const data = await getPerformanceMetrics(options);
                if (isMounted) {
                    setMetricsData(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error fetching metrics:', err);
                    setError('No se pudieron cargar las métricas');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchMetrics();

        return () => {
            isMounted = false;
            // Cleanup chart if it exists
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [timeRange]);

    // Draw chart when data is available
    useEffect(() => {
        if (!metricsData || !chartRef.current || typeof window === 'undefined') return;

        // Check if Chart.js is available
        if (!window.Chart) {
            console.error('Chart.js not loaded. Charts disabled.');
            return;
        }

        // Process metrics for chart display
        const chartData = processMetricsForChart(metricsData.metrics, metric);

        // Destroy previous chart if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Create new chart
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: metric !== 'latency',
                        title: {
                            display: true,
                            text: getMetricLabel(metric)
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tiempo'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                }
            }
        });

    }, [metricsData, metric]);

    // Helper function to process metrics for chart display
    function processMetricsForChart(metrics, metricType) {
        if (!metrics || !metrics.length) {
            return { labels: [], datasets: [] };
        }

        // Group by service
        const serviceGroups = {};
        metrics.forEach(item => {
            if (!serviceGroups[item.service]) {
                serviceGroups[item.service] = [];
            }
            serviceGroups[item.service].push(item);
        });

        // Generate datasets for each service
        const datasets = [];
        const colors = {
            genkit: 'rgba(54, 162, 235, 0.7)',
            vertex_ai: 'rgba(255, 99, 132, 0.7)',
            default: 'rgba(75, 192, 192, 0.7)'
        };

        // Group timestamps into intervals
        const timeGroups = {};
        const interval = getTimeInterval(timeRange);

        metrics.forEach(item => {
            const date = new Date(item.timestamp);
            // Round to nearest interval
            const roundedTime = roundTimeToInterval(date, interval);
            const timeKey = roundedTime.toISOString();

            if (!timeGroups[timeKey]) {
                timeGroups[timeKey] = {};
            }

            if (!timeGroups[timeKey][item.service]) {
                timeGroups[timeKey][item.service] = [];
            }

            timeGroups[timeKey][item.service].push(item);
        });

        // Sort timestamps
        const sortedTimes = Object.keys(timeGroups).sort();

        // Generate labels (timestamps)
        const labels = sortedTimes.map(time => {
            const date = new Date(time);
            return date.toLocaleString();
        });

        // Generate datasets
        Object.keys(serviceGroups).forEach(service => {
            const color = colors[service] || colors.default;
            const data = sortedTimes.map(time => {
                const serviceData = timeGroups[time][service] || [];

                if (serviceData.length === 0) return null;

                // Calculate metric value based on metric type
                switch (metricType) {
                    case 'latency':
                        // Average latency for this time period
                        const latencies = serviceData
                            .filter(item => item.latencyMs && typeof item.latencyMs === 'number')
                            .map(item => item.latencyMs);
                        return latencies.length
                            ? latencies.reduce((sum, val) => sum + val, 0) / latencies.length
                            : null;

                    case 'success_rate':
                        // Success rate for this time period
                        const total = serviceData.length;
                        const successful = serviceData.filter(item => item.eventType === 'success').length;
                        return total > 0 ? (successful / total) * 100 : null;

                    case 'calls':
                        // Number of calls in this time period
                        return serviceData.length;

                    case 'errors':
                        // Number of errors in this time period
                        return serviceData.filter(item => item.eventType === 'failure').length;

                    default:
                        return null;
                }
            });

            datasets.push({
                label: `${service} ${getMetricLabel(metricType)}`,
                data,
                borderColor: color,
                backgroundColor: color.replace('0.7', '0.1'),
                borderWidth: 2,
                tension: 0.2,
                pointRadius: 3,
            });
        });

        return { labels, datasets };
    }

    // Helper function to get the appropriate interval based on time range
    function getTimeInterval(range) {
        switch (range) {
            case '24h': return 60 * 60 * 1000; // 1 hour in ms
            case '7d': return 6 * 60 * 60 * 1000; // 6 hours in ms
            case '30d': return 24 * 60 * 60 * 1000; // 1 day in ms
            default: return 60 * 60 * 1000;
        }
    }

    // Helper function to round a date to the nearest interval
    function roundTimeToInterval(date, interval) {
        const timestamp = date.getTime();
        const rounded = Math.floor(timestamp / interval) * interval;
        return new Date(rounded);
    }

    // Helper function to get the appropriate label for the metric
    function getMetricLabel(metricType) {
        switch (metricType) {
            case 'latency': return 'Latencia (ms)';
            case 'success_rate': return 'Tasa de Éxito (%)';
            case 'calls': return 'Número de Llamadas';
            case 'errors': return 'Errores';
            default: return 'Valor';
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
                <p>Cargando métricas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!metricsData || !metricsData.metrics || metricsData.metrics.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
                <p>No hay datos de métricas disponibles para el período seleccionado.</p>
            </div>
        );
    }

    return (
        <div style={{ height: `${height}px` }}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
}
