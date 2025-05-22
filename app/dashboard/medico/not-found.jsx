'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();

  // Añadimos un efecto para registrar cuándo se muestra esta página
  useEffect(() => {
    console.log('[MedicoNotFound] Not found page shown - could indicate a navigation issue or wrong ID');

    // Establecer un temporizador para redirigir a la ruta base después de mostrar el error
    const redirectTimer = setTimeout(() => {
      console.log('[MedicoNotFound] Redirecting to base doctor dashboard');
      router.push('/dashboard/medico');
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-4 py-16 mx-auto text-center bg-white rounded-lg shadow-xl sm:max-w-md sm:p-8">
        <h1 className="text-4xl font-bold text-red-600">404</h1>
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Dashboard de médico no encontrado</h2>
        <p className="mb-8 text-gray-600">
          No se ha encontrado el médico solicitado o no tienes permisos para acceder a este dashboard.
        </p>
        <div className="space-y-4">
          <a
            href="/dashboard/medico"
            className="inline-block px-5 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Volver al dashboard
          </a>
          <p className="text-sm text-gray-500 mt-4">
            Serás redirigido automáticamente en 5 segundos...
          </p>
        </div>
      </div>
    </div>
  );
}
