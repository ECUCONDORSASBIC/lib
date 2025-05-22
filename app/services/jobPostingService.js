/**
 * Servicio para gestionar ofertas de empleo en Firestore
 * 
 * Este servicio proporciona métodos para:
 * - Crear, actualizar y eliminar ofertas de empleo
 * - Obtener ofertas por empresa, profesional, o filtros específicos
 * - Gestionar postulaciones a ofertas
 */

import { db } from '@/lib/firebase/firebaseClient';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Constantes para colecciones
const JOB_POSTINGS_COLLECTION = 'jobPostings';
const JOB_APPLICATIONS_COLLECTION = 'jobApplications';
const USERS_COLLECTION = 'users';

/**
 * Crear una nueva oferta de empleo
 * @param {Object} jobData - Datos de la oferta
 * @param {string} companyId - ID de la empresa que crea la oferta
 * @returns {Promise<Object>} - Objeto con el ID de la oferta creada
 */
export const createJobPosting = async (jobData, companyId) => {
  try {
    // Preparar datos con timestamps y relaciones
    const jobPostingData = {
      ...jobData,
      companyId,
      status: jobData.status || 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      applicationCount: 0,
      // Convertir deadline a Timestamp si existe
      applicationDeadline: jobData.applicationDeadline 
        ? Timestamp.fromDate(new Date(jobData.applicationDeadline)) 
        : null
    };

    // Crear documento en Firestore
    const docRef = await addDoc(collection(db, JOB_POSTINGS_COLLECTION), jobPostingData);
    
    return { 
      id: docRef.id,
      ...jobPostingData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating job posting:', error);
    throw new Error('No se pudo crear la oferta de empleo. Por favor, inténtelo de nuevo.');
  }
};

/**
 * Actualizar una oferta de empleo existente
 * @param {string} jobId - ID de la oferta a actualizar
 * @param {Object} jobData - Nuevos datos de la oferta
 * @param {string} companyId - ID de la empresa para verificación
 * @returns {Promise<Object>} - Datos actualizados
 */
export const updateJobPosting = async (jobId, jobData, companyId) => {
  try {
    // Verificar si la oferta existe y pertenece a la empresa
    const jobRef = doc(db, JOB_POSTINGS_COLLECTION, jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      throw new Error('La oferta de empleo no existe');
    }
    
    // Verificar pertenencia a la empresa
    const jobData = jobDoc.data();
    if (jobData.companyId !== companyId) {
      throw new Error('No tienes permiso para actualizar esta oferta');
    }
    
    // Preparar datos actualizados
    const updatedData = {
      ...jobData,
      updatedAt: serverTimestamp(),
      // Convertir deadline a Timestamp si existe
      applicationDeadline: jobData.applicationDeadline 
        ? Timestamp.fromDate(new Date(jobData.applicationDeadline)) 
        : null
    };
    
    // Actualizar en Firestore
    await updateDoc(jobRef, updatedData);
    
    return { 
      id: jobId,
      ...updatedData,
      updatedAt: new Date() 
    };
  } catch (error) {
    console.error('Error updating job posting:', error);
    throw new Error(error.message || 'No se pudo actualizar la oferta de empleo');
  }
};

/**
 * Eliminar una oferta de empleo
 * @param {string} jobId - ID de la oferta a eliminar
 * @param {string} companyId - ID de la empresa para verificación
 * @returns {Promise<boolean>} - True si se eliminó correctamente
 */
export const deleteJobPosting = async (jobId, companyId) => {
  try {
    // Verificar si la oferta existe y pertenece a la empresa
    const jobRef = doc(db, JOB_POSTINGS_COLLECTION, jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      throw new Error('La oferta de empleo no existe');
    }
    
    // Verificar pertenencia a la empresa
    const jobData = jobDoc.data();
    if (jobData.companyId !== companyId) {
      throw new Error('No tienes permiso para eliminar esta oferta');
    }
    
    // Eliminar en Firestore
    await deleteDoc(jobRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting job posting:', error);
    throw new Error(error.message || 'No se pudo eliminar la oferta de empleo');
  }
};

/**
 * Obtener todas las ofertas de una empresa
 * @param {string} companyId - ID de la empresa
 * @returns {Promise<Array>} - Array de ofertas
 */
export const getJobPostingsByCompany = async (companyId) => {
  try {
    const jobsQuery = query(
      collection(db, JOB_POSTINGS_COLLECTION),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(jobsQuery);
    const jobPostings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Convertir Timestamps a fechas para uso en frontend
      jobPostings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        applicationDeadline: data.applicationDeadline?.toDate()
      });
    });
    
    return jobPostings;
  } catch (error) {
    console.error('Error fetching company job postings:', error);
    throw new Error('No se pudieron obtener las ofertas de empleo');
  }
};

