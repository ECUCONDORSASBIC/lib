/**
 * Servicio para gestionar mensajes
 */

import { collection, getDocs, addDoc, updateDoc, doc, query, where, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseClient';

const COLLECTION_NAME = 'messages';

/**
 * Obtiene todos los mensajes de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de mensajes
 */
export const getUserMessages = async (userId) => {
  try {
    const messagesCollection = collection(db, COLLECTION_NAME);
    const q = query(
      messagesCollection, 
      where("recipientId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    throw error;
  }
};

/**
 * Obtiene las conversaciones de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de conversaciones
 */
export const getUserConversations = async (userId) => {
  try {
    const messagesCollection = collection(db, COLLECTION_NAME);
    const sentQ = query(
      messagesCollection, 
      where("senderId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const receivedQ = query(
      messagesCollection, 
      where("recipientId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQ),
      getDocs(receivedQ)
    ]);
    
    const conversations = {};
    
    // Procesar mensajes enviados
    sentSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const otherUserId = data.recipientId;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          userId: otherUserId,
          lastMessage: {
            id: doc.id,
            content: data.content,
            createdAt: data.createdAt,
            isRead: data.isRead
          },
          messages: []
        };
      }
      
      conversations[otherUserId].messages.push({
        id: doc.id,
        ...data
      });
    });
    
    // Procesar mensajes recibidos
    receivedSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const otherUserId = data.senderId;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          userId: otherUserId,
          lastMessage: {
            id: doc.id,
            content: data.content,
            createdAt: data.createdAt,
            isRead: data.isRead
          },
          messages: []
        };
      } else {
        const currentLastMessage = conversations[otherUserId].lastMessage;
        const newMessageDate = data.createdAt.toDate();
        const currentLastMessageDate = currentLastMessage.createdAt.toDate();
        
        if (newMessageDate > currentLastMessageDate) {
          conversations[otherUserId].lastMessage = {
            id: doc.id,
            content: data.content,
            createdAt: data.createdAt,
            isRead: data.isRead
          };
        }
      }
      
      conversations[otherUserId].messages.push({
        id: doc.id,
        ...data
      });
    });
    
    return Object.values(conversations);
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    throw error;
  }
};

/**
 * Envía un nuevo mensaje
 * @param {Object} messageData - Datos del mensaje
 * @returns {Promise<string>} ID del mensaje creado
 */
export const sendMessage = async (messageData) => {
  try {
    const messagesCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(messagesCollection, {
      ...messageData,
      isRead: false,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    throw error;
  }
};

/**
 * Marca un mensaje como leído
 * @param {string} messageId - ID del mensaje
 * @returns {Promise<void>}
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const messageRef = doc(db, COLLECTION_NAME, messageId);
    await updateDoc(messageRef, {
      isRead: true,
      readAt: new Date()
    });
  } catch (error) {
    console.error("Error al marcar mensaje como leído:", error);
    throw error;
  }
};
