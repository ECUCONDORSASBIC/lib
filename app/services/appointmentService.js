/**
 * Servicio para gestionar las citas médicas
 */

import { collection, getDocs, addDoc, updateDoc, doc, query, where, getDoc, orderBy, deleteDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseClient';

const COLLECTION_NAME = 'appointments';

/**
 * Obtiene todas las citas
 * @returns {Promise<Array>} Lista de citas
 */
export const getAllAppointments = async () => {
  try {
    const appointmentsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(appointmentsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener citas:", error);
    throw error;
  }
};

/**
 * Obtiene las citas de un médico específico
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Array>} Lista de citas del médico
 */
export const getDoctorAppointments = async (doctorId) => {
  try {
    const appointmentsCollection = collection(db, COLLECTION_NAME);
    const q = query(
      appointmentsCollection, 
      where("doctorId", "==", doctorId),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener citas del médico:", error);
    throw error;
  }
};

/**
 * Crea una nueva cita
 * @param {Object} appointmentData - Datos de la cita
 * @returns {Promise<string>} ID de la cita creada
 */
export const createAppointment = async (appointmentData) => {
  try {
    const appointmentsCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(appointmentsCollection, {
      ...appointmentData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al crear cita:", error);
    throw error;
  }
};

/**
 * Actualiza una cita existente
 * @param {string} appointmentId - ID de la cita
 * @param {Object} appointmentData - Nuevos datos de la cita
 * @returns {Promise<void>}
 */
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const appointmentRef = doc(db, COLLECTION_NAME, appointmentId);
    await updateDoc(appointmentRef, {
      ...appointmentData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    throw error;
  }
};

/**
 * Elimina una cita
 * @param {string} appointmentId - ID de la cita a eliminar
 * @returns {Promise<void>}
 */
export const deleteAppointment = async (appointmentId) => {
  try {
    const appointmentRef = doc(db, COLLECTION_NAME, appointmentId);
    await deleteDoc(appointmentRef);
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    throw error;
  }
};
