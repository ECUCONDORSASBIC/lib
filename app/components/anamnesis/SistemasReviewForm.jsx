'use client';

import { useState } from 'react';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  tooltip = null,
  options = [],
  placeholder = '',
  rows = 3,
  error = null
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tooltip && (
          <div className="group relative flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 cursor-help" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <span className="absolute bottom-full mb-2 hidden group-hover:block w-64 bg-gray-800 text-white text-xs rounded p-2 shadow-lg z-10">
              {tooltip}
            </span>
          </div>
        )}
      </div>

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
          required={required}
        />
      ) : type === 'checkbox' ? (
        <div className="mt-1">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={value || false}
              onChange={onChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{placeholder}</span>
          </label>
        </div>
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
          required={required}
        >
          <option value="">Seleccionar...</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'radio' ? (
        <div className="mt-1 space-y-2">
          {options.map(option => (
            <label key={option.value} className="inline-flex items-center mr-4">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
          required={required}
        />
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Componente para el sistema de revisión de un sistema específico
const SystemReviewSection = ({ system, formData, updateData }) => {
  const handleSymptomToggle = (symptom) => {
    const systemData = { ...(formData[system.id] || {}) };
    const symptoms = systemData.symptoms || [];

    if (symptoms.includes(symptom)) {
      systemData.symptoms = symptoms.filter(s => s !== symptom);
    } else {
      systemData.symptoms = [...symptoms, symptom];
    }

    updateData({ [system.id]: systemData });
  };

  const handleDetailsChange = (e) => {
    const { value } = e.target;
    updateData({
      [system.id]: {
        ...formData[system.id],
        details: value
      }
    });
  };

  const symptoms = formData[system.id]?.symptoms || [];
  const details = formData[system.id]?.details || '';

  return (
    <div className="mb-6 p-4 border rounded-md bg-gray-50">
      <h4 className="mb-3 font-medium text-gray-800">
        {system.emoji && <span className="mr-2">{system.emoji}</span>}
        {system.title}
      </h4>

      <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {system.symptoms.map(symptom => (
          <label key={symptom} className="inline-flex items-start">
            <input
              type="checkbox"
              checked={symptoms.includes(symptom)}
              onChange={() => handleSymptomToggle(symptom)}
              className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{symptom}</span>
          </label>
        ))}
      </div>

      {symptoms.length > 0 && (
        <div className="mt-3">
          <label htmlFor={`details-${system.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Detalles sobre los síntomas seleccionados
          </label>
          <textarea
            id={`details-${system.id}`}
            value={details}
            onChange={handleDetailsChange}
            placeholder={`Describa más detalles sobre los síntomas ${system.title.toLowerCase()} marcados...`}
            rows={2}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      )}
    </div>
  );
};

const SistemasReviewForm = ({ formData = {}, updateData, errors = {} }) => {
  const systemsDefinition = [
    {
      id: 'general',
      title: 'Sistema General',
      emoji: '🧍',
      symptoms: ['Fiebre', 'Cansancio', 'Pérdida de peso', 'Sudoración nocturna', 'Malestar general']
    },
    {
      id: 'cardiovascular',
      title: 'Sistema Cardiovascular',
      emoji: '❤️',
      symptoms: ['Dolor en el pecho', 'Palpitaciones', 'Dificultad para respirar', 'Hinchazón en piernas', 'Desmayos']
    },
    {
      id: 'respiratorio',
      title: 'Sistema Respiratorio',
      emoji: '🫁',
      symptoms: ['Tos', 'Falta de aire', 'Sibilancias', 'Dolor al respirar', 'Expectoración']
    },
    {
      id: 'gastrointestinal',
      title: 'Sistema Gastrointestinal',
      emoji: '🧶',
      symptoms: ['Dolor abdominal', 'Náuseas', 'Vómitos', 'Diarrea', 'Estreñimiento', 'Pérdida de apetito', 'Cambios en hábitos intestinales', 'Sangre en heces']
    },
    {
      id: 'genitourinario',
      title: 'Sistema Genitourinario',
      emoji: '🚽',
      symptoms: ['Dolor al orinar', 'Cambios en la orina', 'Urgencia urinaria', 'Sangre en orina', 'Problemas de control urinario']
    },
    {
      id: 'musculoesqueletico',
      title: 'Sistema Musculoesquelético',
      emoji: '🦴',
      symptoms: ['Dolor articular', 'Rigidez', 'Limitación de movimiento', 'Debilidad muscular', 'Inflamación']
    },
    {
      id: 'neurologico',
      title: 'Sistema Neurológico',
      emoji: '🧠',
      symptoms: ['Dolor de cabeza', 'Mareos', 'Desmayos', 'Debilidad', 'Hormigueo', 'Convulsiones', 'Problemas de memoria', 'Dificultad para hablar']
    },
    {
      id: 'piel',
      title: 'Piel y Anexos',
      emoji: '🧬',
      symptoms: ['Erupciones', 'Picazón', 'Cambios de color', 'Bultos o protuberancias', 'Cambios en lunares', 'Heridas que no sanan']
    },
    {
      id: 'ojos',
      title: 'Ojos y Visión',
      emoji: '👁️',
      symptoms: ['Dolor ocular', 'Visión borrosa', 'Sensibilidad a la luz', 'Cambios en la visión', 'Secreción ocular', 'Ojos rojos']
    },
    {
      id: 'oido_nariz_garganta',
      title: 'Oído, Nariz y Garganta',
      emoji: '👂',
      symptoms: ['Dolor de oído', 'Pérdida de audición', 'Zumbido en oídos', 'Congestión nasal', 'Secreción nasal', 'Dolor de garganta', 'Problemas para tragar']
    },
    {
      id: 'endocrino',
      title: 'Sistema Endocrino',
      emoji: '⚖️',
      symptoms: ['Intolerancia al frío/calor', 'Cambios de peso sin explicación', 'Sed excesiva', 'Micción frecuente', 'Cambios de humor']
    },
    {
      id: 'psiquiatrico',
      title: 'Salud Mental',
      emoji: '🧘',
      symptoms: ['Ansiedad', 'Depresión', 'Problemas de sueño', 'Cambios de humor', 'Pérdida de interés', 'Dificultad de concentración']
    }
  ];

  const [expandedSystems, setExpandedSystems] = useState({});

  const handleSystemToggle = (systemId) => {
    setExpandedSystems(prev => ({
      ...prev,
      [systemId]: !prev[systemId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <h3 className="text-md font-medium text-blue-800 mb-1">Revisión por Sistemas</h3>
        <p className="text-sm text-blue-600">
          Por favor, marque cualquier síntoma que haya experimentado en los últimos meses. Esta información ayudará a su médico a entender mejor su estado de salud general.
        </p>
      </div>

      <div className="mb-4">
        <FormField
          label="¿Tiene algún síntoma que no haya mencionado en las secciones anteriores del formulario?"
          name="tiene_sintomas_adicionales"
          type="radio"
          options={[
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' }
          ]}
          value={formData.tiene_sintomas_adicionales || ''}
          onChange={(e) => updateData({ tiene_sintomas_adicionales: e.target.value })}
        />
      </div>

      {formData.tiene_sintomas_adicionales === 'si' && (
        <div className="space-y-6">
          {systemsDefinition.map(system => (
            <SystemReviewSection
              key={system.id}
              system={system}
              formData={formData}
              updateData={updateData}
            />
          ))}
        </div>
      )}

      <FormField
        label="¿Hay algún otro síntoma que no esté listado anteriormente?"
        name="otros_sintomas"
        type="textarea"
        value={formData.otros_sintomas || ''}
        onChange={(e) => updateData({ otros_sintomas: e.target.value })}
        placeholder="Describa cualquier otro síntoma que considere importante mencionar..."
        rows={3}
      />
    </div>
  );
};

export default SistemasReviewForm;
