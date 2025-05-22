'use client';

import { markAlertAsRead, subscribeToAlerts } from '@/app/services/alertService';
import { BellIcon, CogIcon, EnvelopeIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Mapeo de tipos de alerta a categorías visuales
const alertTypeToCategory = {
  // Tipos médicos
  'medical': 'medical',
  'treatment': 'medical',
  'lab-results': 'medical',
  'prescription': 'medical',
  'doctor-message': 'medical',
  'appointment-medical': 'medical',

  // Tipos administrativos
  'administrative': 'administrative',
  'appointment': 'administrative',
  'schedule': 'administrative',
  'general': 'administrative',
  'info': 'administrative',

  // Tipos de facturación/pagos
  'payment': 'payment',
  'billing': 'payment',
  'invoice': 'payment',
  'insurance': 'payment',
  'critical': 'payment'  // Las alertas críticas usan el estilo rojo
};

const NotificationItem = ({ id, type, title, message, createdAt, read, source, onToggleRead }) => {
  // Determinar la categoría visual basada en el tipo
  const category = alertTypeToCategory[type] || 'administrative';

  const baseClasses = "p-4 rounded-lg shadow-sm mb-3 border-l-4";
  const typeClasses = {
    medical: `bg-blue-50 border-blue-500 ${read ? 'opacity-70' : ''}`,
    administrative: `bg-yellow-50 border-yellow-500 ${read ? 'opacity-70' : ''}`,
    payment: `bg-red-50 border-red-500 ${read ? 'opacity-70' : ''}`,
  };
  const iconClasses = {
    medical: <BellIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />,
    administrative: <CogIcon className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />,
    payment: <InformationCircleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />,
  };

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha desconocida';

    // Si es un timestamp de Firestore
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }

    // Si es una string ISO o un objeto Date
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className={`${baseClasses} ${typeClasses[category] || 'bg-gray-50 border-gray-500'}`}>
      <div className="flex items-start">
        {iconClasses[category]}
        <div className="flex-grow">
          {title && <h4 className={`text-sm font-medium ${read ? 'text-gray-700' : 'text-gray-900'}`}>{title}</h4>}
          <p className={`text-sm ${read ? 'text-gray-600' : 'text-gray-800'}`}>{message}</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
            {source && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{source}</span>}
          </div>
        </div>
        <button
          onClick={() => onToggleRead(id, read)}
          className={`ml-4 text-xs px-2 py-1 rounded-full ${read ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'}`}
        >
          {read ? 'No leído' : 'Leído'}
        </button>
      </div>
    </div>
  );
};

