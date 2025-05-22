'use client';

import { useState } from 'react';

const AlertItem = ({ 
  title, 
  description, 
  severity, // 'critical', 'warning', 'info'
  timestamp, 
  onDismiss,
  onAction,
  actionLabel
}) => {
  const getSeverityStyles = () => {
    switch (severity) {
      case 'critical':
        return {
          container: 'border-red-300 bg-red-50',
          icon: 'text-red-600',
          title: 'text-red-800',
          description: 'text-red-700',
          button: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      case 'warning':
        return {
          container: 'border-yellow-300 bg-yellow-50',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          description: 'text-yellow-700',
          button: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      default:
        return {
          container: 'border-blue-300 bg-blue-50',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          description: 'text-blue-700',
          button: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        };
    }
  };

  const styles = getSeverityStyles();
  
  return (
    <div className={`p-3 mb-2 border rounded-md shadow-sm ${styles.container}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`mr-3 ${styles.icon}`}>
            {severity === 'critical' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : severity === 'warning' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <h4 className={`font-medium ${styles.title}`}>{title}</h4>
            <p className={`text-sm mt-1 ${styles.description}`}>{description}</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              {timestamp && (
                <span>
                  {new Date(timestamp).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Descartar alerta"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {onAction && (
        <div className="mt-3 text-right">
          <button 
            onClick={onAction} 
            className={`px-3 py-1 text-xs font-medium rounded-md ${styles.button}`}
          >
            {actionLabel || "Ver detalles"}
          </button>
        </div>
      )}
    </div>
  );
};

export default function HealthAlerts({ alerts, onDismiss, onAction }) {
  const [showAll, setShowAll] = useState(false);
  
  // Filtrar alertas críticas para mostrar siempre primero
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const otherAlerts = alerts.filter(alert => alert.severity !== 'critical');
  
  // Decidir cuántas alertas mostrar
  const displayAlerts = showAll 
    ? [...criticalAlerts, ...otherAlerts] 
    : [...criticalAlerts, ...otherAlerts.slice(0, Math.max(0, 2 - criticalAlerts.length))];
  
  const hiddenCount = alerts.length - displayAlerts.length;

  return (
    <div className="space-y-2">
      {displayAlerts.length > 0 ? (
        <>
          {displayAlerts.map((alert, index) => (
            <AlertItem
              key={index}
              title={alert.title}
              description={alert.description}
              severity={alert.severity}
              timestamp={alert.timestamp}
              onDismiss={() => onDismiss(alert.id)}
              onAction={() => onAction(alert.id)}
              actionLabel={alert.actionLabel}
            />
          ))}
          
          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              Mostrar {hiddenCount} alerta{hiddenCount !== 1 ? 's' : ''} más
            </button>
          )}
        </>
      ) : (
        <div className="py-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="mt-2 text-gray-600">No hay alertas pendientes</p>
        </div>
      )}
    </div>
  );
}
