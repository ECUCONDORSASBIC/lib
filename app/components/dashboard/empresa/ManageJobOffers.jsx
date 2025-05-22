import React, { useState } from 'react';

const ManageJobOffers = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSpecialty: '',
        location: '',
        salary: '',
        jobType: 'fullTime',
        requirements: [],
        benefits: []
    });
    const [tempRequirement, setTempRequirement] = useState('');
    const [tempBenefit, setTempBenefit] = useState('');
    const [jobOffers, setJobOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [showApplicants, setShowApplicants] = useState(false);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const addRequirement = () => {
        if (tempRequirement) {
            setFormData({
                ...formData,
                requirements: [...formData.requirements, tempRequirement]
            });
            setTempRequirement('');
        }
    };

    const removeRequirement = (index) => {
        const newRequirements = formData.requirements.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            requirements: newRequirements
        });
    };

    const addBenefit = () => {
        if (tempBenefit) {
            setFormData({
                ...formData,
                benefits: [...formData.benefits, tempBenefit]
            });
            setTempBenefit('');
        }
    };

    const removeBenefit = (index) => {
        const newBenefits = formData.benefits.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            benefits: newBenefits
        });
    };

    const handleCreateOffer = (e) => {
        e.preventDefault();
        // Logic to create job offer
        console.log('Creating job offer:', formData);
        setIsCreating(false);
    };

    const updateApplicationStatus = (doctorId, status) => {
        // Logic to update application status
        console.log(`Updating application status for ${doctorId} to ${status}`);
    };

    const formatTime = (timestamp) => {
        // Logic to format time
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Gestión de Ofertas Laborales</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                    Crear Nueva Oferta
                </button>
            </div>

            <div className="p-4">
                {jobOffers.length > 0 ? (
                    <div className="space-y-4">
                        {jobOffers.map((offer) => (
                            <div key={offer.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold">{offer.title}</h3>
                                            <p className="text-gray-600">{offer.jobType === 'fullTime' ? 'Tiempo completo' :
                                                offer.jobType === 'partTime' ? 'Tiempo parcial' :
                                                    offer.jobType === 'contract' ? 'Contrato' :
                                                        offer.jobType === 'temporary' ? 'Temporal' : offer.jobType}
                                            </p>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${offer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {offer.status === 'active' ? 'Activa' : 'Inactiva'}
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Creada {formatTime(offer.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-gray-600 line-clamp-2">{offer.description}</p>
                                    </div>

                                    {offer.applicants && offer.applicants.length > 0 && (
                                        <div className="mt-4 flex items-center">
                                            <span className="text-sm text-gray-600 mr-2">
                                                {offer.applicants.length} aplicante{offer.applicants.length !== 1 ? 's' : ''}
                                            </span>
                                            <div className="flex -space-x-2">
                                                {offer.applicants.slice(0, 3).map((applicant, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs ring-2 ring-white"
                                                    >
                                                        {applicant.doctorName.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                                {offer.applicants.length > 3 && (
                                                    <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs ring-2 ring-white">
                                                        +{offer.applicants.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-between items-center">
                                        <div className="text-sm">
                                            <span className="text-gray-600">{offer.views || 0} visualizaciones</span>
                                        </div>

                                        <div className="flex space-x-2">
                                            {offer.applicants && offer.applicants.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOffer(offer);
                                                        setShowApplicants(true);
                                                    }}
                                                    className="px-3 py-1 border border-blue-300 text-blue-700 bg-blue-50 rounded-md text-sm hover:bg-blue-100"
                                                >
                                                    Ver Aplicantes
                                                </button>
                                            )}

                                            <button
                                                className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
                                                onClick={() => {
                                                    // Editar oferta (no implementado)
                                                    alert("Función de edición no implementada en este ejemplo");
                                                }}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                className={`px-3 py-1 border rounded-md text-sm ${offer.status === 'active'
                                                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                                                    }`}
                                            >
                                                {offer.status === 'active' ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No has creado ninguna oferta de empleo</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                            Crear tu primera oferta
                        </button>
                    </div>
                )}
            </div>

            {/* Modal para crear oferta */}
            {isCreating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium mb-6">Crear Nueva Oferta</h3>

                        <form onSubmit={handleCreateOffer}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Ej. Médico Cardiólogo para Hospital Privado"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        rows="4"
                                        placeholder="Describe los detalles de la posición..."
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Especialidad requerida
                                    </label>
                                    <input
                                        type="text"
                                        name="requiredSpecialty"
                                        value={formData.requiredSpecialty}
                                        onChange={handleFormChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Ej. Cardiología"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ubicación
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleFormChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Ej. Quito, Ecuador"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Salario
                                    </label>
                                    <input
                                        type="text"
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleFormChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Ej. $3000 - $4000 mensual"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de contrato
                                    </label>
                                    <select
                                        name="jobType"
                                        value={formData.jobType}
                                        onChange={handleFormChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="fullTime">Tiempo completo</option>
                                        <option value="partTime">Tiempo parcial</option>
                                        <option value="contract">Contrato</option>
                                        <option value="temporary">Temporal</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Requisitos
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={tempRequirement}
                                            onChange={(e) => setTempRequirement(e.target.value)}
                                            className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Añadir requisito..."
                                        />
                                        <button
                                            type="button"
                                            onClick={addRequirement}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                                        >
                                            Añadir
                                        </button>
                                    </div>

                                    <div className="mt-2">
                                        {formData.requirements.map((req, index) => (
                                            <div key={index} className="inline-flex items-center bg-gray-100 rounded-full pl-3 pr-1 py-1 mr-2 mb-2">
                                                <span className="text-sm text-gray-800">{req}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRequirement(index)}
                                                    className="ml-1 p-1 rounded-full hover:bg-gray-300 text-gray-600"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Beneficios
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={tempBenefit}
                                            onChange={(e) => setTempBenefit(e.target.value)}
                                            className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Añadir beneficio..."
                                        />
                                        <button
                                            type="button"
                                            onClick={addBenefit}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                                        >
                                            Añadir
                                        </button>
                                    </div>

                                    <div className="mt-2">
                                        {formData.benefits.map((benefit, index) => (
                                            <div key={index} className="inline-flex items-center bg-green-50 rounded-full pl-3 pr-1 py-1 mr-2 mb-2">
                                                <span className="text-sm text-green-800">{benefit}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeBenefit(index)}
                                                    className="ml-1 p-1 rounded-full hover:bg-green-100 text-green-600"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Publicar Oferta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageJobOffers;