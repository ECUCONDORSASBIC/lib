'use client';
/**
 * Servicio para gestionar videollamadas y documentos médicos
 */

import { db } from '@/lib/firebase/firebaseClient';
import { addDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore';

const DOCUMENTS_COLLECTION = 'medicalDocuments';
const VIDEOCALLS_COLLECTION = 'videoCalls';

/**
 * Obtiene los documentos médicos de un paciente
 * @param {string} patientId - ID del paciente
 * @returns {Promise<Array>} Lista de documentos médicos
 */
export const getDocuments = async (patientId) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error("Error al obtener documentos médicos:", error);
    throw error;
  }
};

/**
 * Guarda un nuevo documento médico
 * @param {string} patientId - ID del paciente
 * @param {Object} documentData - Datos del documento
 * @returns {Promise<string>} ID del documento creado
 */
export const saveDocument = async (patientId, documentData) => {
  try {
    const newDocument = {
      ...documentData,
      patientId,
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), newDocument);
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar documento médico:", error);
    throw error;
  }
};

/**
 * Obtiene el historial de videollamadas de un paciente
 * @param {string} patientId - ID del paciente
 * @returns {Promise<Array>} Lista de videollamadas
 */
export const getVideoCallHistory = async (patientId) => {
  try {
    const q = query(
      collection(db, VIDEOCALLS_COLLECTION),
      where('patientId', '==', patientId),
      orderBy('startTime', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime?.toDate?.() || doc.data().startTime,
      endTime: doc.data().endTime?.toDate?.() || doc.data().endTime
    }));
  } catch (error) {
    console.error("Error al obtener historial de videollamadas:", error);
    throw error;
  }
};

/**
 * Guarda un registro de videollamada con documentos adjuntos
 * @param {string} patientId - ID del paciente
 * @param {string} doctorId - ID del médico
 * @param {Object} callData - Datos de la videollamada
 * @param {Array} documents - Documentos adjuntos a la videollamada
 * @returns {Promise<string>} ID de la videollamada creada
 */
export const saveVideoCallWithDocuments = async (patientId, doctorId, callData, documents = []) => {
  try {
    // Guardar la videollamada
    const videoCallData = {
      ...callData,
      patientId,
      doctorId,
      startTime: callData.startTime || new Date(),
      createdAt: new Date()
    };

    const callRef = await addDoc(collection(db, VIDEOCALLS_COLLECTION), videoCallData);
    const videoCallId = callRef.id;

    // Guardar los documentos asociados a la videollamada
    const savedDocuments = await Promise.all(
      documents.map(doc => saveDocument(patientId, {
        ...doc,
        videoCallId,
        doctorId
      }))
    );

    return {
      videoCallId,
      documentIds: savedDocuments
    };
  } catch (error) {
    console.error("Error al guardar videollamada con documentos:", error);
    throw error;
  }
};

/**
 * Obtiene las videollamadas para la API
 * @param {string} userId - ID del usuario (paciente o médico)
 * @param {string} role - Rol del usuario ('patient' o 'doctor')
 * @param {number} limit - Número máximo de videollamadas a devolver
 * @returns {Promise<Array>} Lista de videollamadas
 */
export const getVideoCalls = async (userId, role = 'patient', limit = 20) => {
  try {
    const fieldName = role === 'doctor' ? 'doctorId' : 'patientId';
    const q = query(
      collection(db, VIDEOCALLS_COLLECTION),
      where(fieldName, '==', userId),
      orderBy('startTime', 'desc'),
      limit
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime?.toDate?.() || doc.data().startTime,
      endTime: doc.data().endTime?.toDate?.() || doc.data().endTime,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error("Error al obtener videollamadas:", error);
    throw error;
  }
};