/**
 * Obtener una oferta por su ID
 * @param {string} jobId - ID de la oferta
 * @returns {Promise<Object>} - Datos de la oferta
 */
export const getJobPostingById = async (jobId) => {
  try {
    const jobRef = doc(db, JOB_POSTINGS_COLLECTION, jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      throw new Error('La oferta de empleo no existe');
    }
    
    const data = jobDoc.data();
    
    // Convertir Timestamps a fechas para uso en frontend
    return {
      id: jobDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      applicationDeadline: data.applicationDeadline?.toDate()
    };
  } catch (error) {
    console.error('Error fetching job posting:', error);
    throw new Error('No se pudo obtener la oferta de empleo');
  }
};

/**
 * Buscar ofertas de empleo públicas con filtros
 * @param {Object} filters - Filtros para la búsqueda
 * @returns {Promise<Array>} - Array de ofertas
 */
export const searchJobPostings = async (filters = {}) => {
  try {
    // Construir la consulta base
    let jobsQuery = query(
      collection(db, JOB_POSTINGS_COLLECTION),
      where('status', '==', 'published')
    );
    
    // Añadir filtros específicos si se proporcionan
    if (filters.location) {
      jobsQuery = query(jobsQuery, where('location', '==', filters.location));
    }
    
    if (filters.employmentType) {
      jobsQuery = query(jobsQuery, where('employmentType', '==', filters.employmentType));
    }
    
    if (filters.experienceLevel) {
      jobsQuery = query(jobsQuery, where('experienceLevel', '==', filters.experienceLevel));
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    jobsQuery = query(jobsQuery, orderBy('createdAt', 'desc'));
    
    // Aplicar límite si se especifica
    if (filters.limit) {
      jobsQuery = query(jobsQuery, limit(filters.limit));
    }
    
    // Ejecutar la consulta
    const querySnapshot = await getDocs(jobsQuery);
    const jobPostings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Convertir Timestamps a fechas para uso en frontend
      jobPostings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        applicationDeadline: data.applicationDeadline?.toDate()
      });
    });
    
    return jobPostings;
  } catch (error) {
    console.error('Error searching job postings:', error);
    throw new Error('Error al buscar ofertas de empleo');
  }
};

/**
 * Aplicar/postular a una oferta de empleo
 * @param {string} jobId - ID de la oferta
 * @param {string} professionalId - ID del profesional que aplica
 * @param {Object} applicationData - Datos de la postulación
 * @returns {Promise<Object>} - Datos de la postulación creada
 */
