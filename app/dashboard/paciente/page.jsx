'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Este componente manejará la lógica de la página /dashboard/paciente
function PacienteListContent() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si el usuario está autenticado, tiene datos y es un paciente, redirigir a su dashboard específico.
    if (!authLoading && user && userData?.role === 'paciente') {
      console.log(`PacienteListContent: User is a patient (UID: ${user.uid}). Redirecting to their dashboard.`);
      router.push(`/dashboard/paciente/${user.uid}`);
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

  // Si es un paciente, mostrará un mensaje de redirección (esta vista será breve).
  if (user && userData?.role === 'paciente') {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-300">Redirigiendo a tu dashboard personal...</p>
      </div>
    );
  }

  // Para otros roles (médicos, administradores) o si el usuario no está completamente cargado aún.
  // Muestra el título "Listado de Pacientes" y el mensaje de bienvenida.
  // Aquí se implementaría la lógica para buscar y mostrar la lista de pacientes para médicos/admins.
  return (
    <div className="min-h-screen p-8 text-white bg-slate-900"> {/* Estilo para coincidir con la captura */}
      <h1 className="mb-2 text-3xl font-bold text-white">Listado de Pacientes</h1>
      {user && <p className="mb-6 text-slate-300">Bienvenido, {user.email}</p>}

      {user && userData?.role !== 'paciente' && (
        <div className="mt-8 text-slate-400">
          <p>(Aquí se mostrará el listado de pacientes para el personal médico)</p>
          {/* Ejemplo: <PatientTableComponent patients={fetchedPatients} /> */}
        </div>
      )}
      {!user && !authLoading && (
        <p className="text-slate-400">Por favor, inicie sesión para ver el contenido.</p>
      )}
    </div>
  );
}

// El componente principal exportado para la ruta /dashboard/paciente
export default function PacientePage() {
  return (
    <ProtectedRoute>
      <PacienteListContent />
    </ProtectedRoute>
  );
}

// Se eliminan las definiciones anteriores de PacienteList, PatientDashboard y PacientePageWrapper
// que estaban en este archivo para evitar duplicación y confusión, ya que la lógica del dashboard
// detallado del paciente reside en `app/dashboard/paciente/[id]/page.jsx`.
