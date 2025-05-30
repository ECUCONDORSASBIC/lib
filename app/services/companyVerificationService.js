/**
 * Service for company verification operations
 */

import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseClient';
import { storage } from '@/lib/firebase/firebaseClient';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Collection names
const COMPANIES_COLLECTION = 'companies';
const VERIFICATION_COLLECTION = 'company_verifications';
const VERIFICATION_LOGS_COLLECTION = 'verification_logs';
const COMPANY_MEMBERS_COLLECTION = 'company_members'; // New collection for company members
const COMPANY_DEPARTMENTS_COLLECTION = 'company_departments'; // New collection for departments

// Company roles for permission management
export const COMPANY_ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    HR_MANAGER: 'hr_manager',
    DEPARTMENT_HEAD: 'department_head',
    EMPLOYEE: 'employee'
};

/**
 * Get the verification status for a company
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} - Verification status object
 */
export const getCompanyVerificationStatus = async (companyId) => {
    try {
        // Check if a verification document exists
        const verificationRef = doc(db, VERIFICATION_COLLECTION, companyId);
        const verificationDoc = await getDoc(verificationRef);

        if (verificationDoc.exists()) {
            return verificationDoc.data();
        }

        // If no verification document, create one with 'pending' status
        const initialStatus = {
            status: 'pending',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            steps: {
                documents_submitted: false,
                email_verified: false,
                phone_validated: false,
                tax_id_validated: false
            },
            notes: []
        };

        await setDoc(verificationRef, initialStatus);
        return initialStatus;
    } catch (error) {
        console.error('Error getting company verification status:', error);
        throw new Error('No se pudo obtener el estado de verificación de la empresa');
    }
};

/**
 * Start or update the verification process for a company
 * @param {string} companyId - Company ID
 * @param {Object} verificationData - Data for the verification
 * @returns {Promise<Object>} - Updated verification status
 */
export const updateCompanyVerification = async (companyId, verificationData) => {
    try {
        const verificationRef = doc(db, VERIFICATION_COLLECTION, companyId);
        const verificationDoc = await getDoc(verificationRef);

        if (!verificationDoc.exists()) {
            throw new Error('No existe un proceso de verificación para esta empresa');
        }

        const currentData = verificationDoc.data();

        // Update data
        const updatedData = {
            ...currentData,
            ...verificationData,
            updatedAt: Timestamp.now()
        };

        // If all steps are completed, update status to 'in_progress'
        if (
            updatedData.steps.documents_submitted &&
            updatedData.steps.email_verified &&
            updatedData.steps.phone_validated &&
            updatedData.steps.tax_id_validated &&
            updatedData.status === 'pending'
        ) {
            updatedData.status = 'in_progress';
        }

        await updateDoc(verificationRef, updatedData);

        // Log the verification update
        await addVerificationLog(companyId, {
            action: 'update',
            data: verificationData,
            timestamp: Timestamp.now()
        });

        return updatedData;
    } catch (error) {
        console.error('Error updating company verification:', error);
        throw new Error('No se pudo actualizar la verificación de la empresa');
    }
};

/**
 * Upload company verification documents
 * @param {string} companyId - Company ID
 * @param {File} file - Document file to upload
 * @param {string} documentType - Type of document
 * @returns {Promise<string>} - Download URL of the uploaded document
 */
export const uploadVerificationDocument = async (companyId, file, documentType) => {
    try {
        // Create reference to the file location
        const storageRef = ref(storage, `company_verification/${companyId}/${documentType}_${Date.now()}`);

        // Upload file
        const snapshot = await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update verification status to include the document
        const verificationRef = doc(db, VERIFICATION_COLLECTION, companyId);
        const verificationDoc = await getDoc(verificationRef);

        if (verificationDoc.exists()) {
            const currentData = verificationDoc.data();

            // Update documents array
            const documents = currentData.documents || [];
            documents.push({
                type: documentType,
                url: downloadURL,
                filename: file.name,
                uploadedAt: Timestamp.now()
            });

            // Update steps
            const steps = {
                ...currentData.steps,
                documents_submitted: true
            };

            await updateDoc(verificationRef, {
                documents,
                steps,
                updatedAt: Timestamp.now()
            });
        }

        return downloadURL;
    } catch (error) {
        console.error('Error uploading verification document:', error);
        throw new Error('No se pudo subir el documento de verificación');
    }
};

