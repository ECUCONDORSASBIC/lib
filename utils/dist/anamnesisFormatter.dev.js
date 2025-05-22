"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractSearchableTerms = extractSearchableTerms;
exports.calculateSectionCompletionPercentage = calculateSectionCompletionPercentage;
exports.createAnamnesisVersion = exports.calculateCompletionPercentage = exports.prepareAnamnesisForFirestore = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * @file Funciones para formatear y estructurar datos de anamnesis antes de guardarlos en Firestore
 */

/**
 * Genera un identificador único basado en la fecha actual
 * @returns {string} Identificador único
 */
var generateUniqueId = function generateUniqueId() {
  return "anm_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
};
/**
 * Define la estructura de metadatos para cada sección de anamnesis
 * @param {string} sectionId - Identificador de la sección
 * @param {string} version - Versión del esquema de datos (opcional)
 * @returns {Object} Objeto con metadatos
 */


var createSectionMetadata = function createSectionMetadata(sectionId) {
  var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '1.0';
  return {
    sectionId: sectionId,
    version: version,
    lastUpdated: new Date().toISOString()
  };
};
/**
 * Comprueba si un valor está vacío (null, undefined, string vacío, objeto vacío, array vacío)
 * @param {any} value - Valor a comprobar
 * @returns {boolean} True si está vacío, false en caso contrario
 */


var isEmpty = function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (_typeof(value) === 'object') return Object.keys(value).length === 0;
  return false;
};
/**
 * Limpia un objeto eliminando propiedades vacías o nulas
 * @param {Object} obj - Objeto a limpiar
 * @returns {Object} Objeto limpio
 */


var cleanObject = function cleanObject(obj) {
  var clean = {};
  Object.entries(obj).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    // Para objetos anidados, aplicamos recursión
    if (value !== null && _typeof(value) === 'object' && !Array.isArray(value)) {
      var cleanedNested = cleanObject(value);

      if (Object.keys(cleanedNested).length > 0) {
        clean[key] = cleanedNested;
      }
    } // Si es un array, lo filtramos para eliminar valores vacíos
    else if (Array.isArray(value)) {
        var filtered = value.filter(function (item) {
          return !isEmpty(item);
        });

        if (filtered.length > 0) {
          clean[key] = filtered;
        }
      } // Si es un valor simple y no está vacío, lo mantenemos
      else if (!isEmpty(value)) {
          clean[key] = value;
        }
  });
  return clean;
};
/**
 * Estructura los datos de anamnesis según su sección para optimizar el almacenamiento en Firestore
 * @param {Object} formData - Datos brutos del formulario
 * @param {Array} sections - Lista de secciones definidas para el formulario
 * @returns {Object} Datos estructurados por secciones
 */


var structureAnamnesisData = function structureAnamnesisData(formData, sections) {
  // Objeto para organizar los datos por secciones
  var structuredData = {
    metadata: {
      id: generateUniqueId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      isComplete: false,
      completedSections: []
    },
    sections: {}
  }; // Para cada sección definida, agrupamos los datos correspondientes

  sections.forEach(function (section) {
    var sectionId = section.id;
    var sectionData = {};
    var sectionPrefix = "".concat(sectionId, "_"); // Recopilamos todos los campos que pertenecen a esta sección

    Object.entries(formData).forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          value = _ref4[1];

      // Si la clave exactamente coincide con el ID de sección, tomamos todo el objeto
      if (key === sectionId && _typeof(value) === 'object') {
        Object.assign(sectionData, value);
      } // Si la clave comienza con el prefijo de sección, lo incluimos quitando el prefijo
      else if (key.startsWith(sectionPrefix)) {
          var fieldName = key.substring(sectionPrefix.length);
          sectionData[fieldName] = value;
        } // Para campos específicos que sabemos que pertenecen a una sección
        else if (identifySectionForField(key) === sectionId) {
            sectionData[key] = value;
          }
    }); // Si la sección tiene datos, la incluimos en el resultado final

    if (Object.keys(sectionData).length > 0) {
      var cleanedData = cleanObject(sectionData);

      if (Object.keys(cleanedData).length > 0) {
        structuredData.sections[sectionId] = {
          data: cleanedData,
          metadata: createSectionMetadata(sectionId)
        }; // Marcamos la sección como completada si tiene datos

        structuredData.metadata.completedSections.push(sectionId);
      }
    }
  }); // Actualizamos el estado de completado

  if (structuredData.metadata.completedSections.length === sections.length) {
    structuredData.metadata.isComplete = true;
  }

  return structuredData;
};
/**
 * Identifica a qué sección pertenece un campo específico
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} ID de la sección o null si no se puede identificar
 */


