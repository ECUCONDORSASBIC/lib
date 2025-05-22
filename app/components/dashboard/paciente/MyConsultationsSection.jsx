'use client';

import { CalendarDaysIcon, ChevronRightIcon, DocumentMagnifyingGlassIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../../../../lib/firebase/firebaseClient';
import { useRouter } from 'next/navigation';
import { Toast } from '../../ui/Toast';

const ActionButton = ({ children, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between w-full p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors text-left"
  >
    <div className="flex items-center">
      {icon && <span className="mr-3 h-6 w-6">{icon}</span>}
      <span className="font-medium">{children}</span>
    </div>
    <ChevronRightIcon className="h-5 w-5" />
  </button>
);

const InfoCard = ({ title, children, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center text-blue-600 mb-3">
      {icon && <span className="mr-2 h-6 w-6">{icon}</span>}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="text-gray-700 space-y-2 text-sm">
      {children}
    </div>
  </div>
);

const MyConsultationsSection = ({ patientId, consultationsData }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const db = getFirestore(app);

  // Mock data - replace with actual data fetching and props
  const mockRecentConsultations = [
    { id: 1, date: '2025-05-10', reason: 'Chequeo general', doctor: 'Dr. Alan Grant' },
    { id: 2, date: '2025-04-22', reason: 'Dolor de espalda', doctor: 'Dra. Ellie Sattler' },
  ];

  const mockUpcomingConsultations = [
    { id: 3, date: '2025-05-20', time: '10:00 AM', doctor: 'Dr. Ian Malcolm', type: 'Telemedicina' },
  ];

  const mockExams = [
    { id: 1, name: 'Análisis de sangre completo', date: '2025-05-25', status: 'Programado' },
    { id: 2, name: 'Radiografía de tórax', date: '2025-05-15', status: 'Resultados listos' },
  ];

  const handleStartTelemedicine = async () => {
    if (!patientId) {
      setToast({
        show: true,
        message: 'Debe iniciar sesión para acceder a telemedicina',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Crear una nueva sala de telemedicina en Firestore
      const meetingData = {
        patientId,
        createdAt: serverTimestamp(),
        status: 'waiting', // waiting, active, ended
        type: 'telemedicine',
        meetingCode: `tele-${Math.random().toString(36).substring(2, 9)}`,
      };

      const docRef = await addDoc(collection(db, 'telemedicineSessions'), meetingData);

      // Usar setTimeout para evitar múltiples navegaciones rápidas
      setTimeout(() => {
        router.push(`/dashboard/paciente/${patientId}/telemedicina/${docRef.id}`);
      }, 100);
    } catch (error) {
      console.error('Error al iniciar sesión de telemedicina:', error);
      setToast({
        show: true,
        message: 'Error al iniciar la consulta. Intente nuevamente.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar el toast después de 5 segundos
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <section id="mis-consultas" className="p-6 bg-gray-50 rounded-xl shadow-lg space-y-6">
      {/* Toast para notificaciones */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          autoClose={true}
        />
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
        Mis Consultas
        {/* Enlace a ver todas las consultas */}
        {patientId && (
          <a
            href={`/dashboard/paciente/${patientId}/consultas`}
            className="text-blue-600 hover:underline text-base font-normal ml-4"
          >
            Ver todas
          </a>
        )}
      </h2>

      {/* Telemedicina */}
      <div className="mb-6">
        <ActionButton
          icon={<VideoCameraIcon />}
          onClick={handleStartTelemedicine}
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando consulta...' : 'Iniciar Consulta por Telemedicina'}
        </ActionButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Consultas Recientes */}
        <InfoCard title="Consultas Recientes" icon={<CalendarDaysIcon />}>
          {mockRecentConsultations.length > 0 ? (
            mockRecentConsultations.map(consult => (
              <div key={consult.id} className="p-3 bg-gray-100 rounded-md">
                <p><strong>Fecha:</strong> {new Date(consult.date).toLocaleDateString()}</p>
                <p><strong>Motivo:</strong> {consult.reason}</p>
                <p><strong>Médico:</strong> {consult.doctor}</p>
              </div>
            ))
          ) : (
            <p>No hay consultas recientes.</p>
          )}
        </InfoCard>

        {/* Próximas Consultas Agendadas */}
        <InfoCard title="Próximas Consultas" icon={<CalendarDaysIcon />}>
          {mockUpcomingConsultations.length > 0 ? (
            mockUpcomingConsultations.map(consult => (
              <div key={consult.id} className="p-3 bg-gray-100 rounded-md">
                <p><strong>Fecha:</strong> {new Date(consult.date).toLocaleDateString()} a las {consult.time}</p>
                <p><strong>Profesional:</strong> {consult.doctor}</p>
                <p><strong>Tipo:</strong> {consult.type}</p>
                <button className="text-sm text-blue-500 hover:underline mt-1">Ver detalles / Modificar</button>
              </div>
            ))
          ) : (
            <p>No tiene próximas consultas agendadas.</p>
          )}
        </InfoCard>

        {/* Exámenes Complementarios */}
        <InfoCard title="Exámenes Complementarios" icon={<DocumentMagnifyingGlassIcon />}>
          {mockExams.length > 0 ? (
            mockExams.map(exam => (
              <div key={exam.id} className="p-3 bg-gray-100 rounded-md">
                <p><strong>Estudio:</strong> {exam.name}</p>
                <p><strong>Fecha:</strong> {new Date(exam.date).toLocaleDateString()}</p>
                <p><strong>Estado:</strong> <span className={`px-2 py-0.5 text-xs rounded-full ${exam.status === 'Resultados listos' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{exam.status}</span></p>
              </div>
            ))
          ) : (
            <p>No hay exámenes complementarios registrados.</p>
          )}
        </InfoCard>
      </div>
    </section>
  );
};

export default MyConsultationsSection;
