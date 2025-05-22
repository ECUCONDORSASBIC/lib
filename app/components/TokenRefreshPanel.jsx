'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { ArrowPathIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';

export default function TokenRefreshPanel({ patientId, onTokenRefreshed }) {
  const { user, userData, refreshUserDataAndToken } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [autoRefreshAttempted, setAutoRefreshAttempted] = useState(false);

  // Función para obtener y mostrar información del token actual
  const fetchTokenInfo = useCallback(async () => {
    if (!user) return null;
    try {
      const tokenResult = await user.getIdTokenResult(false);
      return {
        role: tokenResult.claims.role || null,
        expirationTime: new Date(tokenResult.expirationTime).toLocaleString(),
        authTime: new Date(tokenResult.authTime).toLocaleString(),
        issuedAtTime: new Date(tokenResult.issuedAtTime).toLocaleString(),
        signInProvider: tokenResult.signInProvider,
        hasRoleClaim: !!tokenResult.claims.role
      };
    } catch (error) {
      console.error("Error al obtener información del token:", error);
      return null;
    }
  }, [user]);

  // Refrescar token
  const handleRefreshToken = async () => {
    if (!user) return;

    setIsRefreshing(true);
    try {
      await refreshUserDataAndToken();
      const newTokenInfo = await fetchTokenInfo();
      setTokenInfo(newTokenInfo);

      if (newTokenInfo?.hasRoleClaim && typeof onTokenRefreshed === 'function') {
        onTokenRefreshed();
      }
    } catch (error) {
      console.error("Error al refrescar token:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Cargar información del token al montar el componente
  useEffect(() => {
    const loadTokenInfo = async () => {
      const info = await fetchTokenInfo();
      setTokenInfo(info);

      // Si hay datos en Firestore pero no en el token, intentar un auto-refresh
      if (!autoRefreshAttempted && userData?.role && !info?.hasRoleClaim) {
        setAutoRefreshAttempted(true);
        await handleRefreshToken();
      }
    };

    if (user) {
      loadTokenInfo();
    }
  }, [user, userData, fetchTokenInfo, autoRefreshAttempted, handleRefreshToken]);

  // Si no hay problema de permisos, no mostrar el componente
  if (tokenInfo?.hasRoleClaim) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4 rounded-md shadow-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ShieldExclamationIcon className="h-6 w-6 text-amber-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">
            Problema de permisos detectado
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              Tu cuenta tiene el rol <strong>{userData?.role || 'desconocido'}</strong> en el sistema, pero
              el token de autenticación no incluye esta información.
            </p>

            {tokenInfo && (
              <div className="mt-2 p-2 bg-amber-100 rounded text-xs font-mono overflow-auto">
                <p>Role en token: {tokenInfo.role || 'no definido'}</p>
                <p>Role en Firestore: {userData?.role || 'no definido'}</p>
                <p>Expiración del token: {tokenInfo.expirationTime}</p>
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={handleRefreshToken}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-300"
              >
                {isRefreshing ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando token...
                  </>
                ) : (
                  'Actualizar permisos'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
