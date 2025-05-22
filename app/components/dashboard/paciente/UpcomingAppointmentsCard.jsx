import Link from 'next/link';
import { useState } from 'react';
import QuickLookModal from './QuickLookModal';

const UpcomingAppointmentsCard = ({ appointments = [], patientId }) => {
  const [isQuickLookOpen, setIsQuickLookOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no especificada';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Hora no especificada';
    return timeString;
  };

  const handleQuickLookOpen = (appointment) => {
    setSelectedAppointment(appointment);
    setIsQuickLookOpen(true);
  };

  const handleQuickLookClose = () => {
    setIsQuickLookOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Próximas citas</h3>
      {appointments.length === 0 ? (
        <div className="text-gray-500">No tienes citas próximas programadas.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {appointments.map((appt) => (
            <li key={appt.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">{appt.title}</div>
                <div className="text-sm text-gray-500">{formatDate(appt.date)} a las {formatTime(appt.time)}</div>
              </div>
              <Link
                href={`/dashboard/paciente/${appt.patientId}/citas/${appt.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Ver detalles
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex justify-between">
        <Link
          href={`/dashboard/paciente/${patientId}/citas/nueva`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Agendar nueva cita
        </Link>
        <Link
          href={`/dashboard/paciente/${patientId}/consultas`}
          className="text-blue-600 hover:underline text-sm"
        >
          Ver todas mis consultas
        </Link>
      </div>
      {selectedAppointment && (
        <QuickLookModal
          isOpen={isQuickLookOpen}
          onClose={handleQuickLookClose}
          title={`Detalles de Cita: ${selectedAppointment.specialty}`}
        >
          <p><strong>Profesional:</strong> {selectedAppointment.doctorName || 'Especialista'}</p>
          <p><strong>Fecha:</strong> {formatDate(selectedAppointment.date)}</p>
          <p><strong>Hora:</strong> {formatTime(selectedAppointment.time)}</p>
          <p className="mt-2 text-xs text-gray-500">Información adicional o notas podrían ir aquí.</p>
        </QuickLookModal>
      )}
    </div>
  );
};

export default UpcomingAppointmentsCard;