var identifySectionForField = function identifySectionForField(fieldName) {
  var fieldMappings = {
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
    'ejercicio': 'habitos' // Más campos pueden ser añadidos según sea necesario

  };
  return fieldMappings[fieldName] || null;
};
/**
 * Prepara los datos de anamnesis para ser guardados en Firestore
 * @param {Object} formData - Datos del formulario
 * @param {Array} sections - Secciones del formulario
 * @param {Object} patientInfo - Información adicional del paciente
 * @returns {Object} Datos listos para guardar en Firestore
 */


var prepareAnamnesisForFirestore = function prepareAnamnesisForFirestore(formData, sections) {
  var patientInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // Limpiamos y estructuramos los datos
  var structuredData = structureAnamnesisData(formData, sections); // Añadimos información del paciente como metadatos

  if (patientInfo.uid) {
    structuredData.metadata.patientId = patientInfo.uid;
  } // Añadimos información clínica relevante a nivel superior para facilitar búsquedas


  var searchableData = {}; // Extraemos campos importantes para búsquedas

  if (formData.motivo_principal) {
    searchableData.motivo_principal = formData.motivo_principal;
  }

  if (formData.sintomas_principales) {
    searchableData.sintomas_principales = formData.sintomas_principales;
  } // Añadimos índice de búsqueda por palabras clave basado en síntomas y diagnósticos


  searchableData.searchTerms = generateSearchTerms(formData);
  return _objectSpread({}, structuredData, {
    searchableData: searchableData
  });
};
/**
 * Genera un array de términos de búsqueda basados en los datos de la anamnesis
 * @param {Object} formData - Datos del formulario
 * @returns {Array} Array de términos de búsqueda
 */


exports.prepareAnamnesisForFirestore = prepareAnamnesisForFirestore;

var generateSearchTerms = function generateSearchTerms(formData) {
  var searchTerms = new Set(); // Extraemos términos del motivo de consulta

  if (formData.motivo_principal) {
    formData.motivo_principal.toLowerCase().split(/\s+/).filter(function (term) {
      return term.length > 3;
    }).forEach(function (term) {
      return searchTerms.add(term);
    });
  } // Extraemos términos de los síntomas


  if (formData.sintomas_principales) {
    formData.sintomas_principales.toLowerCase().split(/\s+/).filter(function (term) {
      return term.length > 3;
    }).forEach(function (term) {
      return searchTerms.add(term);
    });
  } // Extraemos términos de diagnósticos previos


  if (formData.diagnosticos_previos) {
    formData.diagnosticos_previos.toLowerCase().split(/\s+/).filter(function (term) {
      return term.length > 3;
    }).forEach(function (term) {
      return searchTerms.add(term);
    });
  }

  return Array.from(searchTerms);
};
/**
 * Extrae términos médicos relevantes del formulario para facilitar la búsqueda
 * @param {Object} formData - Datos del formulario
 * @returns {Array<string>} - Array de términos médicos normalizados
 */


function extractSearchableTerms(formData) {
  if (!formData) return [];
  var searchTerms = new Set(); // Campos específicos que contienen términos médicos importantes

  var medicalTermsFields = ['motivo_principal', 'preocupacion_principal', 'sintomas_principales', 'diagnostico_previo', 'alergias', 'medicamentos_actuales', 'cirugias', 'enfermedades_cronicas', 'patologia', 'tratamiento']; // Secciones que contienen información diagnóstica

  var diagnosticSections = ['historia-enfermedad', 'antecedentes-personales', 'revision-sistemas']; // Función para extraer y normalizar términos

  var processTerms = function processTerms(value) {
    if (!value || typeof value !== 'string') return; // Normalizar a minúsculas y eliminar acentos

    var normalized = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Dividir en palabras y filtrar términos demasiado cortos o comunes

    var words = normalized.split(/\s+/);
    words.forEach(function (word) {
      if (word.length >= 3 && !commonWords.includes(word)) {
        searchTerms.add(word);
      }
    }); // Buscar términos médicos compuestos (de 2-3 palabras)

    for (var i = 0; i < words.length - 1; i++) {
      var twoWordTerm = words[i] + ' ' + words[i + 1];

      if (twoWordTerm.length >= 5) {
        searchTerms.add(twoWordTerm);
      }

      if (i < words.length - 2) {
        var threeWordTerm = twoWordTerm + ' ' + words[i + 2];

        if (threeWordTerm.length >= 8) {
          searchTerms.add(threeWordTerm);
        }
      }
    }
  }; // Lista de palabras comunes en español para filtrar


  var commonWords = ['que', 'como', 'para', 'por', 'con', 'sin', 'una', 'uno', 'unos', 'unas', 'los', 'las', 'del', 'al', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella', 'aquellos', 'aquellas', 'mas', 'pero', 'ante', 'bajo', 'cabe', 'con', 'contra', 'desde', 'durante', 'mediante', 'para', 'por', 'segun', 'sin', 'sobre', 'tras', 'vez', 'veces', 'dia', 'dias', 'tiene', 'tienen', 'tuvo', 'fue']; // Procesar el formulario para extraer términos
  // 1. Revisar los campos específicos en cualquier parte del formulario

  var processObject = function processObject(obj) {
    if (!obj || _typeof(obj) !== 'object') return;
    Object.entries(obj).forEach(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
          key = _ref6[0],
          value = _ref6[1];

      // Procesar campos específicos que contienen términos médicos
      if (medicalTermsFields.includes(key) && typeof value === 'string') {
        processTerms(value);
      } // Procesar objetos anidados


      if (_typeof(value) === 'object' && value !== null) {
        processObject(value);
      }
    });
  }; // 2. Procesar secciones de diagnóstico con mayor profundidad


  diagnosticSections.forEach(function (section) {
    if (formData[section]) {
      if (typeof formData[section] === 'string') {
        processTerms(formData[section]);
      } else {
        processObject(formData[section]);
      }
    }
  }); // Procesar el objeto completo para encontrar campos específicos

  processObject(formData); // Convertir el Set a Array

  return Array.from(searchTerms);
}
/**
 * Calcula el nivel de compleción de la anamnesis
 * @param {Object} structuredData - Datos estructurados de la anamnesis
 * @param {Array} requiredSections - Secciones requeridas para considerar completa
 * @returns {number} Porcentaje de compleción (0-100)
 */


var calculateCompletionPercentage = function calculateCompletionPercentage(structuredData, requiredSections) {
  if (!structuredData || !structuredData.sections) return 0;
  var completedSections = structuredData.metadata.completedSections || [];
  var requiredCompleted = requiredSections.filter(function (section) {
    return completedSections.includes(section);
  }).length;
  return Math.round(requiredCompleted / requiredSections.length * 100);
};
/**
 * Calcula el porcentaje de compleción para cada sección de la anamnesis
 * @param {Object} structuredData - Datos estructurados de anamnesis 
 * @returns {Object} Objeto con porcentaje de compleción por sección
 */


exports.calculateCompletionPercentage = calculateCompletionPercentage;

function calculateSectionCompletionPercentage(structuredData) {
  if (!structuredData || !structuredData.sections) {
    return {
      total: 0,
      sections: {}
    };
  }

  var sections = structuredData.sections;
  var sectionCompletions = {};
  var totalFields = 0;
  var completedFields = 0; // Definimos la importancia (peso) de cada sección para el cálculo global

  var sectionWeights = {
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
  }; // Para cada sección calculamos el porcentaje individual

  Object.entries(sections).forEach(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
        sectionId = _ref8[0],
        sectionData = _ref8[1];

    if (!sectionData.data) {
      sectionCompletions[sectionId] = 0;
      return;
    } // Contamos campos totales y completados en esta sección


    var fieldsInSection = countFieldsRecursively(sectionData.data);
    var completedFieldsInSection = countCompletedFieldsRecursively(sectionData.data);
    var sectionPercentage = fieldsInSection > 0 ? Math.round(completedFieldsInSection / fieldsInSection * 100) : 0;
    sectionCompletions[sectionId] = sectionPercentage; // Acumulamos para el total global, considerando el peso de la sección

    var weight = sectionWeights[sectionId] || 0.5;
    totalFields += fieldsInSection * weight;
    completedFields += completedFieldsInSection * weight;
  }); // Calculamos el porcentaje total

  var totalPercentage = totalFields > 0 ? Math.round(completedFields / totalFields * 100) : 0;
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
  if (!obj || _typeof(obj) !== 'object') {
    return 0;
  }

  var count = 0;
  Object.entries(obj).forEach(function (_ref9) {
    var _ref10 = _slicedToArray(_ref9, 2),
        key = _ref10[0],
        value = _ref10[1];

    if (_typeof(value) === 'object' && value !== null && !Array.isArray(value)) {
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
  if (!obj || _typeof(obj) !== 'object') {
    return 0;
  }

  var count = 0;
  Object.entries(obj).forEach(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
        key = _ref12[0],
        value = _ref12[1];

    if (_typeof(value) === 'object' && value !== null && !Array.isArray(value)) {
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


var createAnamnesisVersion = function createAnamnesisVersion(currentAnamnesis, userId) {
  return {
    data: currentAnamnesis,
    metadata: {
      versionId: generateUniqueId(),
      createdAt: new Date().toISOString(),
      createdBy: userId
    }
  };
};

exports.createAnamnesisVersion = createAnamnesisVersion;