import { createAppointment, updateAppointment } from '@/app/services/appointmentService';
import { getDoctorPatients } from '@/app/services/doctorService'; // Para cargar pacientes
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const AppointmentModal = ({ isOpen, onClose, appointment, doctorId, onSave }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '', // Podría autocompletarse al seleccionar patientId
    date: '', // Formato YYYY-MM-DD
    time: '', // Formato HH:MM
    type: 'Consulta General',
    notes: '',
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar pacientes del médico para el selector
    if (doctorId) {
      getDoctorPatients(doctorId)
        .then(setPatients)
        .catch(err => {
          console.error("Error loading patients for modal:", err);
          setError("No se pudieron cargar los pacientes.");
        });
    }

    if (appointment) {
      // Si es edición, pre-llenar el formulario
      const appointmentDate = new Date(appointment.date);
      setFormData({
        patientId: appointment.patientId || '',
        patientName: appointment.patientName || '',
        date: appointmentDate.toISOString().split('T')[0],
        time: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
        type: appointment.type || 'Consulta General',
        notes: appointment.notes || '',
      });
    } else {
      // Si es creación, resetear
      setFormData({
        patientId: '',
        patientName: '',
        date: '',
        time: '',
        type: 'Consulta General',
        notes: '',
      });
    }
  }, [appointment, doctorId, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'patientId') {
      const selectedPatient = patients.find(p => p.id === value);
      if (selectedPatient) {
        setFormData(prev => ({
          ...prev, patientName: selectedPatient.displayName || selectedPatient.fullName || ''
        }));
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.date || !formData.time || !formData.patientId) {
      setError("Paciente, fecha y hora son obligatorios.");
      setLoading(false);
      return;
    }

    const dateTimeString = `${formData.date}T${formData.time}:00`;
    const appointmentDate = new Date(dateTimeString);

    if (isNaN(appointmentDate.getTime())) {
      setError("Fecha u hora inválida.");
      setLoading(false);
      return;
    }

    const appointmentData = {
      ...formData,
      doctorId,
      date: appointmentDate.toISOString(), // Enviar como ISO string
      status: 'scheduled', // Asegurar que el estado inicial es 'scheduled'
      createdAt: new Date().toISOString(),
      patientConfirmed: false
    };

    try {
      let appointmentId;

      if (appointment && appointment.id) {
        await updateAppointment(appointment.id, appointmentData);
        appointmentId = appointment.id;
      } else {
        const createdAppointment = await createAppointment(appointmentData);
        appointmentId = createdAppointment.id;

        // Crear alerta para el paciente sobre la nueva cita
        try {
          const { createAlert } = await import('@/app/services/alertService');

          await createAlert(
            formData.patientId,
            'Nueva cita programada',
            `Se ha programado una cita para el ${new Date(appointmentDate).toLocaleDateString()} a las ${formData.time}. Por favor confirme su asistencia.`,
            'appointment',
            'doctor'
          );

          console.log('Alerta de nueva cita creada para el paciente.');
        } catch (alertError) {
          console.error('Error creando alerta para el paciente:', alertError);
          // No bloqueamos el flujo principal por un error en alertas
        }

        // Intentar actualizar relación doctor-paciente si no existe
        try {
          const { db } = await import('@/lib/firebase/firebaseClient');
          const { doc, setDoc, getDoc } = await import('firebase/firestore');

          const relationId = `${doctorId}_${formData.patientId}`;
          const relationRef = doc(db, 'doctorPatients', relationId);
          const relationDoc = await getDoc(relationRef);

          if (!relationDoc.exists()) {
            await setDoc(relationRef, {
              doctorId: doctorId,
              patientId: formData.patientId,
              createdAt: new Date().toISOString(),
              createdVia: 'appointment'
            });
            console.log('Relación doctor-paciente creada.');
          }
        } catch (relationError) {
          console.error('Error estableciendo relación doctor-paciente:', relationError);
          // No bloqueamos el flujo principal por un error en relaciones
        }
      }

      // Sincronizar datos entre colecciones para mantener consistencia
      try {
        const { syncUserProfileData } = await import('@/app/services/syncService');

        // Solo sincronizar datos del paciente seleccionado
        const selectedPatient = patients.find(p => p.id === formData.patientId);
        if (selectedPatient) {
          await syncUserProfileData(formData.patientId, selectedPatient);
          console.log('Datos del paciente sincronizados correctamente.');
        }
      } catch (syncError) {
        console.error('Error sincronizando datos del paciente:', syncError);
        // No bloqueamos el flujo principal por un error en sincronización
      }

      onSave(); // Llama a la función onSave para refrescar datos en el padre
      onClose();
    } catch (err) {
      console.error("Error saving appointment:", err);
      setError(err.message || "Error al guardar la cita.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {appointment ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Paciente</label>
            <select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Seleccione un paciente</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.displayName || p.fullName || p.id}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">Hora</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Consulta</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas (opcional)</label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (appointment ? 'Actualizar Cita' : 'Crear Cita')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
