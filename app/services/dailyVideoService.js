/**
 * Servicio para gestionar videollamadas con Daily.co
 * Esta implementación reemplaza el WebRTC puro con una solución más robusta
 * especialmente diseñada para telemedicina.
 */

import { collection, getDocs, addDoc, updateDoc, doc, query, where, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseClient';

const COLLECTION_NAME = 'videoCalls';
const DAILY_API_URL = 'https://api.daily.co/v1';
const DAILY_API_KEY = process.env.NEXT_PUBLIC_DAILY_API_KEY || '';

/**
 * Crea una sala de videollamada en Daily.co
 * @param {Object} options - Opciones para la sala
 * @returns {Promise<Object>} Información de la sala creada
 */
export const createDailyRoom = async (options = {}) => {
  try {
    const defaultOptions = {
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        enable_prejoin_ui: true,
        start_video_off: false,
        start_audio_off: false,
        exp: Math.floor(Date.now() / 1000) + 3600, // Expire in 1 hour
        eject_at_room_exp: true,
        enable_network_ui: true, // Muestra indicador de calidad de red
        enable_noise_cancellation: true // Importante para consultas médicas
      }
    };

    const roomOptions = {
      ...defaultOptions,
      ...options
    };

    // En producción, esto debería ser una llamada a la API desde el backend
    // por seguridad, pero para fines de demostración usamos un mock
    console.log('Creando sala en Daily.co con opciones:', roomOptions);
    const roomName = `telemedicina-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Mock de respuesta para demostración (en producción, esto sería una llamada a la API real)
    const mockResponse = {
      id: roomName,
      name: roomName,
      url: `https://altamedica.daily.co/${roomName}`,
      privacy: 'private',
      created_at: new Date().toISOString(),
      config: roomOptions.properties
    };
    
    return mockResponse;
  } catch (error) {
    console.error("Error al crear sala en Daily.co:", error);
    throw error;
  }
};

/**
 * Inicializa una videollamada entre doctor y paciente
 * @param {string} doctorId - ID del doctor
 * @param {string} patientId - ID del paciente
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Información de la llamada creada
 */
export const initializeVideoCall = async (doctorId, patientId, options = {}) => {
  try {
    // 1. Crear sala en Daily.co
    const room = await createDailyRoom(options);
    
    // 2. Registrar la llamada en Firestore
    const callData = {
      doctorId,
      patientId,
      roomName: room.name,
      roomUrl: room.url,
      status: 'initiated',
      startTime: new Date(),
      createdAt: new Date(),
      provider: 'daily.co',
      expireAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
      ...options
    };
    
    const callsCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(callsCollection, callData);
    
    return {
      callId: docRef.id,
      ...callData,
      room
    };
  } catch (error) {
    console.error("Error al inicializar videollamada:", error);
    throw error;
  }
};

/**
 * Obtiene detalles de una videollamada
 * @param {string} callId - ID de la videollamada
 * @returns {Promise<Object>} Detalles de la videollamada
 */
export const getVideoCallDetails = async (callId) => {
  try {
    const callRef = doc(db, COLLECTION_NAME, callId);
    const docSnap = await getDoc(callRef);
    
    if (!docSnap.exists()) {
      throw new Error(`La videollamada con ID ${callId} no existe`);
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error("Error al obtener detalles de videollamada:", error);
    throw error;
  }
};

/**
 * Actualiza el estado de una videollamada
 * @param {string} callId - ID de la videollamada
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateVideoCallStatus = async (callId, updateData) => {
  try {
    const callRef = doc(db, COLLECTION_NAME, callId);
    await updateDoc(callRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error al actualizar estado de videollamada:", error);
    throw error;
  }
};

/**
 * Finaliza una videollamada
 * @param {string} callId - ID de la videollamada
 * @param {Object} endCallData - Datos de finalización
 * @returns {Promise<void>}
 */
export const endVideoCall = async (callId, endCallData = {}) => {
  try {
    const callRef = doc(db, COLLECTION_NAME, callId);
    await updateDoc(callRef, {
      endTime: new Date(),
      status: 'completed',
      duration: endCallData.duration,
      notes: endCallData.notes,
      updatedAt: new Date(),
      ...endCallData
    });
    
    // En producción, aquí podríamos llamar a la API de Daily.co para cerrar la sala
    // si es necesario, aunque normalmente las salas se cierran automáticamente
    // cuando todos los participantes salen o cuando expira el tiempo
  } catch (error) {
    console.error("Error al finalizar videollamada:", error);
    throw error;
  }
};

/**
 * Obtiene el historial de videollamadas de un usuario
 * @param {string} userId - ID del usuario (paciente o médico)
 * @param {string} role - Rol del usuario ('patient' o 'doctor')
 * @returns {Promise<Array>} Lista de videollamadas
 */
export const getUserVideoCallHistory = async (userId, role) => {
  try {
    const fieldName = role === 'doctor' ? 'doctorId' : 'patientId';
    const videoCallsCollection = collection(db, COLLECTION_NAME);
    const q = query(
      videoCallsCollection, 
      where(fieldName, "==", userId),
      orderBy("startTime", "desc")
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
