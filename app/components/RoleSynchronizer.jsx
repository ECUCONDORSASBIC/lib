'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useCallback, useEffect, useState } from 'react';

export default function RoleSynchronizer() {
  const { user, userData } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [syncAttempted, setSyncAttempted] = useState(false);

  // Verificar si necesitamos sincronizar los roles
  const needsSync = useCallback(async () => {
    if (!user || !userData?.role) return false;

    try {
      // Obtener token actual con claims
      const tokenResult = await user.getIdTokenResult(true);
      return !tokenResult.claims.role;
    } catch (error) {
      console.error('Error al verificar claims:', error);
      return false;
    }
  }, [user, userData]);

  // Función para sincronizar los roles
  const syncRoleClaims = useCallback(async () => {
    if (!user || !userData?.role || isSyncing) return;

    setIsSyncing(true);
    setStatusMessage('Sincronizando rol...');

    try {
      // Llamar a la API para sincronizar los roles
      const response = await fetch('/api/user/sync-role-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ uid: user.uid })
      });

      const data = await response.json();

      if (response.ok) {
        // Forzar actualización del token
        await user.getIdTokenResult(true);
        setStatusMessage(`Rol "${data.role}" sincronizado correctamente`);

        // Recargar la página después de un breve retraso
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setStatusMessage(`Error: ${data.error || 'No se pudo sincronizar el rol'}`);
      }
    } catch (error) {
      setStatusMessage(`Error de sincronización: ${error.message}`);
    } finally {
      setIsSyncing(false);
      setSyncAttempted(true);
    }
  }, [user, userData, isSyncing]);

  // Verificar y sincronizar al montar el componente
  useEffect(() => {
    async function checkAndSync() {
      if (await needsSync()) {
        syncRoleClaims();
      }
    }

    if (user && userData && !syncAttempted) {
      checkAndSync();
    }
  }, [user, userData, needsSync, syncRoleClaims, syncAttempted]);

  // No renderizar nada si no hay problema de sincronización
  if (!statusMessage) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md p-4 bg-white rounded-lg shadow-lg border border-blue-200 z-50">
      <div className="flex items-center space-x-3">
        {isSyncing ? (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        )}
        <span className="text-sm text-gray-700">{statusMessage}</span>
      </div>
    </div>
  );
}
