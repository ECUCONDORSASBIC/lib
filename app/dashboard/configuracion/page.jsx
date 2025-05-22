"use client";

import { useAuth } from '@/app/contexts/AuthContext'; // Import useAuth
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ConfigurationPage = () => {
  const router = useRouter();
  const { user, logout } = useAuth(); // Usar 'logout' en lugar de 'signOut' para evitar conflictos
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(); // Usar la función logout del AuthContext
      // La función logout en AuthContext ya redirige a /login y muestra un toast.
      // No es necesario router.push('/') o router.refresh() aquí si logout lo maneja.
    } catch (error) {
      console.error('Error during logout:', error);
      // El manejo de errores y toasts ya está en la función logout del AuthContext
      // Podrías añadir un alert genérico aquí si la promesa de logout es rechazada y quieres feedback adicional.
      alert(`Error al cerrar sesión: ${error?.message || 'Ocurrió un error.'}`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Remove the entire redundant section that was causing errors

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configuración</h1>

      {/* Otras secciones de configuración */}

      <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Sesión</h2>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
          {isLoggingOut ? 'Cerrando Sesión...' : 'Cerrar Sesión'}
        </button>
      </div>
    </div>
  );
};

export default ConfigurationPage;
