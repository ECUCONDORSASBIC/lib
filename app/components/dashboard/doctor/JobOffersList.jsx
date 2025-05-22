'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { jobOffersService } from '@/app/services/jobOffersService';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente para mostrar ofertas laborales en el dashboard del médico
 */
const JobOffersList = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [jobOffers, setJobOffers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [filters, setFilters] = useState({
        specialty: '',
        location: '',
        jobType: ''
    });
    const [activeTab, setActiveTab] = useState('offers'); // 'offers' or 'applications'

    // Cargar ofertas de trabajo y aplicaciones del médico
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                setLoading(true);

                // Cargar ofertas de trabajo
                const offers = await jobOffersService.getJobOffersForDoctor();
                setJobOffers(offers);

                // Cargar aplicaciones del médico
                const doctorApplications = await jobOffersService.getDoctorApplications(user.uid);
                setApplications(doctorApplications);
            } catch (error) {
                console.error('Error loading job offers:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Filtrar ofertas según criterios
    const filteredOffers = jobOffers.filter(offer => {
        if (filters.specialty && offer.requiredSpecialty !== filters.specialty) {
            return false;
        }
        if (filters.location && offer.location !== filters.location) {
            return false;
        }
        if (filters.jobType && offer.jobType !== filters.jobType) {
            return false;
        }
        return true;
    });

    // Manejar cambios en filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Formatear tiempo relativo
    const formatTime = (date) => {
        if (!date) return 'Fecha desconocida';
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    };

    // Estados para hacer seguimiento de la aplicación que se está enviando
    const [applyingToOfferId, setApplyingToOfferId] = useState(null);
    const [applicationMessage, setApplicationMessage] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Manejar envío de aplicación
    const handleApply = async (offerId) => {
        if (!user) {
            alert('Debe iniciar sesión para aplicar');
            return;
        }

        try {
            setSubmitLoading(true);
            setSubmitError(null);

            await jobOffersService.applyToJobOffer(offerId, user.uid, {
                message: applicationMessage
            });

            // Actualizar aplicaciones después de aplicar exitosamente
            const doctorApplications = await jobOffersService.getDoctorApplications(user.uid);
            setApplications(doctorApplications);

            // Cerrar modal de aplicación
            setApplyingToOfferId(null);
            setApplicationMessage('');

            alert('¡Aplicación enviada con éxito!');
        } catch (error) {
            console.error('Error applying to job:', error);
            setSubmitError(error.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Extraer especialidades, ubicaciones y tipos de trabajo únicos para los filtros
    const specialties = [...new Set(jobOffers.map(offer => offer.requiredSpecialty))].filter(Boolean);
    const locations = [...new Set(jobOffers.map(offer => offer.location))].filter(Boolean);
    const jobTypes = [...new Set(jobOffers.map(offer => offer.jobType))].filter(Boolean);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Oportunidades Laborales</h2>

                {/* Tabs para alternar entre ofertas y aplicaciones */}
                <div className="flex space-x-2">
                    <button
                        className={`px-4 py-2 text-sm rounded-md ${activeTab === 'offers'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        onClick={() => setActiveTab('offers')}
                    >
                        Ofertas Disponibles
                    </button>
                    <button
                        className={`px-4 py-2 text-sm rounded-md ${activeTab === 'applications'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        onClick={() => setActiveTab('applications')}
                    >
                        Mis Aplicaciones
                    </button>
                </div>
            </div>

            {activeTab === 'offers' && (
                <>
                    {/* Filtros */}
                    <div className="p-4 bg-gray-50 border-b grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                                Especialidad
                            </label>
                            <select
                                id="specialty"
                                name="specialty"
                                value={filters.specialty}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Todas las especialidades</option>
                                {specialties.map((specialty) => (
                                    <option key={specialty} value={specialty}>
                                        {specialty}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                Ubicación
                            </label>
                            <select
                                id="location"
                                name="location"
                                value={filters.location}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Todas las ubicaciones</option>
                                {locations.map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de trabajo
                            </label>
                            <select
                                id="jobType"
                                name="jobType"
                                value={filters.jobType}
                                onChange={handleFilterChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Todos los tipos</option>
                                {jobTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type === 'fullTime' ? 'Tiempo completo' :
                                            type === 'partTime' ? 'Tiempo parcial' :
                                                type === 'contract' ? 'Contrato' :
                                                    type === 'temporary' ? 'Temporal' : type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Lista de ofertas */}
                    <div className="p-4">
                        {filteredOffers.length > 0 ? (
                            <div className="space-y-6">
                                {filteredOffers.map((offer) => {
                                    // Verificar si el médico ya ha aplicado a esta oferta
                                    const hasApplied = applications.some(app => app.offerId === offer.id);

                                    return (
                                        <div
                                            key={offer.id}
                                            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="p-5">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-800">{offer.title}</h3>
                                                        <p className="text-gray-600">{offer.companyName}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {offer.jobType === 'fullTime' ? 'Tiempo completo' :
                                                                offer.jobType === 'partTime' ? 'Tiempo parcial' :
                                                                    offer.jobType === 'contract' ? 'Contrato' :
                                                                        offer.jobType === 'temporary' ? 'Temporal' : offer.jobType}
                                                        </span>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {formatTime(offer.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-2">
                                                    <p className="line-clamp-2 text-gray-600">{offer.description}</p>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {offer.requiredSpecialty && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {offer.requiredSpecialty}
                                                        </span>
                                                    )}

                                                    {offer.location && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            📍 {offer.location}
                                                        </span>
                                                    )}

                                                    {offer.salary && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            💰 {offer.salary}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-5 flex justify-between items-center">
                                                    <Link
                                                        href={`/dashboard/medico/ofertas/${offer.id}`}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Ver detalles
                                                    </Link>

                                                    {hasApplied ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">
                                                            Ya has aplicado
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setApplyingToOfferId(offer.id)}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                                                        >
                                                            Aplicar ahora
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No se encontraron ofertas que coincidan con los filtros</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'applications' && (
                <div className="p-4">
                    {applications.length > 0 ? (
                        <div className="divide-y">
                            {applications.map((application) => (
                                <div key={application.id} className="py-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">{application.offerTitle}</h3>
                                            <p className="text-gray-600">{application.companyName}</p>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    application.status === 'interviewing' ? 'bg-blue-100 text-blue-800' :
                                                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                {application.status === 'pending' ? 'Pendiente' :
                                                    application.status === 'interviewing' ? 'Entrevista' :
                                                        application.status === 'accepted' ? 'Aceptada' :
                                                            'Rechazada'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Aplicada {formatTime(application.appliedAt)}
                                    </p>
                                    <div className="mt-3">
                                        <Link
                                            href={`/dashboard/medico/ofertas/${application.offerId}`}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Ver detalles de la oferta
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No has aplicado a ninguna oferta aún</p>
                            <button
                                onClick={() => setActiveTab('offers')}
                                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                            >
                                Ver ofertas disponibles
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal para aplicar a una oferta */}
            {applyingToOfferId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-lg font-medium mb-4">Aplicar a la oferta</h3>

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

                        {submitError && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                                {submitError}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                    setApplyingToOfferId(null);
                                    setApplicationMessage('');
                                    setSubmitError(null);
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${submitLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                onClick={() => handleApply(applyingToOfferId)}
                                disabled={submitLoading}
                            >
                                {submitLoading ? 'Enviando...' : 'Enviar aplicación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobOffersList;
