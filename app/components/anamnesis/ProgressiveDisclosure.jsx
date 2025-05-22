'use client';

import { useState } from 'react';
import { CheckCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function ProgressiveDisclosure({ children, title, description, complexity = 'basic' }) {
  const [expanded, setExpanded] = useState(complexity === 'basic');

  return (
    <div className={`border rounded-lg overflow-hidden mb-4 ${expanded ? 'bg-white' : 'bg-gray-50'
      }`}>
      <div
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-medium flex items-center">
            {complexity !== 'basic' && (
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${complexity === 'advanced' ? 'bg-purple-500' : 'bg-blue-500'
                }`}></span>
            )}
            {title}
          </h3>
          {!expanded && description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center">
          {complexity !== 'basic' && (
            <span className="text-xs mr-2 px-2 py-1 rounded bg-gray-100">
              {complexity === 'advanced' ? 'Especializado' : 'Importante'}
            </span>
          )}
          <QuestionMarkCircleIcon className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''
            } text-gray-400`} />
        </div>
      </div>

      {expanded && (
        <div className="p-4 pt-0 border-t">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Evalúa los factores de riesgo del paciente basados en sus datos de salud
 * @param {Object} patientData - Datos del paciente
 * @returns {Promise<Object>} - Resultado del análisis de riesgo
 */
export async function evaluateHealthRisks(patientData) {
  try {
    // Crear un prompt para evaluar riesgos de salud
    const prompt = `
      Analiza los siguientes datos del paciente y evalúa los posibles factores de riesgo
      para enfermedades cardiovasculares, diabetes tipo 2 y otros riesgos relevantes.
      Datos del paciente:
      - Edad: ${patientData.age}
      - Sexo: ${patientData.gender}
      - Presión arterial: ${patientData.bloodPressure || 'No disponible'}
      - Colesterol total: ${patientData.cholesterol || 'No disponible'} mg/dL
      - Colesterol HDL: ${patientData.hdlCholesterol || 'No disponible'} mg/dL
      - Fumador: ${patientData.isSmoker ? 'Sí' : 'No'}
      - Diabetes: ${patientData.hasDiabetes ? 'Sí' : 'No'}
      - Índice de masa corporal (IMC): ${patientData.bmi || 'No disponible'}
      - Antecedentes familiares de enfermedad cardíaca: ${patientData.familyHeartDiseaseHistory ? 'Sí' : 'No'}
      - Nivel de actividad física: ${patientData.physicalActivityLevel || 'No disponible'}
      Proporciona un análisis detallado de los factores de riesgo, la pertenencia a grupos de
      riesgo específicos y recomendaciones personalizadas. Estructura la respuesta en formato JSON.
    `;
    // Llamar a la API de GenKit para el análisis
    const response = await genkitClient.prompt({
      messages: [
        { role: 'system', content: 'Eres un asistente médico especializado en evaluación de riesgos para la salud' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    // Procesar la respuesta de GenKit (asumiendo que devuelve un JSON)
    let result;
    try {
      // Intentar parsear el JSON si viene como string
      if (typeof response.content === 'string') {
        result = JSON.parse(response.content);
      } else {
        result = response.content;
      }
    } catch (error) {
      console.error('Error parsing GenKit response:', error);
      throw new Error('Error en formato de respuesta de análisis de riesgos');
    }
    return result;
  } catch (error) {
    console.error('Error calling GenKit API:', error);
    throw new Error(`Error en la evaluación de riesgos: ${error.message}`);
  }
}

/**
 * Genera una predicción de salud a 10 años basada en los datos actuales del paciente
 * @param {Object} patientData - Datos del paciente
 * @param {Object} riskAssessment - Evaluación de riesgo actual
 * @returns {Promise<Object>} - Predicción a 10 años
 */
export async function generateTenYearPrediction(patientData, riskAssessment) {
  try {
    // Crear un prompt para la predicción a 10 años
    const prompt = `
      Basado en los siguientes datos del paciente y su evaluación de riesgo actual,
      genera una predicción de la evolución de su salud en los próximos 10 años.
      Datos del paciente:
      - Edad: ${patientData.age}
      - Sexo: ${patientData.gender}
      - Presión arterial: ${patientData.bloodPressure || 'No disponible'}
      - Colesterol total: ${patientData.cholesterol || 'No disponible'} mg/dL
      - Colesterol HDL: ${patientData.hdlCholesterol || 'No disponible'} mg/dL
      - Fumador: ${patientData.isSmoker ? 'Sí' : 'No'}
      - Diabetes: ${patientData.hasDiabetes ? 'Sí' : 'No'}
      - Índice de masa corporal (IMC): ${patientData.bmi || 'No disponible'}
      Evaluación de riesgo actual:
      ${JSON.stringify(riskAssessment)}
      Proporciona una predicción detallada para los próximos 10 años, incluyendo:
      1. Probabilidad de desarrollar enfermedades cardiovasculares
      2. Probabilidad de desarrollar diabetes tipo 2 (si aún no la tiene)
      3. Cambios proyectados en presión arterial y colesterol
      4. Recomendaciones para reducir estos riesgos
      Estructura la respuesta en formato JSON.
    `;
    // Llamar a la API de GenKit para la predicción
    const response = await genkitClient.prompt({
      messages: [
        { role: 'system', content: 'Eres un asistente médico especializado en predicciones de salud a largo plazo' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    // Procesar la respuesta
    let result;
    try {
      if (typeof response.content === 'string') {
        result = JSON.parse(response.content);
      } else {
        result = response.content;
      }
    } catch (error) {
      console.error('Error parsing GenKit prediction response:', error);
      throw new Error('Error en formato de respuesta de predicción');
    }
    return result;
  } catch (error) {
    console.error('Error calling GenKit API for prediction:', error);
    throw new Error(`Error en la generación de predicción: ${error.message}`);
  }
}

/**
 * Genera un mensaje personalizado para notificar al paciente sobre sus riesgos y predicciones
 * @param {Object} patientData - Datos del paciente
 * @param {Object} riskAssessment - Evaluación de riesgo
 * @param {Object} prediction - Predicción a 10 años
 * @returns {Promise<String>} - Mensaje personalizado
 */
export async function generatePatientNotification(patientData, riskAssessment, prediction) {
  try {
    const prompt = `
      Crea un mensaje personalizado y empático para notificar al paciente sobre su evaluación
      de riesgo de salud y la predicción a 10 años. El mensaje debe ser informativo pero no alarmista,
      y debe incluir recomendaciones prácticas y motivadoras.
      Datos del paciente:
      - Nombre: ${patientData.name}
      - Edad: ${patientData.age}
      Evaluación de riesgo:
      ${JSON.stringify(riskAssessment)}
      Predicción a 10 años:
      ${JSON.stringify(prediction)}
    `;
    const response = await genkitClient.prompt({
      messages: [
        { role: 'system', content: 'Eres un asistente médico empático que comunica información de salud de manera clara y motivadora' },
        { role: 'user', content: prompt }
      ]
    });
    return response.content;
  } catch (error) {
    console.error('Error generating patient notification:', error);
    throw new Error(`Error al generar notificación para el paciente: ${error.message}`);
  }
}

/**
 * Genera un resumen clínico para el médico basado en la evaluación y predicción
 * @param {Object} patientData - Datos del paciente
 * @param {Object} riskAssessment - Evaluación de riesgo
 * @param {Object} prediction - Predicción a 10 años
 * @returns {Promise<Object>} - Resumen clínico estructurado
 */
export async function generateDoctorSummary(patientData, riskAssessment, prediction) {
  try {
    const prompt = `
      Genera un resumen clínico conciso pero completo para el médico, basado en la evaluación
      de riesgo del paciente y la predicción a 10 años. El resumen debe seguir un formato médico
      profesional e incluir posibles intervenciones recomendadas.
      Datos del paciente:
      - Nombre: ${patientData.name}
      - Edad: ${patientData.age}
      - Sexo: ${patientData.gender}
      - Historial médico: ${patientData.medicalHistory || 'No disponible'}
      Evaluación de riesgo:
      ${JSON.stringify(riskAssessment)}
      Predicción a 10 años:
      ${JSON.stringify(prediction)}
      Estructura el resumen en formato JSON con secciones claras para hallazgos clave,
      factores de riesgo, predicciones y recomendaciones de tratamiento.
    `;
    const response = await genkitClient.prompt({
      messages: [
        { role: 'system', content: 'Eres un asistente médico especializado en comunicación clínica profesional' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    // Procesar la respuesta
    let result;
    try {
      if (typeof response.content === 'string') {
        result = JSON.parse(response.content);
      } else {
        result = response.content;
      }
    } catch (error) {
      console.error('Error parsing doctor summary:', error);
      throw new Error('Error en formato de resumen para médico');
    }
    return result;
  } catch (error) {
    console.error('Error generating doctor summary:', error);
    throw new Error(`Error al generar resumen para médico: ${error.message}`);
  }
}

/**
 * Genera sugerencias inteligentes para campos de formularios médicos
 * @param {Object} formData - Datos actuales del formulario
 * @param {string} fieldName - Nombre del campo para el que se solicita sugerencia
 * @param {string} formSection - Sección del formulario (ej. 'antecedentes', 'habitos')
 * @returns {Promise<Object>} - Sugerencia generada
 */
export async function generateSmartFormSuggestions(formData, fieldName, formSection) {
  try {
    const prompt = `
      Como asistente médico, genera una sugerencia relevante para el campo "${fieldName}"
      en la sección "${formSection}" de un formulario de anamnesis médica.

      Los datos actuales del formulario son:
      ${JSON.stringify(formData, null, 2)}

      Proporciona una sugerencia concisa y médicamente apropiada basada en los datos disponibles.
      Si no hay suficiente contexto, proporciona orientación general sobre qué información sería útil incluir.
    `;

    const response = await genkitClient.prompt({
      messages: [
        { role: 'system', content: 'Eres un asistente médico especializado en historias clínicas' },
        { role: 'user', content: prompt }
      ]
    });

    // Procesamiento de la respuesta
    return {
      suggestion: response.content,
      fieldName,
      section: formSection
    };
  } catch (error) {
    console.error('Error generando sugerencia:', error);
    throw new Error(`Error generando sugerencia: ${error.message}`);
  }
}
