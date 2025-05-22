'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useState } from 'react';

export default function RefreshToken() {
  const { user, refreshUserDataAndToken } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  const handleRefreshToken = async () => {
    if (!user) {
      setMessage('No hay usuario autenticado');
      return;
    }

    setIsRefreshing(true);
    setMessage('Actualizando token...');

    try {
      await refreshUserDataAndToken();

      // Obtener token fresco para mostrar claims
      const token = await user.getIdTokenResult(true);

      setMessage(`Token actualizado. Claims: ${JSON.stringify(token.claims)}`);
    } catch (error) {
      setMessage(`Error al actualizar token: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Gestión del token</h2>
      <button
        onClick={handleRefreshToken}
        disabled={isRefreshing || !user}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isRefreshing ? 'Actualizando...' : 'Refrescar token'}
      </button>

      {message && (
        <div className="mt-3 p-3 bg-gray-50 rounded border text-sm">
          {message}
        </div>
      )}
    </div>
  );
}
