// app/services/applicationService.js
import { 
  addDoc, collection, deleteDoc, doc, getDocs, getDoc, 
  query, where, updateDoc, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseClient';

const APPLICATIONS_COLLECTION = 'applications';

/**
 * Crea una nueva postulación a una oferta laboral
 * @param {Object} applicationData - Datos de la postulación 
 * @param {string} professionalId - ID del profesional que se postula
 * @param {string} jobPostingId - ID de la oferta laboral
 * @returns {Promise<Object>} Datos de la postulación creada
 */
export const applyToJob = async (applicationData, professionalId, jobPostingId) => {
  try {
    // Verificar si ya existe una postulación para este profesional y oferta
    const existingApplication = await getApplicationByProfessionalAndJob(professionalId, jobPostingId);
    
    if (existingApplication) {
      throw new Error('Ya te has postulado a esta oferta anteriormente');
    }

    // Crear la postulación con datos adicionales
    const newApplication = {
      ...applicationData,
      professionalId,
      jobPostingId,
      status: 'pending', // pending, viewed, shortlisted, rejected, contacted, interviewing, hired
      applicationDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), newApplication);
    
    // Retornar los datos con ID
    return {
      id: docRef.id,
      ...newApplication,
      applicationDate: new Date(), // Convertir para uso inmediato en el cliente
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error al crear postulación:', error);
    throw error;
  }
};

/**
 * Obtiene una postulación específica por su ID
 * @param {string} applicationId - ID de la postulación
 * @returns {Promise<Object|null>} Datos de la postulación o null si no existe
 */
export const getApplicationById = async (applicationId) => {
  try {
    const applicationRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      return null;
    }
    
    // Convertir timestamp a Date para el cliente
    const data = applicationSnap.data();
    return {
      id: applicationSnap.id,
      ...data,
      applicationDate: data.applicationDate?.toDate() || null,
      updatedAt: data.updatedAt?.toDate() || null,
    };
  } catch (error) {
    console.error('Error al obtener postulación:', error);
    throw error;
  }
};

/**
 * Verifica si un profesional ya se ha postulado a una oferta específica
 * @param {string} professionalId - ID del profesional
 * @param {string} jobPostingId - ID de la oferta laboral
 * @returns {Promise<Object|null>} Datos de la postulación si existe, o null
 */
export const getApplicationByProfessionalAndJob = async (professionalId, jobPostingId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('professionalId', '==', professionalId),
      where('jobPostingId', '==', jobPostingId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Devolver el primer resultado (debería ser único)
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      applicationDate: data.applicationDate?.toDate() || null,
      updatedAt: data.updatedAt?.toDate() || null,
    };
  } catch (error) {
    console.error('Error al verificar postulación existente:', error);
    throw error;
  }
};

/**
 * Obtiene todas las postulaciones de un profesional
 * @param {string} professionalId - ID del profesional
 * @returns {Promise<Array>} Lista de postulaciones del profesional
 */
export const getApplicationsByProfessional = async (professionalId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('professionalId', '==', professionalId),
      orderBy('applicationDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        applicationDate: data.applicationDate?.toDate() || null,
        updatedAt: data.updatedAt?.toDate() || null,
      };
    });
  } catch (error) {
    console.error('Error al obtener postulaciones del profesional:', error);
    throw error;
  }
};

/**
 * Obtiene todas las postulaciones para una oferta específica
 * @param {string} jobPostingId - ID de la oferta laboral
 * @returns {Promise<Array>} Lista de postulaciones para la oferta
 */
export const getApplicationsByJobPostingId = async (jobPostingId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('jobPostingId', '==', jobPostingId),
      orderBy('applicationDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        applicationDate: data.applicationDate?.toDate() || null,
        updatedAt: data.updatedAt?.toDate() || null,
      };
    });
  } catch (error) {
    console.error('Error al obtener postulaciones para la oferta:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de una postulación
 * @param {string} applicationId - ID de la postulación
 * @param {string} newStatus - Nuevo estado de la postulación
 * @returns {Promise<void>}
 */
export const updateApplicationStatus = async (applicationId, newStatus) => {
  try {
    const applicationRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    
    // Verificar que existe
    const applicationSnap = await getDoc(applicationRef);
    if (!applicationSnap.exists()) {
      throw new Error('La postulación no existe');
    }
    
    // Validar estado
    const validStatuses = ['pending', 'viewed', 'shortlisted', 'rejected', 'contacted', 'interviewing', 'hired'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Estado no válido');
    }
    
    // Actualizar
    await updateDoc(applicationRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar estado de postulación:', error);
    throw error;
  }
};

/**
 * Elimina una postulación
 * @param {string} applicationId - ID de la postulación
 * @returns {Promise<void>}
 */
export const deleteApplication = async (applicationId) => {
  try {
    const applicationRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await deleteDoc(applicationRef);
  } catch (error) {
    console.error('Error al eliminar postulación:', error);
    throw error;
  }
};

/**
 * Actualiza una postulación con datos adicionales
 * @param {string} applicationId - ID de la postulación
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateApplicationData = async (applicationId, updateData) => {
  try {
    const applicationRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    
    // Verificar que existe
    const applicationSnap = await getDoc(applicationRef);
    if (!applicationSnap.exists()) {
      throw new Error('La postulación no existe');
    }
    
    // No permitir actualizar campos sensibles desde esta función
    const { professionalId, jobPostingId, applicationDate, ...validUpdateData } = updateData;
    
    // Actualizar
    await updateDoc(applicationRef, {
      ...validUpdateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar datos de la postulación:', error);
    throw error;
  }
};

/**
 * Obtiene el recuento de aplicaciones por estado para un trabajo específico
 * @param {string} jobPostingId - ID de la oferta laboral
 * @returns {Promise<Object>} Objeto con recuento por estado
 */
export const getApplicationsStatsByJobPosting = async (jobPostingId) => {
  try {
    const applications = await getApplicationsByJobPostingId(jobPostingId);
    
    // Inicializar contador con todos los estados posibles
    const stats = {
      total: applications.length,
      pending: 0,
      viewed: 0,
      shortlisted: 0,
      rejected: 0,
      contacted: 0,
      interviewing: 0,
      hired: 0
    };
    
    // Contar aplicaciones por estado
    applications.forEach(app => {
      if (app.status && stats[app.status] !== undefined) {
        stats[app.status]++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas de postulaciones:', error);
    throw error;
  }
};
