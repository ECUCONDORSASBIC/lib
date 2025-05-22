// app/components/HealthMetricsForm.jsx
'use client';

import { useState } from 'react';
import { addBloodPressureReading, addGlucoseReading, addLipidProfile } from '../services/healthMetricsService';

const MetricTabs = {
  BLOOD_PRESSURE: 'blood-pressure',
  GLUCOSE: 'glucose',
  LIPID_PROFILE: 'lipid-profile'
};

const HealthMetricsForm = ({ patientId, onSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState(MetricTabs.BLOOD_PRESSURE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [bloodPressureData, setBloodPressureData] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    notes: ''
  });

  const [glucoseData, setGlucoseData] = useState({
    value: '',
    measuredState: 'fasting', // Default to fasting
    notes: ''
  });

  const [lipidProfileData, setLipidProfileData] = useState({
    total: '',
    hdl: '',
    ldl: '',
    triglycerides: '',
    notes: ''
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage('');
  };

  const handleBloodPressureChange = (e) => {
    const { name, value } = e.target;
    setBloodPressureData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGlucoseChange = (e) => {
    const { name, value } = e.target;
    setGlucoseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLipidProfileChange = (e) => {
    const { name, value } = e.target;
    setLipidProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBloodPressureSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate data
      const systolic = parseInt(bloodPressureData.systolic);
      const diastolic = parseInt(bloodPressureData.diastolic);

      if (isNaN(systolic) || systolic < 50 || systolic > 250) {
        throw new Error('La presión sistólica debe estar entre 50 y 250 mmHg');
      }

      if (isNaN(diastolic) || diastolic < 30 || diastolic > 150) {
        throw new Error('La presión diastólica debe estar entre 30 y 150 mmHg');
      }

      // Handle optional heart rate
      let heartRate = null;
      if (bloodPressureData.heartRate) {
        heartRate = parseInt(bloodPressureData.heartRate);
        if (isNaN(heartRate) || heartRate < 30 || heartRate > 220) {
          throw new Error('El ritmo cardíaco debe estar entre 30 y 220 lpm');
        }
      }

      // Prepare data object
      const readingData = {
        systolic,
        diastolic,
        ...(heartRate ? { heartRate } : {}),
        notes: bloodPressureData.notes,
        timestamp: new Date()
      };

      // Submit reading
      await addBloodPressureReading(patientId, readingData);

      // Show success and reset form
      setSuccessMessage('Lectura de presión arterial guardada correctamente');
      setBloodPressureData({
        systolic: '',
        diastolic: '',
        heartRate: '',
        notes: ''
      });

      if (onSuccess) onSuccess('bloodPressure');

    } catch (err) {
      console.error('Error saving blood pressure reading:', err);
      setError(err.message || 'Error al guardar la lectura de presión arterial');
    } finally {
      setLoading(false);
    }
  };

  const handleGlucoseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate data
      const glucose = parseInt(glucoseData.value);

      if (isNaN(glucose) || glucose < 20 || glucose > 600) {
        throw new Error('El nivel de glucosa debe estar entre 20 y 600 mg/dL');
      }

      // Prepare data object
      const readingData = {
        value: glucose,
        measuredState: glucoseData.measuredState,
        notes: glucoseData.notes,
        timestamp: new Date()
      };

      // Submit reading
      await addGlucoseReading(patientId, readingData);

      // Show success and reset form
      setSuccessMessage('Lectura de glucosa guardada correctamente');
      setGlucoseData({
        value: '',
        measuredState: 'fasting',
        notes: ''
      });

      if (onSuccess) onSuccess('glucose');

    } catch (err) {
      console.error('Error saving glucose reading:', err);
      setError(err.message || 'Error al guardar la lectura de glucosa');
    } finally {
      setLoading(false);
    }
  };

  const handleLipidProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate data
      const total = parseInt(lipidProfileData.total);
      const hdl = parseInt(lipidProfileData.hdl);
      const ldl = parseInt(lipidProfileData.ldl);

      if (isNaN(total) || total < 50 || total > 500) {
        throw new Error('El colesterol total debe estar entre 50 y 500 mg/dL');
      }

      if (isNaN(hdl) || hdl < 10 || hdl > 150) {
        throw new Error('El HDL debe estar entre 10 y 150 mg/dL');
      }

      if (isNaN(ldl) || ldl < 30 || ldl > 400) {
        throw new Error('El LDL debe estar entre 30 y 400 mg/dL');
      }

      // Handle optional triglycerides
      let triglycerides = null;
      if (lipidProfileData.triglycerides) {
        triglycerides = parseInt(lipidProfileData.triglycerides);
        if (isNaN(triglycerides) || triglycerides < 20 || triglycerides > 1000) {
          throw new Error('Los triglicéridos deben estar entre 20 y 1000 mg/dL');
        }
      }

      // Prepare data object
      const profileData = {
        total,
        hdl,
        ldl,
        ...(triglycerides ? { triglycerides } : {}),
        notes: lipidProfileData.notes,
        timestamp: new Date()
      };

      // Submit reading
      await addLipidProfile(patientId, profileData);

      // Show success and reset form
      setSuccessMessage('Perfil lipídico guardado correctamente');
      setLipidProfileData({
        total: '',
        hdl: '',
        ldl: '',
        triglycerides: '',
        notes: ''
      });

      if (onSuccess) onSuccess('lipidProfile');

    } catch (err) {
      console.error('Error saving lipid profile:', err);
      setError(err.message || 'Error al guardar el perfil lipídico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-5 mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Registrar Métrica de Salud</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b">
        <button
          className={`py-2 px-4 font-medium ${activeTab === MetricTabs.BLOOD_PRESSURE
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-blue-500'
            }`}
          onClick={() => handleTabChange(MetricTabs.BLOOD_PRESSURE)}
        >
          Presión Arterial
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === MetricTabs.GLUCOSE
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-blue-500'
            }`}
          onClick={() => handleTabChange(MetricTabs.GLUCOSE)}
        >
          Glucosa
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === MetricTabs.LIPID_PROFILE
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-blue-500'
            }`}
          onClick={() => handleTabChange(MetricTabs.LIPID_PROFILE)}
        >
          Perfil Lipídico
        </button>
      </div>

      {/* Error and success messages */}
      {error && (
        <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="px-4 py-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded">
          {successMessage}
        </div>
      )}

      {/* Blood Pressure Form */}
      {activeTab === MetricTabs.BLOOD_PRESSURE && (
        <form onSubmit={handleBloodPressureSubmit}>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Sistólica (mmHg)
              </label>
              <input
                type="number"
                name="systolic"
                value={bloodPressureData.systolic}
                onChange={handleBloodPressureChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="120"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Diastólica (mmHg)
              </label>
              <input
                type="number"
                name="diastolic"
                value={bloodPressureData.diastolic}
                onChange={handleBloodPressureChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="80"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Ritmo Cardíaco (lpm) <span className="text-gray-500">(opcional)</span>
            </label>
            <input
              type="number"
              name="heartRate"
              value={bloodPressureData.heartRate}
              onChange={handleBloodPressureChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="72"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Notas <span className="text-gray-500">(opcional)</span>
            </label>
            <textarea
              name="notes"
              value={bloodPressureData.notes}
              onChange={handleBloodPressureChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="Información adicional o contexto..."
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Presión Arterial'}
          </button>
        </form>
      )}

      {/* Glucose Form */}
      {activeTab === MetricTabs.GLUCOSE && (
        <form onSubmit={handleGlucoseSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Nivel de Glucosa (mg/dL)
            </label>
            <input
              type="number"
              name="value"
              value={glucoseData.value}
              onChange={handleGlucoseChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="90"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Estado de Medición
            </label>
            <select
              name="measuredState"
              value={glucoseData.measuredState}
              onChange={handleGlucoseChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fasting">En ayunas</option>
              <option value="postMeal">Después de comer</option>
              <option value="beforeMeal">Antes de comer</option>
              <option value="bedtime">Antes de dormir</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Notas <span className="text-gray-500">(opcional)</span>
            </label>
            <textarea
              name="notes"
              value={glucoseData.notes}
              onChange={handleGlucoseChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="Información adicional o contexto..."
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white transition duration-200 bg-green-600 rounded hover:bg-green-700 disabled:bg-green-400"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Nivel de Glucosa'}
          </button>
        </form>
      )}

      {/* Lipid Profile Form */}
      {activeTab === MetricTabs.LIPID_PROFILE && (
        <form onSubmit={handleLipidProfileSubmit}>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Colesterol Total (mg/dL)
              </label>
              <input
                type="number"
                name="total"
                value={lipidProfileData.total}
                onChange={handleLipidProfileChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="200"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                HDL (mg/dL)
              </label>
              <input
                type="number"
                name="hdl"
                value={lipidProfileData.hdl}
                onChange={handleLipidProfileChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                LDL (mg/dL)
              </label>
              <input
                type="number"
                name="ldl"
                value={lipidProfileData.ldl}
                onChange={handleLipidProfileChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="130"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Triglicéridos (mg/dL) <span className="text-gray-500">(opcional)</span>
              </label>
              <input
                type="number"
                name="triglycerides"
                value={lipidProfileData.triglycerides}
                onChange={handleLipidProfileChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="150"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Notas <span className="text-gray-500">(opcional)</span>
            </label>
            <textarea
              name="notes"
              value={lipidProfileData.notes}
              onChange={handleLipidProfileChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="Información adicional o contexto..."
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white transition duration-200 bg-purple-600 rounded hover:bg-purple-700 disabled:bg-purple-400"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Perfil Lipídico'}
          </button>
        </form>
      )}
    </div>
  );
};

export default HealthMetricsForm;
