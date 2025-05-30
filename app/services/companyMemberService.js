/**
 * Service for company members operations
 */

import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, Timestamp, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseClient';
import { addVerificationLog } from './companyVerificationService';

// Collection names
const COMPANY_MEMBERS_COLLECTION = 'company_members';
const COMPANY_DEPARTMENTS_COLLECTION = 'company_departments';
const USERS_COLLECTION = 'users';

/**
 * Get all members for a company
 * @param {string} companyId - Company ID
 * @returns {Promise<Array>} - Array of company members
 */
export const getCompanyMembers = async (companyId) => {
    try {
        const membersQuery = query(
            collection(db, COMPANY_MEMBERS_COLLECTION),
            where('companyId', '==', companyId),
            orderBy('joinedAt', 'desc')
        );

        const querySnapshot = await getDocs(membersQuery);
        const members = [];

        // Get member details and department names
        for (const memberDoc of querySnapshot.docs) {
            const memberData = memberDoc.data();

            // Get user details
            let userData = {};
            try {
                const userRef = doc(db, USERS_COLLECTION, memberData.userId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    userData = userDoc.data();
                }
            } catch (error) {
                console.error(`Error fetching user data for member ${memberData.userId}:`, error);
            }

            // Get department details if member is assigned to one
            let departmentName = null;
            if (memberData.departmentId) {
                try {
                    const departmentRef = doc(db, COMPANY_DEPARTMENTS_COLLECTION, memberData.departmentId);
                    const departmentDoc = await getDoc(departmentRef);
                    if (departmentDoc.exists()) {
                        departmentName = departmentDoc.data().name;
                    }
                } catch (error) {
                    console.error(`Error fetching department data for department ${memberData.departmentId}:`, error);
                }
            }

            members.push({
                id: memberDoc.id,
                ...memberData,
                name: userData.displayName || userData.name || 'Usuario sin nombre',
                email: userData.email || 'Sin correo electrónico',
                departmentName
            });
        }

        return members;
    } catch (error) {
        console.error('Error getting company members:', error);
        throw new Error('No se pudieron obtener los miembros de la empresa');
    }
};

/**
 * Update a member's role
 * @param {string} memberId - Member ID
 * @param {string} newRole - New role
 * @returns {Promise<void>}
 */
export const updateMemberRole = async (memberId, newRole) => {
    try {
        const memberRef = doc(db, COMPANY_MEMBERS_COLLECTION, memberId);
        const memberDoc = await getDoc(memberRef);

        if (!memberDoc.exists()) {
            throw new Error('El miembro no existe');
        }

        const memberData = memberDoc.data();

        await updateDoc(memberRef, {
            role: newRole,
            updatedAt: Timestamp.now()
        });

        // Add to activity log
        await addVerificationLog(memberData.companyId, {
            action: 'member_role_updated',
            data: {
                memberId,
                previousRole: memberData.role,
                newRole
            },
            timestamp: Timestamp.now()
        });

        return true;
    } catch (error) {
        console.error('Error updating member role:', error);
        throw new Error('No se pudo actualizar el rol del miembro');
    }
};

/**
 * Remove a member from the company
 * @param {string} memberId - Member ID
 * @returns {Promise<void>}
 */
export const removeMember = async (memberId) => {
    try {
        const memberRef = doc(db, COMPANY_MEMBERS_COLLECTION, memberId);
        const memberDoc = await getDoc(memberRef);

        if (!memberDoc.exists()) {
            throw new Error('El miembro no existe');
        }

        const memberData = memberDoc.data();

        // You can't remove the owner
        if (memberData.role === 'owner') {
            throw new Error('No se puede eliminar al propietario de la empresa');
        }

        // Log before deletion
        await addVerificationLog(memberData.companyId, {
            action: 'member_removed',
            data: { memberId, userId: memberData.userId, role: memberData.role },
            timestamp: Timestamp.now()
        });

        // Delete member
        await deleteDoc(memberRef);

        return true;
    } catch (error) {
        console.error('Error removing member:', error);
        throw new Error('No se pudo eliminar al miembro');
    }
};

/**
 * Assign member to a department
 * @param {string} memberId - Member ID
 * @param {string} departmentId - Department ID
 * @returns {Promise<void>}
 */
export const assignMemberToDepartment = async (memberId, departmentId) => {
    try {
        const memberRef = doc(db, COMPANY_MEMBERS_COLLECTION, memberId);
        const memberDoc = await getDoc(memberRef);

        if (!memberDoc.exists()) {
            throw new Error('El miembro no existe');
        }

        const memberData = memberDoc.data();

        // If departmentId is null, remove from department
        if (departmentId) {
            // Check if department exists
            const departmentRef = doc(db, COMPANY_DEPARTMENTS_COLLECTION, departmentId);
            const departmentDoc = await getDoc(departmentRef);

            if (!departmentDoc.exists()) {
                throw new Error('El departamento no existe');
            }
        }

        await updateDoc(memberRef, {
            departmentId,
            updatedAt: Timestamp.now()
        });

        // Add to activity log
        await addVerificationLog(memberData.companyId, {
            action: departmentId ? 'member_assigned_to_department' : 'member_removed_from_department',
            data: { memberId, departmentId },
            timestamp: Timestamp.now()
        });

        return true;
    } catch (error) {
        console.error('Error assigning member to department:', error);
        throw new Error('No se pudo asignar el miembro al departamento');
    }
};

/**
 * Get members for a specific department
 * @param {string} companyId - Company ID
 * @param {string} departmentId - Department ID
 * @returns {Promise<Array>} - Array of department members
 */
export const getDepartmentMembers = async (companyId, departmentId) => {
    try {
        const membersQuery = query(
            collection(db, COMPANY_MEMBERS_COLLECTION),
            where('companyId', '==', companyId),
            where('departmentId', '==', departmentId)
        );

        const querySnapshot = await getDocs(membersQuery);
        const members = [];

        for (const memberDoc of querySnapshot.docs) {
            const memberData = memberDoc.data();

            // Get user details
            let userData = {};
            try {
                const userRef = doc(db, USERS_COLLECTION, memberData.userId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    userData = userDoc.data();
                }
            } catch (error) {
                console.error(`Error fetching user data for member ${memberData.userId}:`, error);
            }

            members.push({
                id: memberDoc.id,
                ...memberData,
                name: userData.displayName || userData.name || 'Usuario sin nombre',
                email: userData.email || 'Sin correo electrónico'
            });
        }

        return members;
    } catch (error) {
        console.error('Error getting department members:', error);
        throw new Error('No se pudieron obtener los miembros del departamento');
    }
};
