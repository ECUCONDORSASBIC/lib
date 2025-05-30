/**
 * Service for company departments operations
 */

import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, Timestamp, orderBy, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseClient';
import { addVerificationLog } from './companyVerificationService';

// Collection names
const COMPANY_DEPARTMENTS_COLLECTION = 'company_departments';
const COMPANY_MEMBERS_COLLECTION = 'company_members';

/**
 * Get all departments for a company
 * @param {string} companyId - Company ID
 * @returns {Promise<Array>} - Array of company departments
 */
export const getCompanyDepartments = async (companyId) => {
    try {
        const departmentsQuery = query(
            collection(db, COMPANY_DEPARTMENTS_COLLECTION),
            where('companyId', '==', companyId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(departmentsQuery);
        const departments = [];

        // Get departments and count members for each
        for (const departmentDoc of querySnapshot.docs) {
            const departmentData = departmentDoc.data();
            const departmentId = departmentDoc.id;

            // Count members in department
            const membersQuery = query(
                collection(db, COMPANY_MEMBERS_COLLECTION),
                where('companyId', '==', companyId),
                where('departmentId', '==', departmentId)
            );

            const membersSnapshot = await getDocs(membersQuery);
            const memberCount = membersSnapshot.size;

            departments.push({
                id: departmentId,
                ...departmentData,
                memberCount
            });
        }

        return departments;
    } catch (error) {
        console.error('Error getting company departments:', error);
        throw new Error('No se pudieron obtener los departamentos de la empresa');
    }
};

/**
 * Create a new department
 * @param {string} companyId - Company ID
 * @param {Object} departmentData - Department data
 * @returns {Promise<string>} - Department ID
 */
export const createDepartment = async (companyId, departmentData) => {
    try {
        // Prepare data
        const data = {
            companyId,
            name: departmentData.name,
            description: departmentData.description || '',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        // Create the department
        const departmentsCollection = collection(db, COMPANY_DEPARTMENTS_COLLECTION);
        const docRef = await addDoc(departmentsCollection, data);

        // Add to activity log
        await addVerificationLog(companyId, {
            action: 'department_created',
            data: { departmentId: docRef.id, departmentName: data.name },
            timestamp: Timestamp.now()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error creating department:', error);
        throw new Error('No se pudo crear el departamento');
    }
};

/**
 * Update a department
 * @param {string} departmentId - Department ID
 * @param {Object} departmentData - Department data
 * @returns {Promise<boolean>} - Success status
 */
export const updateDepartment = async (departmentId, departmentData) => {
    try {
        const departmentRef = doc(db, COMPANY_DEPARTMENTS_COLLECTION, departmentId);
        const departmentDoc = await getDoc(departmentRef);

        if (!departmentDoc.exists()) {
            throw new Error('El departamento no existe');
        }

        const currentData = departmentDoc.data();

        // Update the document
        await updateDoc(departmentRef, {
            ...departmentData,
            updatedAt: Timestamp.now()
        });

        // Add to activity log
        await addVerificationLog(currentData.companyId, {
            action: 'department_updated',
            data: { departmentId, updates: departmentData },
            timestamp: Timestamp.now()
        });

        return true;
    } catch (error) {
        console.error('Error updating department:', error);
        throw new Error('No se pudo actualizar el departamento');
    }
};

/**
 * Delete a department
 * @param {string} departmentId - Department ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteDepartment = async (departmentId) => {
    try {
        const departmentRef = doc(db, COMPANY_DEPARTMENTS_COLLECTION, departmentId);
        const departmentDoc = await getDoc(departmentRef);

        if (!departmentDoc.exists()) {
            throw new Error('El departamento no existe');
        }

        const departmentData = departmentDoc.data();

        // Check if there are members in this department
        const membersQuery = query(
            collection(db, COMPANY_MEMBERS_COLLECTION),
            where('departmentId', '==', departmentId)
        );

        const membersSnapshot = await getDocs(membersQuery);

        // Remove department association from all members
        const updatePromises = [];
        membersSnapshot.forEach((memberDoc) => {
            const memberRef = doc(db, COMPANY_MEMBERS_COLLECTION, memberDoc.id);
            updatePromises.push(
                updateDoc(memberRef, {
                    departmentId: null,
                    updatedAt: Timestamp.now()
                })
            );
        });

        // Wait for all member updates
        await Promise.all(updatePromises);

        // Log before deletion
        await addVerificationLog(departmentData.companyId, {
            action: 'department_deleted',
            data: {
                departmentId,
                departmentName: departmentData.name,
                affectedMembers: membersSnapshot.size
            },
            timestamp: Timestamp.now()
        });

        // Delete the department
        await deleteDoc(departmentRef);

        return true;
    } catch (error) {
        console.error('Error deleting department:', error);
        throw new Error('No se pudo eliminar el departamento');
    }
};

/**
 * Get department details
 * @param {string} departmentId - Department ID
 * @returns {Promise<Object>} - Department details
 */
export const getDepartmentDetails = async (departmentId) => {
    try {
        const departmentRef = doc(db, COMPANY_DEPARTMENTS_COLLECTION, departmentId);
        const departmentDoc = await getDoc(departmentRef);

        if (!departmentDoc.exists()) {
            throw new Error('El departamento no existe');
        }

        const departmentData = departmentDoc.data();

        // Count members
        const membersQuery = query(
            collection(db, COMPANY_MEMBERS_COLLECTION),
            where('departmentId', '==', departmentId)
        );

        const membersSnapshot = await getDocs(membersQuery);

        return {
            id: departmentId,
            ...departmentData,
            memberCount: membersSnapshot.size
        };
    } catch (error) {
        console.error('Error getting department details:', error);
        throw new Error('No se pudieron obtener los detalles del departamento');
    }
};
