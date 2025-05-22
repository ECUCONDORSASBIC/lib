'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { jobOffersService } from '@/app/services/jobOffersService';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Página para ver detalles de una oferta laboral específica
 */
export default function JobOfferDetailsPage({ params }) {
    const { id: offerId } = params;
    const router = useRouter();
    const { user, role, loading: authLoading } = useAuth();

    const [jobOffer, setJobOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applications, setApplications] = useState([]);
    const [hasApplied, setHasApplied] = useState(false);

    // Estado para el formulario de aplicación
    const [isApplying, setIsApplying] = useState(false);
    const [applicationMessage, setApplicationMessage] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    // Cargar datos de la oferta y verificar si el usuario ha aplicado
    useEffect(() => {
        if (authLoading || !user) return;

        const loadJobOfferData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Cargar detalles de la oferta
                const offerData = await jobOffersService.getJobOfferDetails(offerId);
                setJobOffer(offerData);

                // Si el usuario es un médico, verificar si ya ha aplicado
                if (role === 'medico') {
                    const doctorApplications = await jobOffersService.getDoctorApplications(user.uid);
                    setApplications(doctorApplications);

                    const hasAppliedToThisOffer = doctorApplications.some(app => app.offerId === offerId);
                    setHasApplied(hasAppliedToThisOffer);
                }
            } catch (err) {
                console.error('Error loading job offer:', err);
                setError(err.message || 'Error al cargar la oferta');
            } finally {
                setLoading(false);
            }
        };

        loadJobOfferData();
    }, [offerId, user, authLoading, role]);

    // Enviar aplicación
    const handleApply = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('Debe iniciar sesión para aplicar');
            return;
        }

        try {
            setSubmitLoading(true);

            await jobOffersService.applyToJobOffer(offerId, user.uid, {
                message: applicationMessage
            });

            // Actualizar estado
            setHasApplied(true);
            setIsApplying(false);

            // Recargar aplicaciones
            const doctorApplications = await jobOffersService.getDoctorApplications(user.uid);
            setApplications(doctorApplications);

            alert('¡Aplicación enviada con éxito!');
        } catch (err) {
            console.error('Error applying to job:', err);
            alert('Error al enviar la aplicación: ' + err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    // Formatear tiempo relativo
    const formatTime = (date) => {
        if (!date) return 'Fecha desconocida';
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return formatDistanceToNow(parsedDate, { addSuffix: true, locale: es });
    };

    // Redireccionar si el usuario no está autenticado o no es un médico
    useEffect(() => {
        if (!authLoading && (!user || role !== 'medico')) {
            router.push('/login');
        }
    }, [user, role, authLoading, router]);

    if (authLoading || loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Volver
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!jobOffer) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <p>No se encontró la oferta de trabajo</p>
                </div>
            </DashboardLayout>
        );
    }

    // Verificar el estado de la aplicación del usuario actual
    const currentApplication = applications.find(app => app.offerId === offerId);
    const applicationStatus = currentApplication?.status;

    return (
        <DashboardLayout>
            <div className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Volver a ofertas
                            </button>
                        </div>

                        {hasApplied && (
                            <div className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Ya has aplicado
                            </div>
                        )}
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b">
                            <h1 className="text-xl font-semibold text-gray-900">{jobOffer.title}</h1>
                            <p className="mt-1 text-sm text-gray-600">{jobOffer.companyName}</p>
                        </div>

                        <div className="px-4 py-5 sm:p-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{jobOffer.description}</dd>
                                </div>

                                {jobOffer.location && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{jobOffer.location}</dd>
                                    </div>
                                )}

                                {jobOffer.jobType && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Tipo de contrato</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {jobOffer.jobType === 'fullTime' ? 'Tiempo completo' :
                                                jobOffer.jobType === 'partTime' ? 'Tiempo parcial' :
                                                    jobOffer.jobType === 'contract' ? 'Contrato' :
                                                        jobOffer.jobType === 'temporary' ? 'Temporal' : jobOffer.jobType}
                                        </dd>
                                    </div>
                                )}

                                {jobOffer.requiredSpecialty && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Especialidad requerida</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{jobOffer.requiredSpecialty}</dd>
                                    </div>
                                )}

                                {jobOffer.salary && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Salario</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{jobOffer.salary}</dd>
                                    </div>
                                )}

                                {jobOffer.requirements && jobOffer.requirements.length > 0 && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Requisitos</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            <ul className="list-disc pl-5 space-y-1">
                                                {jobOffer.requirements.map((req, index) => (
                                                    <li key={index}>{req}</li>
                                                ))}
                                            </ul>
                                        </dd>
                                    </div>
                                )}

                                {jobOffer.benefits && jobOffer.benefits.length > 0 && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Beneficios</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            <ul className="list-disc pl-5 space-y-1">
                                                {jobOffer.benefits.map((benefit, index) => (
                                                    <li key={index}>{benefit}</li>
                                                ))}
                                            </ul>
                                        </dd>
                                    </div>
                                )}

                                <div className="sm:col-span-2 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Publicado {formatTime(jobOffer.createdAt)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {jobOffer.views || 0} visualizaciones
                                        </div>
                                    </div>
                                </div>
                            </dl>
                        </div>

                        <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
                            {hasApplied ? (
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Estado de tu aplicación:
                                        <span className={`ml-2 font-medium ${applicationStatus === 'pending' ? 'text-yellow-600' :
                                                applicationStatus === 'interviewing' ? 'text-blue-600' :
                                                    applicationStatus === 'accepted' ? 'text-green-600' :
                                                        'text-red-600'
                                            }`}>
                                            {applicationStatus === 'pending' ? 'Pendiente' :
                                                applicationStatus === 'interviewing' ? 'Entrevista' :
                                                    applicationStatus === 'accepted' ? 'Aceptada' :
                                                        'Rechazada'}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <div></div>
                            )}

                            <div>
                                {!hasApplied ? (
                                    <button
                                        onClick={() => setIsApplying(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Aplicar ahora
                                    </button>
                                ) : (
                                    <button
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        disabled
                                    >
                                        Ya has aplicado
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para aplicar */}
            {isApplying && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-lg font-medium mb-4">Aplicar a {jobOffer.title}</h3>

                        <form onSubmit={handleApply}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mensaje para el empleador (opcional)
                                </label>
                                <textarea
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="4"
                                    placeholder="Describe por qué eres un buen candidato para esta posición..."
                                    value={applicationMessage}
                                    onChange={(e) => setApplicationMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    onClick={() => setIsApplying(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${submitLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={submitLoading}
                                >
                                    {submitLoading ? 'Enviando...' : 'Enviar aplicación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
