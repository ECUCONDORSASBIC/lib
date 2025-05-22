"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFirstStep = exports.getStepById = exports.onboardingConfig = void 0;
var onboardingConfig = {
  paciente: {
    name: "Paciente",
    steps: [{
      id: "bienvenida",
      title: "Bienvenido/a",
      component: "WelcomeStep",
      nextStepId: "verificacionIdentidad",
      previousStepId: null
    }, {
      id: "verificacionIdentidad",
      title: "Verificación de Identidad",
      component: "IdentityVerificationStep",
      nextStepId: "datosPersonales",
      previousStepId: "bienvenida"
    }, {
      id: "datosPersonales",
      title: "Datos Personales",
      component: "PersonalDataStep",
      fields: ["nombreCompleto", "fechaNacimiento", "genero"],
      nextStepId: "finalizacion",
      previousStepId: "verificacionIdentidad"
    }, {
      id: "finalizacion",
      title: "Finalización",
      component: "CompletionStep",
      nextStepId: null,
      previousStepId: "datosPersonales"
    }]
  },
  empresario: {
    name: "Empresario",
    steps: [{
      id: "bienvenida",
      title: "Bienvenido/a",
      component: "WelcomeStep",
      nextStepId: "verificacionIdentidad",
      previousStepId: null
    }, {
      id: "verificacionIdentidad",
      title: "Verificación de Identidad",
      component: "IdentityVerificationStep",
      nextStepId: "datosEmpresa",
      previousStepId: "bienvenida"
    }, {
      id: "datosEmpresa",
      title: "Datos de la Empresa",
      component: "CompanyDataStep",
      fields: ["nombreEmpresa", "ruc", "direccionEmpresa"],
      nextStepId: "datosBancariosEmpresario",
      previousStepId: "verificacionIdentidad"
    }, {
      id: "datosBancariosEmpresario",
      title: "Datos Bancarios",
      component: "BankingDataStep",
      role: "empresario",
      // To differentiate if BankingDataStep is generic
      fields: ["banco", "numeroCuenta", "tipoCuenta"],
      nextStepId: "finalizacion",
      previousStepId: "datosEmpresa"
    }, {
      id: "finalizacion",
      title: "Finalización",
      component: "CompletionStep",
      nextStepId: null,
      previousStepId: "datosBancariosEmpresario"
    }]
  },
  medico: {
    name: "Médico",
    steps: [{
      id: "bienvenida",
      title: "Bienvenido/a",
      component: "WelcomeStep",
      nextStepId: "verificacionIdentidad",
      previousStepId: null
    }, {
      id: "verificacionIdentidad",
      title: "Verificación de Identidad",
      component: "IdentityVerificationStep",
      nextStepId: "informacionProfesional",
      previousStepId: "bienvenida"
    }, {
      id: "informacionProfesional",
      title: "Información Profesional",
      component: "ProfessionalInfoStep",
      fields: ["especialidad", "numeroColegiatura", "universidad"],
      nextStepId: "datosBancariosMedico",
      previousStepId: "verificacionIdentidad"
    }, {
      id: "datosBancariosMedico",
      title: "Datos Bancarios",
      component: "BankingDataStep",
      role: "medico",
      // To differentiate if BankingDataStep is generic
      fields: ["banco", "numeroCuenta", "tipoCuentaCCI"],
      nextStepId: "finalizacion",
      previousStepId: "informacionProfesional"
    }, {
      id: "finalizacion",
      title: "Finalización",
      component: "CompletionStep",
      nextStepId: null,
      previousStepId: "datosBancariosMedico"
    }]
  }
}; // Helper function to get a step by its ID for a given role

exports.onboardingConfig = onboardingConfig;

var getStepById = function getStepById(role, stepId) {
  if (!onboardingConfig[role]) return null;
  return onboardingConfig[role].steps.find(function (step) {
    return step.id === stepId;
  }) || null;
}; // Helper function to get the first step for a given role


exports.getStepById = getStepById;

var getFirstStep = function getFirstStep(role) {
  if (!onboardingConfig[role] || onboardingConfig[role].steps.length === 0) return null;
  return onboardingConfig[role].steps[0];
};

exports.getFirstStep = getFirstStep;