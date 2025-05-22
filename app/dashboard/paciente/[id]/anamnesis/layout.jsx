'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AnamnesisLayout({ children }) {
  const { id } = useParams();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Validación básica del ID
  const isValidId = id && typeof id === 'string' && id.trim().length > 0;

  // Manejar la navegación de vuelta al perfil del paciente
  const handleBackNavigation = () => {
    setIsNavigating(true);
    router.push(`/dashboard/paciente/${id}`);
  };

  // Reiniciar el estado de navegación cuando el componente se desmonte
  useEffect(() => {
    return () => setIsNavigating(false);
  }, []);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handleBackNavigation}
          disabled={isNavigating}
          className={`inline-flex items-center text-sm transition-colors
            ${isNavigating
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:text-blue-600'}`}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
          {isNavigating ? 'Volviendo...' : 'Volver al perfil del paciente'}
        </button>

        <div className="text-sm text-gray-500">
          ID Paciente: <span className="font-mono">{id}</span>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <h1 className="text-xl font-bold text-gray-800">Historia Clínica</h1>
          <p className="text-sm text-gray-600">Complete todos los campos para un historial médico completo</p>
        </div>

        <div className="p-6">
          {/* Mostrar un mensaje de advertencia si el ID no parece válido */}
          {!isValidId && (
            <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
              <p className="text-sm">
                El ID de paciente parece no ser válido. Esto podría causar problemas al cargar o guardar datos.
              </p>
            </div>
          )}

          {/* Contenido principal: formulario de anamnesis */}
          {children}
        </div>
      </div>
    </div>
  );
}
