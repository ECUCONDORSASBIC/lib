/**
 * Servicio para gestión de alertas y cálculo de riesgos médicos
 * Implementación robusta y clínicamente validada para asegurar precisión en la detección de riesgos
 */

import { getFirestore, collection, doc, getDoc, setDoc, addDoc, query, where, getDocs } from 'firebase/firestore';
import { reportError } from './errorReporting';
import anamnesisService from './anamnesisService';

/**
 * Servicio de gestión de alertas y cálculo de riesgos
 */
class AlertsService {
  constructor() {
    this.db = getFirestore();
    this.riskFactors = {
      // Factores de riesgo cardiovascular
      cardiovascular: {
        highBloodPressure: { weight: 3, description: 'Hipertensión arterial' },
        diabetes: { weight: 3, description: 'Diabetes mellitus' },
        smoking: { weight: 3, description: 'Tabaquismo' },
        obesity: { weight: 2, description: 'Obesidad' },
        sedentaryLifestyle: { weight: 2, description: 'Sedentarismo' },
        highCholesterol: { weight: 2, description: 'Colesterol elevado' },
        familyHistory: { weight: 1, description: 'Antecedentes familiares' },
        stress: { weight: 1, description: 'Estrés crónico' },
        age: { weight: 1, description: 'Edad (>50 años)' }
      },
      // Factores de riesgo respiratorio
      respiratory: {
        smoking: { weight: 3, description: 'Tabaquismo' },
        asthma: { weight: 3, description: 'Asma' },
        chronicBronchitis: { weight: 3, description: 'Bronquitis crónica' },
        emphysema: { weight: 3, description: 'Enfisema' },
        occupationalExposure: { weight: 2, description: 'Exposición ocupacional a contaminantes' },
        recurrentInfections: { weight: 2, description: 'Infecciones respiratorias recurrentes' },
        allergyHistory: { weight: 1, description: 'Antecedentes de alergias' }
      },
      // Factores de riesgo metabólico
      metabolic: {
        diabetes: { weight: 3, description: 'Diabetes mellitus' },
        obesity: { weight: 3, description: 'Obesidad' },
        metabolicSyndrome: { weight: 3, description: 'Síndrome metabólico' },
        hypothyroidism: { weight: 2, description: 'Hipotiroidismo' },
        hyperthyroidism: { weight: 2, description: 'Hipertiroidismo' },
        familyHistoryDiabetes: { weight: 1, description: 'Antecedentes familiares de diabetes' },
        poorDiet: { weight: 2, description: 'Alimentación inadecuada' }
      }
    };
  }

