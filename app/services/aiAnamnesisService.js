/**
 * Servicio especializado para anamnesis asistida por IA
 * Integra Genkit y Vertex AI para automatizar el proceso de recopilación
 * de información clínica mediante conversación natural
 */

import { formatAnalysisRequest } from './genkitService';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Modelo de sistema para guiar la generación de preguntas médicas
const SYSTEM_PROMPT = `
Eres un asistente médico profesional especializado en realizar anamnesis de manera conversacional.
Tu objetivo es ayudar a obtener información médica relevante del paciente de forma empática y estructurada.
Debes adaptar tus preguntas basándote en las respuestas previas, priorizando información
clínicamente relevante según la sección actual de la anamnesis.

Sigue estas directrices:
1. Formula preguntas claras, específicas y en un lenguaje accesible
2. Adapta tu enfoque según la edad del paciente (niños, adultos, adultos mayores)
3. Profundiza en síntomas o condiciones relevantes mencionadas
4. Mantén un tono profesional pero cercano
5. Evita interrumpir al paciente
6. Estructura la conversación según la sección actual de la anamnesis
7. Extrae y estructura la información médica relevante para cada campo del formulario
`;

/**
 * Genera preguntas inteligentes basadas en el contexto de la anamnesis
 * @param {Object} options - Opciones de generación
 * @param {string} options.currentSection - Sección actual de la anamnesis
 * @param {Array} options.previousQuestions - Preguntas previas realizadas
 * @param {Array} options.patientResponses - Respuestas previas del paciente
 * @param {Object} options.patientContext - Contexto del paciente (edad, sexo, etc.)
 * @param {Object} options.existingData - Datos ya recopilados
 * @returns {Promise<Object>} - Pregunta generada y análisis
 */
export const generateSmartQuestion = async ({
  currentSection,
  previousQuestions = [],
  patientResponses = [],
  patientContext = {},
  existingData = {}
}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const conversationContext = buildConversationContext(
      currentSection,
      previousQuestions,
      patientResponses,
      patientContext,
      existingData
    );

    const formattedData = formatAnalysisRequest({
      conversationContext,
      patientContext,
      currentSection,
    });

    const response = await fetch('/api/genkit/generate-anamnesis-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error generando pregunta:', errorData);
      return {
        error: errorData.error || 'Error al generar pregunta inteligente',
        fallbackQuestion: getFallbackQuestion(currentSection)
      };
    }

    const data = await response.json();
    return {
      question: data.question,
      analysis: data.analysis || {},
      suggestedFollowUps: data.suggestedFollowUps || [],
      infoExtracted: data.extractedInfo || null,
      contradictions: data.contradictions || [],
      suggestedResponses: data.suggestedResponses || []
    };
  } catch (error) {
    console.error('Error en generateSmartQuestion:', error);
    
    if (error.name === 'AbortError') {
      return {
        error: 'Tiempo de espera agotado al generar la pregunta',
        fallbackQuestion: getFallbackQuestion(currentSection)
      };
    }
    
    return {
      error: error.message || 'Error de conexión',
      fallbackQuestion: getFallbackQuestion(currentSection)
    };
  }
};

/**
 * Analiza la respuesta del paciente y extrae información estructurada
 * @param {Object} options - Opciones de análisis
 * @param {string} options.currentSection - Sección actual de la anamnesis
 * @param {string} options.question - Pregunta formulada
 * @param {string} options.patientResponse - Respuesta del paciente
 * @param {Object} options.patientContext - Contexto del paciente
 * @param {Array} options.previousQuestions - Preguntas previas
 * @param {Array} options.previousResponses - Respuestas previas
 * @param {Object} options.existingData - Datos ya recopilados
 * @returns {Promise<Object>} - Datos estructurados extraídos
 */
export const analyzePatientResponse = async ({
  currentSection,
  question,
  patientResponse,
  patientContext = {},
  previousQuestions = [],
  previousResponses = [],
  existingData = {}
}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const formattedData = formatAnalysisRequest({
      currentSection,
      question,
      patientResponse,
      patientContext
    });

    const response = await fetch('/api/genkit/analyze-patient-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error analizando respuesta:', errorData);
      return {
        error: errorData.error || 'Error al analizar la respuesta del paciente',
        extractedData: {}
      };
    }

    const data = await response.json();
    return {
      extractedData: data.extractedData || {},
      relevantFields: data.relevantFields || [],
      confidenceScore: data.confidenceScore || 0,
      followUpNeeded: data.followUpNeeded || false,
      suggestedFollowUp: data.suggestedFollowUp || null,
      detectedRisks: data.detectedRisks || []
    };
  } catch (error) {
    console.error('Error en analyzePatientResponse:', error);
    
    if (error.name === 'AbortError') {
      return {
        error: 'Tiempo de espera agotado al analizar la respuesta',
        extractedData: {}
      };
    }
    
    return {
      error: error.message || 'Error de conexión',
      extractedData: {}
    };
  }
};

