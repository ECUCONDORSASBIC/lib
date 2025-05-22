import React, { useState } from 'react';
import { format, isToday, isTomorrow, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar el calendario de citas del médico
 */
const AppointmentCalendar = ({ appointments = [], view = 'list' }) => {
  const [currentView, setCurrentView] = useState(view);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Handlers para navegación del calendario
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Si no hay citas
  if (!appointments.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No hay citas programadas
      </div>
    );
  }

  // Vista de lista de citas
  if (currentView === 'list') {
    return (
      <div>
        <div className="flex justify-between mb-4">
          <div className="text-sm font-medium text-gray-500">
            {appointments.length} {appointments.length === 1 ? 'cita' : 'citas'} programadas
          </div>
          <button
            onClick={() => setCurrentView('calendar')}
            className="px-3 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
          >
            Ver calendario
          </button>
        </div>
        <ul className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {appointment.patientName || 'Paciente'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {appointment.type || 'Consulta'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getDateColorClass(appointment.date)}`}>
                    {getFormattedDate(appointment.date)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {appointment.date ? format(new Date(appointment.date), 'HH:mm') : '--:--'}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex justify-end space-x-2">
                <button
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                  onClick={() => startAppointment(appointment.id)}
                >
                  Iniciar consulta
                </button>
                <button
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  onClick={() => rescheduleAppointment(appointment.id)}
                >
                  Reprogramar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Vista de calendario
  if (currentView === 'calendar') {
    // Generar días del mes actual para el calendario
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes como inicio de semana
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "eeee";
    const days = [];
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    // Crear las celdas del calendario
    const rows = [];
    let daysInGrid = eachDayOfInterval({
      start: startDate,
      end: endDate
    });

    let dayRows = [];
    let weekRows = [];

    // Agrupar días por semanas
    daysInGrid.forEach((day, i) => {
      if (i % 7 === 0 && dayRows.length) {
        weekRows.push(dayRows);
        dayRows = [];
      }

      // Filtrar citas para este día
      const dayAppointments = appointments.filter(a => {
        const appointmentDate = new Date(a.date);
        return isSameDay(appointmentDate, day);
      });

      dayRows.push(
        <div
          key={day}
          className={`h-24 sm:h-32 p-1 border border-gray-200 ${
            isSameMonth(day, currentMonth)
              ? 'bg-white'
              : 'bg-gray-50 text-gray-400'
          } ${
            isToday(day) ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex justify-between">
            <span
              className={`text-sm ${
                isToday(day) ? 'font-bold text-blue-600' : 'font-medium'
              }`}
            >
              {format(day, 'd')}
            </span>
            {dayAppointments.length > 0 && (
              <span className="text-xs font-medium text-blue-600 bg-blue-100 rounded-full h-5 w-5 flex items-center justify-center">
                {dayAppointments.length}
              </span>
            )}
          </div>

          <div className="mt-1 overflow-y-auto max-h-20 sm:max-h-28">
            {dayAppointments.slice(0, 2).map(appointment => (
              <div
                key={appointment.id}
                className="text-xs p-1 mb-1 rounded bg-blue-100 cursor-pointer hover:bg-blue-200"
                onClick={() => viewAppointmentDetails(appointment.id)}
              >
                <div className="font-medium truncate">{appointment.patientName || 'Paciente'}</div>
                <div className="text-gray-600 truncate">
                  {format(new Date(appointment.date), 'HH:mm')}
                </div>
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <div className="text-xs text-center text-blue-600">
                +{dayAppointments.length - 2} más
              </div>
            )}
          </div>
        </div>
      );
    });

    if (dayRows.length) {
      weekRows.push(dayRows);
    }

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => setCurrentView('list')}
              className="px-3 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md mr-2"
            >
              Ver lista
            </button>
            <span className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Hoy
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Cabecera de días de la semana */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map(day => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Celdas del calendario */}
        <div className="bg-white rounded-md overflow-hidden">
          {weekRows.map((week, i) => (
            <div key={i} className="grid grid-cols-7">
              {week}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// Función para iniciar una consulta
const startAppointment = (appointmentId) => {
  window.location.href = `/dashboard/medico/consulta/${appointmentId}`;
};

// Función para ver detalles de una cita
const viewAppointmentDetails = (appointmentId) => {
  window.location.href = `/dashboard/medico/citas/${appointmentId}`;
};

// Función para reprogramar una cita
const rescheduleAppointment = (appointmentId) => {
  console.log(`Reprogramar cita ${appointmentId}`);
  // Aquí se implementaría lógica para abrir un modal de reprogramación
};

// Helper para obtener una fecha formateada
const getFormattedDate = (dateStr) => {
  if (!dateStr) return 'Fecha no disponible';

  const date = new Date(dateStr);

  if (isToday(date)) {
    return 'Hoy';
  } else if (isTomorrow(date)) {
    return 'Mañana';
  } else {
    return format(date, 'd MMM', { locale: es });
  }
};

// Helper para obtener el color de la fecha según la cercanía
const getDateColorClass = (dateStr) => {
  if (!dateStr) return 'text-gray-500';

  const date = new Date(dateStr);

  if (isToday(date)) {
    return 'text-green-600';
  } else if (isTomorrow(date)) {
    return 'text-blue-600';
  } else {
    return 'text-gray-600';
  }
};

export default AppointmentCalendar;
