'use client';

import AppointmentCalendar from '@/app/components/dashboard/medico/AppointmentCalendar';
import AppointmentModal from '@/app/components/dashboard/medico/AppointmentModal';
import Spinner from '@/app/components/ui/Spinner'; // Assuming Spinner component path
import { Toast } from '@/app/components/ui/Toast'; // Assuming Toast component path
import { useAuth } from '@/app/onboarding/hooks/useAuth';
import { createAppointment, deleteAppointment, getDoctorAppointments, updateAppointment } from '@/app/services/appointmentService';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function CitasPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fetchAppointments = useCallback(async () => {
    if (!currentUser?.uid) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAppointments = await getDoctorAppointments(currentUser.uid);
      setAppointments(fetchedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Error al cargar las citas. Por favor, inténtelo de nuevo.');
      setToast({ show: true, message: 'Error al cargar las citas.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleOpenCreateModal = () => {
    setSelectedAppointment(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    // setModalMode('create'); // Optionally reset mode
  };

  const handleAppointmentSubmit = async (appointmentData) => {
    setIsLoading(true);
    try {
      if (modalMode === 'create') {
        await createAppointment({ ...appointmentData, doctorId: currentUser.uid });
        setToast({ show: true, message: 'Cita creada exitosamente.', type: 'success' });
      } else if (modalMode === 'edit' && selectedAppointment) {
        await updateAppointment(selectedAppointment.id, appointmentData);
        setToast({ show: true, message: 'Cita actualizada exitosamente.', type: 'success' });
      }
      fetchAppointments(); // Refresh list
      handleCloseModal();
    } catch (err) {
      console.error('Error submitting appointment:', err);
      setToast({ show: true, message: `Error al ${modalMode === 'create' ? 'crear' : 'actualizar'} la cita.`, type: 'error' });
      setError(`Error al ${modalMode === 'create' ? 'crear' : 'actualizar'} la cita.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta cita?')) return;
    setIsLoading(true);
    try {
      await deleteAppointment(appointmentId);
      setToast({ show: true, message: 'Cita eliminada exitosamente.', type: 'success' });
      fetchAppointments(); // Refresh list
      if (selectedAppointment?.id === appointmentId) { // If deleted appointment was selected in modal
        handleCloseModal();
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setToast({ show: true, message: 'Error al eliminar la cita.', type: 'error' });
      setError('Error al eliminar la cita.');
    } finally {
      setIsLoading(false);
    }
  };

  // Close toast after a delay
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!currentUser) {
    // Or a more specific loading/auth check component
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestión de Citas</h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Nueva Cita
        </button>
      </div>

      {isLoading && !isModalOpen && ( // Show general loading spinner only if modal is not open (modal might have its own)
        <div className="flex justify-center items-center my-10">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!isLoading && !error && (
        <AppointmentCalendar
          appointments={appointments}
          onEditAppointment={handleOpenEditModal} // For list view edit
          onDeleteAppointment={handleDeleteAppointment} // For list view delete
          onSelectAppointment={handleOpenEditModal} // For calendar event click
        // onDateClick={(date) => { /* TODO: Optionally open create modal with date prefilled */ }}
        />
      )}

      {isModalOpen && currentUser?.uid && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleAppointmentSubmit} // Changed from onSubmit to onSave
          appointment={selectedAppointment} // Changed from initialData to appointment
          mode={modalMode}
          doctorId={currentUser.uid}
        />
      )}
    </div>
  );
}
