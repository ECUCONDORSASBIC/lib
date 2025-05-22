"use client";

import { BoltIcon, BriefcaseIcon, CurrencyDollarIcon, DocumentTextIcon, PencilIcon, PlusCircleIcon, TagIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const JobPostingForm = ({ initialData = {}, onSubmit, isEditing = false, isSubmitting = false }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    companyName: '', // Datos de la empresa
    employmentType: 'full-time',
    experienceLevel: 'mid-level',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'ARS',
    salaryPeriod: 'monthly',
    benefits: '',
    skillsRequired: '',
    isUrgent: false,
    status: 'draft',
    applicationDeadline: '',
    contactEmail: '',
  });
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);

  // Inicializar el formulario con datos existentes si los hay
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Marcar el formulario como manipulado
    if (!formTouched) {
      setFormTouched(true);
    }

    // Limpiar error de este campo si existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'La descripción debe tener al menos 50 caracteres';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es obligatoria';
    }

    if (formData.salaryMin && formData.salaryMax && 
        Number(formData.salaryMin) > Number(formData.salaryMax)) {
      newErrors.salaryMin = 'El salario mínimo no puede ser mayor que el máximo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormTouched(true);

    // Validar formulario
    if (!validateForm()) {
      // Hacer scroll al primer error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }

    try {
      // Preparar datos finales
      const finalData = {
        ...formData,
        status: formData.status === 'draft' ? 'draft' : 'published', // Asegurar estado correcto
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
      };
      
      await onSubmit(finalData);
    } catch (error) {
      console.error('Error submitting job posting:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Error al enviar el formulario. Por favor, inténtalo de nuevo.'
      }));
      
      // Hacer scroll al error de envío
      const submitError = document.getElementById('submit-error');
      if (submitError) {
        submitError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  const cancelForm = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
      router.back();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

        {/* Sección: Información General */}
        <div className="md:col-span-2 border-b border-gray-200 pb-6 mb-2">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <DocumentTextIcon className="w-7 h-7 mr-3 text-blue-600" />
            Información General de la Oferta
          </h2>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título de la Oferta</label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            required
            aria-invalid={errors.title ? 'true' : 'false'}
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ej: Médico/a de Guardia para Clínica"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada</label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            required
            aria-invalid={errors.description ? 'true' : 'false'}
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Describe las responsabilidades, requisitos, entorno de trabajo, etc."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <div className="mt-1 text-xs text-gray-500 flex justify-between">
            <span>Mínimo 50 caracteres</span>
            <span>{formData.description.length} caracteres</span>
          </div>
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa/Institución</label>
          <input
            type="text"
            name="companyName"
            id="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nombre de tu organización"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <input
            type="text"
            name="location"
            id="location"
            value={formData.location}
            onChange={handleChange}
            required
            aria-invalid={errors.location ? 'true' : 'false'}
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ej: Palermo, Buenos Aires"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Sección: Detalles del Contrato */}
        <div className="md:col-span-2 border-b border-gray-200 pb-6 mb-2 mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <BriefcaseIcon className="w-7 h-7 mr-3 text-green-600" />
            Detalles del Contrato
          </h2>
        </div>

        <div>
          <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
          <select
            name="employmentType"
            id="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="full-time">Tiempo Completo</option>
            <option value="part-time">Medio Tiempo</option>
            <option value="contract">Contrato</option>
            <option value="temporary">Temporal</option>
            <option value="internship">Pasantía</option>
            <option value="guardia">Guardia</option>
          </select>
        </div>

        <div>
          <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">Nivel de Experiencia</label>
          <select
            name="experienceLevel"
            id="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="entry-level">Inicial (Sin experiencia)</option>
            <option value="junior">Junior (1-2 años)</option>
            <option value="mid-level">Semi-Senior (3-5 años)</option>
            <option value="senior-level">Senior (5+ años)</option>
            <option value="lead">Líder de Equipo / Jefe</option>
            <option value="manager">Gerencial</option>
          </select>
        </div>

        {/* Sección: Salario y Beneficios */}
        <div className="md:col-span-2 border-b border-gray-200 pb-6 mb-2 mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <CurrencyDollarIcon className="w-7 h-7 mr-3 text-yellow-500" />
            Salario y Beneficios
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 items-end">
          <div>
            <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-1">Salario Mínimo</label>
            <input 
              type="number" 
              name="salaryMin" 
              id="salaryMin" 
              value={formData.salaryMin} 
              onChange={handleChange} 
              aria-invalid={errors.salaryMin ? 'true' : 'false'}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.salaryMin ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ej: 80000" 
            />
            {errors.salaryMin && (
              <p className="mt-1 text-sm text-red-600">{errors.salaryMin}</p>
            )}
          </div>
          <div>
            <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-1">Salario Máximo</label>
            <input type="number" name="salaryMax" id="salaryMax" value={formData.salaryMax} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: 120000" />
          </div>
          <div>
            <label htmlFor="salaryCurrency" className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select name="salaryCurrency" id="salaryCurrency" value={formData.salaryCurrency} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label htmlFor="salaryPeriod" className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select name="salaryPeriod" id="salaryPeriod" value={formData.salaryPeriod} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="hourly">Por Hora</option>
              <option value="daily">Por Día</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="per-guardia">Por Guardia</option>
              <option value="annually">Anual</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2 mt-4">
          <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1">Beneficios Adicionales</label>
          <textarea name="benefits" id="benefits" value={formData.benefits} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: Prepaga, Días de estudio, Capacitaciones, Bonos por desempeño..."></textarea>
        </div>

        {/* Sección: Requisitos y Gestión */}
        <div className="md:col-span-2 border-b border-gray-200 pb-6 mb-2 mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <TagIcon className="w-7 h-7 mr-3 text-purple-600" />
            Requisitos y Gestión de la Oferta
          </h2>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700 mb-1">Habilidades Requeridas</label>
          <input
            type="text"
            name="skillsRequired"
            id="skillsRequired"
            value={formData.skillsRequired}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: ACLS, PALS, Experiencia en Terapia Intensiva (separar con comas)"
          />
        </div>

        <div>
          <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite de Postulación</label>
          <input
            type="date"
            name="applicationDeadline"
            id="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto (para postulaciones)</label>
          <input
            type="email"
            name="contactEmail"
            id="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: rrhh@tuempresa.com"
          />
        </div>

        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            name="isUrgent"
            id="isUrgent"
            checked={formData.isUrgent}
            onChange={handleChange}
            className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="isUrgent" className="ml-2 block text-sm font-medium text-red-700">
            <BoltIcon className="w-5 h-5 inline mr-1" />
            Marcar como Urgente
          </label>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado de la Oferta</label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="draft">Borrador (No visible)</option>
            <option value="published">Publicada (Visible)</option>
            <option value="paused">Pausada (No visible temporalmente)</option>
            <option value="closed">Cerrada (No acepta más postulaciones)</option>
            <option value="filled">Cubierta</option>
          </select>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="md:col-span-2 flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Estatus:</span>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="draft">Guardar como Borrador</option>
            <option value="published">Publicar Inmediatamente</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button 
            type="button" 
            onClick={cancelForm}
            disabled={isSubmitting}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-all"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Actualizando...' : 'Publicando...'}
              </>
            ) : (
              <>
                {isEditing ? <PencilIcon className="w-5 h-5 mr-2" /> : <PlusCircleIcon className="w-5 h-5 mr-2" />}
                {isEditing ? 'Guardar Cambios' : 'Publicar Oferta'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {errors.submit && (
        <div id="submit-error" className="md:col-span-2 mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{errors.submit}</span>
          </div>
        </div>
      )}
    </form>
  );
};

export default JobPostingForm;
