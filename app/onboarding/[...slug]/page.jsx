"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Normaliza un ID de paso de onboarding de snake_case a camelCase
 * @param {string} stepId - ID del paso en formato potencialmente snake_case
 * @returns {string} - ID normalizado en camelCase
 */
const normalizeStepId = (stepId) => {
  if (!stepId) return '';
  return stepId.includes('_')
    ? stepId.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    : stepId;
};

export default function OnboardingRedirect() {
  const router = useRouter();
  const params = useParams();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Limpiar cualquier flag anti-bucle que pudiera existir
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lastRedirectAttempt');
    }

    try {
      if (!params.slug || !Array.isArray(params.slug) || params.slug.length === 0) {
        console.warn('[OnboardingRedirect] Parámetros de slug inválidos:', params.slug);
        setError('Ruta de onboarding inválida');
        router.replace('/onboarding');
        return;
      }

      const rawStep = params.slug[params.slug.length - 1];

      if (!rawStep || typeof rawStep !== 'string' || !rawStep.trim()) {
        console.warn('[OnboardingRedirect] ID de paso vacío o inválido');
        setError('Paso de onboarding no especificado');
        router.replace('/onboarding');
        return;
      }

      const normalizedStep = normalizeStepId(rawStep);

      console.log(
        `[OnboardingRedirect] Normalizando paso: "${rawStep}" → "${normalizedStep}". Redirigiendo a /onboarding?step=${normalizedStep}`
      );

      router.replace(`/onboarding?step=${normalizedStep}`);
    } catch (err) {
      console.error('[OnboardingRedirect] Error durante la redirección:', err);
      setError('Error al procesar la ruta de onboarding');
      setIsRedirecting(false);
      router.replace('/onboarding');
    }
  }, [params.slug, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="p-3 mb-4 bg-red-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="mb-2 font-medium text-red-600">{error}</p>
        <p className="text-gray-600">Redirigiendo a la página principal de onboarding...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-12 h-12 mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      <p className="font-medium text-gray-700">Normalizando formato del paso...</p>
      <p className="mt-2 text-sm text-gray-500">Serás redirigido en un momento</p>
    </div>
  );
}
