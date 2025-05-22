/**
 * Utilities for validating anamnesis data using JSDoc types
 *
 * This module uses the type definitions from types/anamnesis.js to
 * validate data structures before they are sent to the database or displayed
 * in the UI, providing type safety and better error messages.
 */

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
 * @typedef {import('../types/anamnesis').AnamnesisSectionKey} AnamnesisSectionKey
 */

/**
 * Validates individual section data against its expected type
 *
 * @template {AnamnesisSectionKey} T
 * @param {T} sectionId - The ID of the section to validate
 * @param {any} data - The data to validate
 * @returns {Object} - Validation result with errors if any
 */
export function validateSection(sectionId, data) {
  // Convert kebab-case or snake_case to camelCase for type mapping
  const camelCaseId = sectionId
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^([A-Z])/, (m) => m.toLowerCase());

  const errors = {};

  switch (camelCaseId) {
    case 'datosPersonales':
    case 'identificacion':
      return validateIdentificacionData(data);
    case 'motivoConsulta':
      return validateMotivoConsultaData(data);
    case 'historiaEnfermedad':
    case 'enfermedadActual':
      return validateEnfermedadActualData(data);
    case 'antecedentesPersonales':
      return validateAntecedentesPersonalesData(data);
    case 'antecedentesFamiliares':
      return validateAntecedentesFamiliaresData(data);
    case 'habitos':
    case 'habitosEstiloVida':
      return validateHabitosEstiloVidaData(data);
    case 'revisionSistemas':
      return validateRevisionSistemasData(data);
    case 'pruebasPrevias':
    case 'pruebasInformesPrevios':
      return validatePruebasInformesPreviosData(data);
    case 'saludMental':
      return validateSaludMentalData(data);
    case 'percepcionPaciente':
      return validatePercepcionPacienteData(data);
    default:
      console.warn(`No validation defined for section: ${sectionId}`);
      return { isValid: true, errors: {} };
  }
}

/**
 * Validates identification data against the IdentificacionData type
 * @param {IdentificacionData} data - The data to validate
 * @returns {Object} - Validation result
 */
