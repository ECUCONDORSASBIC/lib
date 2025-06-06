'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Toast } from '@/app/components/ui/Toast';
import {
    UserIcon,
    UserPlusIcon,
    UserMinusIcon,
    PencilSquareIcon,
    ArrowPathIcon,
    CheckBadgeIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
    COMPANY_ROLES,
    checkUserPermission,
    addCompanyMember
} from '@/app/services/companyVerificationService';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

const MembersPage = () => {
    const { user, userData } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: 'success' });
    const [showAddMemberForm, setShowAddMemberForm] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState(COMPANY_ROLES.EMPLOYEE);
    const [editingMember, setEditingMember] = useState(null);
    const [canManageMembers, setCanManageMembers] = useState(false);
    const [canAssignRoles, setCanAssignRoles] = useState(false);

    const companyId = user?.uid;

    // Load permissions and members
    useEffect(() => {
        const loadPermissionsAndMembers = async () => {
            if (!companyId || !user) return;

            try {
                // Check permissions
                const hasManagePermission = await checkUserPermission(companyId, user.uid, 'manage_members');
                const hasRolePermission = await checkUserPermission(companyId, user.uid, 'assign_roles');

                setCanManageMembers(hasManagePermission);
                setCanAssignRoles(hasRolePermission);

                // Load members
                await fetchMembers();
            } catch (err) {
                console.error('Error loading permissions:', err);
                setError('No se pudieron cargar los permisos');
            }
        };

        loadPermissionsAndMembers();
    }, [companyId, user]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            // This would be replaced with a real service call
            // For now, using mock data
            const mockMembers = [
                {
                    id: '1',
                    userId: 'user1',
                    name: 'Ana González',
                    email: 'ana@example.com',
                    role: COMPANY_ROLES.OWNER,
                    departmentName: 'Dirección',
                    joinedAt: new Date(2022, 0, 15).toISOString()
                },
                {
                    id: '2',
                    userId: 'user2',
                    name: 'Carlos Pérez',
                    email: 'carlos@example.com',
                    role: COMPANY_ROLES.HR_MANAGER,
                    departmentName: 'Recursos Humanos',
                    joinedAt: new Date(2022, 2, 10).toISOString()
                },
                {
                    id: '3',
                    userId: 'user3',
                    name: 'María López',
                    email: 'maria@example.com',
                    role: COMPANY_ROLES.DEPARTMENT_HEAD,
                    departmentName: 'Tecnología',
                    joinedAt: new Date(2022, 4, 5).toISOString()
                }
            ];

            setMembers(mockMembers);
            setError('');
        } catch (err) {
            console.error('Error fetching members:', err);
            setError('No se pudieron cargar los miembros del equipo');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();

        if (!newMemberEmail) {
            setToastInfo({
                visible: true,
                message: 'Debe ingresar un correo electrónico',
                type: 'error'
            });
            return;
        }

        setToastInfo({
            visible: true,
            message: 'Añadiendo miembro...',
            type: 'info'
        });

        try {
            // In a real implementation, you might need to search for the user by email first
            // Here we're assuming a simplified flow where we have the userId
            const userId = 'dummy-user-id'; // This would come from a user lookup by email

            // Mock successful addition
            // await addCompanyMember(companyId, userId, newMemberRole);

            setToastInfo({
                visible: true,
                message: 'Miembro añadido con éxito',
                type: 'success'
            });

            setNewMemberEmail('');
            setNewMemberRole(COMPANY_ROLES.EMPLOYEE);
            setShowAddMemberForm(false);

            // Refresh members list
            fetchMembers();
        } catch (err) {
            console.error('Error adding member:', err);
            setToastInfo({
                visible: true,
                message: `Error: ${err.message || 'No se pudo añadir el miembro'}`,
                type: 'error'
            });
        }
    };

    const handleEditMember = (member) => {
        setEditingMember({
            ...member,
            newRole: member.role
        });
    };

    const handleUpdateRole = async () => {
        if (!editingMember) return;

        setToastInfo({
            visible: true,
            message: 'Actualizando rol...',
            type: 'info'
        });

        try {
            // Mock successful update
            // await updateMemberRole(editingMember.id, editingMember.newRole);

            setToastInfo({
                visible: true,
                message: 'Rol actualizado con éxito',
                type: 'success'
            });

            setEditingMember(null);

            // Refresh members list
            fetchMembers();
        } catch (err) {
            console.error('Error updating role:', err);
            setToastInfo({
                visible: true,
                message: `Error: ${err.message || 'No se pudo actualizar el rol'}`,
                type: 'error'
            });
        }
    };

    const handleRemoveMember = async (memberId) => {
        // Confirm deletion
        const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este miembro del equipo?');
        if (!confirmDelete) return;

        setToastInfo({
            visible: true,
            message: 'Eliminando miembro...',
            type: 'info'
        });

        try {
            // Mock successful removal
            // await removeMember(memberId);

            setToastInfo({
                visible: true,
                message: 'Miembro eliminado con éxito',
                type: 'success'
            });

            // Refresh members list
            fetchMembers();
        } catch (err) {
            console.error('Error removing member:', err);
            setToastInfo({
                visible: true,
                message: `Error: ${err.message || 'No se pudo eliminar el miembro'}`,
                type: 'error'
            });
        }
    };

    const getRoleBadgeClasses = (role) => {
        switch (role) {
            case COMPANY_ROLES.OWNER:
                return 'bg-purple-100 text-purple-800';
            case COMPANY_ROLES.ADMIN:
                return 'bg-red-100 text-red-800';
            case COMPANY_ROLES.HR_MANAGER:
                return 'bg-blue-100 text-blue-800';
            case COMPANY_ROLES.DEPARTMENT_HEAD:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleTranslation = (role) => {
        const translations = {
            [COMPANY_ROLES.OWNER]: 'Propietario',
            [COMPANY_ROLES.ADMIN]: 'Administrador',
            [COMPANY_ROLES.HR_MANAGER]: 'Gerente de RR.HH.',
            [COMPANY_ROLES.DEPARTMENT_HEAD]: 'Jefe de Departamento',
            [COMPANY_ROLES.EMPLOYEE]: 'Empleado',
        };
        return translations[role] || role;
    };

    return (
        <ProtectedRoute allowedRoles={['employer', 'superuser']}>
            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                                <UserIcon className="w-7 h-7 mr-3 text-blue-600" />
                                Gestión de Equipo
                            </h2>

                            {canManageMembers && (
                                <button
                                    onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {showAddMemberForm ? 'Cancelar' : (
                                        <>
                                            <UserPlusIcon className="w-5 h-5 mr-2" />
                                            Añadir Miembro
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                                {error}
                            </div>
                        )}

                        {showAddMemberForm && (
                            <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 rounded-md">
                                <h3 className="text-lg font-medium mb-4">Añadir Nuevo Miembro</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            value={newMemberEmail}
                                            onChange={(e) => setNewMemberEmail(e.target.value)}
                                            placeholder="email@ejemplo.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rol
                                        </label>
                                        <select
                                            value={newMemberRole}
                                            onChange={(e) => setNewMemberRole(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {Object.values(COMPANY_ROLES).map(role => (
                                                <option key={role} value={role}>
                                                    {getRoleTranslation(role)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Añadir
                                    </button>
                                </div>
                            </form>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
                                <span className="ml-2">Cargando miembros...</span>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-8">
                                <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">No hay miembros en el equipo</p>
                                {canManageMembers && !showAddMemberForm && (
                                    <button
                                        onClick={() => setShowAddMemberForm(true)}
                                        className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                    >
                                        Añadir el primer miembro
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Usuario
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rol
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Departamento
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fecha de Ingreso
                                            </th>
                                            {canManageMembers && (
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {members.map((member) => (
                                            <tr key={member.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <UserIcon className="h-6 w-6 text-gray-500" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                            <div className="text-sm text-gray-500">{member.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingMember && editingMember.id === member.id ? (
                                                        <div className="flex items-center space-x-2">
                                                            <select
                                                                value={editingMember.newRole}
                                                                onChange={(e) => setEditingMember({ ...editingMember, newRole: e.target.value })}
                                                                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                                                            >
                                                                {Object.values(COMPANY_ROLES).map(role => (
                                                                    <option key={role} value={role}>
                                                                        {getRoleTranslation(role)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={handleUpdateRole}
                                                                className="p-1 text-blue-600 hover:text-blue-800"
                                                            >
                                                                <CheckBadgeIcon className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingMember(null)}
                                                                className="p-1 text-gray-600 hover:text-gray-800"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClasses(member.role)}`}>
                                                            {getRoleTranslation(member.role)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {member.departmentName || 'Sin departamento'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-'}
                                                </td>
                                                {canManageMembers && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {canAssignRoles && !editingMember && (
                                                            <button
                                                                onClick={() => handleEditMember(member)}
                                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                            >
                                                                <PencilSquareIcon className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                        {member.role !== COMPANY_ROLES.OWNER && (
                                                            <button
                                                                onClick={() => handleRemoveMember(member.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <UserMinusIcon className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {toastInfo.visible && (
                <Toast
                    message={toastInfo.message}
                    type={toastInfo.type}
                    onClose={() => setToastInfo({ ...toastInfo, visible: false })}
                />
            )}
        </ProtectedRoute>
    );
};

export default MembersPage;
