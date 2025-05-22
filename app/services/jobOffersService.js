import { db, serverTimestamp } from '@/lib/firebase/firebaseConfig';
import {
    collection, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, getDocs, getDoc, doc
} from 'firebase/firestore';

/**
 * Servicio para gestionar ofertas laborales para médicos
 */
class JobOffersService {
    /**
     * Crear una nueva oferta laboral
     * @param {Object} offerData - Datos de la oferta laboral
     * @param {string} companyId - ID de la empresa que crea la oferta
     * @returns {Promise<string>} - ID de la oferta creada
     */
    async createJobOffer(offerData, companyId) {
        try {
            // Validar datos
            if (!offerData.title) throw new Error('El título de la oferta es requerido');
            if (!offerData.description) throw new Error('La descripción de la oferta es requerida');
            if (!companyId) throw new Error('ID de empresa es requerido');

            // Verificar que la empresa existe
            const companyRef = doc(db, 'companies', companyId);
            const companyDoc = await getDoc(companyRef);

            if (!companyDoc.exists()) {
                throw new Error('La empresa no existe');
            }

            // Crear la oferta
            const jobOfferData = {
                ...offerData,
                companyId,
                companyName: companyDoc.data().name || 'Empresa',
                status: offerData.status || 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                applicants: [],
                views: 0
            };

            const docRef = await addDoc(collection(db, 'jobOffers'), jobOfferData);

            return docRef.id;
        } catch (error) {
            console.error('Error creating job offer:', error);
            throw error;
        }
    }

    /**
     * Obtener ofertas laborales para un médico
     * @param {Object} filters - Filtros para la búsqueda
     * @returns {Promise<Array>} - Lista de ofertas laborales
     */
    async getJobOffersForDoctor(filters = {}) {
        try {
            const { specialty, location, type, workingHours } = filters;

            let jobOffersQuery = query(
                collection(db, 'jobOffers'),
                where('status', '==', 'active'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(jobOffersQuery);
            const offers = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();

                // Aplicar filtros adicionales que no se pueden hacer en la query
                let matchesFilters = true;

                if (specialty && data.requiredSpecialty !== specialty) {
                    matchesFilters = false;
                }

                if (location && data.location !== location) {
                    matchesFilters = false;
                }

                if (type && data.jobType !== type) {
                    matchesFilters = false;
                }

                if (workingHours && data.workingHours !== workingHours) {
                    matchesFilters = false;
                }

                if (matchesFilters) {
                    offers.push({
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.() || data.createdAt
                    });
                }
            });

            return offers;
        } catch (error) {
            console.error('Error getting job offers:', error);
            throw error;
        }
    }

    /**
     * Obtener ofertas laborales creadas por una empresa
     * @param {string} companyId - ID de la empresa
     * @returns {Promise<Array>} - Lista de ofertas laborales
     */
    async getCompanyJobOffers(companyId) {
        try {
            if (!companyId) throw new Error('Company ID is required');

            const jobOffersQuery = query(
                collection(db, 'jobOffers'),
                where('companyId', '==', companyId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(jobOffersQuery);
            const offers = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                offers.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
                });
            });

