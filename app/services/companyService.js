/**
 * Servicio para gestionar información de empresas
 */

import { collection, getDocs, addDoc, updateDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseClient';

const COLLECTION_NAME = 'companies';

/**
 * Obtiene todas las empresas
 * @returns {Promise<Array>} Lista de empresas
 */
export const getAllCompanies = async () => {
  try {
    const companiesCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(companiesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    throw error;
  }
};

/**
 * Obtiene una empresa por su ID
 * @param {string} companyId - ID de la empresa
 * @returns {Promise<Object|null>} Datos de la empresa o null si no existe
 */
export const getCompanyById = async (companyId) => {
  try {
    const companyRef = doc(db, COLLECTION_NAME, companyId);
    const docSnap = await getDoc(companyRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    throw error;
  }
};

/**
 * Crea una nueva empresa
 * @param {Object} companyData - Datos de la empresa
 * @returns {Promise<string>} ID de la empresa creada
 */
export const createCompany = async (companyData) => {
  try {
    const companiesCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(companiesCollection, {
      ...companyData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al crear empresa:", error);
    throw error;
  }
};

/**
 * Actualiza una empresa existente
 * @param {string} companyId - ID de la empresa
 * @param {Object} companyData - Nuevos datos de la empresa
 * @returns {Promise<void>}
 */
export const updateCompany = async (companyId, companyData) => {
  try {
    const companyRef = doc(db, COLLECTION_NAME, companyId);
    await updateDoc(companyRef, {
      ...companyData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    throw error;
  }
};

/**
 * Obtiene las configuraciones de una empresa
 * @param {string} companyId - ID de la empresa
 * @returns {Promise<Object>} Configuraciones de la empresa
 */
export const getCompanySettings = async (companyId) => {
  try {
    const company = await getCompanyById(companyId);
    return company?.settings || {};
  } catch (error) {
    console.error("Error al obtener configuraciones de la empresa:", error);
    throw error;
  }
};

/**
 * Actualiza las configuraciones de una empresa
 * @param {string} companyId - ID de la empresa
 * @param {Object} settings - Nuevas configuraciones
 * @returns {Promise<void>}
 */
export const updateCompanySettings = async (companyId, settings) => {
  try {
    const companyRef = doc(db, COLLECTION_NAME, companyId);
    await updateDoc(companyRef, {
      settings: settings,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error al actualizar configuraciones de la empresa:", error);
    throw error;
  }
};

/**
 * Obtiene el perfil completo de una empresa, incluyendo configuraciones y datos adicionales
 * @param {string} companyId - ID de la empresa
 * @returns {Promise<Object>} Perfil completo de la empresa
 */
export const getCompanyProfile = async (companyId) => {
  try {
    const company = await getCompanyById(companyId);
    if (!company) {
      return null;
    }
    
    // Obtener cualquier información adicional necesaria para el perfil
    // Por ejemplo, estadísticas, usuarios asociados, etc.
    
    return {
      ...company,
      settings: company.settings || {}
    };
  } catch (error) {
    console.error("Error al obtener perfil de la empresa:", error);
    throw error;
  }
};
