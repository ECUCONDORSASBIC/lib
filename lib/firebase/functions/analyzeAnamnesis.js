const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar la app si no está ya inicializada
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import the genkitService functions (require paths may need adjustment based on your deployment)
// Cuando implementes esto en Firebase Functions, asegúrate de tener las dependencias correctas
// y las rutas de importación adecuadas.
const { evaluateHealthRisks, generateTenYearPrediction } = require('../../../services/genkitService');

exports.analyzeAnamnesisData = functions.firestore
  .document('patients/{patientId}/medical/anamnesis')
  .onWrite(async (change, context) => {
    const { patientId } = context.params;
    const anamnesisData = change.after.data();

    // No procesar si se eliminó el documento
    if (!anamnesisData) return null;

    console.log(`Analizando datos de anamnesis para paciente: ${patientId}`);

    try {
      // Primero obtenemos datos básicos del paciente para complementar la anamnesis
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

      console.log(`Datos enriquecidos preparados para análisis de Genkit: ${JSON.stringify(enrichedPatientData)}`);

      // Usar Genkit para evaluación de riesgos
      const riskAssessmentData = await evaluateHealthRisks(enrichedPatientData);

      // Usar resultados de la evaluación para generar predicción a 10 años
      const tenYearPredictionData = await generateTenYearPrediction(enrichedPatientData, riskAssessmentData);

      console.log(`Evaluación de riesgos y predicción generadas exitosamente`);

      // Guardar los resultados en nuevo formato estructurado
      const riskAssessmentRef = admin.firestore()
        .collection(`patients/${patientId}/medical`)
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
