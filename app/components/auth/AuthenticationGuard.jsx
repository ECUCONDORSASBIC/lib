'use client';

import LoadingIndicator from '@/app/components/ui/LoadingIndicator';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function AuthenticationGuard({
  children,
  minStableTime = 2000,
  redirectTo = '/login'
}) {
  const { user, loading: authLoading } = useAuth();
  const [isStable, setIsStable] = useState(false);
  const [previouslyAuthenticated, setPreviouslyAuthenticated] = useState(false);
  const stabilityTimerRef = useRef(null);
  const hasRedirectedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Si detectamos un usuario, marcamos que ha estado autenticado
    if (user?.uid) {
      setPreviouslyAuthenticated(true);

      // Limpiar cualquier timer existente
      if (stabilityTimerRef.current) {
        clearTimeout(stabilityTimerRef.current);
      }

      // Establecer un nuevo timer para estabilidad
      stabilityTimerRef.current = setTimeout(() => {
        console.log('[AuthGuard] Authentication state confirmed stable');
        setIsStable(true);
      }, minStableTime);
    }
    else if (!user && !authLoading && previouslyAuthenticated) {
      // Si anteriormente había un usuario y ahora no, y no estamos cargando,
      // redirigimos al login - esto sugiere pérdida deliberada de autenticación
      console.log('[AuthGuard] Previously authenticated, but now logged out - redirecting');

      // Use a ref to track if we've already redirected to prevent multiple redirects
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        setTimeout(() => {
          router.push(redirectTo);
        }, 100);
      }
    }

    return () => {
      if (stabilityTimerRef.current) {
        clearTimeout(stabilityTimerRef.current);
      }
    };
  }, [user, authLoading, previouslyAuthenticated, minStableTime, router, redirectTo]);

  if (authLoading || !isStable) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <LoadingIndicator
            message={authLoading ? "Verificando autenticación..." : "Preparando sesión..."}
            size="medium"
            variant="primary"
          />
          <p className="text-gray-500 text-sm text-center mt-4">
            {authLoading
              ? "Conectando con el servidor..."
              : "Estableciendo sesión segura..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="mb-4 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m1-4a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sesión no iniciada</h2>
          <p className="text-gray-600 mb-4">Por favor inicia sesión para acceder a esta página</p>
          <button
            onClick={() => router.push(redirectTo)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return children;
}
