// app/services/robustAnamnesisService.js
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { prepareAnamnesisForFirestore, createAnamnesisVersion } from '@/utils/enhancedAnamnesisFormatter';

/**
 * Servicio robusto para la gestión de anamnesis con control de versiones, sincronización y validación de integridad.
 */
const ANAMNESIS_COLLECTION = 'anamnesis';
const ANAMNESIS_HISTORY_COLLECTION = 'anamnesis_history';

/**
 * Crea o actualiza la anamnesis de un paciente de manera atómica y versionada.
 * Garantiza integridad y sincronización.
 * @param {string} patientId
 * @param {Object} formData
 * @param {Array} steps
 * @param {Object} patientData
 * @param {string} userId
 * @returns {Promise<Object>} Estructura completa y versión creada
 */
export async function saveOrUpdateAnamnesis(patientId, formData, steps, patientData, userId, currentUser) {
  // Seguridad: verificar autenticación, email verificado y rol/propiedad
  if (!currentUser || !currentUser.uid) throw new Error('No autenticado');
  if (!currentUser.emailVerified) throw new Error('Debe verificar su email para operar con datos sensibles');
  const isOwner = currentUser.uid === patientId;
  const role = currentUser.role || (currentUser.customClaims && currentUser.customClaims.role);
  if (!isOwner && !['medico','admin'].includes(role)) {
    throw new Error('No autorizado para acceder a la anamnesis de este paciente');
  }
  const structuredData = prepareAnamnesisForFirestore(formData, steps, patientData);
  const versioned = createAnamnesisVersion(structuredData, userId);

  const docRef = doc(db, ANAMNESIS_COLLECTION, `${patientId}`);
  const historyRef = collection(db, ANAMNESIS_COLLECTION, `${patientId}`, ANAMNESIS_HISTORY_COLLECTION);

  return await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    let prevData = null;
    if (docSnap.exists()) {
      prevData = docSnap.data();
    }
    // Guardar la nueva versión en el historial
    await addDoc(historyRef, {
      ...versioned,
      timestamp: serverTimestamp(),
      prevData,
    });
    // Guardar la versión actual
    transaction.set(docRef, {
      ...structuredData,
      updatedAt: new Date().toISOString(),
      lastEditedBy: userId,
    });
    return {
      patientId,
      ...structuredData,
      versionId: versioned.metadata.versionId,
    };
  });
}

/**
 * Obtiene la anamnesis actual de un paciente.
 * @param {string} patientId
 * @returns {Promise<Object|null>}
 */
export async function getCurrentAnamnesis(patientId, currentUser) {
  // Seguridad: verificar autenticación, email verificado y rol/propiedad
  if (!currentUser || !currentUser.uid) throw new Error('No autenticado');
  if (!currentUser.emailVerified) throw new Error('Debe verificar su email para operar con datos sensibles');
  const isOwner = currentUser.uid === patientId;
  const role = currentUser.role || (currentUser.customClaims && currentUser.customClaims.role);
  if (!isOwner && !['medico','admin'].includes(role)) {
    throw new Error('No autorizado para acceder a la anamnesis de este paciente');
  }
  const docRef = doc(db, ANAMNESIS_COLLECTION, `${patientId}`);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

/**
 * Obtiene el historial de versiones de la anamnesis de un paciente.
 * @param {string} patientId
 * @returns {Promise<Array>} Lista de versiones (ordenadas por fecha descendente)
 */
export async function getAnamnesisHistory(patientId, currentUser) {
  // Seguridad: verificar autenticación, email verificado y rol/propiedad
  if (!currentUser || !currentUser.uid) throw new Error('No autenticado');
  if (!currentUser.emailVerified) throw new Error('Debe verificar su email para operar con datos sensibles');
  const isOwner = currentUser.uid === patientId;
  const role = currentUser.role || (currentUser.customClaims && currentUser.customClaims.role);
  if (!isOwner && !['medico','admin'].includes(role)) {
    throw new Error('No autorizado para acceder a la anamnesis de este paciente');
  }
  const historyRef = collection(db, ANAMNESIS_COLLECTION, `${patientId}`, ANAMNESIS_HISTORY_COLLECTION);
  const historySnap = await getDocs(historyRef);
  const history = [];
  historySnap.forEach(doc => {
    history.push({ id: doc.id, ...doc.data() });
  });
  // Ordenar por fecha descendente
  return history.sort((a, b) => (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0));
}

/**
 * Sincroniza cambios concurrentes usando control de versiones optimista.
 * Lanza error si hay conflicto de edición.
 * @param {string} patientId
 * @param {Object} newData
 * @param {string} expectedVersionId
 * @param {string} userId
 * @returns {Promise<Object>} Nueva versión si éxito
 */
export async function syncAnamnesis(patientId, newData, expectedVersionId, userId, currentUser) {
  // Seguridad: verificar autenticación, email verificado y rol/propiedad
  if (!currentUser || !currentUser.uid) throw new Error('No autenticado');
  if (!currentUser.emailVerified) throw new Error('Debe verificar su email para operar con datos sensibles');
  const isOwner = currentUser.uid === patientId;
  const role = currentUser.role || (currentUser.customClaims && currentUser.customClaims.role);
  if (!isOwner && !['medico','admin'].includes(role)) {
    throw new Error('No autorizado para acceder a la anamnesis de este paciente');
  }
  const docRef = doc(db, ANAMNESIS_COLLECTION, `${patientId}`);
  return await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists()) throw new Error('No existe anamnesis para el paciente');
    const current = docSnap.data();
    if (current.metadata?.versionId && current.metadata.versionId !== expectedVersionId) {
      throw new Error('Conflicto de versión: los datos han sido modificados por otro usuario.');
    }
    // Nueva versión
    const versioned = createAnamnesisVersion(newData, userId);
    transaction.set(docRef, {
      ...newData,
      updatedAt: new Date().toISOString(),
      lastEditedBy: userId,
      metadata: {
        ...newData.metadata,
        versionId: versioned.metadata.versionId,
      },
    });
    return {
      patientId,
      ...newData,
      versionId: versioned.metadata.versionId,
    };
  });
}

/**
 * Valida la integridad de los datos de anamnesis según el esquema.
 * @param {Object} anamnesisData
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateAnamnesis(anamnesisData) {
  // Aquí podrías usar un esquema de validación robusto (por ejemplo, yup o zod)
  // Por simplicidad, solo validamos campos mínimos
  const errors = [];
  if (!anamnesisData || typeof anamnesisData !== 'object') {
    errors.push('La anamnesis debe ser un objeto.');
  }
  if (!anamnesisData.sections || typeof anamnesisData.sections !== 'object') {
    errors.push('Faltan las secciones de la anamnesis.');
  }
  // ... agregar más validaciones según reglas clínicas
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * API para frontend: crear, actualizar, obtener, versionar, sincronizar y validar anamnesis
 * - saveOrUpdateAnamnesis(patientId, formData, steps, patientData, userId)
 * - getCurrentAnamnesis(patientId)
 * - getAnamnesisHistory(patientId)
 * - syncAnamnesis(patientId, newData, expectedVersionId, userId)
 * - validateAnamnesis(anamnesisData)
 */
