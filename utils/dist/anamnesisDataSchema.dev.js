"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeAnamnesisData = exports.ANAMNESIS_SCHEMA = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @typedef {import('../types/anamnesis').IdentificacionData} IdentificacionData
 * @typedef {import('../types/anamnesis').MotivoConsultaData} MotivoConsultaData
 * @typedef {import('../types/anamnesis').EnfermedadActualData} EnfermedadActualData
 * @typedef {import('../types/anamnesis').AntecedentesPersonalesData} AntecedentesPersonalesData
 * @typedef {import('../types/anamnesis').AntecedentesFamiliaresData} AntecedentesFamiliaresData
 * @typedef {import('../types/anamnesis').HabitosEstiloVidaData} HabitosEstiloVidaData
 * @typedef {import('../types/anamnesis').RevisionSistemasData} RevisionSistemasData
 * @typedef {import('../types/anamnesis').PruebasInformesPreviosData} PruebasInformesPreviosData
 * @typedef {import('../types/anamnesis').SaludMentalData} SaludMentalData
 * @typedef {import('../types/anamnesis').PercepcionPacienteData} PercepcionPacienteData
 * @typedef {import('../types/anamnesis').AnamnesisFormData} AnamnesisFormData
 */

/**
 * Esquema de datos para normalizar la estructura de Anamnesis
 * Basado en los tipos definidos en types/anamnesis.js
 * @type {AnamnesisFormData}
 */
var ANAMNESIS_SCHEMA = {
  // Datos personales (equivale a IdentificacionData)
  'datos-personales': {
    nombreCompleto: '',
    fechaNacimiento: '',
    sexo: '',
    ocupacion: ''
  },
  // Motivo de consulta
  'motivo-consulta': {
    descripcion: ''
  },
  // Enfermedad actual
  'historia-enfermedad': {
    inicio: '',
    sintomas: [],
    tratamientos_probados: [],
    impacto_funcional: {
      general: 0,
      avd: 0,
      trabajo_estudios: 0,
      sueno: 0,
      social_hobbies: 0,
      animo: 0
    },
    narrativa: ''
  },
  // Antecedentes personales
  'antecedentes-personales': {
    enfermedades_cronicas: [],
    cirugias: [],
    alergias: [],
    medicamentos_actuales: [],
    otros_antecedentes: ''
  },
  // Antecedentes familiares
  'antecedentes-familiares': {
    familiares: []
  },
  // Hábitos y estilo de vida
  'habitos': {
    tabaquismo: {
      estado: 'Nunca'
    },
    alcohol: {
      consume: false
    },
    drogas: {
      consume: false
    },
    actividad_fisica: {
      realiza: false
    },
    sueno_horas_noche: 0
  } // Otros campos se pueden agregar según la estructura

};
/**
 * Normaliza los datos de anamnesis según el esquema definido
 * @param {Partial<AnamnesisFormData>} existingData - Datos existentes para normalizar
 * @returns {AnamnesisFormData} - Datos normalizados según el esquema
 */

exports.ANAMNESIS_SCHEMA = ANAMNESIS_SCHEMA;

var normalizeAnamnesisData = function normalizeAnamnesisData() {
  var existingData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var normalizedData = _objectSpread({}, ANAMNESIS_SCHEMA); // Combinar datos existentes con el esquema


  Object.keys(existingData).forEach(function (sectionKey) {
    if (normalizedData[sectionKey]) {
      normalizedData[sectionKey] = _objectSpread({}, normalizedData[sectionKey], {}, existingData[sectionKey]);
    } else {
      normalizedData[sectionKey] = existingData[sectionKey];
    }
  });
  return normalizedData;
};

exports.normalizeAnamnesisData = normalizeAnamnesisData;