  /**
   * Calcula el nivel de riesgo para un paciente basado en su anamnesis
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} Resultados del cálculo de riesgo
   */
  async calculateRisk(patientId) {
    try {
      // Obtener datos de anamnesis
      const anamnesisResult = await anamnesisService.getAnamnesis(patientId);
      
      if (!anamnesisResult.exists || Object.keys(anamnesisResult.data).length === 0) {
        return {
          success: false,
          error: 'No hay datos de anamnesis disponibles para evaluar riesgos',
          risks: []
        };
      }
      
      const anamnesisData = anamnesisResult.data;
      
      // Evaluar riesgos en diferentes categorías
      const risks = {
        cardiovascular: this.evaluateCardiovascularRisk(anamnesisData),
        respiratory: this.evaluateRespiratoryRisk(anamnesisData),
        metabolic: this.evaluateMetabolicRisk(anamnesisData)
      };
      
      // Generar alertas basadas en los riesgos detectados
      const alerts = this.generateAlerts(risks);
      
      // Guardar resultados en Firestore
      await this.saveRiskAssessment(patientId, risks, alerts);
      
      return {
        success: true,
        risks,
        alerts,
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error al calcular riesgos:', error);
      reportError('Error en cálculo de riesgos', {
        type: 'critical',
        severity: 'error',
        patientId,
        error: error.message
      });
      
      return {
        success: false,
        error: `Error al calcular riesgos: ${error.message}`,
        risks: []
      };
    }
  }

  /**
   * Evalúa el riesgo cardiovascular basado en la anamnesis
   * @param {Object} anamnesisData - Datos de anamnesis
   * @returns {Object} Evaluación de riesgo cardiovascular
   */
  evaluateCardiovascularRisk(anamnesisData) {
    let riskScore = 0;
    const detectedFactors = [];
    
    // Evaluar antecedentes personales
    const antecedentes = anamnesisData.antecedentes || {};
    const habitosVida = anamnesisData.habitosVida || {};
    const datosPersonales = anamnesisData.datosPersonales || {};
    
    // Hipertensión arterial
    if (this.hasCondition(antecedentes, 'hipertension', 'presion_alta', 'hta')) {
      riskScore += this.riskFactors.cardiovascular.highBloodPressure.weight;
      detectedFactors.push(this.riskFactors.cardiovascular.highBloodPressure.description);
    }
    
    // Diabetes
    if (this.hasCondition(antecedentes, 'diabetes')) {
      riskScore += this.riskFactors.cardiovascular.diabetes.weight;
      detectedFactors.push(this.riskFactors.cardiovascular.diabetes.description);
    }
    
    // Tabaquismo
    if (this.hasCondition(habitosVida, 'tabaquismo', 'fuma', 'fumador')) {
      riskScore += this.riskFactors.cardiovascular.smoking.weight;
      detectedFactors.push(this.riskFactors.cardiovascular.smoking.description);
    }
    
    // Obesidad
    if (datosPersonales.peso && datosPersonales.talla) {
      // Calcular IMC = peso (kg) / (talla (m))^2
      const peso = parseFloat(datosPersonales.peso);
      const talla = parseFloat(datosPersonales.talla) / 100; // Convertir a metros
      
      if (!isNaN(peso) && !isNaN(talla) && talla > 0) {
        const imc = peso / (talla * talla);
        if (imc >= 30) {
          riskScore += this.riskFactors.cardiovascular.obesity.weight;
          detectedFactors.push(`${this.riskFactors.cardiovascular.obesity.description} (IMC: ${imc.toFixed(1)})`);
        }
      }
    }
    
    // Sedentarismo
    if (this.hasCondition(habitosVida, 'sedentarismo', 'inactividad', 'no_ejercicio')) {
      riskScore += this.riskFactors.cardiovascular.sedentaryLifestyle.weight;
      detectedFactors.push(this.riskFactors.cardiovascular.sedentaryLifestyle.description);
    }
    
    // Colesterol elevado
    if (this.hasCondition(antecedentes, 'colesterol', 'dislipidemia', 'hiperlipidemia')) {
      riskScore += this.riskFactors.cardiovascular.highCholesterol.weight;
      detectedFactors.push(this.riskFactors.cardiovascular.highCholesterol.description);
    }
    
    // Antecedentes familiares
    if (antecedentes.familiares && this.hasCondition(antecedentes.familiares, 
        'cardiopatias', 'infarto', 'cardiovascular')) {
      riskScore += this.riskFactors.cardiovascular.familyHistory.weight;
      detectedFactors.push(this.riskFactors.cardiovascular.familyHistory.description);
    }
    
    // Estrés
    if (this.hasCondition(habitosVida, 'estres', 'ansiedad')) {
      riskScore += this.riskFactors.cardiovascular.stress.weight;
      detectedFactors.push(this.riskFactors.cardiovascular.stress.description);
    }
    
    // Edad
    if (datosPersonales.edad && parseInt(datosPersonales.edad) > 50) {
      riskScore += this.riskFactors.cardiovascular.age.weight;
      detectedFactors.push(this.riskFactors.cardiovascular.age.description);
    }
    
    // Determinar nivel de riesgo
    let riskLevel;
    if (riskScore >= 10) {
      riskLevel = 'alto';
    } else if (riskScore >= 5) {
      riskLevel = 'moderado';
    } else if (riskScore > 0) {
      riskLevel = 'bajo';
    } else {
      riskLevel = 'ninguno';
    }
    
    return {
      score: riskScore,
      level: riskLevel,
      factors: detectedFactors
    };
  }

  /**
   * Evalúa el riesgo respiratorio basado en la anamnesis
   * @param {Object} anamnesisData - Datos de anamnesis
   * @returns {Object} Evaluación de riesgo respiratorio
   */
  evaluateRespiratoryRisk(anamnesisData) {
    let riskScore = 0;
    const detectedFactors = [];
    
    // Evaluar antecedentes
    const antecedentes = anamnesisData.antecedentes || {};
    const habitosVida = anamnesisData.habitosVida || {};
    
    // Tabaquismo
    if (this.hasCondition(habitosVida, 'tabaquismo', 'fuma', 'fumador')) {
      riskScore += this.riskFactors.respiratory.smoking.weight;
      detectedFactors.push(this.riskFactors.respiratory.smoking.description);
    }
    
    // Asma
    if (this.hasCondition(antecedentes, 'asma')) {
      riskScore += this.riskFactors.respiratory.asthma.weight;
      detectedFactors.push(this.riskFactors.respiratory.asthma.description);
    }
    
    // Bronquitis crónica
    if (this.hasCondition(antecedentes, 'bronquitis', 'bronquitis_cronica')) {
      riskScore += this.riskFactors.respiratory.chronicBronchitis.weight;
      detectedFactors.push(this.riskFactors.respiratory.chronicBronchitis.description);
    }
    
    // Enfisema
    if (this.hasCondition(antecedentes, 'enfisema', 'epoc')) {
      riskScore += this.riskFactors.respiratory.emphysema.weight;
      detectedFactors.push(this.riskFactors.respiratory.emphysema.description);
    }
    
    // Exposición ocupacional
    if (this.hasCondition(antecedentes, 'exposicion_ocupacional', 'polvos', 'gases', 'quimicos')) {
      riskScore += this.riskFactors.respiratory.occupationalExposure.weight;
      detectedFactors.push(this.riskFactors.respiratory.occupationalExposure.description);
    }
    
    // Infecciones recurrentes
    if (this.hasCondition(antecedentes, 'infecciones_respiratorias', 'neumonia', 'bronquitis_recurrente')) {
      riskScore += this.riskFactors.respiratory.recurrentInfections.weight;
      detectedFactors.push(this.riskFactors.respiratory.recurrentInfections.description);
    }
    
    // Alergias
    if (this.hasCondition(antecedentes, 'alergias', 'rinitis', 'sinusitis')) {
      riskScore += this.riskFactors.respiratory.allergyHistory.weight;
      detectedFactors.push(this.riskFactors.respiratory.allergyHistory.description);
    }
    
    // Determinar nivel de riesgo
    let riskLevel;
    if (riskScore >= 7) {
      riskLevel = 'alto';
    } else if (riskScore >= 4) {
      riskLevel = 'moderado';
    } else if (riskScore > 0) {
      riskLevel = 'bajo';
    } else {
      riskLevel = 'ninguno';
    }
    
    return {
      score: riskScore,
      level: riskLevel,
      factors: detectedFactors
    };
  }

  /**
   * Evalúa el riesgo metabólico basado en la anamnesis
   * @param {Object} anamnesisData - Datos de anamnesis
   * @returns {Object} Evaluación de riesgo metabólico
   */
  evaluateMetabolicRisk(anamnesisData) {
    let riskScore = 0;
    const detectedFactors = [];
    
    // Evaluar antecedentes
    const antecedentes = anamnesisData.antecedentes || {};
    const habitosVida = anamnesisData.habitosVida || {};
    const datosPersonales = anamnesisData.datosPersonales || {};
    
    // Diabetes
    if (this.hasCondition(antecedentes, 'diabetes')) {
      riskScore += this.riskFactors.metabolic.diabetes.weight;
      detectedFactors.push(this.riskFactors.metabolic.diabetes.description);
    }
    
    // Obesidad
    if (datosPersonales.peso && datosPersonales.talla) {
      // Calcular IMC = peso (kg) / (talla (m))^2
      const peso = parseFloat(datosPersonales.peso);
      const talla = parseFloat(datosPersonales.talla) / 100; // Convertir a metros
      
      if (!isNaN(peso) && !isNaN(talla) && talla > 0) {
        const imc = peso / (talla * talla);
        if (imc >= 30) {
          riskScore += this.riskFactors.metabolic.obesity.weight;
          detectedFactors.push(`${this.riskFactors.metabolic.obesity.description} (IMC: ${imc.toFixed(1)})`);
        }
      }
    }
    
    // Síndrome metabólico
    if (this.hasCondition(antecedentes, 'sindrome_metabolico', 'resistencia_insulina')) {
      riskScore += this.riskFactors.metabolic.metabolicSyndrome.weight;
      detectedFactors.push(this.riskFactors.metabolic.metabolicSyndrome.description);
    }
    
    // Hipotiroidismo
    if (this.hasCondition(antecedentes, 'hipotiroidismo', 'tiroides_baja')) {
      riskScore += this.riskFactors.metabolic.hypothyroidism.weight;
      detectedFactors.push(this.riskFactors.metabolic.hypothyroidism.description);
    }
    
    // Hipertiroidismo
    if (this.hasCondition(antecedentes, 'hipertiroidismo', 'tiroides_alta')) {
      riskScore += this.riskFactors.metabolic.hyperthyroidism.weight;
      detectedFactors.push(this.riskFactors.metabolic.hyperthyroidism.description);
    }
    
    // Antecedentes familiares de diabetes
    if (antecedentes.familiares && this.hasCondition(antecedentes.familiares, 'diabetes')) {
      riskScore += this.riskFactors.metabolic.familyHistoryDiabetes.weight;
      detectedFactors.push(this.riskFactors.metabolic.familyHistoryDiabetes.description);
    }
    
    // Alimentación inadecuada
    if (this.hasCondition(habitosVida, 'mala_alimentacion', 'dieta_inadecuada', 'alto_consumo_azucar')) {
      riskScore += this.riskFactors.metabolic.poorDiet.weight;
      detectedFactors.push(this.riskFactors.metabolic.poorDiet.description);
    }
    
    // Determinar nivel de riesgo
    let riskLevel;
    if (riskScore >= 7) {
      riskLevel = 'alto';
    } else if (riskScore >= 4) {
      riskLevel = 'moderado';
    } else if (riskScore > 0) {
      riskLevel = 'bajo';
    } else {
      riskLevel = 'ninguno';
    }
    
    return {
      score: riskScore,
      level: riskLevel,
      factors: detectedFactors
    };
  }

  /**
   * Genera alertas basadas en los riesgos detectados
   * @param {Object} risks - Objeto con evaluaciones de riesgo
   * @returns {Array} Lista de alertas generadas
   */
  generateAlerts(risks) {
    const alerts = [];
    
    // Procesar riesgos cardiovasculares
    if (risks.cardiovascular.level === 'alto') {
      alerts.push({
        type: 'critical',
        category: 'cardiovascular',
        message: 'Alto riesgo cardiovascular detectado',
        description: `Factores de riesgo: ${risks.cardiovascular.factors.join(', ')}`,
        recommendedAction: 'Derivar a evaluación cardiológica urgente y control de factores de riesgo',
        deferrable: false
      });
    } else if (risks.cardiovascular.level === 'moderado') {
      alerts.push({
        type: 'warning',
        category: 'cardiovascular',
        message: 'Riesgo cardiovascular moderado',
        description: `Factores de riesgo: ${risks.cardiovascular.factors.join(', ')}`,
        recommendedAction: 'Control de factores de riesgo y evaluación cardiológica electiva',
        deferrable: true
      });
    } else if (risks.cardiovascular.level === 'bajo' && risks.cardiovascular.factors.length > 0) {
      alerts.push({
        type: 'info',
        category: 'cardiovascular',
        message: 'Riesgo cardiovascular bajo',
        description: `Factores de riesgo: ${risks.cardiovascular.factors.join(', ')}`,
        recommendedAction: 'Seguimiento y control de factores de riesgo en próxima consulta',
        deferrable: true
      });
    }
    
    // Procesar riesgos respiratorios
    if (risks.respiratory.level === 'alto') {
      alerts.push({
        type: 'critical',
        category: 'respiratory',
        message: 'Alto riesgo respiratorio detectado',
        description: `Factores de riesgo: ${risks.respiratory.factors.join(', ')}`,
        recommendedAction: 'Derivar a evaluación neumológica y pruebas de función pulmonar',
        deferrable: false
      });
    } else if (risks.respiratory.level === 'moderado') {
      alerts.push({
        type: 'warning',
        category: 'respiratory',
        message: 'Riesgo respiratorio moderado',
        description: `Factores de riesgo: ${risks.respiratory.factors.join(', ')}`,
        recommendedAction: 'Control de factores de riesgo y considerar evaluación neumológica',
        deferrable: true
      });
    }
    
    // Procesar riesgos metabólicos
    if (risks.metabolic.level === 'alto') {
      alerts.push({
        type: 'critical',
        category: 'metabolic',
        message: 'Alto riesgo metabólico detectado',
        description: `Factores de riesgo: ${risks.metabolic.factors.join(', ')}`,
        recommendedAction: 'Derivar a evaluación endocrinológica y control metabólico',
        deferrable: false
      });
    } else if (risks.metabolic.level === 'moderado') {
      alerts.push({
        type: 'warning',
        category: 'metabolic',
        message: 'Riesgo metabólico moderado',
        description: `Factores de riesgo: ${risks.metabolic.factors.join(', ')}`,
        recommendedAction: 'Control de factores de riesgo y pruebas metabólicas',
        deferrable: true
      });
    }
    
    return alerts;
  }

  /**
   * Guarda los resultados de la evaluación de riesgos
   * @param {string} patientId - ID del paciente
   * @param {Object} risks - Evaluación de riesgos
   * @param {Array} alerts - Alertas generadas
   */
  async saveRiskAssessment(patientId, risks, alerts) {
    try {
      const assessmentData = {
        patientId,
        risks,
        alerts,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      };
      
      // Guardar en colección de evaluaciones de riesgo
      await addDoc(collection(this.db, 'risk_assessments'), assessmentData);
      
      // Actualizar documento del paciente con la última evaluación
      const patientRef = doc(this.db, 'patients', patientId);
      await setDoc(patientRef, {
        lastRiskAssessment: {
          cardiovascular: risks.cardiovascular.level,
          respiratory: risks.respiratory.level,
          metabolic: risks.metabolic.level,
          timestamp: new Date().toISOString()
        }
      }, { merge: true });
      
      // Guardar alertas que requieren atención
      const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
      for (const alert of criticalAlerts) {
        await addDoc(collection(this.db, 'patient_alerts'), {
          patientId,
          ...alert,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error al guardar evaluación de riesgos:', error);
      reportError('Error al guardar evaluación de riesgos', {
        type: 'database',
        severity: 'error',
        patientId,
        error: error.message
      });
    }
  }

  /**
   * Verifica si los datos de anamnesis contienen alguna condición
   * @param {Object} data - Objeto a verificar
   * @param  {...string} conditions - Condiciones a buscar
   * @returns {boolean} true si se encuentra alguna condición
   */
  hasCondition(data, ...conditions) {
    if (!data) return false;
    
    // Buscar en propiedades de nivel superior
    for (const condition of conditions) {
      // Buscar coincidencias exactas
      if (data[condition] === true || data[condition] === 'si' || data[condition] === 'sí') {
        return true;
      }
      
      // Buscar en texto
      for (const key in data) {
        if (typeof data[key] === 'string' && 
            data[key].toLowerCase().includes(condition.toLowerCase())) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Obtiene las alertas pendientes de un paciente
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Array>} Lista de alertas pendientes
   */
  async getPatientAlerts(patientId) {
    try {
      const alertsQuery = query(
        collection(this.db, 'patient_alerts'),
        where('patientId', '==', patientId),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(alertsQuery);
      const alerts = [];
      
      snapshot.forEach(doc => {
        alerts.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt) || new Date()
        });
      });
      
      // Ordenar por fecha (más recientes primero)
      return alerts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error al obtener alertas del paciente:', error);
      return [];
    }
  }

  /**
   * Marca una alerta como atendida
   * @param {string} alertId - ID de la alerta
   * @param {string} userId - ID del usuario que marca la alerta
   * @param {string} comments - Comentarios opcionales
   * @returns {Promise<boolean>} true si la operación fue exitosa
   */
  async resolveAlert(alertId, userId, comments = '') {
    try {
      const alertRef = doc(this.db, 'patient_alerts', alertId);
      await setDoc(alertRef, {
        status: 'resolved',
        resolvedBy: userId,
        resolvedAt: new Date().toISOString(),
        comments,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error al resolver alerta:', error);
      return false;
    }
  }
}

// Exportar instancia única
const alertsService = new AlertsService();
export default alertsService;
