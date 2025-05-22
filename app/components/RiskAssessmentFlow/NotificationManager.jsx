'use client';

import React, { useState } from 'react';

const NotificationManager = ({ patientData, assessmentData, onNotificationSent }) => {
  const [notificationType, setNotificationType] = useState('patient'); // 'patient' o 'doctor'
  const [notificationChannel, setNotificationChannel] = useState('email');
  const [customMessage, setCustomMessage] = useState('');
  const [recipientInfo, setRecipientInfo] = useState({
    email: patientData?.email || '',
    phone: patientData?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Plantillas de mensajes predefinidas
  const messageTemplates = {
    patient: {
      lowRisk: "Sus resultados de evaluación cardiovascular muestran un riesgo bajo. Siga manteniendo hábitos saludables y realice revisiones periódicas.",
      moderateRisk: "Su evaluación muestra un riesgo moderado. Recomendamos revisar estos resultados con su médico en la próxima consulta.",
      highRisk: "Su evaluación indica un riesgo cardiovascular elevado. Le recomendamos agendar una consulta con su médico para revisión pronto.",
      veryHighRisk: "Su evaluación indica un riesgo cardiovascular muy alto. Es importante que consulte con su médico lo antes posible para discutir estos resultados.",
    },
    doctor: {
      lowRisk: "El paciente muestra un perfil de riesgo cardiovascular bajo. Se recomienda seguimiento de rutina.",
      moderateRisk: "El paciente presenta factores de riesgo cardiovascular que requieren atención. Se recomienda revisión en la próxima consulta.",
      highRisk: "Alerta: El paciente presenta un riesgo cardiovascular elevado que requiere revisión próxima y posible ajuste del plan de tratamiento.",
      veryHighRisk: "URGENTE: Paciente con perfil de riesgo cardiovascular muy alto. Se recomienda evaluación inmediata y plan de intervención.",
    }
  };

  // Seleccionar plantilla de mensaje según el tipo de destinatario y nivel de riesgo
  const selectMessageTemplate = () => {
    const riskLevel = assessmentData?.riskCategory || 'lowRisk';
    return messageTemplates[notificationType][riskLevel] || '';
  };

  // Inicializar el mensaje personalizado con la plantilla seleccionada
  React.useEffect(() => {
    setCustomMessage(selectMessageTemplate());
  }, [notificationType, assessmentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Preparar los datos de la notificación
      const notificationData = {
        type: notificationType,
        channel: notificationChannel,
        recipient: notificationType === 'patient' ? {
          id: patientData?.id,
          name: patientData?.name,
          [notificationChannel]: recipientInfo[notificationChannel],
        } : {
          role: 'doctor',
          department: 'Cardiología',
          [notificationChannel]: recipientInfo[notificationChannel],
        },
        subject: `Evaluación de riesgo cardiovascular - ${patientData?.name || 'Paciente'}`,
        message: customMessage,
        assessmentSummary: {
          patientId: patientData?.id,
          date: new Date().toISOString(),
          riskCategory: assessmentData?.riskCategory,
          tenYearRisk: assessmentData?.tenYearRisk,
          keyFactors: assessmentData?.majorContributingFactors,
        }
      };
      
      // Simular envío de notificación (reemplazar con llamada real a API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear registro simulado de notificación (normalmente vendría de respuesta de API)
      const notificationRecord = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'sent',
        recipient: notificationData.recipient,
        channel: notificationChannel,
        message: customMessage.substring(0, 50) + (customMessage.length > 50 ? '...' : ''),
      };
      
      setNotification(notificationRecord);
      if (onNotificationSent) {
        onNotificationSent(notificationRecord);
      }
    } catch (error) {
      console.error("Error al enviar notificación:", error);
      setNotification({
        status: 'error',
        message: 'Error al enviar la notificación. Por favor intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Gestor de notificaciones</h2>
      
      {notification?.status === 'sent' ? (
        <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Notificación enviada</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>La notificación ha sido enviada correctamente al {notificationType === 'patient' ? 'paciente' : 'médico'} vía {notificationChannel}.</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-transparent rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Enviar otra notificación
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : notification?.status === 'error' ? (
        <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{notification.message}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Tipo de notificación
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="patient-notification"
                    name="notification-type"
                    type="radio"
                    value="patient"
                    checked={notificationType === 'patient'}
                    onChange={() => setNotificationType('patient')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="patient-notification" className="block ml-2 text-sm font-medium text-gray-700">
                    Paciente
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="doctor-notification"
                    name="notification-type"
                    type="radio"
                    value="doctor"
                    checked={notificationType === 'doctor'}
                    onChange={() => setNotificationType('doctor')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="doctor-notification" className="block ml-2 text-sm font-medium text-gray-700">
                    Médico
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Canal de notificación
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="email-channel"
                    name="notification-channel"
                    type="radio"
                    value="email"
                    checked={notificationChannel === 'email'}
                    onChange={() => setNotificationChannel('email')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="email-channel" className="block ml-2 text-sm font-medium text-gray-700">
                    Email
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="sms-channel"
                    name="notification-channel"
                    type="radio"
                    value="phone"
                    checked={notificationChannel === 'phone'}
                    onChange={() => setNotificationChannel('phone')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="sms-channel" className="block ml-2 text-sm font-medium text-gray-700">
                    SMS
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="recipient-info" className="block mb-2 text-sm font-medium text-gray-700">
                {notificationChannel === 'email' ? 'Email del destinatario' : 'Número de teléfono'}
              </label>
              <input
                type={notificationChannel === 'email' ? 'email' : 'tel'}
                id="recipient-info"
                value={recipientInfo[notificationChannel]}
                onChange={(e) => setRecipientInfo({...recipientInfo, [notificationChannel]: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">
                Mensaje
              </label>
              <textarea
                id="message"
                rows={4}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Se incluirá automáticamente un link para que el destinatario pueda acceder a los resultados completos.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setCustomMessage(selectMessageTemplate())}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Restablecer mensaje
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 mr-2 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar notificación'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NotificationManager;