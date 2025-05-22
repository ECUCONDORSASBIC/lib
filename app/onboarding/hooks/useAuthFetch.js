'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useCallback, useState } from 'react';

export const useAuthFetch = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const authFetch = useCallback(async (url, options = {}) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken(true);
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      setError(err.message || 'Error en la petición');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return { authFetch, isLoading, error };
};