/**
 * Construye un contexto de conversación formateado para la IA
 * @private
 */
function buildConversationContext(
  currentSection,
  previousQuestions,
  patientResponses,
  patientContext,
  existingData
) {
  // Crear un histórico de conversación formateado
  const conversationHistory = [];
  
  for (let i = 0; i < Math.max(previousQuestions.length, patientResponses.length); i++) {
    if (previousQuestions[i]) {
      conversationHistory.push({
        role: 'assistant',
        content: previousQuestions[i]
      });
    }
    
    if (patientResponses[i]) {
      conversationHistory.push({
        role: 'user',
        content: patientResponses[i]
      });
    }
  }

  // Información sobre secciones ya completadas
  const completedSections = Object.keys(existingData).filter(
    section => existingData[section] && Object.keys(existingData[section]).length > 0
  );

  // Crear el contexto completo
  return {
    currentSection,
    conversationHistory,
    patientInfo: patientContext,
    completedSections,
    existingData
  };
}

/**
 * Obtiene una pregunta predeterminada para una sección en caso de fallo
 * @private
 */
function getFallbackQuestion(sectionId) {
  const fallbackQuestions = {
    'datos-personales': '¿Podría decirme su nombre completo y fecha de nacimiento?',
    'motivo-consulta': '¿Cuál es el motivo principal por el que busca atención médica hoy?',
    'historia-enfermedad': '¿Podría describirme cómo comenzaron sus síntomas y cómo han evolucionado?',
    'antecedentes-personales': '¿Padece alguna enfermedad crónica o ha tenido cirugías importantes?',
    'antecedentes-gineco': '¿Podría comentarme sobre sus antecedentes ginecológicos como ciclos menstruales o embarazos previos?',
    'antecedentes-familiares': '¿Hay enfermedades que sean frecuentes en su familia?',
    'habitos': '¿Podría describirme sus hábitos de vida como ejercicio, alimentación o consumo de sustancias?',
    'revision-sistemas': '¿Ha notado algún problema o síntoma en alguno de sus sistemas corporales últimamente?',
    'pruebas-previas': '¿Se ha realizado algún estudio o análisis médico recientemente?',
    'salud-mental': '¿Cómo describiría su estado de ánimo general en las últimas semanas?',
    'percepcion-paciente': '¿Qué espera usted de esta consulta o tratamiento?'
  };
  
  return fallbackQuestions[sectionId] || '¿Podría proporcionarme más información sobre su situación médica?';
}

/**
 * Genera un resumen completo de la anamnesis basado en todos los datos recopilados
 * @param {Object} formData - Datos completos del formulario
 * @param {Array} visibleSections - Secciones visibles del formulario
 * @returns {Promise<Object>} - Resumen generado
 */
export const generateAnamnesisReport = async (formData, visibleSections) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const formattedData = formatAnalysisRequest({
      formData,
      visibleSections: visibleSections.map(s => s.id),
    });

    const response = await fetch('/api/genkit/generate-anamnesis-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error generando reporte:', errorData);
      return {
        error: errorData.error || 'Error al generar el reporte de anamnesis',
        summary: null
      };
    }

    const data = await response.json();
    return {
      summary: data.summary,
      keyFindings: data.keyFindings || [],
      suggestedActions: data.suggestedActions || [],
      completeness: data.completeness || 0,
      riskAreas: data.riskAreas || [],
      relevantTerms: data.relevantTerms || [],
      diagnosisSuggestions: data.diagnosisSuggestions || []
    };
  } catch (error) {
    console.error('Error en generateAnamnesisReport:', error);
    
    if (error.name === 'AbortError') {
      return {
        error: 'Tiempo de espera agotado al generar el reporte',
        summary: null
      };
    }
    
    return {
      error: error.message || 'Error de conexión',
      summary: null
    };
  }
};