            return offers;
        } catch (error) {
            console.error('Error getting company job offers:', error);
            throw error;
        }
    }

    /**
     * Aplicar a una oferta laboral
     * @param {string} offerId - ID de la oferta
     * @param {string} doctorId - ID del médico que aplica
     * @param {Object} applicationData - Datos adicionales de la aplicación
     * @returns {Promise<boolean>} - True si la aplicación fue exitosa
     */
    async applyToJobOffer(offerId, doctorId, applicationData = {}) {
        try {
            if (!offerId) throw new Error('Offer ID is required');
            if (!doctorId) throw new Error('Doctor ID is required');

            // Verificar que la oferta existe y está activa
            const offerRef = doc(db, 'jobOffers', offerId);
            const offerDoc = await getDoc(offerRef);

            if (!offerDoc.exists()) {
                throw new Error('La oferta no existe');
            }

            const offerData = offerDoc.data();

            if (offerData.status !== 'active') {
                throw new Error('La oferta no está activa');
            }

            // Verificar que el doctor no ha aplicado ya
            if (offerData.applicants && offerData.applicants.some(app => app.doctorId === doctorId)) {
                throw new Error('Ya has aplicado a esta oferta');
            }

            // Verificar que el médico existe
            const doctorRef = doc(db, 'doctors', doctorId);
            const doctorDoc = await getDoc(doctorRef);

            if (!doctorDoc.exists()) {
                throw new Error('El médico no existe');
            }

            // Datos del médico para la aplicación
            const doctorData = doctorDoc.data();

            // Crear la aplicación
            const application = {
                doctorId,
                doctorName: doctorData.name || 'Doctor',
                doctorSpecialty: doctorData.specialty || '',
                message: applicationData.message || '',
                resume: applicationData.resume || doctorData.resume || '',
                status: 'pending',
                appliedAt: new Date().toISOString()
            };

            // Actualizar la oferta con el nuevo aplicante
            await updateDoc(offerRef, {
                applicants: [...(offerData.applicants || []), application],
                updatedAt: serverTimestamp()
            });

            // También guardar la aplicación en la colección de aplicaciones del médico
            await addDoc(collection(db, `doctors/${doctorId}/applications`), {
                offerId,
                offerTitle: offerData.title,
                companyId: offerData.companyId,
                companyName: offerData.companyName,
                status: 'pending',
                appliedAt: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('Error applying to job offer:', error);
            throw error;
        }
    }

    /**
     * Obtener detalle de una oferta laboral
     * @param {string} offerId - ID de la oferta
     * @returns {Promise<Object>} - Datos de la oferta
     */
    async getJobOfferDetails(offerId) {
        try {
            if (!offerId) throw new Error('Offer ID is required');

            const offerRef = doc(db, 'jobOffers', offerId);
            const offerDoc = await getDoc(offerRef);

            if (!offerDoc.exists()) {
                throw new Error('La oferta no existe');
            }

            const offerData = offerDoc.data();

            // Incrementar contador de vistas
            await updateDoc(offerRef, {
                views: (offerData.views || 0) + 1
            });

            return {
                id: offerDoc.id,
                ...offerData,
                createdAt: offerData.createdAt?.toDate?.() || offerData.createdAt
            };
        } catch (error) {
            console.error('Error getting job offer details:', error);
            throw error;
        }
    }

    /**
     * Actualizar estado de una aplicación
     * @param {string} offerId - ID de la oferta
     * @param {string} doctorId - ID del médico aplicante
     * @param {string} status - Nuevo estado (accepted, rejected, interviewing)
     * @returns {Promise<boolean>} - True si la actualización fue exitosa
     */
    async updateApplicationStatus(offerId, doctorId, status) {
        try {
            if (!offerId) throw new Error('Offer ID is required');
            if (!doctorId) throw new Error('Doctor ID is required');
            if (!['accepted', 'rejected', 'interviewing', 'pending'].includes(status)) {
                throw new Error('Invalid status');
            }

            // Obtener la oferta
            const offerRef = doc(db, 'jobOffers', offerId);
            const offerDoc = await getDoc(offerRef);

            if (!offerDoc.exists()) {
                throw new Error('La oferta no existe');
            }

            const offerData = offerDoc.data();

            // Encontrar y actualizar la aplicación
            const applicants = offerData.applicants || [];
            const applicantIndex = applicants.findIndex(app => app.doctorId === doctorId);

            if (applicantIndex === -1) {
                throw new Error('Aplicación no encontrada');
            }

            // Actualizar estatus
            applicants[applicantIndex].status = status;
            applicants[applicantIndex].updatedAt = new Date().toISOString();

            // Guardar cambios en la oferta
            await updateDoc(offerRef, {
                applicants,
                updatedAt: serverTimestamp()
            });

            // Actualizar también en la colección de aplicaciones del médico
            const applicationsQuery = query(
                collection(db, `doctors/${doctorId}/applications`),
                where('offerId', '==', offerId)
            );

            const querySnapshot = await getDocs(applicationsQuery);

            if (!querySnapshot.empty) {
                const applicationDoc = querySnapshot.docs[0];
                await updateDoc(doc(db, `doctors/${doctorId}/applications`, applicationDoc.id), {
                    status,
                    updatedAt: new Date().toISOString()
                });
            }

            return true;
        } catch (error) {
            console.error('Error updating application status:', error);
            throw error;
        }
    }

    /**
     * Obtener aplicaciones a ofertas de un médico
     * @param {string} doctorId - ID del médico
     * @returns {Promise<Array>} - Lista de aplicaciones
     */
    async getDoctorApplications(doctorId) {
        try {
            if (!doctorId) throw new Error('Doctor ID is required');

            const applicationsRef = collection(db, `doctors/${doctorId}/applications`);
            const querySnapshot = await getDocs(applicationsRef);

            const applications = [];

            querySnapshot.forEach((doc) => {
                applications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return applications;
        } catch (error) {
            console.error('Error getting doctor applications:', error);
            throw error;
        }
    }
}

export const jobOffersService = new JobOffersService();
