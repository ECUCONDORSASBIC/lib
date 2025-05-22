'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, ClockIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

/**
 * Component for the enhanced company verification process
 * Displays verification status and steps required for full verification
 * Now with role permissions integration
 */
export default function CompanyVerificationStatus({ verificationStatus = 'pending', onStartVerification, permissionsEnabled = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPermissionsSection, setShowPermissionsSection] = useState(permissionsEnabled);

    const statuses = {
        pending: {
            title: 'Verificación Pendiente',
            description: 'Tu empresa aún no ha sido verificada. Completa el proceso para acceder a todas las funcionalidades.',
            icon: ClockIcon,
            color: 'text-yellow-500',
            backgroundColor: 'bg-yellow-50',
            buttonText: 'Iniciar Verificación',
        },
        in_progress: {
            title: 'Verificación en Proceso',
            description: 'Estamos verificando la información de tu empresa. Este proceso puede tomar hasta 48 horas hábiles.',
            icon: ClockIcon,
            color: 'text-blue-500',
            backgroundColor: 'bg-blue-50',
            buttonText: 'Ver Estado',
        },
        verified: {
            title: 'Empresa Verificada',
            description: 'Tu empresa ha sido verificada exitosamente. Tienes acceso a todas las funcionalidades.',
            icon: CheckIcon,
            color: 'text-green-500',
            backgroundColor: 'bg-green-50',
            buttonText: 'Ver Detalles',
        },
        rejected: {
            title: 'Verificación Rechazada',
            description: 'La verificación de tu empresa fue rechazada. Revisa los motivos y vuelve a intentarlo.',
            icon: ExclamationTriangleIcon,
            color: 'text-red-500',
            backgroundColor: 'bg-red-50',
            buttonText: 'Ver Detalles',
        }
    };

    const currentStatus = statuses[verificationStatus] || statuses.pending;

    return (
        <div className={`p-4 ${currentStatus.backgroundColor} border rounded-lg mb-6`}>
            <div className="flex items-start">
                <div className={`p-2 rounded-full ${currentStatus.color} bg-white mr-4`}>
                    <currentStatus.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-medium">{currentStatus.title}</h3>
                    <p className="text-gray-600 mt-1">{currentStatus.description}</p>

                    <button
                        onClick={() => verificationStatus === 'pending' ? onStartVerification() : setIsModalOpen(true)}
                        className={`mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${verificationStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                                verificationStatus === 'verified' ? 'bg-green-600 hover:bg-green-700' :
                                    'bg-blue-600 hover:bg-blue-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        {currentStatus.buttonText}
                    </button>
                </div>
            </div>

            {/* Verification Steps (visible for pending/in_progress states) */}
            {['pending', 'in_progress'].includes(verificationStatus) && (
                <div className="mt-4 ml-12 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Pasos para verificación completa:</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">1</span>
                            <span>Subir documentación legal de la empresa (Registro mercantil, Acta constitutiva)</span>
                        </li>
                        <li className="flex items-center">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">2</span>
                            <span>Verificar dominio de correo electrónico corporativo</span>
                        </li>
                        <li className="flex items-center">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">3</span>
                            <span>Validación telefónica con representante legal</span>
                        </li>
                        <li className="flex items-center">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">4</span>
                            <span>Verificación de registro fiscal contra base de datos oficiales</span>
                        </li>
                    </ul>
                </div>
            )}

            {/* Company permissions section (only visible when verified) */}
            {verificationStatus === 'verified' && showPermissionsSection && (
                <div className="mt-4 ml-12 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-600" />
                        Gestión de roles y permisos habilitada:
                    </h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                            <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                            <span>Estructura jerárquica de roles (Propietario, Admin, Gerente, etc.)</span>
                        </li>
                        <li className="flex items-center">
                            <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                            <span>Creación y gestión de departamentos</span>
                        </li>
                        <li className="flex items-center">
                            <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                            <span>Control de acceso basado en roles para datos sensibles</span>
                        </li>
                        <li className="flex items-center">
                            <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                            <span>Gestión avanzada de empleados y miembros del equipo</span>
                        </li>
                    </ul>
                </div>
            )}

            {/* Verification Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900">{currentStatus.title}</h3>
                            <button
                                className="text-gray-400 hover:text-gray-500"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <span className="sr-only">Cerrar</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4">
                            {verificationStatus === 'verified' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500">
                                        Tu empresa ha sido verificada exitosamente. Fecha de verificación: {new Date().toLocaleDateString()}
                                    </p>
                                    <div className="bg-green-50 p-3 rounded-md">
                                        <div className="flex">
                                            <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
                                            <p className="text-sm text-green-700">
                                                Verificación completada con éxito. Todas las funcionalidades están disponibles para tu empresa.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {verificationStatus === 'rejected' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500">
                                        La verificación de tu empresa fue rechazada. Por favor revisa los motivos y vuelve a intentarlo.
                                    </p>
                                    <div className="bg-red-50 p-3 rounded-md">
                                        <div className="flex">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                                            <div>
                                                <p className="text-sm font-medium text-red-800">Motivos del rechazo:</p>
                                                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                                    <li>La documentación proporcionada no es válida o está incompleta.</li>
                                                    <li>No se pudo verificar el identificador fiscal en registros oficiales.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {verificationStatus === 'in_progress' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500">
                                        Estamos verificando la información de tu empresa. Este proceso puede tomar hasta 48 horas hábiles.
                                    </p>
                                    <div className="bg-blue-50 p-3 rounded-md">
                                        <div className="flex">
                                            <ClockIcon className="h-5 w-5 text-blue-400 mr-2" />
                                            <p className="text-sm text-blue-700">
                                                Tu solicitud está siendo procesada. Te notificaremos por correo electrónico cuando se complete la verificación.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}