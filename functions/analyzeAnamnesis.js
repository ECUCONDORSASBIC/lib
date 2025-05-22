const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Genkit } = require('@genkit-ai/core');

// Inicializamos la instancia de Genkit con la clave API
// Para entorno de producción, usa la configuración de Firebase Functions
const genkitClient = new Genkit({
  apiKey: functions.config().genkit?.api_key || process.env.GENKIT_API_KEY || process.env.NEXT_PUBLIC_GENKIT_API_KEY || 'tu-genkit-api-key'
});

/**
 * Evalúa los factores de riesgo del paciente basados en sus datos de salud
 * @param {Object} patientData - Datos del paciente
 * @returns {Promise<Object>} - Resultado del análisis de riesgo
 */
async function evaluateHealthRisks(patientData) {
  try {
    // Crear un prompt para evaluar riesgos de salud
    const prompt = `
      Analiza exhaustivamente los siguientes datos del paciente para identificar y evaluar los factores de riesgo
      para enfermedades cardiovasculares, diabetes tipo 2, hipertensión y otros riesgos de salud relevantes según el perfil.

      Datos del paciente:
      - Edad: ${patientData.age}
      - Sexo: ${patientData.gender}
      - Presión arterial (sistólica/diastólica): ${patientData.bloodPressure || 'No disponible'}
      - Colesterol total: ${patientData.cholesterol || 'No disponible'} mg/dL
      - Colesterol HDL: ${patientData.hdlCholesterol || 'No disponible'} mg/dL
      - Colesterol LDL: ${patientData.ldlCholesterol || 'No disponible'} mg/dL
      - Triglicéridos: ${patientData.triglycerides || 'No disponible'} mg/dL
      - Fumador: ${patientData.isSmoker ? 'Sí' : 'No'} (Detallar frecuencia y duración si es posible)
      - Diabetes diagnosticada: ${patientData.hasDiabetes ? 'Sí' : 'No'}
      - Índice de masa corporal (IMC): ${patientData.bmi || 'No disponible'} (Clasificar según OMS)
      - Circunferencia abdominal: ${patientData.waistCircumference || 'No disponible'} cm
      - Antecedentes familiares de enfermedad cardíaca: ${patientData.familyHeartDiseaseHistory ? 'Sí' : 'No'}
      - Antecedentes familiares de diabetes: ${patientData.familyDiabetesHistory ? 'Sí' : 'No'}
      - Nivel de actividad física: ${patientData.physicalActivityLevel || 'No disponible'} (Ej: sedentario, ligero, moderado, intenso. Minutos/semana)
      - Dieta: ${patientData.dietDescription || 'No disponible'} (Breve descripción: ej. alta en grasas saturadas, rica en frutas y verduras)

      Estructura la respuesta en el siguiente formato JSON:
      {
        "resumenGeneralRiesgo": "string",
        "factoresRiesgoIdentificados": [
          {
            "factor": "string",
            "valorPaciente": "string",
            "nivelRiesgoFactor": "string",
            "descripcionImpacto": "string",
            "condicionesAsociadas": ["string"]
          }
        ],
        "gruposRiesgoPertenencia": ["string"],
        "recomendacionesPersonalizadas": [
          {
            "recomendacion": "string",
            "detalleAccion": "string",
            "objetivo": "string",
            "prioridad": "string"
          }
        ],
        "alertasCriticas": ["string"]
      }

      Considera el contexto integral del paciente al generar las recomendaciones, evitando sugerencias redundantes si una condición ya está diagnosticada (ej. si ya tiene diabetes, enfócate en el manejo, no en la prevención primaria de diabetes).
      Sé específico y cuantitativo en lo posible.
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
async function generateTenYearPrediction(patientData, riskAssessment) {
  try {
    // Crear un prompt para la predicción a 10 años
    const prompt = `
      Basándote en los datos completos del paciente y su evaluación de riesgo actual,
      genera una predicción detallada de la evolución de su salud en los próximos 10 años.

      Datos del paciente (incluir todos los datos relevantes disponibles como en la evaluación de riesgo):
      - Edad: ${patientData.age}
      - Sexo: ${patientData.gender}
      - Presión arterial (sistólica/diastólica): ${patientData.bloodPressure || 'No disponible'}
      - Colesterol total: ${patientData.cholesterol || 'No disponible'} mg/dL
      - Colesterol HDL: ${patientData.hdlCholesterol || 'No disponible'} mg/dL
      - Colesterol LDL: ${patientData.ldlCholesterol || 'No disponible'} mg/dL
      - Triglicéridos: ${patientData.triglycerides || 'No disponible'} mg/dL
      - Fumador: ${patientData.isSmoker ? 'Sí' : 'No'}
      - Diabetes diagnosticada: ${patientData.hasDiabetes ? 'Sí' : 'No'}
      - Índice de masa corporal (IMC): ${patientData.bmi || 'No disponible'}
      - Circunferencia abdominal: ${patientData.waistCircumference || 'No disponible'} cm
      - Antecedentes familiares de enfermedad cardíaca: ${patientData.familyHeartDiseaseHistory ? 'Sí' : 'No'}
      - Antecedentes familiares de diabetes: ${patientData.familyDiabetesHistory ? 'Sí' : 'No'}
      - Nivel de actividad física: ${patientData.physicalActivityLevel || 'No disponible'}
      - Dieta: ${patientData.dietDescription || 'No disponible'}

      Evaluación de riesgo actual (JSON):
      ${JSON.stringify(riskAssessment)}

      Estructura la respuesta en el siguiente formato JSON:
      {
        "resumenPrediccion": "string",
        "prediccionesEspecificas": [
          {
            "condicion": "string",
            "probabilidad10AnosBase": "string",
            "factoresInfluyentes": ["string"],
            "proyeccionValoresClave": [
              {
                "parametro": "string",
                "valorProyectado": "string"
              }
            ]
          }
        ],
        "impactoPotencialIntervenciones": [
          {
            "intervencionSugerida": "string",
            "reduccionEstimadaRiesgoECV": "string",
            "mejoraProyectadaValores": [
              {
                "parametro": "string",
                "mejoraEstimada": "string"
              }
            ]
          }
        ],
        "consejosProactivosGenerales": ["string"]
      }

      La predicción debe ser realista y basada en la evidencia científica actual.
      Considera cómo las recomendaciones de la evaluación de riesgo, si se siguen, podrían alterar estas predicciones.
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

// Cloud Function que analiza los datos de anamnesis
exports.analyzeAnamnesisData = functions.firestore
  .document('patients/{patientId}/medical/anamnesis')
  .onWrite(async (change, context) => {
    const { patientId } = context.params;
    const anamnesisData = change.after.exists ? change.after.data() : null;

    // No procesar si se eliminó el documento
    if (!anamnesisData) {
      console.log(`No hay datos de anamnesis para analizar para el paciente: ${patientId}`);
      return null;
    }

    console.log(`Analizando datos de anamnesis para paciente: ${patientId}`);

    try {
      // Obtener datos básicos del paciente para complementar la anamnesis
      const patientSnapshot = await admin.firestore()
        .collection('patients')
        .doc(patientId)
        .get();

      if (!patientSnapshot.exists) {
        console.error(`No se encontró el paciente con ID: ${patientId}`);
        return null;
      }

      const patientData = patientSnapshot.data();

      // Combinamos los datos del paciente con los de anamnesis para obtener un objeto completo
      const enrichedPatientData = {
        ...patientData,
        // Campos específicos para Genkit
        age: patientData.age || calculateAgeFromBirthDate(patientData.birthDate || patientData.fechaNacimiento),
        gender: patientData.gender || patientData.sexo || 'No especificado',
        bloodPressure: anamnesisData.signosVitales?.presionArterial || 'No disponible',
        cholesterol: anamnesisData.laboratorio?.colesterolTotal || 'No disponible',
        hdlCholesterol: anamnesisData.laboratorio?.colesterolHDL || 'No disponible',
        ldlCholesterol: anamnesisData.laboratorio?.colesterolLDL || 'No disponible',
        triglycerides: anamnesisData.laboratorio?.trigliceridos || 'No disponible',
        isSmoker: anamnesisData.habitos?.tabaquismo?.activo || false,
        hasDiabetes: checkForDiabetes(anamnesisData),
        bmi: calculateBMI(anamnesisData.antropometria?.peso, anamnesisData.antropometria?.altura),
        waistCircumference: anamnesisData.antropometria?.circunferenciaAbdominal || 'No disponible',
        familyHeartDiseaseHistory: checkFamilyHistory(anamnesisData, 'cardio'),
        familyDiabetesHistory: checkFamilyHistory(anamnesisData, 'diabetes'),
        physicalActivityLevel: determineActivityLevel(anamnesisData),
        dietDescription: describeDiet(anamnesisData)
      };

      console.log(`Datos enriquecidos preparados para análisis de Genkit`);

      // Usar Genkit para evaluación de riesgos
      const riskAssessmentData = await evaluateHealthRisks(enrichedPatientData);
      console.log("Evaluación de riesgos completada");

      // Usar resultados de la evaluación para generar predicción a 10 años
      const tenYearPredictionData = await generateTenYearPrediction(enrichedPatientData, riskAssessmentData);
      console.log("Predicción a 10 años completada");

      // Guardar los resultados en nuevo formato estructurado
      const riskAssessmentRef = admin.firestore()
        .collection('patients')
        .doc(patientId)
        .collection('medical')
        .doc('riskAssessment');

      await riskAssessmentRef.set({
        riskAssessmentData,
        tenYearPredictionData,
        calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'genkit-analysis'
      }, { merge: true });

      console.log(`Datos de riesgo y predicción guardados en Firestore para el paciente ${patientId}`);

      // También mantener compatibilidad con el formato antiguo para sistemas legacy
      // que esperan la estructura anterior
      const legacyFactors = extractLegacyFactors(riskAssessmentData);
      await riskAssessmentRef.set({
        factors: legacyFactors
      }, { merge: true });

      // Crear alertas para factores de alto riesgo
      const highRiskFactors = legacyFactors.filter(factor => factor.level === 'high');
      if (highRiskFactors.length > 0) {
        await createHighRiskAlert(patientId, highRiskFactors);
      }

      return null;
    } catch (error) {
      console.error(`Error en el análisis de datos para el paciente ${patientId}:`, error);
      return null;
    }
  });

// Funciones auxiliares para enriquecer y procesar los datos

// Calcula la edad a partir de la fecha de nacimiento
function calculateAgeFromBirthDate(birthDateString) {
  if (!birthDateString) return null;

  try {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  } catch (e) {
    console.error('Error calculando edad:', e);
    return null;
  }
}

// Verifica si el paciente tiene diagnóstico de diabetes
function checkForDiabetes(anamnesisData) {
  if (!anamnesisData.patologias) return false;

  // Verifica en diagnósticos o problemas de salud actuales
  const hasDiabetesDiagnosis = anamnesisData.patologias.some(
    p => p.diagnostico && p.diagnostico.toLowerCase().includes('diabetes')
  );

  // O verifica si hay medicación para diabetes
  const hasDiabetesMedication = anamnesisData.medicacion && anamnesisData.medicacion.some(
    m => m.indicacion && (
      m.indicacion.toLowerCase().includes('diabetes') ||
      m.indicacion.toLowerCase().includes('glucosa') ||
      m.nombre.toLowerCase().includes('metformina')
    )
  );

  return hasDiabetesDiagnosis || hasDiabetesMedication;
}

// Calcula el IMC si hay peso y altura disponibles
function calculateBMI(weight, height) {
  if (!weight || !height || height <= 0) return null;

  // Altura en metros (si está en cm)
  const heightInMeters = height > 3 ? height / 100 : height;

  // Fórmula IMC: peso(kg) / altura²(m)
  const bmi = weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
}

// Verifica si hay antecedentes familiares de una condición específica
function checkFamilyHistory(anamnesisData, condition) {
  if (!anamnesisData.antecedentesFamiliares) return false;

  return anamnesisData.antecedentesFamiliares.some(
    af => af.enfermedad && af.enfermedad.toLowerCase().includes(condition.toLowerCase())
  );
}

// Determina el nivel de actividad física basado en la anamnesis
function determineActivityLevel(anamnesisData) {
  if (!anamnesisData.estiloVida || !anamnesisData.estiloVida.actividadFisica) {
    return 'No disponible';
  }

  const actividadData = anamnesisData.estiloVida.actividadFisica;

  // Si hay una categorización directa
  if (actividadData.nivel) {
    return actividadData.nivel;
  }

  // Si hay minutos por semana, categorizar
  if (actividadData.minutosSemana) {
    const minutos = Number(actividadData.minutosSemana);
    if (isNaN(minutos)) return 'No disponible';

    if (minutos < 60) return 'sedentario';
    if (minutos < 150) return 'ligero';
    if (minutos < 300) return 'moderado';
    return 'intenso';
  }

  // Si hay frecuencia, categorizar
  if (actividadData.frecuenciaSemanal) {
    const frecuencia = Number(actividadData.frecuenciaSemanal);
    if (isNaN(frecuencia)) return 'No disponible';

    if (frecuencia === 0) return 'sedentario';
    if (frecuencia <= 2) return 'ligero';
    if (frecuencia <= 4) return 'moderado';
    return 'intenso';
  }

  return 'No disponible';
}

// Genera una descripción de la dieta basada en los datos disponibles
function describeDiet(anamnesisData) {
  if (!anamnesisData.estiloVida || !anamnesisData.estiloVida.alimentacion) {
    return 'No disponible';
  }

  const alimentacion = anamnesisData.estiloVida.alimentacion;

  // Si hay una descripción ya formateada
  if (alimentacion.descripcion) {
    return alimentacion.descripcion;
  }

  let descripcion = '';

  // Construir descripción basada en componentes individuales
  if (alimentacion.consumoVerduras === 'alto') descripcion += 'Alto consumo de verduras. ';
  if (alimentacion.consumoFrutas === 'alto') descripcion += 'Alto consumo de frutas. ';
  if (alimentacion.consumoProcesados === 'alto') descripcion += 'Alto consumo de alimentos procesados. ';
  if (alimentacion.consumoAzucares === 'alto') descripcion += 'Alto consumo de azúcares. ';
  if (alimentacion.consumoGrasasSaturadas === 'alto') descripcion += 'Alto consumo de grasas saturadas. ';

  if (descripcion === '') return 'No especificada';
  return descripcion.trim();
}

// Extrae factores de riesgo en formato legacy a partir de datos nuevos
function extractLegacyFactors(riskAssessmentData) {
  if (!riskAssessmentData || !riskAssessmentData.factoresRiesgoIdentificados) {
    return [];
  }

  return riskAssessmentData.factoresRiesgoIdentificados.map(factor => {
    // Determinar el tipo basado en las condiciones asociadas o el nombre del factor
    let type = 'general';
    if (factor.condicionesAsociadas && factor.condicionesAsociadas.length > 0) {
      type = factor.condicionesAsociadas[0];
    } else if (factor.factor) {
      const factorText = factor.factor.toLowerCase();
      if (factorText.includes('cardio') || factorText.includes('corazón')) type = 'cardiovascular';
      else if (factorText.includes('diabetes') || factorText.includes('glucosa')) type = 'metabolic';
      else if (factorText.includes('presión') || factorText.includes('hipertensión')) type = 'cardiovascular';
      else if (factorText.includes('pulmonar') || factorText.includes('respiratorio')) type = 'respiratory';
      else if (factorText.includes('mental') || factorText.includes('estrés')) type = 'mental';
    }

    return {
      type,
      description: factor.factor,
      level: mapRiskLevelToLegacy(factor.nivelRiesgoFactor),
      recommendation: factor.descripcionImpacto || 'Se recomienda evaluación médica'
    };
  });
}

// Mapea los niveles de riesgo del nuevo formato al antiguo
function mapRiskLevelToLegacy(level) {
  if (!level) return 'moderate';

  const lowerLevel = level.toLowerCase();
  if (lowerLevel.includes('alto') || lowerLevel.includes('crítico') || lowerLevel.includes('high')) {
    return 'high';
  }
  if (lowerLevel.includes('moderado') || lowerLevel.includes('medio') || lowerLevel.includes('moderate')) {
    return 'moderate';
  }
  if (lowerLevel.includes('bajo') || lowerLevel.includes('low')) {
    return 'low';
  }

  return 'moderate'; // default
}

// Crea alertas para médicos cuando se detectan factores de alto riesgo
async function createHighRiskAlert(patientId, highRiskFactors) {
  try {
    // Obtener info básica del paciente
    const patientSnapshot = await admin.firestore()
      .collection('patients')
      .doc(patientId)
      .get();

    if (!patientSnapshot.exists) {
      console.error(`No se encontró el paciente con ID: ${patientId}`);
      return;
    }

    const patientData = patientSnapshot.data();

    // Crear una alerta en la colección de alertas médicas
    await admin.firestore().collection('physicianAlerts').add({
      patientId,
      patientName: `${patientData.nombre || ''} ${patientData.apellidos || ''}`,
      riskFactors: highRiskFactors,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'new',
      priority: 'high'
    });

    console.log(`Alerta creada para paciente ${patientId} con factores de riesgo altos`);
  } catch (error) {
    console.error('Error al crear alerta de alto riesgo:', error);
  }
}
