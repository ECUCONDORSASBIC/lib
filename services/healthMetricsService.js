'use client';

// services/healthMetricsService.js

/**
 * Adds a blood pressure reading to a patient's record
 * @param {string} patientId - The ID of the patient
 * @param {Object} readingData - The blood pressure reading data
 * @returns {Promise<Object>} - A promise that resolves to the created reading
 */
export const addBloodPressureReading = async (patientId, readingData) => {
  // This is a placeholder implementation - replace with actual API calls
  console.log('Adding blood pressure reading for patient:', patientId, readingData);

  // Simulating an API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 'bp-' + Date.now(), ...readingData });
    }, 500);
  });
};

/**
 * Adds a glucose reading to a patient's record
 * @param {string} patientId - The ID of the patient
 * @param {Object} readingData - The glucose reading data
 * @returns {Promise<Object>} - A promise that resolves to the created reading
 */
export const addGlucoseReading = async (patientId, readingData) => {
  // This is a placeholder implementation - replace with actual API calls
  console.log('Adding glucose reading for patient:', patientId, readingData);

  // Simulating an API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 'glucose-' + Date.now(), ...readingData });
    }, 500);
  });
};

/**
 * Adds a lipid profile to a patient's record
 * @param {string} patientId - The ID of the patient
 * @param {Object} profileData - The lipid profile data
 * @returns {Promise<Object>} - A promise that resolves to the created profile
 */
export const addLipidProfile = async (patientId, profileData) => {
  // This is a placeholder implementation - replace with actual API calls
  console.log('Adding lipid profile for patient:', patientId, profileData);

  // Simulating an API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 'lipid-' + Date.now(), ...profileData });
    }, 500);
  });
};

/**
 * Obtiene las métricas de salud recientes para un paciente
 * @param {string} patientId - ID del paciente
 * @param {number} limit - Número máximo de registros a devolver
 * @returns {Promise<Object>} - Datos con métricas de salud recientes (BP, glucosa, etc)
 */
export const getRecentHealthMetrics = async (patientId, limit = 10) => {
  // Esta es una implementación de ejemplo - reemplazar con llamadas reales a la API
  console.log('Obteniendo métricas recientes para el paciente:', patientId, 'límite:', limit);

  // Simulamos una solicitud a la API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        bloodPressure: [
          { id: 'bp-1', systolic: 120, diastolic: 80, date: new Date().toISOString() },
          { id: 'bp-2', systolic: 118, diastolic: 78, date: new Date(Date.now() - 86400000).toISOString() }
        ],
        glucose: [
          { id: 'gl-1', level: 95, date: new Date().toISOString() },
          { id: 'gl-2', level: 98, date: new Date(Date.now() - 86400000).toISOString() }
        ],
        weight: [
          { id: 'wt-1', value: 70.5, date: new Date().toISOString() },
          { id: 'wt-2', value: 70.2, date: new Date(Date.now() - 86400000 * 7).toISOString() }
        ],
        heartRate: [
          { id: 'hr-1', value: 68, date: new Date().toISOString() },
          { id: 'hr-2', value: 72, date: new Date(Date.now() - 86400000).toISOString() }
        ]
      });
    }, 500);
  });
};
