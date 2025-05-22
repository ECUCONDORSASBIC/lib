"use client";

import { useAuth } from '@/app/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toast } from '@/app/components/ui/Toast';

// Importar componentes necesarios del dashboard actual
import AppointmentCalendar from '@/app/components/dashboard/medico/AppointmentCalendar';
import PatientList from '@/app/components/dashboard/medico/PatientList';
import PhysicianAlertList from '@/app/components/dashboard/medico/PhysicianAlertList';
import ErrorReportingService from '@/lib/errorReporting';
import { getDoctorPatients, getDoctorAppointments, getDoctorAlerts, fetchDoctorStats } from '@/app/services/doctorService';

export default function MedicoDashboardPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { id: doctorId } = useParams();
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    patients: [],
    appointments: [],
    alerts: [],
    stats: {}
  });

  // Verificar si el usuario está autenticado y tiene permiso para ver este dashboard
  useEffect(() => {
    if (!user || !userData) {
      router.push('/auth/login');
      return;
    }

    if (userData.role !== 'medico' && userData.role !== 'admin') {
      router.push('/dashboard');
      setToast({
        show: true,
        message: 'No tienes permisos para acceder al dashboard médico',
        type: 'error'
      });
      return;
    }

    // Verificar si el usuario es el mismo médico cuyo dashboard está viendo o si es admin
    if (userData.role === 'medico' && user.uid !== doctorId) {
      router.push(`/dashboard/medico/${user.uid}`);
      setToast({
        show: true,
        message: 'Solo puedes acceder a tu propio dashboard',
        type: 'error'
      });
      return;
    }

    // Si llegamos aquí, es porque el usuario tiene permiso para ver el dashboard
    // Cargar datos del médico (usar las mismas funciones que el dashboard actual)
    loadDoctorData();
  }, [user, userData, router, doctorId]);

  // Función para cargar datos (adaptar del dashboard actual)
  const loadDoctorData = async () => {
    // Implementar según la lógica actual del dashboard
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 rounded-full border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Médico</h1>
        <p className="text-gray-600">ID del médico: {doctorId}</p>
      </header>

      {/* Adaptar el contenido del dashboard actual aquí */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total de pacientes:</span>
              <span className="font-semibold">10</span>
            </div>
            <div className="flex justify-between">
              <span>Citas hoy:</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="flex justify-between">
              <span>Alertas activas:</span>
              <span className="font-semibold">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
