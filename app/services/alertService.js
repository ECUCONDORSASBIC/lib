// app/services/alertService.js
import { db } from '@/lib/firebase/firebaseClient';
import { collection, query, where, getDocs, orderBy, getFirestore } from 'firebase/firestore';

/**
 * Marks an alert as read
 * @param {string} alertId - The ID of the alert to mark as read
 * @returns {Promise<Object>} - A promise that resolves to the updated alert
 */
export const markAlertAsRead = async (alertId) => {
  // This is a placeholder implementation - replace with actual API call
  console.log('Marking alert as read:', alertId);

  // Simulate API request with a promise
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: alertId,
        read: true,
        readAt: new Date().toISOString()
      });
    }, 300);
  });
};

/**
 * Subscribe to alerts and notifications for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Function} onAlert - Callback function that gets called when a new alert arrives
 * @returns {Function} - An unsubscribe function to stop receiving alerts
 */
export const subscribeToAlerts = (patientId, onAlert) => {
  console.log('Subscribing to alerts for patient:', patientId);

  // This is a mock implementation - in a real app, you'd use WebSockets or SSE
  // For now, we'll just simulate occasional alerts
  const intervalId = setInterval(() => {
    // 10% chance of receiving an alert every 30 seconds (for demo purposes)
    if (Math.random() < 0.1) {
      const alertTypes = ['appointment', 'medication', 'test_result', 'message'];
      const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];

      const newAlert = {
        id: 'alert-' + Date.now(),
        patientId,
        type: randomType,
        title: getAlertTitle(randomType),
        message: getAlertMessage(randomType),
        timestamp: new Date().toISOString(),
        read: false,
        priority: Math.random() < 0.3 ? 'high' : 'normal'
      };

      onAlert(newAlert);
    }
  }, 30000); // Check every 30 seconds

  // Return unsubscribe function
  return () => {
    console.log('Unsubscribing from alerts for patient:', patientId);
    clearInterval(intervalId);
  };
};

/**
 * Get alerts for a patient
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Array>} - A promise that resolves to an array of alerts
 */
export const getAlerts = async (patientId) => {
  // This is a placeholder implementation - replace with actual API call
  console.log('Getting alerts for patient:', patientId);

  // Simulate API request with a promise
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate some sample alerts
      const sampleAlerts = [
        {
          id: 'alert-1',
          patientId,
          type: 'appointment',
          title: 'Recordatorio de cita',
          message: 'Tiene una cita programada para mañana a las 10:00 AM',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          read: false,
          priority: 'normal'
        },
        {
          id: 'alert-2',
          patientId,
          type: 'medication',
          title: 'Recordatorio de medicamento',
          message: 'Es hora de tomar su medicamento para la presión arterial',
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          read: true,
          priority: 'high'
        },
        {
          id: 'alert-3',
          patientId,
          type: 'message',
          title: 'Nuevo mensaje',
          message: 'Su médico le ha enviado un nuevo mensaje',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          read: false,
          priority: 'normal'
        }
      ];

      resolve(sampleAlerts);
    }, 500);
  });
};

/**
 * Obtiene las alertas para un médico específico
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Array>} - Lista de alertas para el médico
 */
export const getDoctorAlerts = async (doctorId) => {
  try {
    const db = getFirestore();
    const alertsRef = collection(db, 'alerts');
    const q = query(
      alertsRef,
      where('doctorId', '==', doctorId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const alerts = [];
    querySnapshot.forEach((doc) => {
      alerts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return alerts;
  } catch (error) {
    console.error('Error getting doctor alerts:', error);
    throw new Error('Error al obtener las alertas del médico');
  }
};

// Helper functions for alert generation
const getAlertTitle = (type) => {
  switch (type) {
    case 'appointment': return 'Recordatorio de cita';
    case 'medication': return 'Recordatorio de medicamento';
    case 'test_result': return 'Resultados disponibles';
    case 'message': return 'Nuevo mensaje';
    default: return 'Notificación';
  }
};

const getAlertMessage = (type) => {
  switch (type) {
    case 'appointment':
      return 'Tiene una próxima cita programada. Por favor confirme su asistencia.';
    case 'medication':
      return 'Es hora de tomar su medicamento según lo prescrito.';
    case 'test_result':
      return 'Sus resultados de laboratorio están disponibles para revisión.';
    case 'message':
      return 'Ha recibido un nuevo mensaje de su equipo médico.';
    default:
      return 'Tiene una nueva notificación en su perfil de salud.';
  }
};
