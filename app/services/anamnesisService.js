'use client';

import { db } from '@firebase/client';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Servicio para manejar operaciones relacionadas con anamnesis
 */

/**
 * Obtiene los datos de anamnesis de un paciente
 * @param {string} patientId - El ID del paciente
 * @returns {Promise<Object|null>} - Los datos de anamnesis o null si no existen
 */
export const getAnamnesisData = async (patientId) => {
  try {
    const docRef = doc(db, 'anamnesis', patientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error al obtener datos de anamnesis:", error);
    throw error;
  }
};

/**
 * Guarda datos de anamnesis para un paciente
 * @param {string} patientId - El ID del paciente
 * @param {Object} anamnesisData - Los datos de anamnesis a guardar
 * @returns {Promise<Object>} - Una promesa que se resuelve con los datos de anamnesis guardados
 */
export const saveAnamnesisData = async (patientId, anamnesisData) => {
  try {
    const docRef = doc(db, 'anamnesis', `${patientId}`);
    const dataToSave = {
      patientId,
      ...anamnesisData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(docRef, dataToSave);
    return dataToSave;
  } catch (error) {
    console.error("Error al guardar datos de anamnesis:", error);
    throw error;
  }
};

/**
 * Actualiza datos de anamnesis para un paciente
 * @param {string} patientId - El ID del paciente
 * @param {Object} anamnesisData - Los datos de anamnesis a actualizar
 * @returns {Promise<Object>} - Una promesa que se resuelve con los datos de anamnesis actualizados
 */
export const updateAnamnesisData = async (patientId, anamnesisData) => {
  try {
    const docRef = doc(db, 'anamnesis', `${patientId}`);
    const dataToUpdate = {
      ...anamnesisData,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(docRef, dataToUpdate);
    return { patientId, ...dataToUpdate };
  } catch (error) {
    console.error("Error al actualizar datos de anamnesis:", error);
    throw error;
  }
};

/**
 * Obtiene todas las anamnesis asociadas a un médico
 * @param {string} doctorId - El ID del médico
 * @returns {Promise<Array>} - Una promesa que se resuelve con un array de anamnesis
 */
export const getAnamnesisForDoctor = async (doctorId) => {
  try {
    const anamnesisCollection = collection(db, 'anamnesis');
    const q = query(anamnesisCollection, where("doctorId", "==", doctorId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener anamnesis para el médico:", error);
    throw error;
  }
};

/**
 * Obtiene un resumen estructurado de los datos de anamnesis de un paciente
 * @param {string} patientId - El ID del paciente
 * @returns {Promise<Object>} - Una promesa que se resuelve con el resumen de anamnesis
 */
export const getAnamneisisSummary = async (patientId) => {
  try {
    const anamnesisData = await getAnamnesisData(patientId);

    if (!anamnesisData) {
      throw new Error('No se encontraron datos de anamnesis para este paciente');
    }

    // Crear un resumen estructurado de los datos
    const summary = {
      medicalHistory: {
        enfermedadesCronicas: anamnesisData.enfermedades,
        cirugias: anamnesisData.cirugias,
        alergias: anamnesisData.alergias,
        medicamentos: anamnesisData.medicamentos
      },
      lifestyle: {
        tabaco: anamnesisData.tabaco,
        alcohol: anamnesisData.alcohol,
        actividadFisica: anamnesisData.actividad_fisica,
        dieta: anamnesisData.dieta,
        sueno: anamnesisData.sueno
      },
      familyHistory: {
        diabetes: anamnesisData.diabetes,
        hipertension: anamnesisData.hipertension,
        cancer: anamnesisData.cancer,
        cardiopatias: anamnesisData.cardiopatias
      }
    };

    return summary;
  } catch (error) {
    console.error('Error getting anamnesis summary:', error);
    throw new Error('No se pudo obtener el resumen de anamnesis');
  }
};

/**
 * Actualiza el perfil del paciente con datos extraídos de la anamnesis
 * @param {string} patientId - El ID del paciente
 * @param {Object} data - Los datos extraídos para actualizar el perfil
 * @returns {Promise<boolean>} - Indica si la actualización fue exitosa
 */
export const updatePatientProfile = async (patientId, data) => {
  try {
    // Obtenemos los datos personales desde la estructura
    const personalData = data.datos_personales || {};

    // Si no hay datos personales, no hay nada que actualizar
    if (!Object.keys(personalData).length) {
      return false;
    }

    // Obtenemos el perfil actual para actualizarlo
    const patientRef = doc(db, 'patients', patientId);
    const patientSnap = await getDoc(patientRef);

    if (!patientSnap.exists()) {
      console.warn(`No profile found for patient ${patientId} to update`);
      return false;
    }

    // Preparamos los datos a actualizar
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    // Mapeamos los campos de datos_personales a sus equivalentes en el perfil
    if (personalData.nombreCompleto) updateData.fullName = personalData.nombreCompleto;
    if (personalData.documentoIdentidad) updateData.documentId = personalData.documentoIdentidad;
    if (personalData.fechaNacimiento) updateData.birthDate = personalData.fechaNacimiento;
    if (personalData.genero) updateData.gender = personalData.genero;
    if (personalData.email) updateData.email = personalData.email;
    if (personalData.telefono) updateData.phone = personalData.telefono;

    // Actualizamos el perfil
    await updateDoc(patientRef, updateData);
    console.log(`Patient profile ${patientId} updated successfully with anamnesis data`);
    return true;
  } catch (error) {
    console.error('Error updating patient profile with anamnesis data:', error);
    return false;
  }
};
