'use client';

import { useState } from 'react';

/**
 * Debug component for Firebase operations
 * Shows status of Firebase operations and latest error messages
 * Only visible in development mode
 */
const FirebaseDebug = ({ user, formData, errors, lastSaved }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-2 py-1 bg-yellow-500 text-white rounded-md text-xs shadow-md"
      >
        {isExpanded ? 'Hide Debug' : 'Show Debug'}
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 bg-gray-900 text-white rounded-md shadow-lg text-xs w-80 max-h-96 overflow-y-auto">
          <h3 className="text-sm font-bold mb-2">Firebase Debug</h3>

          <div className="mb-2">
            <h4 className="font-medium">Auth Status:</h4>
            <pre className="text-green-400 whitespace-pre-wrap break-all">
              {user ? `Authenticated: ${user.uid.substring(0, 8)}...` : 'Not authenticated'}
            </pre>
          </div>

          {errors && Object.keys(errors).length > 0 && (
            <div className="mb-2">
              <h4 className="font-medium text-red-400">Validation Errors:</h4>
              <pre className="text-red-300 whitespace-pre-wrap break-all">
                {JSON.stringify(errors, null, 2)}
              </pre>
            </div>
          )}

          <div className="mb-2">
            <h4 className="font-medium">Form Data Sample:</h4>
            <pre className="text-blue-300 whitespace-pre-wrap break-all">
              {JSON.stringify(
                {
                  // Show just a sample of data to avoid overwhelming the UI
                  sexo: formData.sexo,
                  nombre_completo: formData.nombre_completo,
                  fecha_nacimiento: formData.fecha_nacimiento,
                  // Add other key fields as needed
                },
                null,
                2
              )}
            </pre>
          </div>

          {lastSaved && (
            <div>
              <h4 className="font-medium">Last Saved:</h4>
              <pre className="text-green-300">
                {lastSaved.toLocaleTimeString()}
              </pre>
            </div>
          )}

          <button
            onClick={() => console.log('Full form data:', formData)}
            className="mt-2 px-2 py-1 bg-blue-600 text-white rounded-md text-xs"
          >
            Log Full Data to Console
          </button>
        </div>
      )}
    </div>
  );
};

export default FirebaseDebug;
