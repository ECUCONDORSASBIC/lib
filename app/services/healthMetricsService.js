'use client';
import { db, serverTimestamp } from '@/lib/firebase/firebaseConfig';
import { collection, addDoc, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * Servicio para gestionar métricas de salud de pacientes
 */
class HealthMetricsService {
  /**
   * Obtiene las métricas de salud recientes para un paciente
   * @param {string} patientId - ID del paciente
   * @param {number} limit - Número máximo de registros a devolver
   * @returns {Promise<Object>} - Datos con métricas de salud recientes (BP, glucosa, etc)
   */
  async getRecentMetrics(patientId, limitCount = 10) {
    try {
      const metricsRef = collection(db, `patients/${patientId}/healthMetrics`);
      const metricsQuery = query(
        metricsRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(metricsQuery);
      const metrics = [];

      snapshot.forEach((doc) => {
        metrics.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
        });
      });

      return this.organizeMetricsByType(metrics);
    } catch (error) {
      console.error('Error fetching recent health metrics:', error);
      throw new Error('Failed to fetch health metrics');
    }
  }

  /**
   * Obtiene las métricas de salud para un período específico
   * @param {string} patientId - ID del paciente
   * @param {string} startDate - Fecha inicial (ISO string)
   * @param {string} endDate - Fecha final (ISO string)
   * @returns {Promise<Object>} - Datos de métricas de salud en el período
   */
  async getMetricsByDateRange(patientId, startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const metricsRef = collection(db, `patients/${patientId}/healthMetrics`);
      const metricsQuery = query(
        metricsRef,
        where('timestamp', '>=', start),
        where('timestamp', '<=', end),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(metricsQuery);
      const metrics = [];

      snapshot.forEach((doc) => {
        metrics.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
        });
      });

      return this.organizeMetricsByType(metrics);
    } catch (error) {
      console.error('Error fetching health metrics by date range:', error);
      throw new Error('Failed to fetch health metrics for date range');
    }
  }

  /**
   * Obtiene métricas de salud por tipo específico
   * @param {string} patientId - ID del paciente
   * @param {string} metricType - Tipo de métrica (BP, glucose, etc)
   * @param {number} limitCount - Número máximo de registros
   * @returns {Promise<Array>} - Datos de métricas del tipo especificado
   */
  async getMetricsByType(patientId, metricType, limitCount = 50) {
    try {
      const metricsRef = collection(db, `patients/${patientId}/healthMetrics`);
      const metricsQuery = query(
        metricsRef,
        where('type', '==', metricType),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(metricsQuery);
      const metrics = [];

      snapshot.forEach((doc) => {
        metrics.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
        });
      });

      return metrics.reverse(); // Orden cronológico para gráficos
    } catch (error) {
      console.error(`Error fetching ${metricType} metrics:`, error);
      throw new Error(`Failed to fetch ${metricType} metrics`);
    }
  }

  /**
   * Registra una nueva métrica de salud
   * @param {string} patientId - ID del paciente
   * @param {Object} metricData - Datos de la métrica
   * @returns {Promise<string>} - ID del registro creado
   */
  async recordHealthMetric(patientId, metricData) {
    try {
      // Validar los datos según el tipo
      this.validateMetricData(metricData);

      const metricsRef = collection(db, `patients/${patientId}/healthMetrics`);

      const dataToStore = {
        ...metricData,
        timestamp: metricData.timestamp || serverTimestamp(),
        recordedAt: serverTimestamp(),
        source: metricData.source || 'manual-entry'
      };

      const docRef = await addDoc(metricsRef, dataToStore);

      // Actualizar también los datos más recientes del paciente
      await this.updatePatientLatestMetrics(patientId, metricData);

      return docRef.id;
    } catch (error) {
      console.error('Error recording health metric:', error);
      throw error;
    }
  }

  /**
   * Actualiza métricas más recientes en el documento del paciente
   * @param {string} patientId - ID del paciente
   * @param {Object} metricData - Datos de la métrica
   * @private
   */
  async updatePatientLatestMetrics(patientId, metricData) {
    try {
      const patientRef = doc(db, 'patients', patientId);
      const patientDoc = await getDoc(patientRef);

      if (!patientDoc.exists()) {
        console.warn(`Patient document ${patientId} not found for updating metrics`);
        return;
      }

      const latestMetrics = patientDoc.data().latestMetrics || {};

      // Actualizar solo los campos de esta métrica
      const updatedMetrics = {
        ...latestMetrics,
        [metricData.type]: {
          value: metricData.value || metricData.values,
          timestamp: metricData.timestamp || new Date().toISOString(),
          unit: metricData.unit
        },
        lastUpdated: new Date().toISOString()
      };

      await updateDoc(patientRef, { latestMetrics: updatedMetrics });
    } catch (error) {
      console.error('Error updating patient latest metrics:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Valida los datos de la métrica según su tipo
   * @param {Object} metricData - Datos de la métrica a validar
   * @throws {Error} Si los datos son inválidos
   * @private
   */
  validateMetricData(metricData) {
    if (!metricData.type) {
      throw new Error('Metric type is required');
    }

    switch (metricData.type) {
      case 'bloodPressure':
        if (!metricData.values?.systolic || !metricData.values?.diastolic) {
          throw new Error('Blood pressure requires systolic and diastolic values');
        }
        break;

      case 'glucose':
      case 'weight':
      case 'height':
      case 'temperature':
      case 'oxygenSaturation':
      case 'heartRate':
        if (metricData.value === undefined || metricData.value === null) {
          throw new Error(`${metricData.type} requires a value`);
        }
        break;

      case 'cholesterol':
        if (!metricData.values?.total) {
          throw new Error('Cholesterol requires at least a total value');
        }
        break;

      default:
        // Para tipos genéricos, asegurarse de que al menos hay un valor
        if (
          (metricData.value === undefined || metricData.value === null) &&
          (!metricData.values || Object.keys(metricData.values).length === 0)
        ) {
          throw new Error('Metric requires either value or values field');
        }
    }

    // Validar que tiene unidad si es requerido
    const typesRequiringUnits = [
      'bloodPressure', 'glucose', 'weight', 'height',
      'temperature', 'cholesterol'
    ];

    if (typesRequiringUnits.includes(metricData.type) && !metricData.unit) {
      throw new Error(`${metricData.type} requires a unit`);
    }
  }

  /**
   * Organiza las métricas por tipo para fácil acceso
   * @param {Array} metrics - Lista de métricas
   * @returns {Object} - Métricas organizadas por tipo
   * @private
   */
  organizeMetricsByType(metrics) {
    const organized = {
      bloodPressure: [],
      glucose: [],
      weight: [],
      height: [],
      temperature: [],
      oxygenSaturation: [],
      heartRate: [],
      cholesterol: [],
      other: []
    };

    metrics.forEach(metric => {
      const type = metric.type;

      if (organized[type]) {
        organized[type].push(metric);
      } else {
        organized.other.push(metric);
      }
    });

    return organized;
  }

  /**
   * Calcula estadísticas para un conjunto de métricas
   * @param {Array} metrics - Lista de métricas de un tipo específico
   * @returns {Object} - Estadísticas (promedio, min, max, etc.)
   */
  calculateStatistics(metrics) {
    if (!metrics || metrics.length === 0) {
      return { count: 0 };
    }

    const type = metrics[0].type;

    switch (type) {
      case 'bloodPressure':
        return this.calculateBloodPressureStats(metrics);

      case 'glucose':
      case 'weight':
      case 'height':
      case 'temperature':
      case 'oxygenSaturation':
      case 'heartRate':
        return this.calculateSimpleValueStats(metrics);

      case 'cholesterol':
        return this.calculateCholesterolStats(metrics);

      default:
        return { count: metrics.length };
    }
  }

  /**
   * Calcula estadísticas para métricas de presión arterial
   * @param {Array} metrics - Métricas de presión arterial
   * @returns {Object} - Estadísticas
   * @private
   */
  calculateBloodPressureStats(metrics) {
    let systolicSum = 0;
    let diastolicSum = 0;
    let minSystolic = Infinity;
    let maxSystolic = -Infinity;
    let minDiastolic = Infinity;
    let maxDiastolic = -Infinity;

    metrics.forEach(metric => {
      const systolic = metric.values.systolic;
      const diastolic = metric.values.diastolic;

      systolicSum += systolic;
      diastolicSum += diastolic;

      minSystolic = Math.min(minSystolic, systolic);
      maxSystolic = Math.max(maxSystolic, systolic);
      minDiastolic = Math.min(minDiastolic, diastolic);
      maxDiastolic = Math.max(maxDiastolic, diastolic);
    });

    return {
      count: metrics.length,
      systolic: {
        avg: systolicSum / metrics.length,
        min: minSystolic,
        max: maxSystolic
      },
      diastolic: {
        avg: diastolicSum / metrics.length,
        min: minDiastolic,
        max: maxDiastolic
      },
      unit: metrics[0].unit || 'mmHg'
    };
  }

  /**
   * Calcula estadísticas para métricas de valor simple
   * @param {Array} metrics - Métricas de valor simple
   * @returns {Object} - Estadísticas
   * @private
   */
  calculateSimpleValueStats(metrics) {
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;

    metrics.forEach(metric => {
      const value = metric.value;

      sum += value;
      min = Math.min(min, value);
      max = Math.max(max, value);
    });

    return {
      count: metrics.length,
      avg: sum / metrics.length,
      min,
      max,
      unit: metrics[0].unit || ''
    };
  }

  /**
   * Calcula estadísticas para métricas de colesterol
   * @param {Array} metrics - Métricas de colesterol
   * @returns {Object} - Estadísticas
   * @private
   */
  calculateCholesterolStats(metrics) {
    let totalSum = 0;
    let ldlSum = 0;
    let hdlSum = 0;
    let ldlCount = 0;
    let hdlCount = 0;

    metrics.forEach(metric => {
      const values = metric.values;

      totalSum += values.total || 0;

      if (values.ldl) {
        ldlSum += values.ldl;
        ldlCount++;
      }

      if (values.hdl) {
        hdlSum += values.hdl;
        hdlCount++;
      }
    });

    return {
      count: metrics.length,
      total: {
        avg: totalSum / metrics.length
      },
      ldl: ldlCount > 0 ? { avg: ldlSum / ldlCount } : undefined,
      hdl: hdlCount > 0 ? { avg: hdlSum / hdlCount } : undefined,
      unit: metrics[0].unit || 'mg/dL'
    };
  }
}

export const healthMetricsService = new HealthMetricsService();

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
 * Gets blood pressure readings for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Object} options - Query options (limit, etc.)
 * @returns {Promise<Array>} - A promise that resolves to an array of readings
 */
export const getBloodPressureReadings = async (patientId, options = {}) => {
  try {
    // For development, return mock data
    const mockData = [
      {
        id: 'bp-1',
        date: new Date(),
        systolic: 120,
        diastolic: 80,
        pulse: 72,
      },
      {
        id: 'bp-2',
        date: new Date(Date.now() - 86400000), // Yesterday
        systolic: 118,
        diastolic: 78,
        pulse: 70,
      },
      {
        id: 'bp-3',
        date: new Date(Date.now() - 172800000), // 2 days ago
        systolic: 122,
        diastolic: 82,
        pulse: 74,
      }
    ];

    return mockData;

    /* Uncomment when Firebase collection is ready
    const bpCollection = collection(db, 'bloodPressure');
    const q = query(
      bpCollection,
      where('patientId', '==', patientId),
      orderBy('date', 'desc'),
      limit(options.limit || 10)
    );

    const querySnapshot = await getDocs(q);
    const readings = [];
    querySnapshot.forEach((doc) => {
      readings.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      });
    });

    return readings;
    */
  } catch (error) {
    console.error('Error fetching blood pressure readings:', error);
    throw error;
  }
};

/**
 * Gets glucose readings for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Object} options - Query options (limit, etc.)
 * @returns {Promise<Array>} - A promise that resolves to an array of readings
 */
export const getGlucoseReadings = async (patientId, options = {}) => {
  try {
    // For development, return mock data
    const mockData = [
      {
        id: 'glucose-1',
        date: new Date(),
        value: 95,
        isFasting: true,
      },
      {
        id: 'glucose-2',
        date: new Date(Date.now() - 86400000), // Yesterday
        value: 100,
        isFasting: true,
      },
      {
        id: 'glucose-3',
        date: new Date(Date.now() - 172800000), // 2 days ago
        value: 110,
        isFasting: false,
      }
    ];

    return mockData;

    /* Uncomment when Firebase collection is ready
    const glucoseCollection = collection(db, 'glucoseReadings');
    const q = query(
      glucoseCollection,
      where('patientId', '==', patientId),
      orderBy('date', 'desc'),
      limit(options.limit || 10)
    );

    const querySnapshot = await getDocs(q);
    const readings = [];
    querySnapshot.forEach((doc) => {
      readings.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      });
    });

    return readings;
    */
  } catch (error) {
    console.error('Error fetching glucose readings:', error);
    throw error;
  }
};

/**
 * Gets lipid profiles for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Object} options - Query options (limit, etc.)
 * @returns {Promise<Array>} - A promise that resolves to an array of profiles
 */
export const getLipidProfiles = async (patientId, options = {}) => {
  try {
    // For development, return mock data
    const mockData = [
      {
        id: 'lipid-1',
        date: new Date(),
        totalCholesterol: 180,
        ldl: 100,
        hdl: 55,
        triglycerides: 125,
      },
      {
        id: 'lipid-2',
        date: new Date(Date.now() - 2592000000), // 30 days ago
        totalCholesterol: 190,
        ldl: 110,
        hdl: 50,
        triglycerides: 130,
      }
    ];

    return mockData;

    /* Uncomment when Firebase collection is ready
    const lipidCollection = collection(db, 'lipidProfiles');
    const q = query(
      lipidCollection,
      where('patientId', '==', patientId),
      orderBy('date', 'desc'),
      limit(options.limit || 10)
    );

    const querySnapshot = await getDocs(q);
    const profiles = [];
    querySnapshot.forEach((doc) => {
      profiles.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      });
    });

    return profiles;
    */
  } catch (error) {
    console.error('Error fetching lipid profiles:', error);
    throw error;
  }
};
