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
  error = null,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
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
      ) : type === 'range' ? (
        <div className="mt-2">
          <input
            type="range"
            id={name}
            name={name}
            min="0"
            max="10"
            step="1"
            value={value || 0}
            onChange={onChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 px-1">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
            <span>9</span>
            <span>10</span>
          </div>
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

// Componente para un síntoma individual
const SintomaItem = ({ sintoma, index, onUpdate, onRemove }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate(index, { ...sintoma, [name]: value });
  };

  const handleIntensidadChange = (e) => {
    const value = parseInt(e.target.value, 10);
    onUpdate(index, { ...sintoma, intensidad: value });
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium">Síntoma #{index + 1}</h4>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nombre del síntoma"
          name="nombre"
          value={sintoma.nombre}
          onChange={handleChange}
          placeholder="Ej: Dolor de cabeza, Tos, Fiebre..."
          required
        />

        <FormField
          label="Localización (en caso de dolores o molestias)"
          name="localizacion"
          value={sintoma.localizacion}
          onChange={handleChange}
          placeholder="Ej: Cabeza, lado izquierdo, abdomen, parte baja de la espalda..."
        />
      </div>

      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Intensidad (0 = ausente, 10 = máxima)
        </label>
        <input
          type="range"
          name="intensidad"
          min="0"
          max="10"
          step="1"
          value={sintoma.intensidad || 0}
          onChange={handleIntensidadChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 px-1">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
          <span>10</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Ausente</span>
          <span>Moderada</span>
          <span>Máxima</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField
          label="Frecuencia"
          name="frecuencia"
          type="select"
          value={sintoma.frecuencia || ''}
          onChange={handleChange}
          options={[
            { value: 'constante', label: 'Constante (todo el tiempo)' },
            { value: 'intermitente', label: 'Intermitente (viene y va)' },
            { value: 'periodico', label: 'Periódico (horarios específicos)' },
            { value: 'ocasional', label: 'Ocasional (rara vez)' }
          ]}
        />

        <FormField
          label="Duración"
          name="duracion"
          value={sintoma.duracion}
          onChange={handleChange}
          placeholder="Ej: 3 días, 2 semanas, desde hace un mes..."
        />
      </div>

      <div className="mt-4">
        <FormField
          label="¿Qué empeora este síntoma?"
          name="factores_agravantes"
          value={sintoma.factores_agravantes}
          onChange={handleChange}
          placeholder="Ej: Actividad física, ciertos alimentos, estrés..."
        />

        <FormField
          label="¿Qué alivia este síntoma?"
          name="factores_aliviantes"
          value={sintoma.factores_aliviantes}
          onChange={handleChange}
          placeholder="Ej: Descanso, medicamentos, frío/calor..."
        />
      </div>
    </div>
  );
};

const HistoriaEnfermedadActualForm = ({ formData = {}, updateData, errors = {} }) => {
  // Estado local para manejar los síntomas
  const [sintomas, setSintomas] = useState(formData.sintomas || [{
    nombre: '',
    localizacion: '',
    intensidad: 5,
    frecuencia: '',
    duracion: '',
    factores_agravantes: '',
    factores_aliviantes: ''
  }]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  const handleSintomaUpdate = (index, updatedSintoma) => {
    const newSintomas = [...sintomas];
    newSintomas[index] = updatedSintoma;
    setSintomas(newSintomas);
    updateData({ sintomas: newSintomas });
  };

  const handleAddSintoma = () => {
    const newSintoma = {
      nombre: '',
      localizacion: '',
      intensidad: 5,
      frecuencia: '',
      duracion: '',
      factores_agravantes: '',
      factores_aliviantes: ''
    };
    const newSintomas = [...sintomas, newSintoma];
    setSintomas(newSintomas);
    updateData({ sintomas: newSintomas });
  };

  const handleRemoveSintoma = (index) => {
    const newSintomas = [...sintomas];
    newSintomas.splice(index, 1);

    // Si no quedan síntomas, añadimos uno vacío para que siempre haya al menos uno
    if (newSintomas.length === 0) {
      newSintomas.push({
        nombre: '',
        localizacion: '',
        intensidad: 5,
        frecuencia: '',
        duracion: '',
        factores_agravantes: '',
        factores_aliviantes: ''
      });
    }

    setSintomas(newSintomas);
    updateData({ sintomas: newSintomas });
  };

  // Opciones para impacto funcional
  const impactoOptions = [
    { value: '0', label: '0 - Sin impacto' },
    { value: '1', label: '1 - Mínimo' },
    { value: '2', label: '2 - Leve' },
    { value: '3', label: '3 - Moderado' },
    { value: '4', label: '4 - Significativo' },
    { value: '5', label: '5 - Severo' }
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <h3 className="text-md font-medium text-blue-800 mb-1">Historia de la Enfermedad Actual</h3>
        <p className="text-sm text-blue-600">
          Describa el problema de salud que le trae a consulta, indicando cuándo y cómo comenzó,
          los síntomas principales y su evolución hasta ahora.
        </p>
      </div>

      <FormField
        label="¿Cuándo comenzó este problema?"
        name="inicio"
        type="date"
        value={formData.inicio || ''}
        onChange={handleChange}
        required
        tooltip="Indique la fecha aproximada de cuando empezó a notar el primer síntoma"
        error={errors.inicio}
      />

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-4">Síntomas Principales</h4>

        {sintomas.map((sintoma, index) => (
          <SintomaItem
            key={index}
            sintoma={sintoma}
            index={index}
            onUpdate={handleSintomaUpdate}
            onRemove={sintomas.length > 1 ? handleRemoveSintoma : null}
          />
        ))}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleAddSintoma}
            className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Añadir otro síntoma
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-4">Impacto en su Vida Diaria</h4>
        <p className="text-sm text-gray-500 mb-4">
          Indique cómo este problema de salud afecta sus actividades diarias (0 = no afecta, 5 = afecta severamente)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="En general"
            name="impacto_general"
            type="select"
            value={formData.impacto_general || ''}
            onChange={handleChange}
            options={impactoOptions}
          />

          <FormField
            label="Actividades básicas (vestirse, bañarse, etc.)"
            name="impacto_actividades_basicas"
            type="select"
            value={formData.impacto_actividades_basicas || ''}
            onChange={handleChange}
            options={impactoOptions}
          />

          <FormField
            label="Trabajo/Estudios"
            name="impacto_trabajo"
            type="select"
            value={formData.impacto_trabajo || ''}
            onChange={handleChange}
            options={impactoOptions}
          />

          <FormField
            label="Sueño"
            name="impacto_sueno"
            type="select"
            value={formData.impacto_sueno || ''}
            onChange={handleChange}
            options={impactoOptions}
          />

          <FormField
            label="Vida social/Ocio"
            name="impacto_social"
            type="select"
            value={formData.impacto_social || ''}
            onChange={handleChange}
            options={impactoOptions}
          />

          <FormField
            label="Estado emocional"
            name="impacto_emocional"
            type="select"
            value={formData.impacto_emocional || ''}
            onChange={handleChange}
            options={impactoOptions}
          />
        </div>
      </div>

      <FormField
        label="¿Ha intentado algún tratamiento o remedio hasta ahora? ¿Cuál ha sido el resultado?"
        name="tratamientos_previos"
        type="textarea"
        value={formData.tratamientos_previos || ''}
        onChange={handleChange}
        placeholder="Describa los medicamentos, remedios caseros o cualquier otra medida que haya tomado y si le ayudaron o no..."
        rows={3}
      />

      <FormField
        label="Narrativa cronológica"
        name="narrativa"
        type="textarea"
        value={formData.narrativa || ''}
        onChange={handleChange}
        required
        tooltip="Describa en sus propias palabras cómo ha evolucionado el problema desde que comenzó hasta ahora."
        placeholder="Cuente con sus propias palabras la historia de este problema de salud: cómo comenzó, cómo ha evolucionado y su estado actual..."
        rows={5}
        error={errors.narrativa}
      />
    </div>
  );
};

export default HistoriaEnfermedadActualForm;
