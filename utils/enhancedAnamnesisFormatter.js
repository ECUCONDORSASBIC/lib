/**
 * @file Herramienta mejorada para garantizar consistencia e integridad en datos de anamnesis
 * 
 * Esta implementación reforzada garantiza:
 * - Persistencia confiable en cada paso del proceso de anamnesis
 * - Sincronización segura entre clientes
 * - Verificación estructural para evitar errores en datos clínicos
 * - Soporte para ediciones concurrentes sin conflictos ni pérdida de datos
 */

import anamnesisService from '@/lib/anamnesisService';
import alertsService from '@/lib/alertsService';
import { reportError } from '@/lib/errorReporting';

// Importar utilidades base desde el formateador original
import { 
  isEmpty, 
  cleanObject, 
  generateUniqueId, 
  createSectionMetadata 
} from './anamnesisFormatter';

/**
 * Clase para gestión optimizada de anamnesis con garantías de integridad
 */
class EnhancedAnamnesisFormatter {
  constructor() {
    // Definición de secciones y sus campos obligatorios
    this.sectionDefinitions = {
      'datos-personales': {
        requiredFields: ['nombre_completo', 'fecha_nacimiento'],
        optionalFields: ['sexo', 'email', 'telefono', 'direccion', 'ocupacion'],
        maxWeight: 100
      },
      'motivo-consulta': {
        requiredFields: ['motivo_principal'],
        optionalFields: ['primera_historia_clinica', 'preocupacion_principal', 'inicio_sintomas'],
        maxWeight: 100
      },
      'historia-enfermedad': {
        requiredFields: ['tiene_sintomas_actuales'],
        optionalFields: ['sintomas_principales', 'fecha_inicio', 'evolucion', 'factores_agravantes'],
        maxWeight: 150
      },
      'antecedentes-personales': {
        requiredFields: [],
        optionalFields: ['alergias', 'cirugias_previas', 'enfermedades_previas', 'medicamentos_actuales'],
        maxWeight: 200
      },
      'antecedentes-familiares': {
        requiredFields: [],
        optionalFields: ['diabetes_familiar', 'hipertension_familiar', 'cancer_familiar'],
        maxWeight: 100
      },
      'habitos': {
        requiredFields: [],
        optionalFields: ['tabaco', 'alcohol', 'ejercicio', 'drogas', 'alimentacion'],
        maxWeight: 100
      }
    };
  }

  /**
   * Prepara los datos de anamnesis para su guardado, asegurando integridad
   * 
   * @param {Object} formData - Datos brutos del formulario de anamnesis
   * @param {string} patientId - ID del paciente
   * @param {Object} userData - Información del usuario que realiza el guardado
   * @returns {Object} Datos formateados y listos para guardar
   */
  async prepareAnamnesisData(formData, patientId, userData) {
    try {
      // Obtener anamnesis existente para actualización parcial
      const existingAnamnesis = await anamnesisService.getAnamnesis(patientId);
      
      // Estructurar los datos por secciones
      const structuredData = this.structureDataBySections(formData);
      
      // Limpiar datos para eliminar campos vacíos o nulos
      const cleanedData = this.cleanAndValidateData(structuredData);
      
      // Calcular porcentajes de compleción
      const completionStats = this.calculateCompletionStats(cleanedData);
      
      // Verificar integridad de datos críticos
      this.validateCriticalData(cleanedData);
      
      // Generar términos de búsqueda
      const searchTerms = this.generateSearchTerms(cleanedData);
      
      // Estructura final con metadatos
      const formattedData = {
        ...cleanedData,
        _meta: {
          timestamp: new Date().toISOString(),
          lastUpdatedBy: userData.uid,
          version: existingAnamnesis.exists ? 
            ((existingAnamnesis.meta?.version || 0) + 1) : 1,
          completion: completionStats,
          searchTerms,
        }
      };
      
      return formattedData;
    } catch (error) {
      console.error('Error al preparar datos de anamnesis:', error);
      reportError('Error al preparar datos de anamnesis', {
        type: 'critical',
        patientId,
        error: error.message
      });
      throw new Error(`Error al preparar anamnesis: ${error.message}`);
    }
  }

