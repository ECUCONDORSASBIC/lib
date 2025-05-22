/**
 * Servicio para el procesamiento de imágenes médicas en anamnesis
 * Integra Vertex AI Vision y Firebase Storage para análisis de imágenes
 */

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatAnalysisRequest } from './genkitService';

/**
 * Sube una imagen médica a Firebase Storage y devuelve la URL
 * @param {File} imageFile - Archivo de imagen a subir
 * @param {string} patientId - ID del paciente
 * @returns {Promise<string>} - URL de la imagen subida
 */
export const uploadMedicalImage = async (imageFile, patientId) => {
  try {
    if (!imageFile || !patientId) {
      throw new Error('Se requiere un archivo de imagen y un ID de paciente');
    }
    
    const storage = getStorage();
    const timestamp = Date.now();
    const imagePath = `patients/${patientId}/medical-images/${timestamp}_${imageFile.name}`;
    const storageRef = ref(storage, imagePath);
    
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: imagePath,
      timestamp,
      success: true
    };
  } catch (error) {
    console.error('Error al subir imagen médica:', error);
    return {
      url: null,
      error: error.message || 'Error al subir imagen',
      success: false
    };
  }
};

/**
 * Analiza una imagen médica usando Vertex AI Vision
 * @param {string} imageUrl - URL de la imagen a analizar
 * @param {Object} contextData - Contexto médico relevante para el análisis
 * @returns {Promise<Object>} - Resultados del análisis
 */
export const analyzeMedicalImage = async (imageUrl, contextData = {}) => {
  try {
    if (!imageUrl) {
      throw new Error('Se requiere URL de imagen para análisis');
    }
    
    const formattedData = formatAnalysisRequest({
      imageUrl,
      patientContext: contextData.patientInfo || {},
      currentSection: contextData.currentSection || 'visual-evidence',
      symptoms: contextData.symptoms || [],
      previousDiagnoses: contextData.previousDiagnoses || []
    });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch('/api/genkit/analyze-medical-image', {
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
      console.error('Error analizando imagen médica:', errorData);
      return {
        error: errorData.error || 'Error al analizar la imagen médica',
        success: false
      };
    }
    
    const data = await response.json();
    
    return {
      findings: data.findings || 'No se detectaron hallazgos específicos.',
      relevance: data.relevance || 'Relevancia clínica indeterminada.',
      suggestions: data.suggestions || 'Se recomienda evaluación profesional.',
      detectedConditions: data.detectedConditions || [],
      confidence: data.confidence || 0,
      success: true
    };
  } catch (error) {
    console.error('Error en analyzeMedicalImage:', error);
    
    if (error.name === 'AbortError') {
      return {
        error: 'Tiempo de espera agotado al analizar la imagen',
        success: false
      };
    }
    
    return {
      error: error.message || 'Error de conexión',
      success: false
    };
  }
};

/**
 * Detecta contradicciones en las respuestas del paciente
 * @param {Object} options - Opciones para detección
 * @param {Array} options.previousResponses - Respuestas previas
 * @param {string} options.currentResponse - Respuesta actual
 * @param {Array} options.previousQuestions - Preguntas previas
 * @param {Object} options.formData - Datos actuales del formulario
 * @returns {Promise<Object>} - Contradicciones detectadas
 */
export const detectContradictions = async ({
  previousResponses = [],
  currentResponse,
  previousQuestions = [],
  formData = {}
}) => {
  try {
    if (!currentResponse) {
      return { contradictions: [], success: true };
    }
    
    const formattedData = formatAnalysisRequest({
      previousResponses,
      currentResponse,
      previousQuestions,
      formData
    });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch('/api/genkit/detect-contradictions', {
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
      console.error('Error detectando contradicciones:', errorData);
      return {
        contradictions: [],
        error: errorData.error || 'Error al detectar contradicciones',
        success: false
      };
    }
    
    const data = await response.json();
    
    return {
      contradictions: data.contradictions || [],
      suggestedClarifications: data.suggestedClarifications || [],
      confidence: data.confidence || 0,
      success: true
    };
  } catch (error) {
    console.error('Error en detectContradictions:', error);
    
    if (error.name === 'AbortError') {
      return {
        contradictions: [],
        error: 'Tiempo de espera agotado al detectar contradicciones',
        success: false
      };
    }
    
    return {
      contradictions: [],
      error: error.message || 'Error de conexión',
      success: false
    };
  }
};

/**
 * Genera términos médicos con explicaciones simplificadas
 * @param {string} text - Texto a analizar para extraer términos médicos
 * @returns {Promise<Array>} - Lista de términos médicos con explicaciones
 */
export const extractMedicalTermsWithDefinitions = async (text) => {
  try {
    if (!text) {
      return { terms: [], success: true };
    }
    
    const formattedData = { text };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('/api/genkit/extract-medical-terms', {
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
      console.error('Error extrayendo términos médicos:', errorData);
      return {
        terms: [],
        error: errorData.error || 'Error al extraer términos médicos',
        success: false
      };
    }
    
    const data = await response.json();
    
    return {
      terms: data.terms || [],
      success: true
    };
  } catch (error) {
    console.error('Error en extractMedicalTermsWithDefinitions:', error);
    return {
      terms: [],
      error: error.message || 'Error de conexión',
      success: false
    };
  }
};
