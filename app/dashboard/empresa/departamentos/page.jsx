'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Toast } from '@/app/components/ui/Toast';
import {
    UserGroupIcon,
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    ArrowPathIcon,
    CheckBadgeIcon,
    ExclamationTriangleIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import {
    createCompanyDepartment,
    checkUserPermission,
} from '@/app/services/companyVerificationService';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

const DepartmentsPage = () => {
    const { user, userData } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: 'success' });
    const [showAddDepartmentForm, setShowAddDepartmentForm] = useState(false);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [canManageDepartments, setCanManageDepartments] = useState(false);

    const companyId = user?.uid;

    // Load permissions and departments
    useEffect(() => {
        const loadPermissionsAndDepartments = async () => {
            if (!companyId || !user) return;

            try {
                // Check permissions
                const hasPermission = await checkUserPermission(companyId, user.uid, 'create_department');
                setCanManageDepartments(hasPermission);

                // Load departments
                await fetchDepartments();
            } catch (err) {
                console.error('Error loading permissions:', err);
                setError('No se pudieron cargar los permisos');
            }
        };

        loadPermissionsAndDepartments();
    }, [companyId, user]);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            // This would be replaced with a real service call
            // For now, using mock data
            const mockDepartments = [
                {
                    id: '1',
                    name: 'Dirección',
                    description: 'Equipo directivo y estrategia corporativa',
                    createdAt: new Date(2022, 0, 10).toISOString(),
                    memberCount: 3
                },
                {
                    id: '2',
                    name: 'Recursos Humanos',
                    description: 'Gestión de talento y recursos humanos',
                    createdAt: new Date(2022, 0, 15).toISOString(),
                    memberCount: 4
                },
                {
                    id: '3',
                    name: 'Tecnología',
                    description: 'Desarrollo de software y sistemas',
                    createdAt: new Date(2022, 1, 5).toISOString(),
                    memberCount: 8
                },
                {
                    id: '4',
                    name: 'Marketing',
                    description: 'Estrategias de marketing y ventas',
                    createdAt: new Date(2022, 2, 20).toISOString(),
                    memberCount: 5
                }
            ];

            setDepartments(mockDepartments);
            setError('');
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('No se pudieron cargar los departamentos');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();

        if (!newDepartmentName) {
            setToastInfo({
                visible: true,
                message: 'Debe ingresar un nombre para el departamento',
                type: 'error'
            });
            return;
        }

        setToastInfo({
            visible: true,
            message: 'Creando departamento...',
            type: 'info'
        });

        try {
            // In a real implementation, you would call the service
            // await createCompanyDepartment(companyId, {
            //   name: newDepartmentName,
            //   description: newDepartmentDescription
            // });

            // Mock successful creation
            setToastInfo({
                visible: true,
                message: 'Departamento creado con éxito',
                type: 'success'
            });

            setNewDepartmentName('');
            setNewDepartmentDescription('');
            setShowAddDepartmentForm(false);

            // Refresh departments list
            fetchDepartments();
        } catch (err) {
            console.error('Error creating department:', err);
            setToastInfo({
                visible: true,
                message: `Error: ${err.message || 'No se pudo crear el departamento'}`,
                type: 'error'
            });
        }
    };

    const handleEditDepartment = (department) => {
        setEditingDepartment({
            ...department,
            newName: department.name,
            newDescription: department.description
        });
    };

    const handleUpdateDepartment = async () => {
        if (!editingDepartment) return;

        setToastInfo({
            visible: true,
            message: 'Actualizando departamento...',
            type: 'info'
        });

        try {
            // Mock successful update
            // await updateDepartment(editingDepartment.id, {
            //   name: editingDepartment.newName,
            //   description: editingDepartment.newDescription
            // });

            setToastInfo({
                visible: true,
                message: 'Departamento actualizado con éxito',
                type: 'success'
            });

            setEditingDepartment(null);

            // Refresh departments list
            fetchDepartments();
        } catch (err) {
            console.error('Error updating department:', err);
            setToastInfo({
                visible: true,
                message: `Error: ${err.message || 'No se pudo actualizar el departamento'}`,
                type: 'error'
            });
        }
    };

    const handleDeleteDepartment = async (departmentId) => {
        // Confirm deletion
        const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este departamento?');
        if (!confirmDelete) return;

        setToastInfo({
            visible: true,
            message: 'Eliminando departamento...',
            type: 'info'
        });

        try {
            // Mock successful removal
            // await deleteDepartment(departmentId);

            setToastInfo({
                visible: true,
                message: 'Departamento eliminado con éxito',
                type: 'success'
            });

            // Refresh departments list
            fetchDepartments();
        } catch (err) {
            console.error('Error removing department:', err);
            setToastInfo({
                visible: true,
                message: `Error: ${err.message || 'No se pudo eliminar el departamento'}`,
                type: 'error'
            });
        }
    };

    return (
        <ProtectedRoute allowedRoles={['employer', 'superuser']}>
            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                                <BuildingOfficeIcon className="w-7 h-7 mr-3 text-blue-600" />
                                Gestión de Departamentos
                            </h2>

                            {canManageDepartments && (
                                <button
                                    onClick={() => setShowAddDepartmentForm(!showAddDepartmentForm)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {showAddDepartmentForm ? 'Cancelar' : (
                                        <>
                                            <PlusIcon className="w-5 h-5 mr-2" />
                                            Añadir Departamento
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

                        {showAddDepartmentForm && (
                            <form onSubmit={handleAddDepartment} className="mb-6 p-4 bg-gray-50 rounded-md">
                                <h3 className="text-lg font-medium mb-4">Crear Nuevo Departamento</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del Departamento
                                        </label>
                                        <input
                                            type="text"
                                            value={newDepartmentName}
                                            onChange={(e) => setNewDepartmentName(e.target.value)}
                                            placeholder="Ej: Recursos Humanos"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={newDepartmentDescription}
                                            onChange={(e) => setNewDepartmentDescription(e.target.value)}
                                            placeholder="Breve descripción de las funciones del departamento"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Crear Departamento
                                    </button>
                                </div>
                            </form>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
                                <span className="ml-2">Cargando departamentos...</span>
                            </div>
                        ) : departments.length === 0 ? (
                            <div className="text-center py-8">
                                <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">No hay departamentos definidos</p>
                                {canManageDepartments && !showAddDepartmentForm && (
                                    <button
                                        onClick={() => setShowAddDepartmentForm(true)}
                                        className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                    >
                                        Crear el primer departamento
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {departments.map((department) => (
                                    <div
                                        key={department.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        {editingDepartment && editingDepartment.id === department.id ? (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={editingDepartment.newName}
                                                    onChange={(e) => setEditingDepartment({ ...editingDepartment, newName: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <textarea
                                                    value={editingDepartment.newDescription}
                                                    onChange={(e) => setEditingDepartment({ ...editingDepartment, newDescription: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows={3}
                                                />
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={handleUpdateDepartment}
                                                        className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                    >
                                                        <CheckBadgeIcon className="w-4 h-4 mr-1" />
                                                        Guardar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingDepartment(null)}
                                                        className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                                                    {canManageDepartments && (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditDepartment(department)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <PencilSquareIcon className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDepartment(department.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">{department.description}</p>
                                                <div className="mt-4 flex justify-between text-xs text-gray-500">
                                                    <div className="flex items-center">
                                                        <UserGroupIcon className="w-4 h-4 mr-1" />
                                                        {department.memberCount} {department.memberCount === 1 ? 'miembro' : 'miembros'}
                                                    </div>
                                                    <div>
                                                        Creado: {new Date(department.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
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

export default DepartmentsPage;