/**
 * Validate company tax ID against official registry API
 * @param {string} companyId - Company ID
 * @param {string} taxId - Tax ID to validate
 * @returns {Promise<Object>} - Validation result
 */
export const validateCompanyTaxId = async (companyId, taxId) => {
    try {
        // This would connect to an official API - for now we'll simulate the validation
        // In a real implementation, this would call an API like:
        // const response = await fetch(`https://api.registrooficial.com/validate?taxId=${taxId}`);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate validation - in real implementation this would use the API response
        const isValid = taxId.length >= 10 && /^\d+$/.test(taxId);
        const validationDetails = isValid
            ? {
                exists: true,
                officialName: 'ACME CORPORATION S.A.',
                registrationDate: '2010-05-15',
                status: 'ACTIVE'
            }
            : { exists: false };

        // Update verification status
        if (isValid) {
            const verificationRef = doc(db, VERIFICATION_COLLECTION, companyId);
            await updateDoc(verificationRef, {
                'steps.tax_id_validated': true,
                taxIdValidation: validationDetails,
                updatedAt: Timestamp.now()
            });
        }

        return {
            isValid,
            details: validationDetails
        };
    } catch (error) {
        console.error('Error validating company tax ID:', error);
        throw new Error('No se pudo validar el ID fiscal de la empresa');
    }
};

/**
 * Add a log entry for verification activities
 * @param {string} companyId - Company ID
 * @param {Object} logData - Log data
 * @returns {Promise<void>}
 */
