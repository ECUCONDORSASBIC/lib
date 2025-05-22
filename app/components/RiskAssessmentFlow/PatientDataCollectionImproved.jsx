import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';

const PatientDataCollection = ({ initialData, onComplete }) => {
  // Estado para controlar las pestañas activas
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Estado para controlar autoguardado
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: '',
    smoking: false,
    bloodPressure: {
      systolic: '',
      diastolic: ''
    },
    cholesterol: {
      total: '',
      hdl: '',
      ldl: '',
    },
    glucose: '',
    bmi: '',
    weight: '',
    height: '',
    familyHistory: {
      diabetes: false,
      heartDisease: false,
      hypertension: false,
      stroke: false,
    },
    lastCheckup: '',
    medications: []
  });

  const [errors, setErrors] = useState({});
  const [calculatingBMI, setCalculatingBMI] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [touched, setTouched] = useState({});

  // Si hay datos iniciales, usarlos para llenar el formulario
  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        ...initialData
      }));
    }
  }, [initialData]);

  // Calcular IMC cuando cambia peso o altura
  useEffect(() => {
    if (formData.weight && formData.height) {
      setCalculatingBMI(true);

      // Pequeño retraso para simular cálculo
      const timer = setTimeout(() => {
        const weightKg = parseFloat(formData.weight);
        const heightM = parseFloat(formData.height) / 100; // convertir cm a m
        if (!isNaN(weightKg) && !isNaN(heightM) && heightM > 0) {
          const bmi = (weightKg / (heightM * heightM)).toFixed(1);
          setFormData(prev => ({
            ...prev,
            bmi
          }));
        }
        setCalculatingBMI(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData.weight, formData.height]);

  // Calcular el progreso del formulario
  useEffect(() => {
    const requiredFields = ['name', 'age', 'bloodPressure.systolic', 'bloodPressure.diastolic', 'cholesterol.total', 'glucose'];
    let filledCount = 0;

    requiredFields.forEach(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (formData[parent]?.[child]) filledCount++;
      } else {
        if (formData[field]) filledCount++;
      }
    });

    setFormProgress(Math.round((filledCount / requiredFields.length) * 100));

    // Autoguardado
    const timer = setTimeout(() => {
      if (Object.keys(touched).length > 0) {
        setIsSaving(true);
        // Simular guardado - en un caso real, aquí iría la llamada a la API
        setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());
          setTouched({});
        }, 1000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Marcar campo como tocado para autoguardado
    setTouched(prev => ({ ...prev, [name]: true }));

    if (name.includes('.')) {
      // Maneja campos anidados como 'bloodPressure.systolic'
      const [parent, child] = name.split('.');
      setFormData(prevData => ({
        ...prevData,
        [parent]: {
          ...prevData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', frequency: '' }
      ]
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...formData.medications];
    newMedications[index] = {
      ...newMedications[index],
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      medications: newMedications
    }));

    // Marcar como tocado para autoguardado
    setTouched(prev => ({ ...prev, [`medication_${index}_${field}`]: true }));
  };

  const handleRemoveMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.age) newErrors.age = 'La edad es requerida';
    else if (isNaN(formData.age) || formData.age < 0 || formData.age > 120)
      newErrors.age = 'Edad inválida';

    if (!formData.bloodPressure?.systolic)
      newErrors['bloodPressure.systolic'] = 'La presión sistólica es requerida';
    if (!formData.bloodPressure?.diastolic)
      newErrors['bloodPressure.diastolic'] = 'La presión diastólica es requerida';

    if (!formData.cholesterol?.total)
      newErrors['cholesterol.total'] = 'El colesterol total es requerido';

    if (!formData.glucose)
      newErrors.glucose = 'El nivel de glucosa es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onComplete(formData);
    } else {
      // Si hay errores, navegar a la primera pestaña con error
      if (errors.name || errors.age) {
        setActiveTabIndex(0);
      } else if (errors['bloodPressure.systolic'] || errors['bloodPressure.diastolic']) {
        setActiveTabIndex(2);
      } else if (errors['cholesterol.total'] || errors.glucose) {
        setActiveTabIndex(2);
      }
    }
  };

  const Tooltip = ({ text }) => (
    <div className="relative inline-block ml-1 group">
      <span className="text-sm text-blue-500 cursor-help">
        <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      <div className="absolute z-10 w-64 p-2 mb-2 text-xs text-white transition-opacity -translate-x-1/2 bg-gray-800 rounded opacity-0 bottom-full left-1/2 group-hover:opacity-100">
        {text}
      </div>
    </div>
  );

  const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    error,
    tooltip = '',
    options = [],
    min,
    max,
    step,
    required = false,
    readOnly = false
  }) => (
    <div className="w-full">
      <div className="flex items-center">
        <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tooltip && <Tooltip text={tooltip} />}
      </div>

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-blue-500`}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center mt-1">
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={value}
            onChange={onChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : undefined}
          />
          <span className="ml-2 text-sm text-gray-700">{placeholder}</span>
        </div>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          readOnly={readOnly}
          className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : readOnly ? 'bg-gray-100 border-gray-300' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-blue-500`}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );

  const formatTabName = (name, hasErrors) => (
    <div className="flex items-center">
      <span>{name}</span>
      {hasErrors && (
        <svg className="w-4 h-4 ml-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-md">
      {/* Cabecera con indicador de progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-800">Datos del Paciente</h2>
          <div className="text-sm text-gray-500">
            {isSaving ? 'Guardando...' : lastSaved ? `Guardado: ${lastSaved.toLocaleTimeString()}` : ''}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${formProgress}%` }}
          ></div>
        </div>
        <div className="mt-1 text-xs text-right text-gray-500">
          {formProgress}% completado
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tab.Group selectedIndex={activeTabIndex} onChange={setActiveTabIndex}>
          <Tab.List className="flex p-1 mb-6 space-x-1 bg-gray-100 rounded-lg">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors duration-200
                 ${selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-gray-700 hover:bg-white/[0.12] hover:text-blue-600'}`
              }
            >
              {formatTabName('Información Personal', errors.name || errors.age)}
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors duration-200
                 ${selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-gray-700 hover:bg-white/[0.12] hover:text-blue-600'}`
              }
            >
              {formatTabName('Medidas Físicas', false)}
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors duration-200
                 ${selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-gray-700 hover:bg-white/[0.12] hover:text-blue-600'}`
              }
            >
              {formatTabName('Métricas de Salud',
                errors['bloodPressure.systolic'] ||
                errors['bloodPressure.diastolic'] ||
                errors['cholesterol.total'] ||
                errors.glucose
              )}
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors duration-200
                 ${selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-gray-700 hover:bg-white/[0.12] hover:text-blue-600'}`
              }
            >
              {formatTabName('Antecedentes e Información', false)}
            </Tab>
          </Tab.List>

          <Tab.Panels>
            {/* Panel 1: Información Personal */}
            <Tab.Panel>
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <h3 className="pb-2 mb-4 text-lg font-medium text-gray-700 border-b">Información Personal</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <FormField
                    label="Nombre Completo"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nombre del paciente"
                    error={errors.name}
                    tooltip="Nombre completo del paciente como aparece en su identificación oficial"
                    required
                  />

                  <FormField
                    label="Edad"
                    name="age"
                    type="number"
                    min={0}
                    max={120}
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Edad en años"
                    error={errors.age}
                    tooltip="La edad es importante para calcular factores de riesgo específicos por edad"
                    required
                  />

                  <FormField
                    label="Sexo"
                    name="sex"
                    type="select"
                    value={formData.sex}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "Seleccionar" },
                      { value: "male", label: "Masculino" },
                      { value: "female", label: "Femenino" },
                      { value: "other", label: "Otro" }
                    ]}
                    tooltip="El sexo biológico es relevante para ciertos factores de riesgo cardiovascular"
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    type="checkbox"
                    name="smoking"
                    value={formData.smoking}
                    onChange={handleChange}
                    placeholder="Fumador"
                    tooltip="El tabaquismo es un factor de riesgo importante para enfermedades cardiovasculares"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setActiveTabIndex(1)}
                  className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Siguiente
                </button>
              </div>
            </Tab.Panel>

            {/* Panel 2: Medidas Físicas */}
            <Tab.Panel>
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <h3 className="pb-2 mb-4 text-lg font-medium text-gray-700 border-b">Medidas Físicas</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    label="Peso"
                    name="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Peso en kg"
                    tooltip="Ingrese el peso en kilogramos para calcular el IMC"
                  />

                  <FormField
                    label="Altura"
                    name="height"
                    type="number"
                    min="0"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Altura en cm"
                    tooltip="Ingrese la altura en centímetros para calcular el IMC"
                  />

                  <FormField
                    label="IMC"
                    name="bmi"
                    value={formData.bmi}
                    placeholder="Calculado automáticamente"
                    tooltip="El Índice de Masa Corporal se calcula automáticamente con el peso y altura"
                    readOnly
                  />
                  {calculatingBMI && (
                    <div className="flex justify-center col-span-3">
                      <svg className="w-5 h-5 mr-3 -ml-1 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm text-gray-500">Calculando IMC...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setActiveTabIndex(0)}
                  className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabIndex(2)}
                  className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Siguiente
                </button>
              </div>
            </Tab.Panel>

            {/* Panel 3: Métricas de Salud */}
            <Tab.Panel>
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <h3 className="pb-2 mb-4 text-lg font-medium text-gray-700 border-b">Métricas de Salud</h3>

                <div className="mb-6">
                  <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    Presión Arterial
                    <Tooltip text="La presión arterial es un indicador clave de la salud cardiovascular. Se mide en milímetros de mercurio (mmHg)." />
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      label="Sistólica (mmHg)"
                      name="bloodPressure.systolic"
                      type="number"
                      min="0"
                      value={formData.bloodPressure.systolic}
                      onChange={handleChange}
                      placeholder="120"
                      error={errors['bloodPressure.systolic']}
                      tooltip="La presión arterial cuando el corazón late/bombea sangre"
                      required
                    />

                    <FormField
                      label="Diastólica (mmHg)"
                      name="bloodPressure.diastolic"
                      type="number"
                      min="0"
                      value={formData.bloodPressure.diastolic}
                      onChange={handleChange}
                      placeholder="80"
                      error={errors['bloodPressure.diastolic']}
                      tooltip="La presión arterial cuando el corazón está en reposo entre latidos"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700">
                    Colesterol
                    <Tooltip text="Los niveles de colesterol ayudan a evaluar el riesgo cardiovascular." />
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      label="Total (mg/dL)"
                      name="cholesterol.total"
                      type="number"
                      min="0"
                      value={formData.cholesterol.total}
                      onChange={handleChange}
                      placeholder="200"
                      error={errors['cholesterol.total']}
                      tooltip="El colesterol total incluye todas las formas de colesterol en la sangre"
                      required
                    />

                    <FormField
                      label="HDL (mg/dL)"
                      name="cholesterol.hdl"
                      type="number"
                      min="0"
                      value={formData.cholesterol.hdl}
                      onChange={handleChange}
                      placeholder="50"
                      tooltip="El colesterol 'bueno' que ayuda a eliminar otras formas de colesterol"
                    />

                    <FormField
                      label="LDL (mg/dL)"
                      name="cholesterol.ldl"
                      type="number"
                      min="0"
                      value={formData.cholesterol.ldl}
                      onChange={handleChange}
                      placeholder="130"
                      tooltip="El colesterol 'malo' que puede acumularse en las paredes arteriales"
                    />
                  </div>
                </div>

                <FormField
                  label="Glucosa en Ayunas (mg/dL)"
                  name="glucose"
                  type="number"
                  min="0"
                  value={formData.glucose}
                  onChange={handleChange}
                  placeholder="90"
                  error={errors.glucose}
                  tooltip="La glucosa en ayunas es importante para evaluar el riesgo de diabetes"
                  required
                />
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setActiveTabIndex(1)}
                  className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabIndex(3)}
                  className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Siguiente
                </button>
              </div>
            </Tab.Panel>

            {/* Panel 4: Antecedentes e Información Adicional */}
            <Tab.Panel>
              <div className="space-y-6">
                {/* Antecedentes Familiares */}
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <h3 className="pb-2 mb-4 text-lg font-medium text-gray-700 border-b">
                    Antecedentes Familiares
                    <Tooltip text="Los antecedentes familiares pueden indicar predisposición genética a ciertas condiciones" />
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField
                      type="checkbox"
                      name="familyHistory.diabetes"
                      value={formData.familyHistory.diabetes}
                      onChange={handleChange}
                      placeholder="Diabetes"
                      tooltip="Historia familiar de diabetes tipo 1 o tipo 2 en familiares de primer grado"
                    />

                    <FormField
                      type="checkbox"
                      name="familyHistory.heartDisease"
                      value={formData.familyHistory.heartDisease}
                      onChange={handleChange}
                      placeholder="Enfermedades del Corazón"
                      tooltip="Historia familiar de cardiopatías coronarias o infartos"
                    />

                    <FormField
                      type="checkbox"
                      name="familyHistory.hypertension"
                      value={formData.familyHistory.hypertension}
                      onChange={handleChange}
                      placeholder="Hipertensión"
                      tooltip="Historia familiar de presión arterial alta"
                    />

                    <FormField
                      type="checkbox"
                      name="familyHistory.stroke"
                      value={formData.familyHistory.stroke}
                      onChange={handleChange}
                      placeholder="ACV/Derrame Cerebral"
                      tooltip="Historia familiar de accidentes cerebrovasculares o derrames cerebrales"
                    />
                  </div>
                </div>

                {/* Medicaciones */}
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-700">
                      Medicaciones Actuales
                      <Tooltip text="Las medicaciones actuales pueden ayudar a evaluación integral y evitar interacciones medicamentosas" />
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddMedication}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Añadir Medicamento
                    </button>
                  </div>

                  {formData.medications.length === 0 ? (
                    <div className="py-6 text-center border border-gray-300 border-dashed rounded-lg bg-gray-50">
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No hay medicaciones registradas</p>
                      <button
                        type="button"
                        onClick={handleAddMedication}
                        className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Añadir medicamento
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.medications.map((med, index) => (
                        <div key={index} className="flex items-start p-3 transition-colors border border-gray-200 rounded-md bg-gray-50 hover:bg-white">
                          <div className="grid flex-grow grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <label className="block mb-1 text-xs font-medium text-gray-600">Medicamento</label>
                              <input
                                type="text"
                                value={med.name}
                                onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nombre del medicamento"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-xs font-medium text-gray-600">Dosis</label>
                              <input
                                type="text"
                                value={med.dosage}
                                onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ej. 10mg"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-xs font-medium text-gray-600">Frecuencia</label>
                              <input
                                type="text"
                                value={med.frequency}
                                onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ej. 2 veces al día"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(index)}
                            className="p-1 ml-2 text-red-500 transition-colors rounded-md hover:text-red-700 hover:bg-red-50"
                            title="Eliminar medicamento"
                            aria-label="Eliminar medicamento"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Información Adicional */}
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <h3 className="pb-2 mb-4 text-lg font-medium text-gray-700 border-b">
                    Información Adicional
                  </h3>
                  <div>
                    <FormField
                      label="Fecha del último chequeo médico"
                      name="lastCheckup"
                      type="date"
                      value={formData.lastCheckup}
                      onChange={handleChange}
                      tooltip="La fecha del último chequeo médico completo"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setActiveTabIndex(2)}
                  className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Anterior
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Completar
                </button>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </form>
    </div>
  );
};

export default PatientDataCollection;
