'use client';

import { useState, useEffect } from 'react';

export default function ViewToggle({ onToggle, initialDetailed = false }) {
  const [isDetailed, setIsDetailed] = useState(initialDetailed);
  
  useEffect(() => {
    onToggle(isDetailed);
  }, [isDetailed, onToggle]);

  return (
    <div className="inline-flex items-center p-1 bg-blue-100 rounded-lg shadow-sm">
      <button
        onClick={() => setIsDetailed(false)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          !isDetailed 
            ? 'bg-white text-blue-800 shadow-sm' 
            : 'text-blue-600 hover:bg-blue-50'
        }`}
        aria-label="Ver resumen"
      >
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          Simplificado
        </span>
      </button>
      <button
        onClick={() => setIsDetailed(true)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          isDetailed 
            ? 'bg-white text-blue-800 shadow-sm' 
            : 'text-blue-600 hover:bg-blue-50'
        }`}
        aria-label="Ver detalle"
      >
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Detallado
        </span>
      </button>
    </div>
  );
}
