'use client';

import { useGenkit } from '@/app/contexts/GenkitContext';
import { useState } from 'react';
import { ArrowPathIcon, LightBulbIcon } from '@heroicons/react/24/outline';

export default function SmartAssistant({ formData, fieldName, formSection }) {
  const { generateSmartSuggestion, isProcessing } = useGenkit();
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleGetSuggestion = async () => {
    setShowSuggestion(true);
    try {
      const result = await generateSmartSuggestion(formData, fieldName, formSection);
      setSuggestion(result.suggestion);
    } catch (error) {
      console.error('Error generando sugerencia:', error);
      setSuggestion('No fue posible generar una sugerencia en este momento.');
    }
  };

  return (
    <div className="mt-1">
      <button
        onClick={handleGetSuggestion}
        type="button"
        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
      >
        <LightBulbIcon className="w-3 h-3 mr-1" />
        Obtener sugerencia
      </button>

      {showSuggestion && (
        <div className="p-2 mt-2 text-sm border border-blue-100 rounded bg-blue-50">
          {isProcessing ? (
            <div className="flex items-center text-gray-500">
              <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
              Generando sugerencia...
            </div>
          ) : (
            <div className="text-gray-700">{suggestion}</div>
          )}
        </div>
      )}
    </div>
  );
}