export const applyToJob = async (jobId, professionalId, applicationData) => {
  try {
    // Verificar si el trabajo existe
    const jobRef = doc(db, JOB_POSTINGS_COLLECTION, jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      throw new Error('La oferta de empleo no existe');
    }
    
    // Verificar si el profesional ya aplicó a este trabajo
    const existingApplicationQuery = query(
      collection(db, JOB_APPLICATIONS_COLLECTION),
      where('jobId', '==', jobId),
      where('professionalId', '==', professionalId)
    );
    
    const existingApplications = await getDocs(existingApplicationQuery);
    if (!existingApplications.empty) {
      throw new Error('Ya has aplicado a esta oferta anteriormente');
    }
    
    // Crear la aplicación
    const application = {
      jobId,
      professionalId,
      status: 'pending', // pending, reviewed, shortlisted, rejected, hired
      ...applicationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const applicationRef = await addDoc(collection(db, JOB_APPLICATIONS_COLLECTION), application);
    
    // Incrementar el contador de aplicaciones en la oferta
    await updateDoc(jobRef, {
      applicationCount: (jobDoc.data().applicationCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: applicationRef.id,
      ...application,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error applying to job:', error);
    throw new Error(error.message || 'No se pudo aplicar a la oferta');
  }
};

/**
 * Obtener todas las postulaciones para una oferta
 * @param {string} jobId - ID de la oferta
 * @param {string} companyId - ID de la empresa para verificación
 * @returns {Promise<Array>} - Array de postulaciones
 */
export const getApplicationsForJob = async (jobId, companyId) => {
  try {
    // Verificar si la oferta existe y pertenece a la empresa
    const jobRef = doc(db, JOB_POSTINGS_COLLECTION, jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      throw new Error('La oferta de empleo no existe');
    }
    
    // Verificar pertenencia a la empresa
    const jobData = jobDoc.data();
    if (jobData.companyId !== companyId) {
      throw new Error('No tienes permiso para ver las postulaciones de esta oferta');
    }
    
    // Obtener las postulaciones
    const applicationsQuery = query(
      collection(db, JOB_APPLICATIONS_COLLECTION),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(applicationsQuery);
    const applications = [];
    
    // Recopilar las IDs de los profesionales para obtener sus datos
    const professionalIds = new Set();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      professionalIds.add(data.professionalId);
      applications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });
    
    // Obtener datos de los profesionales si hay aplicaciones
    if (applications.length > 0) {
      // Crear un mapa para buscar rápidamente los datos del profesional
      const professionalsMap = {};
      
      // Buscar información de cada profesional
      for (const profId of professionalIds) {
        const userRef = doc(db, USERS_COLLECTION, profId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          professionalsMap[profId] = {
            id: profId,
            displayName: userData.displayName || 'Usuario',
            email: userData.email,
            photoURL: userData.photoURL || null,
            specialty: userData.specialty || null,
            experience: userData.experience || null
          };
        }
      }
      
      // Enriquecer las aplicaciones con datos de profesionales
      for (let i = 0; i < applications.length; i++) {
        applications[i].professional = professionalsMap[applications[i].professionalId] || {
          id: applications[i].professionalId,
          displayName: 'Usuario desconocido'
        };
      }
    }
    
    return applications;
  } catch (error) {
    console.error('Error fetching job applications:', error);
    throw new Error(error.message || 'No se pudieron obtener las postulaciones');
  }
};

/**
 * Actualizar el estado de una postulación
 * @param {string} applicationId - ID de la postulación
 * @param {string} status - Nuevo estado
 * @param {string} companyId - ID de la empresa para verificación
 * @param {Object} additionalData - Datos adicionales para actualizar
 * @returns {Promise<Object>} - Datos actualizados
 */
export const updateApplicationStatus = async (applicationId, status, companyId, additionalData = {}) => {
  try {
    // Obtener la aplicación
    const applicationRef = doc(db, JOB_APPLICATIONS_COLLECTION, applicationId);
    const applicationDoc = await getDoc(applicationRef);
    
    if (!applicationDoc.exists()) {
      throw new Error('La postulación no existe');
    }
    
    const applicationData = applicationDoc.data();
    
    // Obtener la oferta para verificar permisos
    const jobRef = doc(db, JOB_POSTINGS_COLLECTION, applicationData.jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      throw new Error('La oferta asociada no existe');
    }
    
    // Verificar pertenencia a la empresa
    const jobData = jobDoc.data();
    if (jobData.companyId !== companyId) {
      throw new Error('No tienes permiso para actualizar esta postulación');
    }
    
    // Actualizar el estado y datos adicionales
    const updatedData = {
      status,
      ...additionalData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(applicationRef, updatedData);
    
    return {
      id: applicationId,
      ...applicationData,
      ...updatedData,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error updating application status:', error);
    throw new Error(error.message || 'No se pudo actualizar el estado de la postulación');
  }
};

/**
 * Obtener todas las postulaciones realizadas por un profesional
 * @param {string} professionalId - ID del profesional
 * @returns {Promise<Array>} - Array de postulaciones con detalles de ofertas
 */
export const getUserApplications = async (professionalId) => {
  try {
    // Obtener las postulaciones del profesional
    const applicationsQuery = query(
      collection(db, JOB_APPLICATIONS_COLLECTION),
      where('professionalId', '==', professionalId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(applicationsQuery);
    const applications = [];
    
    // Recopilar las IDs de las ofertas para obtener sus datos
    const jobIds = new Set();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobIds.add(data.jobId);
      applications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });
    
    // Obtener datos de las ofertas si hay aplicaciones
    if (applications.length > 0) {
      // Crear un mapa para buscar rápidamente los datos de la oferta
      const jobsMap = {};
      const companyIds = new Set();
      
      // Buscar información de cada oferta
      for (const jobId of jobIds) {
        const jobRef = doc(db, JOB_POSTINGS_COLLECTION, jobId);
        const jobDoc = await getDoc(jobRef);
        
        if (jobDoc.exists()) {
          const jobData = jobDoc.data();
          companyIds.add(jobData.companyId);
          
          jobsMap[jobId] = {
            id: jobId,
            title: jobData.title,
            location: jobData.location,
            companyId: jobData.companyId,
            status: jobData.status,
            employmentType: jobData.employmentType,
            salaryRange: jobData.salaryMin && jobData.salaryMax ? 
              `${jobData.salaryMin} - ${jobData.salaryMax} ${jobData.salaryCurrency}` : 
              'No especificado',
            createdAt: jobData.createdAt?.toDate(),
            applicationDeadline: jobData.applicationDeadline?.toDate()
          };
        }
      }
      
      // Obtener datos de las empresas
      const companiesMap = {};
      for (const companyId of companyIds) {
        const companyRef = doc(db, USERS_COLLECTION, companyId);
        const companyDoc = await getDoc(companyRef);
        
        if (companyDoc.exists()) {
          const companyData = companyDoc.data();
          companiesMap[companyId] = {
            id: companyId,
            name: companyData.companyName || companyData.displayName || 'Empresa',
            logo: companyData.logoURL || companyData.photoURL
          };
        }
      }
      
      // Enriquecer las aplicaciones con datos de ofertas y empresas
      for (let i = 0; i < applications.length; i++) {
        const job = jobsMap[applications[i].jobId];
        applications[i].job = job || { id: applications[i].jobId, title: 'Oferta eliminada' };
        
        if (job) {
          applications[i].company = companiesMap[job.companyId] || { 
            id: job.companyId, 
            name: 'Empresa desconocida' 
          };
        }
      }
    }
    
    return applications;
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw new Error('No se pudieron obtener tus postulaciones');
  }
};

/**
 * Obtener profesionales disponibles para contratar (básicamente usuarios con rol "doctor")
 * @param {Object} filters - Filtros para la búsqueda
 * @returns {Promise<Array>} - Array de profesionales
 */
export const getAvailableProfessionals = async (filters = {}) => {
  try {
    // Consulta base para obtener doctores
    let professionalsQuery = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'doctor')
    );
    
    // Añadir filtros específicos si se proporcionan
    if (filters.specialty) {
      professionalsQuery = query(professionalsQuery, where('specialty', '==', filters.specialty));
    }
    
    if (filters.location) {
      professionalsQuery = query(professionalsQuery, where('location', '==', filters.location));
    }
    
    // Aplicar límite si se especifica
    if (filters.limit) {
      professionalsQuery = query(professionalsQuery, limit(filters.limit));
    }
    
    // Ejecutar la consulta
    const querySnapshot = await getDocs(professionalsQuery);
    const professionals = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Solo extraer la información necesaria
      professionals.push({
        id: doc.id,
        displayName: data.displayName || 'Usuario',
        email: data.email,
        photoURL: data.photoURL || null,
        specialty: data.specialty || null,
        experience: data.experience || null,
        location: data.location || null,
        bio: data.bio || null,
        isAvailableForWork: data.isAvailableForWork !== false, // Por defecto, considerar disponible
        skills: data.skills || []
      });
    });
    
    return professionals;
  } catch (error) {
    console.error('Error fetching available professionals:', error);
    throw new Error('No se pudieron obtener los profesionales disponibles');
  }
};

// Exportar todas las funciones para su uso en la aplicación
export default {
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getJobPostingsByCompany,
  getJobPostingById,
  searchJobPostings,
  applyToJob,
  getApplicationsForJob,
  updateApplicationStatus,
  getUserApplications,
  getAvailableProfessionals
};
