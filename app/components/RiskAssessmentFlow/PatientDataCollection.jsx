import React, { useState, useEffect } from 'react';

const PatientDataCollection = ({ initialData, onComplete }) => {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

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

    // Limpiar error al modificar un campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleAddMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '' }]
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="mb-6 text-xl font-semibold text-gray-800">Datos del Paciente</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="mb-4 font-medium text-gray-700 text-md">Información Personal</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Nombre del paciente"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="age" className="block mb-1 text-sm font-medium text-gray-700">
                Edad
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Edad"
              />
              {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age}</p>}
            </div>

            <div>
              <label htmlFor="sex" className="block mb-1 text-sm font-medium text-gray-700">
                Sexo
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccionar</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="smoking"
                checked={formData.smoking}
                onChange={handleChange}
                className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Fumador</span>
            </label>
          </div>
        </div>

        {/* Medidas físicas */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="mb-4 font-medium text-gray-700 text-md">Medidas Físicas</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label htmlFor="weight" className="block mb-1 text-sm font-medium text-gray-700">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Peso en kg"
              />
            </div>

            <div>
              <label htmlFor="height" className="block mb-1 text-sm font-medium text-gray-700">
                Altura (cm)
              </label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Altura en cm"
              />
            </div>

            <div>
              <label htmlFor="bmi" className="block mb-1 text-sm font-medium text-gray-700">
                IMC
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="bmi"
                  name="bmi"
                  value={formData.bmi}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                  placeholder="Calculado automáticamente"
                />
                {calculatingBMI && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Métricas médicas */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="mb-4 font-medium text-gray-700 text-md">Métricas de Salud</h3>

          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Presión Arterial</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bp-systolic" className="block mb-1 text-sm text-gray-600">
                  Sistólica (mmHg)
                </label>
                <input
                  type="number"
                  id="bp-systolic"
                  name="bloodPressure.systolic"
                  value={formData.bloodPressure.systolic}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors['bloodPressure.systolic'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="120"
                />
                {errors['bloodPressure.systolic'] && (
                  <p className="mt-1 text-xs text-red-500">{errors['bloodPressure.systolic']}</p>
                )}
              </div>

              <div>
                <label htmlFor="bp-diastolic" className="block mb-1 text-sm text-gray-600">
                  Diastólica (mmHg)
                </label>
                <input
                  type="number"
                  id="bp-diastolic"
                  name="bloodPressure.diastolic"
                  value={formData.bloodPressure.diastolic}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors['bloodPressure.diastolic'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="80"
                />
                {errors['bloodPressure.diastolic'] && (
                  <p className="mt-1 text-xs text-red-500">{errors['bloodPressure.diastolic']}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Colesterol</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="chol-total" className="block mb-1 text-sm text-gray-600">
                  Total (mg/dL)
                </label>
                <input
                  type="number"
                  id="chol-total"
                  name="cholesterol.total"
                  value={formData.cholesterol.total}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors['cholesterol.total'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="200"
                />
                {errors['cholesterol.total'] && (
                  <p className="mt-1 text-xs text-red-500">{errors['cholesterol.total']}</p>
                )}
              </div>

              <div>
                <label htmlFor="chol-hdl" className="block mb-1 text-sm text-gray-600">
                  HDL (mg/dL)
                </label>
                <input
                  type="number"
                  id="chol-hdl"
                  name="cholesterol.hdl"
                  value={formData.cholesterol.hdl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="50"
                />
              </div>

              <div>
                <label htmlFor="chol-ldl" className="block mb-1 text-sm text-gray-600">
                  LDL (mg/dL)
                </label>
                <input
                  type="number"
                  id="chol-ldl"
                  name="cholesterol.ldl"
                  value={formData.cholesterol.ldl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="130"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="glucose" className="block mb-1 text-sm font-medium text-gray-700">
              Glucosa en Ayunas (mg/dL)
            </label>
            <input
              type="number"
              id="glucose"
              name="glucose"
              value={formData.glucose}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.glucose ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="90"
            />
            {errors.glucose && <p className="mt-1 text-xs text-red-500">{errors.glucose}</p>}
          </div>
        </div>

        {/* Antecedentes familiares */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="mb-4 font-medium text-gray-700 text-md">Antecedentes Familiares</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="familyHistory.diabetes"
                checked={formData.familyHistory.diabetes}
                onChange={handleChange}
                className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Diabetes</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="familyHistory.heartDisease"
                checked={formData.familyHistory.heartDisease}
                onChange={handleChange}
                className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enfermedades del Corazón</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="familyHistory.hypertension"
                checked={formData.familyHistory.hypertension}
                onChange={handleChange}
                className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Hipertensión</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="familyHistory.stroke"
                checked={formData.familyHistory.stroke}
                onChange={handleChange}
                className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">ACV/Derrame Cerebral</span>
            </label>
          </div>
        </div>

        {/* Medicaciones actuales */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700 text-md">Medicaciones Actuales</h3>
            <button
              type="button"
              onClick={handleAddMedication}
              className="inline-flex items-center px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Añadir
            </button>
          </div>

          {formData.medications.length === 0 ? (
            <p className="text-sm text-gray-500">No hay medicaciones registradas</p>
          ) : (
            <div className="space-y-3">
              {formData.medications.map((med, index) => (
                <div key={index} className="flex items-start p-3 border border-gray-200 rounded-md">
                  <div className="grid flex-grow grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">Medicamento</label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Nombre"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">Dosis</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="ej. 10mg"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">Frecuencia</label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="ej. 2 veces al día"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
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

        {/* Última revisión */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="mb-4 font-medium text-gray-700 text-md">Información Adicional</h3>
          <div>
            <label htmlFor="lastCheckup" className="block mb-1 text-sm font-medium text-gray-700">
              Fecha del último chequeo médico
            </label>
            <input
              type="date"
              id="lastCheckup"
              name="lastCheckup"
              value={formData.lastCheckup}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientDataCollection;
