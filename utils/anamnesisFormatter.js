/**
 * @file Utilidades para optimizar el almacenamiento de datos de anamnesis en Firestore
 *
 * Este archivo contiene funciones para estructurar, limpiar y optimizar los datos
 * de historias clínicas (anamnesis) antes de guardarlos en Firestore.
 *
 * Características principales:
 * - Estructura de datos jerárquica por secciones para acceso eficiente
 * - Eliminación de datos vacíos o redundantes para reducir el tamaño de documentos
 * - Generación de términos de búsqueda para consultas rápidas
 * - Cálculo de porcentajes de compleción por sección
 * - Soporte para versionado y seguimiento de cambios en las historias clínicas
 *
 * Diseñado para trabajar con miles de usuarios y grandes volúmenes de datos médicos,
 * optimizando tanto el almacenamiento como las operaciones de lectura y escritura.
 */

/**
 * Genera un identificador único basado en la fecha actual
 * @returns {string} Identificador único
 */
const generateUniqueId = () => {
  return `anm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Define la estructura de metadatos para cada sección de anamnesis
 * @param {string} sectionId - Identificador de la sección
 * @param {string} version - Versión del esquema de datos (opcional)
 * @returns {Object} Objeto con metadatos
 */
const createSectionMetadata = (sectionId, version = '1.0') => {
  return {
    sectionId,
    version,
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Comprueba si un valor está vacío (null, undefined, string vacío, objeto vacío, array vacío)
 * @param {any} value - Valor a comprobar
 * @returns {boolean} True si está vacío, false en caso contrario
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Limpia un objeto eliminando propiedades vacías o nulas
 * @param {Object} obj - Objeto a limpiar
 * @returns {Object} Objeto limpio
 */
const cleanObject = (obj) => {
  const clean = {};

  Object.entries(obj).forEach(([key, value]) => {
    // Para objetos anidados, aplicamos recursión
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const cleanedNested = cleanObject(value);
      if (Object.keys(cleanedNested).length > 0) {
        clean[key] = cleanedNested;
      }
    }
    // Si es un array, lo filtramos para eliminar valores vacíos
    else if (Array.isArray(value)) {
      const filtered = value.filter(item => !isEmpty(item));
      if (filtered.length > 0) {
        clean[key] = filtered;
      }
    }
    // Si es un valor simple y no está vacío, lo mantenemos
    else if (!isEmpty(value)) {
      clean[key] = value;
    }
  });

  return clean;
};

/**
 * Identifica a qué sección pertenece un campo específico
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} ID de la sección o null si no se puede identificar
 */
const identifySectionForField = (fieldName) => {
  const fieldMappings = {
    // Datos personales
    'nombre_completo': 'datos-personales',
    'fecha_nacimiento': 'datos-personales',
    'sexo': 'datos-personales',
    'email': 'datos-personales',
    'telefono': 'datos-personales',

    // Motivo consulta
    'motivo_principal': 'motivo-consulta',
    'primera_historia_clinica': 'motivo-consulta',
    'preocupacion_principal': 'motivo-consulta',

    // Enfermedad actual
    'sintomas_principales': 'historia-enfermedad',
    'tiene_sintomas_actuales': 'historia-enfermedad',
    'fecha_inicio': 'historia-enfermedad',

    // Antecedentes
    'alergias': 'antecedentes-personales',
    'cirugias_previas': 'antecedentes-personales',

    // Hábitos
    'tabaco': 'habitos',
    'alcohol': 'habitos',
    'ejercicio': 'habitos',

    // Más campos pueden ser añadidos según sea necesario
  };

  return fieldMappings[fieldName] || null;
};

/**
 * Genera un array de términos de búsqueda basados en los datos de la anamnesis
 * @param {Object} formData - Datos del formulario
 * @returns {Array} Array de términos de búsqueda
 */
const generateSearchTerms = (formData) => {
  const searchTerms = new Set();

  // Extraemos términos del motivo de consulta
  if (formData.motivo_principal) {
    formData.motivo_principal
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 3)
      .forEach(term => searchTerms.add(term));
  }

  // Extraemos términos de los síntomas
  if (formData.sintomas_principales) {
    formData.sintomas_principales
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 3)
      .forEach(term => searchTerms.add(term));
  }

  // Extraemos términos de diagnósticos previos
  if (formData.diagnosticos_previos) {
    formData.diagnosticos_previos
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 3)
      .forEach(term => searchTerms.add(term));
  }

  return Array.from(searchTerms);
};

/**
 * Extrae términos médicos relevantes del formulario para facilitar la búsqueda
 * @param {Object} formData - Datos del formulario
 * @returns {Array<string>} - Array de términos médicos normalizados
 */
export function extractSearchableTerms(formData) {
  if (!formData || typeof formData !== 'object') return [];

  const searchTerms = new Set();

  // Campos específicos que contienen términos médicos importantes
  const medicalTermsFields = [
    'motivo_principal',
    'preocupacion_principal',
    'sintomas_principales',
    'diagnostico_previo',
    'alergias',
    'medicamentos_actuales',
    'cirugias',
    'enfermedades_cronicas',
    'patologia',
    'tratamiento'
  ];

  // Secciones que contienen información diagnóstica
  const diagnosticSections = [
    'historia-enfermedad',
    'antecedentes-personales',
    'revision-sistemas'
  ];

  // Función para extraer y normalizar términos
  const processTerms = (value) => {
    if (!value || typeof value !== 'string') return;

    // Normalizar a minúsculas y eliminar acentos
    const normalized = value.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Dividir en palabras y filtrar términos demasiado cortos o comunes
    const words = normalized.split(/\s+/);

    words.forEach(word => {
      if (word.length >= 3 && !commonWords.includes(word)) {
        searchTerms.add(word);
      }
    });

    // Buscar términos médicos compuestos (de 2-3 palabras)
    for (let i = 0; i < words.length - 1; i++) {
      const twoWordTerm = words[i] + ' ' + words[i + 1];
      if (twoWordTerm.length >= 5) {
        searchTerms.add(twoWordTerm);
      }

      if (i < words.length - 2) {
        const threeWordTerm = twoWordTerm + ' ' + words[i + 2];
        if (threeWordTerm.length >= 8) {
          searchTerms.add(threeWordTerm);
        }
      }
    }
  };

  // Lista de palabras comunes en español para filtrar
  const commonWords = [
    'que', 'como', 'para', 'por', 'con', 'sin', 'una', 'uno', 'unos', 'unas',
    'los', 'las', 'del', 'al', 'este', 'esta', 'estos', 'estas', 'ese', 'esa',
    'esos', 'esas', 'aquel', 'aquella', 'aquellos', 'aquellas', 'mas', 'pero',
    'ante', 'bajo', 'cabe', 'con', 'contra', 'desde', 'durante', 'mediante',
    'para', 'por', 'segun', 'sin', 'sobre', 'tras', 'vez', 'veces', 'dia',
    'dias', 'tiene', 'tienen', 'tuvo', 'fue'
  ];

  // Procesar el formulario para extraer términos
  // 1. Revisar los campos específicos en cualquier parte del formulario
  const processObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    // Asegurarse de que el objeto tenga un método entries (evitar errores con arrays u otros tipos)
    if (!Object.entries) return; try {
      Object.entries(obj).forEach(([key, value]) => {
        // Procesar campos específicos que contienen términos médicos
        if (medicalTermsFields.includes(key) && typeof value === 'string') {
          processTerms(value);
        }

        // Procesar objetos anidados
        if (typeof value === 'object' && value !== null) {
          processObject(value);
        }
      });
    } catch (error) {
      console.error('Error procesando objeto para extracción de términos:', error);
    }
  };
  // 2. Procesar secciones de diagnóstico con mayor profundidad
  diagnosticSections.forEach(section => {
    if (formData[section]) {
      if (typeof formData[section] === 'string') {
        processTerms(formData[section]);
      } else {
        processObject(formData[section]);
      }
    }
  });

  // Procesar el objeto completo para encontrar campos específicos
  processObject(formData);

  // Convertir el Set a Array
  return Array.from(searchTerms);
}

/**
 * Calcula el nivel de compleción de la anamnesis
 * @param {Object} structuredData - Datos estructurados de la anamnesis
 * @param {Array} requiredSections - Secciones requeridas para considerar completa
 * @returns {number} Porcentaje de compleción (0-100)
 */
export const calculateCompletionPercentage = (structuredData, requiredSections) => {
  if (!structuredData || !structuredData.sections) return 0;

  const completedSections = structuredData.metadata.completedSections || [];
  const requiredCompleted = requiredSections.filter(section =>
    completedSections.includes(section)).length;

  return Math.round((requiredCompleted / requiredSections.length) * 100);
};

/**
 * Calcula el porcentaje de compleción para cada sección de la anamnesis
 * @param {Object} structuredData - Datos estructurados de anamnesis
 * @returns {Object} Objeto con porcentaje de compleción por sección
 */
export function calculateSectionCompletionPercentage(structuredData) {
  if (!structuredData || !structuredData.sections) {
    return { total: 0, sections: {} };
  }

  const sections = structuredData.sections;
  const sectionCompletions = {};
  let totalFields = 0;
  let completedFields = 0;

  // Definimos la importancia (peso) de cada sección para el cálculo global
  const sectionWeights = {
    'datos-personales': 1.0,
    'motivo-consulta': 1.0,
    'historia-enfermedad': 1.0,
    'antecedentes-personales': 0.8,
    'antecedentes-gineco': 0.6,
    'antecedentes-familiares': 0.7,
    'habitos': 0.6,
    'revision-sistemas': 0.8,
    'pruebas-previas': 0.5,
    'salud-mental': 0.6,
    'percepcion-paciente': 0.5
  };

  // Para cada sección calculamos el porcentaje individual
  Object.entries(sections).forEach(([sectionId, sectionData]) => {
    if (!sectionData.data) {
      sectionCompletions[sectionId] = 0;
      return;
    }

    // Contamos campos totales y completados en esta sección
    const fieldsInSection = countFieldsRecursively(sectionData.data);
    const completedFieldsInSection = countCompletedFieldsRecursively(sectionData.data);

    const sectionPercentage = fieldsInSection > 0
      ? Math.round((completedFieldsInSection / fieldsInSection) * 100)
      : 0;

    sectionCompletions[sectionId] = sectionPercentage;

    // Acumulamos para el total global, considerando el peso de la sección
    const weight = sectionWeights[sectionId] || 0.5;
    totalFields += fieldsInSection * weight;
    completedFields += completedFieldsInSection * weight;
  });

  // Calculamos el porcentaje total
  const totalPercentage = totalFields > 0
    ? Math.round((completedFields / totalFields) * 100)
    : 0;

  return {
    total: totalPercentage,
    sections: sectionCompletions
  };
}

/**
 * Cuenta el número de campos en un objeto (incluyendo campos anidados)
 * @param {Object} obj - Objeto a analizar
 * @returns {number} Número total de campos
 */
function countFieldsRecursively(obj) {
  if (!obj || typeof obj !== 'object') {
    return 0;
  }

  let count = 0;

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Para objetos anidados, contamos recursivamente
      count += countFieldsRecursively(value);
    } else {
      // Para valores simples y arrays, contamos como un campo
      count += 1;
    }
  });

  return count;
}

/**
 * Cuenta el número de campos completados en un objeto
 * @param {Object} obj - Objeto a analizar
 * @returns {number} Número de campos completados
 */
function countCompletedFieldsRecursively(obj) {
  if (!obj || typeof obj !== 'object') {
    return 0;
  }

  let count = 0;

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Para objetos anidados, contamos recursivamente
      count += countCompletedFieldsRecursively(value);
    } else if (!isEmpty(value)) {
      // Para valores simples y arrays no vacíos, contamos como completados
      count += 1;
    }
  });

  return count;
}

/**
 * Versiona la anamnesis para mantener un historial de cambios
 * @param {Object} currentAnamnesis - Anamnesis actual
 * @param {string} userId - ID del usuario que realiza el cambio
 * @returns {Object} Datos versionados
 */
export const createAnamnesisVersion = (currentAnamnesis, userId) => {
  return {
    data: currentAnamnesis,
    metadata: {
      versionId: generateUniqueId(),
      createdAt: new Date().toISOString(),
      createdBy: userId
    }
  };
};

/**
 * Prepara los datos de anamnesis para su almacenamiento optimizado en Firestore
 * @param {Object} formData - Datos del formulario
 * @param {Array} steps - Pasos/secciones del formulario
 * @param {Object} patientData - Datos básicos del paciente
 * @returns {Object} Datos estructurados y optimizados para Firestore
 */
export function prepareAnamnesisForFirestore(formData, steps, patientData) {
  // Verificar que formData sea un objeto válido
  if (!formData || typeof formData !== 'object') {
    console.error('Error: formData no es un objeto válido', formData);
    // Devolver al menos un objeto vacío pero válido
    return {
      metadata: {
        id: generateUniqueId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        error: 'Datos de formulario inválidos'
      },
      sections: {},
      searchableData: { searchTerms: [] }
    };
  }

  // Crear la estructura base
  const structuredData = {
    metadata: {
      id: generateUniqueId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      patientId: patientData?.uid || null,
      patientSex: patientData?.sexo || formData?.sexo || null,
    },
    sections: {},
    searchableData: {
      searchTerms: []
    }
  };

  // Extraer términos de búsqueda
  structuredData.searchableData.searchTerms = extractSearchableTerms(formData);

  // Para cada paso/sección, estructurar los datos
  steps.forEach(step => {
    const sectionId = step.id;

    // Si el formData tiene una propiedad con el mismo nombre que la sección
    if (formData[sectionId]) {
      // Limpiamos el objeto para eliminar campos vacíos
      const cleanedData = cleanObject(formData[sectionId]);

      // Si hay datos después de la limpieza, los añadimos a la estructura
      if (Object.keys(cleanedData).length > 0) {
        structuredData.sections[sectionId] = {
          metadata: createSectionMetadata(sectionId),
          data: cleanedData
        };
      }
    } else {
      // Si no hay una propiedad directa, buscamos campos que empiecen por el ID de la sección
      const sectionData = {};
      const prefix = `${sectionId}_`;

      Object.entries(formData).forEach(([key, value]) => {
        if (key.startsWith(prefix)) {
          // Quitamos el prefijo para tener un nombre de campo más limpio
          const cleanKey = key.substring(prefix.length);
          sectionData[cleanKey] = value;
        }
      });

      // Limpiamos el objeto recopilado
      const cleanedData = cleanObject(sectionData);

      // Si hay datos después de la limpieza, los añadimos a la estructura
      if (Object.keys(cleanedData).length > 0) {
        structuredData.sections[sectionId] = {
          metadata: createSectionMetadata(sectionId),
          data: cleanedData
        };
      }
    }
  });

  // Calcular completitud de cada sección
  const completionData = calculateSectionCompletionPercentage(structuredData);
  structuredData.metadata.completionPercentage = completionData.total;
  structuredData.metadata.sectionCompletion = completionData.sections;

  // Definir secciones completadas (aquellas con más del 30% de compleción)
  const completedSections = Object.entries(completionData.sections)
    .filter(([_, percentage]) => percentage >= 30)
    .map(([sectionId]) => sectionId);

  structuredData.metadata.completedSections = completedSections;

  return structuredData;
}