function validateIdentificacionData(data) {
  const errors = {};

  // Check required fields according to the IdentificacionData type
  if (!data.nombreCompleto || typeof data.nombreCompleto !== 'string' || !data.nombreCompleto.trim()) {
    errors.nombreCompleto = 'El nombre completo es requerido y debe ser un texto';
  }

  if (!data.fechaNacimiento || typeof data.fechaNacimiento !== 'string') {
    errors.fechaNacimiento = 'La fecha de nacimiento es requerida y debe ser un texto';
  } else {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.fechaNacimiento) &&
      !/^\d{2}\/\d{2}\/\d{4}$/.test(data.fechaNacimiento)) {
      errors.fechaNacimiento = 'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD o DD/MM/YYYY)';
    }
  }

  // Validate sexo against the enum defined in the type
  if (!data.sexo) {
    errors.sexo = 'El sexo es requerido';
  } else if (typeof data.sexo !== 'string') {
    errors.sexo = 'El sexo debe ser un texto';
  } else if (!['masculino', 'femenino', 'otro'].includes(data.sexo)) {
    errors.sexo = 'El sexo debe ser "masculino", "femenino" u "otro"';
  }

  // Validate ocupacion if provided
  if (data.ocupacion !== undefined && (typeof data.ocupacion !== 'string')) {
    errors.ocupacion = 'La ocupación debe ser un texto';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates motivo consulta data against the MotivoConsultaData type
 * @param {MotivoConsultaData} data - The data to validate
 * @returns {Object} - Validation result
 */
function validateMotivoConsultaData(data) {
  const errors = {};

  // Check if the descripcion field exists and is a string, as defined in the type
  if (!data) {
    return { isValid: false, errors: { global: 'Los datos del motivo de consulta son requeridos' } };
  }

  if (!data.descripcion) {
    errors.descripcion = 'El motivo de consulta es requerido';
  } else if (typeof data.descripcion !== 'string') {
    errors.descripcion = 'El motivo de consulta debe ser un texto';
  } else if (!data.descripcion.trim()) {
    errors.descripcion = 'El motivo de consulta no puede estar vacío';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates enfermedad actual data
 * @param {any} data - The data to validate
 * @returns {Object} - Validation result
 */
function validateEnfermedadActualData(data) {
  const errors = {};

  // Basic validation for required fields
  if (!data.inicio) {
    errors.inicio = 'El inicio de la enfermedad es requerido';
  }

  if (!data.sintomas || !Array.isArray(data.sintomas) || data.sintomas.length === 0) {
    errors.sintomas = 'Al menos un síntoma es requerido';
  } else {
    // Validate each symptom
    const sintomasErrors = data.sintomas.map((sintoma, index) => {
      const sError = {};
      if (!sintoma.nombre) {
        sError.nombre = 'El nombre del síntoma es requerido';
      }
      return Object.keys(sError).length > 0 ? sError : null;
    }).filter(Boolean);

    if (sintomasErrors.length > 0) {
      errors.sintomas = sintomasErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates antecedentes personales data
 * @param {any} data - The data to validate
 * @returns {Object} - Validation result
 */
function validateAntecedentesPersonalesData(data) {
  const errors = {};

  // Validate cirugias array if present
  if (data.cirugias && Array.isArray(data.cirugias)) {
    const cirugiasErrors = data.cirugias.map((cirugia, index) => {
      const cError = {};
      if (!cirugia.procedimiento) {
        cError.procedimiento = 'El procedimiento es requerido';
      }
      if (!cirugia.anio) {
        cError.anio = 'El año es requerido';
      }
      return Object.keys(cError).length > 0 ? cError : null;
    }).filter(Boolean);

    if (cirugiasErrors.length > 0) {
      errors.cirugias = cirugiasErrors;
    }
  }

  // Validate medicamentos array if present
  if (data.medicamentos_actuales && Array.isArray(data.medicamentos_actuales)) {
    const medicamentosErrors = data.medicamentos_actuales.map((med, index) => {
      const mError = {};
      if (!med.nombre) {
        mError.nombre = 'El nombre del medicamento es requerido';
      }
      return Object.keys(mError).length > 0 ? mError : null;
    }).filter(Boolean);

    if (medicamentosErrors.length > 0) {
      errors.medicamentos_actuales = medicamentosErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates antecedentes familiares data
 * @param {any} data - The data to validate
 * @returns {Object} - Validation result
 */
function validateAntecedentesFamiliaresData(data) {
  const errors = {};

  // Validate familiares array if present
  if (data.familiares && Array.isArray(data.familiares)) {
    const familiaresErrors = data.familiares.map((familiar, index) => {
      const fError = {};
      if (!familiar.parentesco) {
        fError.parentesco = 'El parentesco es requerido';
      }
      if (!familiar.enfermedades || !Array.isArray(familiar.enfermedades) || familiar.enfermedades.length === 0) {
        fError.enfermedades = 'Al menos una enfermedad es requerida';
      }
      return Object.keys(fError).length > 0 ? fError : null;
    }).filter(Boolean);

    if (familiaresErrors.length > 0) {
      errors.familiares = familiaresErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates habitos estilo vida data
 * @param {any} data - The data to validate
 * @returns {Object} - Validation result
 */
function validateHabitosEstiloVidaData(data) {
  // For habits, we don't enforce strict validation as all fields are optional
  return { isValid: true, errors: {} };
}

/**
 * Validates revision sistemas data
 * @param {any} data - The data to validate
 * @returns {Object} - Validation result
 */
function validateRevisionSistemasData(data) {
  // Revision de sistemas is mostly optional as well
  return { isValid: true, errors: {} };
}

/**
 * Validates pruebas informes previos data
 * @param {any} data - The data to validate
 * @returns {Object} - Validation result
 */
function validatePruebasInformesPreviosData(data) {
  const errors = {};

  // Validate pruebas_informes_previos array if present
  if (data.pruebas_informes_previos && Array.isArray(data.pruebas_informes_previos)) {
    const pruebasErrors = data.pruebas_informes_previos.map((prueba, index) => {
      const pError = {};
      if (!prueba.tipo_prueba) {
        pError.tipo_prueba = 'El tipo de prueba es requerido';
      }
      return Object.keys(pError).length > 0 ? pError : null;
    }).filter(Boolean);

    if (pruebasErrors.length > 0) {
      errors.pruebas_informes_previos = pruebasErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates salud mental data
 * @param {any} data - The data to validate
 * @returns {Object} - Validation result
 */
function validateSaludMentalData(data) {
  // Mental health fields are optional
  return { isValid: true, errors: {} };
}

/**
 * Validates percepcion paciente data
 * @param {any} data - The data to validate
 * @returns {Object} - Validation result
 */
function validatePercepcionPacienteData(data) {
  // Patient perception fields are optional
  return { isValid: true, errors: {} };
}

/**
 * Validates complete anamnesis form data
 *
 * @param {Object} formData - The complete anamnesis form data
 * @returns {Object} - Validation result with section errors
 */
export function validateAnamnesisFormData(formData) {
  const errors = {};
  let isValid = true;

  // Validate each section if present
  Object.entries(formData).forEach(([sectionId, sectionData]) => {
    const validationResult = validateSection(sectionId, sectionData);
    if (!validationResult.isValid) {
      errors[sectionId] = validationResult.errors;
      isValid = false;
    }
  });

  return {
    isValid,
    errors
  };
}

/**
 * Checks if a section is minimally complete based on its data
 *
 * @param {AnamnesisSectionKey} sectionId - The ID of the section to check
 * @param {any} data - The section data
 * @returns {boolean} - True if the section is minimally complete
 */
export function isSectionComplete(sectionId, data) {
  const { isValid } = validateSection(sectionId, data);
  return isValid;
}
