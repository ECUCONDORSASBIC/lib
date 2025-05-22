'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthDebugger() {
  const { user, userData, loading } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-0 right-0 m-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2 bg-gray-800 text-white text-xs rounded-md opacity-70 hover:opacity-100"
      >
        {isExpanded ? 'Ocultar' : 'Debug Auth'}
      </button>

      {isExpanded && (
        <div className="p-4 bg-gray-800 text-white rounded-md mt-2 w-80 text-xs overflow-auto max-h-80">
          <h3 className="font-bold mb-2">Estado de Auth</h3>
          <p>Loading: {loading ? 'Sí' : 'No'}</p>
          <p>Autenticado: {user ? 'Sí' : 'No'}</p>

          {user && (
            <>
              <p className="mt-2 font-semibold">Usuario:</p>
              <pre className="overflow-x-auto">{JSON.stringify({
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                displayName: user.displayName,
              }, null, 2)}</pre>

              {userData && (
                <>
                  <p className="mt-2 font-semibold">Datos adicionales:</p>
                  <pre className="overflow-x-auto">{JSON.stringify(userData, null, 2)}</pre>
                </>
              )}
            </>
          )}

          <div className="mt-4 pt-2 border-t border-gray-600">
            <p className="font-semibold mb-1">Acciones:</p>
            <button
              onClick={() => document.cookie.split(";").forEach(c => {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              })}
              className="p-1 bg-red-600 text-white rounded text-xs mr-2"
            >
              Borrar cookies
            </button>

            <button
              onClick={() => window.localStorage.clear()}
              className="p-1 bg-orange-600 text-white rounded text-xs"
            >
              Limpiar localStorage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
