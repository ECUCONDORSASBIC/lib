'use client';

/**
 * Servicio para gestionar chat médico con Firebase Realtime Database
 * Esta implementación proporciona una solución robusta y escalable para
 * la comunicación en tiempo real entre médicos y pacientes.
 */

import { get, getDatabase, limitToLast, onChildAdded, orderByChild, push, query, ref, set, update } from "firebase/database";

// Referencia a la base de datos de Firebase Realtime Database
let rtDatabase;

try {
  rtDatabase = getDatabase();
} catch (error) {
  console.error("Error al inicializar Firebase Realtime Database:", error);
}

/**
 * Inicializa una conversación entre un doctor y un paciente
 * @param {string} doctorId - ID del doctor
 * @param {string} patientId - ID del paciente
 * @returns {Promise<string>} ID de la conversación
 */
export const initializeConversation = async (doctorId, patientId) => {
  try {
    const conversationRef = ref(rtDatabase, `conversations`);
    const newConversationRef = push(conversationRef);

    const timestamp = new Date().toISOString();
    await set(newConversationRef, {
      participants: {
        doctorId,
        patientId
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      lastMessage: null,
      status: 'active'
    });

    // También actualizamos los índices para búsqueda rápida
    const doctorIndex = ref(rtDatabase, `userConversations/${doctorId}/${newConversationRef.key}`);
    const patientIndex = ref(rtDatabase, `userConversations/${patientId}/${newConversationRef.key}`);

    await set(doctorIndex, {
      role: 'doctor',
      withUser: patientId,
      timestamp
    });

    await set(patientIndex, {
      role: 'patient',
      withUser: doctorId,
      timestamp
    });

    return newConversationRef.key;
  } catch (error) {
    console.error("Error al inicializar conversación:", error);
    throw error;
  }
};

/**
 * Envía un mensaje a una conversación
 * @param {string} conversationId - ID de la conversación
 * @param {string} senderId - ID del remitente
 * @param {string} content - Contenido del mensaje
 * @param {string} messageType - Tipo de mensaje (text, image, file)
 * @returns {Promise<string>} ID del mensaje enviado
 */
export const sendMessage = async (conversationId, senderId, content, messageType = 'text') => {
  try {
    const messagesRef = ref(rtDatabase, `messages/${conversationId}`);
    const newMessageRef = push(messagesRef);

    const timestamp = new Date().toISOString();
    const message = {
      senderId,
      content,
      type: messageType,
      timestamp,
      status: 'sent'
    };

    await set(newMessageRef, message);

    // Actualizar la última actividad en la conversación
    const conversationRef = ref(rtDatabase, `conversations/${conversationId}`);
    await update(conversationRef, {
      lastMessage: {
        content: messageType === 'text' ? content : `[${messageType}]`,
        timestamp,
        senderId
      },
      updatedAt: timestamp
    });

    return newMessageRef.key;
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    throw error;
  }
};

/**
 * Obtiene los mensajes de una conversación
 * @param {string} conversationId - ID de la conversación
 * @param {number} limit - Número máximo de mensajes a devolver
 * @returns {Promise<Array>} Lista de mensajes
 */
export const getMessages = async (conversationId, limit = 50) => {
  try {
    const messagesRef = query(
      ref(rtDatabase, `messages/${conversationId}`),
      orderByChild('timestamp'),
      limitToLast(limit)
    );

    const snapshot = await get(messagesRef);
    const messages = [];

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }

    return messages;
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    throw error;
  }
};

/**
 * Escucha nuevos mensajes en una conversación
 * @param {string} conversationId - ID de la conversación
 * @param {Function} callback - Función a llamar cuando llega un nuevo mensaje
 * @returns {Function} Función para cancelar la escucha
 */
export const subscribeToMessages = (conversationId, callback) => {
  try {
    const messagesRef = ref(rtDatabase, `messages/${conversationId}`);

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const message = {
        id: snapshot.key,
        ...snapshot.val()
      };

      callback(message);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error al suscribirse a mensajes:", error);
    throw error;
  }
};

/**
 * Obtiene todas las conversaciones de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de conversaciones
 */
export const getUserConversations = async (userId) => {
  try {
    const userConversationsRef = ref(rtDatabase, `userConversations/${userId}`);

    const snapshot = await get(userConversationsRef);
    const conversations = [];

    if (snapshot.exists()) {
      const conversationPromises = [];

      snapshot.forEach((childSnapshot) => {
        const conversationId = childSnapshot.key;
        const conversationRef = ref(rtDatabase, `conversations/${conversationId}`);
        conversationPromises.push(get(conversationRef));
      });

      const conversationSnapshots = await Promise.all(conversationPromises);

      conversationSnapshots.forEach((convSnapshot, index) => {
        if (convSnapshot.exists()) {
          const conversationId = Object.keys(snapshot.val())[index];
          conversations.push({
            id: conversationId,
            ...convSnapshot.val()
          });
        }
      });
    }

    // Ordenar por última actualización
    return conversations.sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  } catch (error) {
    console.error("Error al obtener conversaciones del usuario:", error);
    throw error;
  }
};

/**
 * Marca los mensajes como leídos
 * @param {string} conversationId - ID de la conversación
 * @param {string} userId - ID del usuario que lee los mensajes
 * @returns {Promise<void>}
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const messagesRef = ref(rtDatabase, `messages/${conversationId}`);
    const snapshot = await get(messagesRef);

    if (snapshot.exists()) {
      const updates = {};

      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        if (message.senderId !== userId && message.status !== 'read') {
          updates[`messages/${conversationId}/${childSnapshot.key}/status`] = 'read';
        }
      });

      if (Object.keys(updates).length > 0) {
        await update(ref(rtDatabase), updates);
      }
    }
  } catch (error) {
    console.error("Error al marcar mensajes como leídos:", error);
    throw error;
  }
};

/**
 * Actualiza el estado de una conversación
 * @param {string} conversationId - ID de la conversación
 * @param {string} status - Nuevo estado ('active', 'archived', 'closed')
 * @returns {Promise<void>}
 */
export const updateConversationStatus = async (conversationId, status) => {
  try {
    const conversationRef = ref(rtDatabase, `conversations/${conversationId}`);
    await update(conversationRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error al actualizar estado de la conversación:", error);
    throw error;
  }
};
