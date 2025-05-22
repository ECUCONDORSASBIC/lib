'use client';

import { useState, useEffect } from 'react';
import { createAppointment, updateAppointment } from '@/app/services/appointmentService';
import { getDoctorPatients } from '@/app/services/doctorService';

/**
 * Modal para crear y editar citas médicas
 */
const AppointmentModal = ({ isOpen, onClose, appointment, doctorId, onSave }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    duration: 30,
    type: 'consulta',
    notes: ''
  });

  // Cargar los datos de los pacientes al abrir el modal
  useEffect(() => {
    if (isOpen && doctorId) {
      const fetchPatients = async () => {
        try {
          setLoading(true);
          const patients = await getDoctorPatients(doctorId);
          setPatients(patients);
          setLoading(false);
        } catch (error) {
          setError('Error al cargar los pacientes');
          setLoading(false);
          console.error('Error fetching patients:', error);
        }
      };

      fetchPatients();
    }
  }, [isOpen, doctorId]);

  // Cargar los datos de la cita si estamos editando
  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.dateTime);
      
      setFormData({
        patientId: appointment.patientId || '',
        date: appointmentDate.toISOString().split('T')[0] || '',
        time: appointmentDate.toTimeString().slice(0, 5) || '',
        duration: appointment.duration || 30,
        type: appointment.type || 'consulta',
        notes: appointment.notes || ''
      });
    } else {
      // Resetear el formulario si estamos creando una nueva cita
      setFormData({
        patientId: '',
        date: '',
        time: '',
        duration: 30,
        type: 'consulta',
        notes: ''
      });
    }
  }, [appointment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.date || !formData.time) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }
    
    try {
      setLoading(true);
      
      // Construir el objeto de cita
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const appointmentData = {
        patientId: formData.patientId,
        dateTime,
        duration: parseInt(formData.duration),
        type: formData.type,
        notes: formData.notes,
        doctorId
      };
      
      if (appointment) {
        // Editar cita existente
        await updateAppointment(appointment.id, appointmentData);
      } else {
        // Crear nueva cita
        await createAppointment(appointmentData);
      }
      
      setLoading(false);
      onSave();
      onClose();
    } catch (error) {
      setError('Error al guardar la cita');
      setLoading(false);
      console.error('Error saving appointment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          {appointment ? 'Editar Cita' : 'Nueva Cita'}
        </h2>
        
        {error && (
          <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Paciente *
            </label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            >
              <option value="">Seleccionar paciente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name || patient.displayName || patient.email}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Fecha *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Hora *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Duración (min)
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Tipo de Cita
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="consulta">Consulta General</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="emergencia">Emergencia</option>
                <option value="telemedicina">Telemedicina</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              disabled={loading}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Guardando...' : appointment ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
