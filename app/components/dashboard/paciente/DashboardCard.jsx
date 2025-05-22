'use client';

import { useState } from 'react';

export default function DashboardCard({
  title,
  icon,
  children,
  expandable = false,
  initialExpanded = false,
  importance = 'normal', // 'critical', 'normal', 'low'
  className = '',
  footerContent = null,
  actionButton = null,
  isDetailed = false
}) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // Determinamos colores basados en la importancia
  const getBorderColor = () => {
    switch (importance) {
      case 'critical': return 'border-red-300';
      case 'warning': return 'border-yellow-300';
      case 'success': return 'border-green-300';
      case 'low': return 'border-gray-200';
      default: return 'border-blue-200';
    }
  };

  const getHeaderColor = () => {
    switch (importance) {
      case 'critical': return 'bg-red-50 text-red-700';
      case 'warning': return 'bg-yellow-50 text-yellow-700';
      case 'success': return 'bg-green-50 text-green-700';
      case 'low': return 'bg-gray-50 text-gray-600';
      default: return 'bg-blue-50 text-blue-700';
    }
  };

  return (
    <div className={`relative rounded-lg border ${getBorderColor()} overflow-hidden shadow-sm transition-all duration-200 ${className} ${isExpanded ? 'ring-2 ring-blue-300' : ''}`}>
      <div className={`flex items-center justify-between p-3 ${getHeaderColor()}`}>
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <h3 className="font-medium">{title}</h3>
        </div>

        <div className="flex items-center space-x-1">
          {actionButton}
          
          {expandable && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full hover:bg-white/50"
              aria-label={isExpanded ? "Contraer" : "Expandir"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={`p-3 bg-white ${expandable && !isExpanded && !isDetailed ? 'max-h-48 overflow-hidden' : ''}`}>
        {children}
        
        {expandable && !isExpanded && !isDetailed && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent flex items-end justify-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="mb-2 px-3 py-1 text-xs text-blue-600 bg-white border border-blue-200 rounded-full shadow-sm hover:bg-blue-50"
            >
              Ver más
            </button>
          </div>
        )}
      </div>

      {footerContent && (
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
          {footerContent}
        </div>
      )}
    </div>
  );
}