const NotificationsAndMessagesSection = ({ patientId, initialNotifications }) => {
  const [notifications, setNotifications] = useState(initialNotifications || []);
  const [loading, setLoading] = useState(!initialNotifications);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!patientId) {
      setError("ID de paciente no disponible");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Configurar listener en tiempo real para notificaciones
    let unsubscribe = () => {};
    
    try {
      unsubscribe = subscribeToAlerts(patientId, 
        // Success callback
        (alertsData) => {
          if (Array.isArray(alertsData)) {
            setNotifications(alertsData);
            setError(null);
          } else {
            console.error("Formato de datos de alertas inesperado:", alertsData);
            setNotifications([]);
            setError("Formato de datos incorrecto. Por favor, contacte con soporte técnico.");
          }
          setLoading(false);
        },
        // Error callback
        (error) => {
          console.error("Error al suscribirse a alertas:", error);
          setError(`Error al cargar notificaciones: ${error.message || 'Error desconocido'}`);
          setLoading(false);
          setNotifications([]);
        }
      );
    } catch (err) {
      console.error("Excepción al intentar suscribirse a alertas:", err);
      setError(`Error al inicializar notificaciones: ${err.message || 'Error desconocido'}`);
      setLoading(false);
    }

    // Limpiar listener cuando el componente se desmonte
    return () => {
      try {
        unsubscribe();
      } catch (err) {
        console.error("Error al desuscribirse de alertas:", err);
      }
    };
  }, [patientId, retryCount]);

  const toggleReadStatus = async (id, currentReadStatus) => {
    try {
      // Optimistic UI update
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, read: !notif.read } : notif
        )
      );

      // Actualizar en Firebase
      await markAlertAsRead(id);
      console.log(`Notificación ${id} marcada como leída`);
    } catch (error) {
      console.error('Error al actualizar estado de notificación:', error);

      // Revertir cambio en caso de error
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, read: currentReadStatus } : notif
        )
      );

      setError('No se pudo actualizar el estado de la notificación');
    }
  };  // Asegurarse de que notifications sea un array antes de usar reduce
  const notificationsArray = Array.isArray(notifications) ? notifications : [];

  // Agrupar notificaciones por categoría usando nuestro mapeo
  const categorizedNotifications = notificationsArray.reduce((acc, notification) => {
    const category = alertTypeToCategory[notification.type] || 'administrative';
    if (!acc[category]) acc[category] = [];
    acc[category].push(notification);
    return acc;
  }, { medical: [], administrative: [], payment: [] });

  // Ordenar cada categoría por fecha (más recientes primero)
  Object.keys(categorizedNotifications).forEach(category => {
    categorizedNotifications[category].sort((a, b) => {
      const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  });

  return (
    <section id="notificaciones-mensajes" className="p-6 bg-gray-50 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Notificaciones y Mensajes</h2>
        {error && (
          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
            {error}
          </span>
        )}
        {loading && (
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded flex items-center">
            <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Actualizando...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mensajes del Equipo Médico */}
        <div className="lg:col-span-1 bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
            <EnvelopeIcon className="h-5 w-5 mr-2" /> Mensajes del Equipo Médico
            {categorizedNotifications.medical.filter(n => !n.read).length > 0 && (
              <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {categorizedNotifications.medical.filter(n => !n.read).length} nuevos
              </span>
            )}
          </h3>
          {categorizedNotifications.medical.length > 0 ? (
            categorizedNotifications.medical.map(notif => (
              <NotificationItem
                key={notif.id}
                {...notif}
                message={notif.message || notif.title}
                onToggleRead={toggleReadStatus}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay mensajes del equipo médico.</p>
          )}
        </div>

        {/* Alertas Administrativas */}
        <div className="lg:col-span-1 bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center">
            <CogIcon className="h-5 w-5 mr-2" /> Alertas Administrativas
            {categorizedNotifications.administrative.filter(n => !n.read).length > 0 && (
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                {categorizedNotifications.administrative.filter(n => !n.read).length} nuevos
              </span>
            )}
          </h3>
          {categorizedNotifications.administrative.length > 0 ? (
            categorizedNotifications.administrative.map(notif => (
              <NotificationItem
                key={notif.id}
                {...notif}
                message={notif.message || notif.title}
                onToggleRead={toggleReadStatus}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay alertas administrativas.</p>
          )}
        </div>

        {/* Mensajes Administrativos (Pagos, etc.) */}
        <div className="lg:col-span-1 bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2" /> Avisos (Pagos, Facturación)
            {categorizedNotifications.payment.filter(n => !n.read).length > 0 && (
              <span className="ml-auto text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                {categorizedNotifications.payment.filter(n => !n.read).length} nuevos
              </span>
            )}
          </h3>
          {categorizedNotifications.payment.length > 0 ? (
            categorizedNotifications.payment.map(notif => (
              <NotificationItem
                key={notif.id}
                {...notif}
                message={notif.message || notif.title}
                onToggleRead={toggleReadStatus}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay avisos de pagos o facturación.</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <Link
          href={`/dashboard/paciente/${patientId}/notificaciones`}
          className="text-blue-600 hover:underline text-sm"
        >
          Ver todas las notificaciones
        </Link>
        <Link
          href={`/dashboard/paciente/${patientId}/mensajes`}
          className="text-blue-600 hover:underline text-sm"
        >
          Ver todos los mensajes
        </Link>
        <Link
          href={`/dashboard/paciente/${patientId}/notificaciones-mensajes`}
          className="text-blue-600 hover:underline text-sm font-semibold"
        >
          Ver todos los mensajes y notificaciones
        </Link>
      </div>
    </section>
  );
};

export default NotificationsAndMessagesSection;
