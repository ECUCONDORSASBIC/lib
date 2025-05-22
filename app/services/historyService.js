'use client';
/**
 * Servicio para gestionar el historial médico de pacientes
 */

import { db } from '@/lib/firebase/firebaseClient';
import { addDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'patientNotifications';
const HISTORY_COLLECTION = 'patientHistory';

/**
 * Obtiene las notificaciones de un paciente
 * @param {string} patientId - ID del paciente
 * @returns {Promise<Array>} Lista de notificaciones
 */
export const getNotifications = async (patientId) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      read: doc.data().read || false
    }));
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return []; // Devolver array vacío en caso de error para no romper la UI
  }
};

/**
 * Crea una nueva notificación para un paciente
 * @param {string} patientId - ID del paciente
 * @param {Object} notificationData - Datos de la notificación
 * @returns {Promise<string>} ID de la notificación creada
 */
export const createNotification = async (patientId, notificationData) => {
  try {
    const newNotification = {
      ...notificationData,
      patientId,
      read: false,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), newNotification);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear notificación:", error);
    throw error;
  }
};

/**
 * Obtiene el historial médico completo de un paciente
 * @param {string} patientId - ID del paciente
 * @returns {Promise<Object>} Historial médico del paciente
 */
export const getPatientHistory = async (patientId) => {
  try {
    // Obtener notificaciones
    const notifications = await getNotifications(patientId);

    // Obtener registros de historial
    const q = query(
      collection(db, HISTORY_COLLECTION),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    const historyRecords = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date
    }));

    // Importar servicios adicionales necesarios
    const { getVideoCallHistory } = await import('./videoCallAndDocumentService');
    const { getPatientAllergiesAndConditions } = await import('./healthMetricsService');

    // Obtener videollamadas y documentos
    const videoCalls = await getVideoCallHistory(patientId);

    // Obtener alergias y condiciones crónicas
    const medicalConditions = await getPatientAllergiesAndConditions(patientId);

    return {
      notifications,
      historyRecords,
      videoCalls,
      medicalConditions
    };
  } catch (error) {
    console.error("Error al obtener historial del paciente:", error);
    throw error;
  }
};
