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
export const ANAMNESIS_SCHEMA = {
  // Datos personales (equivale a IdentificacionData)
  'datos-personales': {
    nombreCompleto: '',
    fechaNacimiento: '',
    sexo: '',
    ocupacion: '',
  },
  // Motivo de consulta
  'motivo-consulta': {
    descripcion: '',
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
      estado: 'Nunca',
    },
    alcohol: {
      consume: false,
    },
    drogas: {
      consume: false,
    },
    actividad_fisica: {
      realiza: false,
    },
    sueno_horas_noche: 0
  },
  // Otros campos se pueden agregar según la estructura
};

/**
 * Normaliza los datos de anamnesis según el esquema definido
 * @param {Partial<AnamnesisFormData>} existingData - Datos existentes para normalizar
 * @returns {AnamnesisFormData} - Datos normalizados según el esquema
 */
export const normalizeAnamnesisData = (existingData = {}) => {
  const normalizedData = { ...ANAMNESIS_SCHEMA };

  // Combinar datos existentes con el esquema
  Object.keys(existingData).forEach(sectionKey => {
    if (normalizedData[sectionKey]) {
      normalizedData[sectionKey] = {
        ...normalizedData[sectionKey],
        ...existingData[sectionKey]
      };
    } else {
      normalizedData[sectionKey] = existingData[sectionKey];
    }
  });

  return normalizedData;
};