export const addVerificationLog = async (companyId, logData) => {
    try {
        const logsCollection = collection(db, VERIFICATION_LOGS_COLLECTION);
        await setDoc(doc(logsCollection), {
            companyId,
            ...logData,
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.error('Error adding verification log:', error);
        // Don't throw here to prevent disrupting the main flow
    }
};

/**
 * Get verification logs for a company
 * @param {string} companyId - Company ID
 * @returns {Promise<Array>} - Array of log entries
 */
export const getVerificationLogs = async (companyId) => {
    try {
        const logsQuery = query(
            collection(db, VERIFICATION_LOGS_COLLECTION),
            where('companyId', '==', companyId),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(logsQuery);
        const logs = [];

        querySnapshot.forEach((doc) => {
            logs.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return logs;
    } catch (error) {
        console.error('Error getting verification logs:', error);
        throw new Error('No se pudieron obtener los registros de verificación');
    }
};

/**
 * Setup initial company structure with owner after verification
 * @param {string} companyId - Company ID
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<boolean>} - Success status
 */
export const setupVerifiedCompanyStructure = async (companyId, ownerId) => {
    try {
        // Add owner as the first company member with owner role
        const memberData = {
            userId: ownerId,
            companyId,
            role: COMPANY_ROLES.OWNER,
            joinedAt: Timestamp.now(),
            status: 'active'
        };

        const membersCollection = collection(db, COMPANY_MEMBERS_COLLECTION);
        await setDoc(doc(membersCollection), memberData);

        // Update company status in the main company collection
        const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
        await updateDoc(companyRef, {
            isVerified: true,
            verifiedAt: Timestamp.now(),
            hierarchyEnabled: true,
            updatedAt: Timestamp.now()
        });

        // Add verification completion log
        await addVerificationLog(companyId, {
            action: 'verification_completed',
            data: { status: 'verified' },
            timestamp: Timestamp.now()
        });

        return true;
    } catch (error) {
        console.error('Error setting up verified company structure:', error);
        throw new Error('No se pudo configurar la estructura de la empresa verificada');
    }
};

/**
 * Create a new department in the company
 * @param {string} companyId - Company ID
 * @param {Object} departmentData - Department data
 * @returns {Promise<string>} - Department ID
 */
export const createCompanyDepartment = async (companyId, departmentData) => {
    try {
        const data = {
            companyId,
            ...departmentData,
            createdAt: Timestamp.now()
        };

        const departmentsCollection = collection(db, COMPANY_DEPARTMENTS_COLLECTION);
        const docRef = await setDoc(doc(departmentsCollection), data);

        // Add to activity log
        await addVerificationLog(companyId, {
            action: 'department_created',
            data: { departmentName: departmentData.name },
            timestamp: Timestamp.now()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error creating company department:', error);
        throw new Error('No se pudo crear el departamento');
    }
};

/**
 * Add a member to the company
 * @param {string} companyId - Company ID
 * @param {string} userId - User ID
 * @param {string} role - Role (from COMPANY_ROLES)
 * @param {string} departmentId - Department ID (optional)
 * @returns {Promise<string>} - Member document ID
 */
export const addCompanyMember = async (companyId, userId, role, departmentId = null) => {
    try {
        // Check if already a member
        const memberQuery = query(
            collection(db, COMPANY_MEMBERS_COLLECTION),
            where('companyId', '==', companyId),
            where('userId', '==', userId)
        );

        const existingMembers = await getDocs(memberQuery);
        if (!existingMembers.empty) {
            throw new Error('El usuario ya es miembro de esta empresa');
        }

        // Add the member
        const memberData = {
            userId,
            companyId,
            role,
            departmentId,
            joinedAt: Timestamp.now(),
            status: 'active'
        };

        const membersCollection = collection(db, COMPANY_MEMBERS_COLLECTION);
        const docRef = await setDoc(doc(membersCollection), memberData);

        // Add to activity log
        await addVerificationLog(companyId, {
            action: 'member_added',
            data: { userId, role },
            timestamp: Timestamp.now()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding company member:', error);
        throw new Error('No se pudo añadir el miembro a la empresa');
    }
};

/**
 * Check if a user has permission for a specific action
 * @param {string} companyId - Company ID
 * @param {string} userId - User ID
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} - Whether user has permission
 */
export const checkUserPermission = async (companyId, userId, permission) => {
    try {
        // Get the user's role in the company
        const memberQuery = query(
            collection(db, COMPANY_MEMBERS_COLLECTION),
            where('companyId', '==', companyId),
            where('userId', '==', userId)
        );

        const members = await getDocs(memberQuery);
        if (members.empty) {
            return false; // Not a company member
        }

        const memberData = members.docs[0].data();
        const role = memberData.role;

        // Role-based permissions map
        const rolePermissions = {
            [COMPANY_ROLES.OWNER]: [
                'manage_billing', 'delete_company', 'manage_verification', 'manage_members',
                'assign_roles', 'create_department', 'view_all_stats', 'manage_job_postings',
                'view_all_applications', 'manage_medical_programs', 'view_aggregated_health_data'
            ],
            [COMPANY_ROLES.ADMIN]: [
                'manage_members', 'assign_roles', 'create_department', 'view_all_stats',
                'manage_job_postings', 'view_all_applications', 'manage_medical_programs',
                'view_aggregated_health_data'
            ],
            [COMPANY_ROLES.HR_MANAGER]: [
                'manage_job_postings', 'view_all_applications', 'manage_medical_programs',
                'view_aggregated_health_data'
            ],
            [COMPANY_ROLES.DEPARTMENT_HEAD]: [
                'view_department_stats', 'manage_department_members'
            ],
            [COMPANY_ROLES.EMPLOYEE]: [
                'view_own_data', 'access_medical_services'
            ]
        };

        // Check if the role has the requested permission
        return rolePermissions[role]?.includes(permission) || false;
    } catch (error) {
        console.error('Error checking user permission:', error);
        return false;
    }
};