  /**
   * Estructura los datos del formulario por secciones lógicas
   * 
   * @param {Object} formData - Datos brutos del formulario
   * @returns {Object} Datos estructurados por secciones
   */
  structureDataBySections(formData) {
    // Inicializar las secciones del resultado
    const result = Object.keys(this.sectionDefinitions).reduce((acc, sectionId) => {
      acc[sectionId] = {
        _meta: createSectionMetadata(sectionId),
        data: {}
      };
      return acc;
    }, {});
    
    // Asignar cada campo a su sección correspondiente
    Object.entries(formData).forEach(([fieldName, value]) => {
      // Identificar a qué sección pertenece el campo
      const sectionId = this.identifySectionForField(fieldName);
      
      if (sectionId && result[sectionId]) {
        result[sectionId].data[fieldName] = value;
      } else {
        // Si no pertenece a ninguna sección específica, lo ponemos en una sección "otros"
        if (!result.otros) {
          result.otros = {
            _meta: createSectionMetadata('otros'),
            data: {}
          };
        }
        result.otros.data[fieldName] = value;
      }
    });
    
    return result;
  }

  /**
   * Identifica a qué sección pertenece un campo
   * 
   * @param {string} fieldName - Nombre del campo
   * @returns {string|null} ID de la sección o null si no se puede identificar
   */
  identifySectionForField(fieldName) {
    // Mapeamos patrones de nombres de campo a secciones
    const fieldPatterns = {
      'datos-personales': [
        /nombre/, /apellido/, /nacimiento/, /edad/, /sexo/, /genero/, 
        /email/, /correo/, /telefono/, /contacto/, /direccion/, /domicilio/
      ],
      'motivo-consulta': [
        /motivo/, /consulta/, /problema/, /preocupa/, /razon/, /queja/
      ],
      'historia-enfermedad': [
        /sintoma/, /dolor/, /malestar/, /inicio/, /evolucion/, /agrava/, 
        /mejora/, /tratamiento/
      ],
      'antecedentes-personales': [
        /alergia/, /cirugia/, /operacion/, /enfermedad/, /medicamento/,
        /diagnostico/, /tratamiento/, /previo/
      ],
      'antecedentes-familiares': [
        /familiar/, /padre/, /madre/, /hermano/, /abuelo/, /tio/, /pariente/
      ],
      'habitos': [
        /tabaco/, /fuma/, /alcohol/, /bebida/, /ejercicio/, /deporte/, 
        /droga/, /dieta/, /alimentacion/, /sueno/, /dormir/
      ]
    };
    
    // Buscar coincidencia en los patrones
    for (const [sectionId, patterns] of Object.entries(fieldPatterns)) {
      if (patterns.some(pattern => pattern.test(fieldName.toLowerCase()))) {
        return sectionId;
      }
    }
    
    return null;
  }

  /**
   * Limpia y valida los datos estructurados
   * 
   * @param {Object} structuredData - Datos estructurados por secciones
   * @returns {Object} Datos limpios y validados
   */
  cleanAndValidateData(structuredData) {
    const cleanedData = {};
    
    Object.entries(structuredData).forEach(([sectionId, section]) => {
      // Limpiar la sección de datos vacíos
      const cleanedSection = {
        ...section,
        data: cleanObject(section.data)
      };
      
      // Solo incluir la sección si tiene datos
      if (Object.keys(cleanedSection.data).length > 0) {
        cleanedData[sectionId] = cleanedSection;
      }
    });
    
    return cleanedData;
  }

  /**
   * Valida campos críticos y lanza error si faltan datos obligatorios
   * 
   * @param {Object} data - Datos de anamnesis
   * @throws {Error} Si faltan datos críticos
   */
  validateCriticalData(data) {
    const criticalErrors = [];
    
    // Validar datos críticos por sección
    Object.entries(this.sectionDefinitions).forEach(([sectionId, definition]) => {
      if (data[sectionId] && definition.requiredFields.length > 0) {
        const sectionData = data[sectionId].data;
        
        definition.requiredFields.forEach(field => {
          if (isEmpty(sectionData[field])) {
            criticalErrors.push(`Campo obligatorio '${field}' no completado en la sección '${sectionId}'`);
          }
        });
      }
    });
    
    if (criticalErrors.length > 0) {
      throw new Error(`Validación fallida: ${criticalErrors.join(', ')}`);
    }
  }

