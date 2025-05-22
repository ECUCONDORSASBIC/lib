// app/services/telemedicineService.js
'use client';
import { db } from '@/lib/firebase/firebaseClient'; // Corrected import
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

/**
 * Crea una nueva sesión de telemedicina
 * @param {Object} sessionData - Datos de la sesión
 * @returns {Promise<Object>} - Referencia del documento creado
 */
export const createTelemedicineSession = async (sessionData) => {
  try {
    const sessionRef = await addDoc(collection(db, 'telemedicineSessions'), {
      ...sessionData,
      createdAt: serverTimestamp(),
      status: 'waiting',
      participants: [],
      messages: [],
    });

    return { id: sessionRef.id, ...sessionData };
  } catch (error) {
    console.error('Error creating telemedicine session:', error);
    throw error;
  }
};

/**
 * Obtiene los datos de una sesión de telemedicina
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Object>} - Datos de la sesión
 */
export const getTelemedicineSession = async (sessionId) => {
  try {
    const sessionRef = doc(db, 'telemedicineSessions', sessionId);
    const sessionSnapshot = await getDoc(sessionRef);

    if (!sessionSnapshot.exists()) {
      throw new Error('Session not found');
    }

    return { id: sessionSnapshot.id, ...sessionSnapshot.data() };
  } catch (error) {
    console.error('Error fetching telemedicine session:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de una sesión de telemedicina
 * @param {string} sessionId - ID de la sesión
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateTelemedicineSession = async (sessionId, updates) => {
  try {
    const sessionRef = doc(db, 'telemedicineSessions', sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating telemedicine session:', error);
    throw error;
  }
};

/**
 * Añade un participante a una sesión de telemedicina
 * @param {string} sessionId - ID de la sesión
 * @param {Object} participant - Datos del participante
 * @returns {Promise<void>}
 */
export const joinTelemedicineSession = async (sessionId, participant) => {
  try {
    const session = await getTelemedicineSession(sessionId);

    // Verificar si el participante ya está en la sesión
    const existingParticipants = session.participants || [];
    const isAlreadyJoined = existingParticipants.some(p => p.id === participant.id);

    if (!isAlreadyJoined) {
      const updatedParticipants = [...existingParticipants, {
        ...participant,
        joinedAt: new Date().toISOString(),
        isActive: true
      }];

      await updateTelemedicineSession(sessionId, {
        participants: updatedParticipants,
        status: updatedParticipants.length > 1 ? 'active' : 'waiting'
      });
    }

    return { joined: true, sessionId };
  } catch (error) {
    console.error('Error joining telemedicine session:', error);
    throw error;
  }
};

/**
 * Elimina un participante de una sesión de telemedicina
 * @param {string} sessionId - ID de la sesión
 * @param {string} participantId - ID del participante
 * @returns {Promise<void>}
 */
export const leaveTelemedicineSession = async (sessionId, participantId) => {
  try {
    const session = await getTelemedicineSession(sessionId);

    const existingParticipants = session.participants || [];
    const updatedParticipants = existingParticipants.map(p =>
      p.id === participantId ? { ...p, isActive: false, leftAt: new Date().toISOString() } : p
    );

    // Si todos los participantes se han ido, finalizar la sesión
    const activeParticipants = updatedParticipants.filter(p => p.isActive);
    const newStatus = activeParticipants.length === 0 ? 'ended' : (activeParticipants.length === 1 ? 'waiting' : 'active');

    await updateTelemedicineSession(sessionId, {
      participants: updatedParticipants,
      status: newStatus,
      ...(newStatus === 'ended' ? { endedAt: serverTimestamp() } : {})
    });

    return { left: true, sessionId };
  } catch (error) {
    console.error('Error leaving telemedicine session:', error);
    throw error;
  }
};

/**
 * Envía un mensaje de señalización para la videollamada
 * @param {string} sessionId - ID de la sesión
 * @param {Object} signalData - Datos de señalización
 * @returns {Promise<void>}
 */
export const sendSignalingMessage = async (sessionId, signalData) => {
  try {
    const sessionRef = doc(db, 'telemedicineSessions', sessionId);
    const messagesCollectionRef = collection(sessionRef, 'signaling');

    await addDoc(messagesCollectionRef, {
      ...signalData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending signaling message:', error);
    throw error;
  }
};

/**
 * Escucha los mensajes de señalización de una sesión
 * @param {string} sessionId - ID de la sesión
 * @param {Function} callback - Función a llamar cuando se recibe un mensaje
 * @returns {Function} - Función para dejar de escuchar
 */
export const listenToSignalingMessages = (sessionId, callback) => {
  try {
    const sessionRef = doc(db, 'telemedicineSessions', sessionId);
    const messagesCollectionRef = collection(sessionRef, 'signaling');
    const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          callback({ id: change.doc.id, ...change.doc.data() });
        }
      });
    });
  } catch (error) {
    console.error('Error listening to signaling messages:', error);
    throw error;
  }
};

/**
 * Suscribe a los cambios de una sesión de telemedicina
 * @param {string} sessionId - ID de la sesión
 * @param {Function} callback - Función a llamar cuando cambia la sesión
 * @returns {Function} - Función para cancelar la suscripción
 */
export const subscribeToSessionChanges = (sessionId, callback) => {
  try {
    const sessionRef = doc(db, 'telemedicineSessions', sessionId);

    return onSnapshot(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      }
    });
  } catch (error) {
    console.error('Error subscribing to session changes:', error);
    throw error;
  }
};
