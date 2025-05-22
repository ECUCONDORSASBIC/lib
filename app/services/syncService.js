'use client';

/**
 * Servicio para sincronización de datos
 */

import { db } from '@/lib/firebase/firebaseClient';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Sincroniza datos locales con la base de datos remota
 * @param {string} collectionName - Nombre de la colección
 * @param {string} documentId - ID del documento
 * @param {Object} data - Datos a sincronizar
 * @returns {Promise<void>}
 */
export const syncData = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        ...data,
        lastSynced: new Date()
      });
    } else {
      await setDoc(docRef, {
        ...data,
        createdAt: new Date(),
        lastSynced: new Date()
      });
    }
  } catch (error) {
    console.error(`Error al sincronizar datos en ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Obtiene el estado de sincronización de un documento
 * @param {string} collectionName - Nombre de la colección
 * @param {string} documentId - ID del documento
 * @returns {Promise<Object>} Estado de sincronización
 */
export const getSyncStatus = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        isSynced: true,
        lastSynced: data.lastSynced || null
      };
    } else {
      return {
        isSynced: false,
        lastSynced: null
      };
    }
  } catch (error) {
    console.error(`Error al verificar estado de sincronización en ${collectionName}:`, error);
    return {
      isSynced: false,
      lastSynced: null,
      error: error.message
    };
  }
};