  /**
   * Calcula estadísticas de compleción de la anamnesis por sección
   * 
   * @param {Object} data - Datos de anamnesis estructurados
   * @returns {Object} Estadísticas de compleción
   */
  calculateCompletionStats(data) {
    const stats = {
      total: 0,
      bySection: {}
    };
    
    let totalWeight = 0;
    let totalScore = 0;
    
    // Calcular compleción por sección
    Object.entries(this.sectionDefinitions).forEach(([sectionId, definition]) => {
      const sectionWeight = definition.maxWeight;
      totalWeight += sectionWeight;
      
      if (data[sectionId]) {
        const sectionData = data[sectionId].data;
        const allFields = [...definition.requiredFields, ...definition.optionalFields];
        let fieldsComplete = 0;
        
        allFields.forEach(field => {
          if (!isEmpty(sectionData[field])) {
            fieldsComplete++;
          }
        });
        
        const sectionScore = Math.min(100, Math.round((fieldsComplete / allFields.length) * 100));
        stats.bySection[sectionId] = sectionScore;
        
        // Contribución ponderada a la puntuación total
        totalScore += (sectionScore * sectionWeight) / 100;
      } else {
        stats.bySection[sectionId] = 0;
      }
    });
    
    // Calcular puntuación total ponderada
    stats.total = Math.round(totalScore / (totalWeight / 100));
    
    return stats;
  }

  /**
   * Genera términos de búsqueda basados en los datos de anamnesis
   * 
   * @param {Object} data - Datos de anamnesis estructurados
   * @returns {Array} Términos de búsqueda
   */
  generateSearchTerms(data) {
    const searchTerms = new Set();
    
    // Recorremos todas las secciones buscando términos significativos
    Object.values(data).forEach(section => {
      const sectionData = section.data;
      
      Object.entries(sectionData).forEach(([fieldName, value]) => {
        // Solo procesar campos de texto
        if (typeof value === 'string') {
          // Extraer términos significativos (palabras de 3+ caracteres)
          value.toLowerCase()
            .split(/\s+/)
            .filter(term => term.length > 3)
            .forEach(term => searchTerms.add(term));
        }
      });
    });
    
    return Array.from(searchTerms);
  }

  /**
   * Guarda la anamnesis con verificación de integridad y bloqueo concurrente
   * 
   * @param {Object} formData - Datos del formulario de anamnesis
   * @param {string} patientId - ID del paciente
   * @param {Object} userData - Información del usuario que realiza el guardado
   * @returns {Promise<Object>} Resultado de la operación
   */
  async saveAnamnesis(formData, patientId, userData) {
    try {
      // Preparar datos para guardar
      const preparedData = await this.prepareAnamnesisData(formData, patientId, userData);
      
      // Guardar utilizando el servicio anamnesisService que maneja bloqueos y concurrencia
      const result = await anamnesisService.saveAnamnesis(patientId, preparedData, userData);
      
      if (result.success) {
        // Calcular riesgos basados en los nuevos datos
        const riskResult = await alertsService.calculateRisk(patientId);
        
        return {
          success: true,
          data: preparedData,
          risks: riskResult.success ? riskResult.risks : null,
          alerts: riskResult.success ? riskResult.alerts : []
        };
      } else {
        return result; // Propagar error desde el servicio
      }
    } catch (error) {
      console.error('Error al guardar anamnesis:', error);
      reportError('Error al guardar anamnesis desde el formateador', {
        type: 'database',
        severity: 'critical',
        patientId,
        error: error.message
      });
      
      return {
        success: false,
        error: `Error al guardar anamnesis: ${error.message}`
      };
    }
  }

  /**
   * Guarda una sección específica de la anamnesis
   * 
   * @param {string} patientId - ID del paciente
   * @param {string} sectionId - ID de la sección
   * @param {Object} sectionData - Datos de la sección
   * @param {Object} userData - Información del usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  async saveAnamnesisSection(patientId, sectionId, sectionData, userData) {
    try {
      // Limpiar datos de la sección
      const cleanedData = cleanObject(sectionData);
      
      // Crear metadata para la sección
      const sectionWithMeta = {
        _meta: createSectionMetadata(sectionId),
        data: cleanedData
      };
      
      // Guardar utilizando el servicio que maneja bloqueos
      const result = await anamnesisService.updateAnamnesisSection(
        patientId, 
        sectionId, 
        sectionWithMeta, 
        userData
      );
      
      return result;
    } catch (error) {
      console.error(`Error al guardar sección ${sectionId} de anamnesis:`, error);
      reportError(`Error al guardar sección ${sectionId} de anamnesis`, {
        type: 'database',
        severity: 'error',
        patientId,
        sectionId,
        error: error.message
      });
      
      return {
        success: false,
        error: `Error al guardar sección: ${error.message}`
      };
    }
  }
}

// Exportar instancia única
const enhancedFormatter = new EnhancedAnamnesisFormatter();
export default enhancedFormatter;
