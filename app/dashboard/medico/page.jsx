'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Este componente manejará la lógica de la página /dashboard/medico
function MedicoListContent() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si el usuario está autenticado, tiene datos y es un médico, redirigir a su dashboard específico.
    if (!authLoading && user && userData?.role === 'medico') {
      console.log(`MedicoListContent: User is a doctor (UID: ${user.uid}). Redirecting to their dashboard.`);
      router.push(`/dashboard/medico/${user.uid}`);
    }
  }, [user, userData, authLoading, router]);

  // Muestra un indicador de carga mientras se verifica la autenticación o el rol.
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si es un médico, mostrará un mensaje de redirección (esta vista será breve).
  if (user && userData?.role === 'medico') {
    return (
      <div className="p-8 text-center">
        <p className="text-blue-300">Redirigiendo a tu dashboard personal...</p>
      </div>
    );
  }

  // Para otros roles (pacientes, administradores) o si el usuario no está completamente cargado aún.
  return (
    <div className="min-h-screen p-8 text-white bg-blue-900">
      <h1 className="text-3xl font-bold mb-6">Acceso Médico</h1>
      <p className="text-xl">
        Esta área está restringida solo para médicos registrados en nuestra plataforma.
      </p>
      <div className="mt-8">
        <p className="text-lg">
          Si eres médico, por favor inicia sesión para acceder a tu panel personalizado.
        </p>
      </div>
    </div>
  );
}

export default function MedicoPage() {
  return (
    <ProtectedRoute>
      <MedicoListContent />
    </ProtectedRoute>
  );
}