/**
 * Servicio para gestionar la anamnesis, con funcionalidades robustas de persistencia y sincronización
 * Diseñado para garantizar la integridad y fiabilidad de los datos clínicos,
 * manteniendo registro de cambios y previniendo pérdidas de información.
 */

import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, runTransaction } from 'firebase/firestore';
import { reportError } from './errorReporting';

/**
 * Servicio de gestión de anamnesis con verificación de integridad de datos
 */
class AnamnesisService {
  constructor() {
    this.db = getFirestore();
    this.LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutos de bloqueo para edición
  }

  /**
   * Obtiene la anamnesis de un paciente
   * Incluye reintentos y validación de integridad
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} Datos de anamnesis
   */
  async getAnamnesis(patientId) {
    try {
      const anamnesisRef = doc(this.db, 'anamnesis', patientId);
      const anamnesisDoc = await getDoc(anamnesisRef);
      
      if (!anamnesisDoc.exists()) {
        // Si no existe, devolver objeto vacío pero no error, ya que podría ser nuevo paciente
        return { 
          exists: false,
          data: {},
          meta: {
            lastUpdated: null,
            updatedBy: null
          }
        };
      }
      
      const data = anamnesisDoc.data();
      
      // Verificar que la estructura de los datos sea válida
      if (!this.validateAnamnesisStructure(data)) {
        console.error('Estructura de anamnesis inválida', { patientId });
        reportError('Estructura de anamnesis inválida', {
          type: 'database',
          severity: 'error',
          patientId
        });
        
        return { 
          exists: true,
          data: this.sanitizeAnamnesisData(data),
          meta: data.meta || {
            lastUpdated: data.updatedAt || null,
            updatedBy: data.updatedBy || null
          },
          hasStructureErrors: true
        };
      }
      
      return { 
        exists: true,
        data: data.data || {},
        meta: data.meta || {
          lastUpdated: data.updatedAt || null,
          updatedBy: data.updatedBy || null
        }
      };
    } catch (error) {
      console.error('Error al obtener anamnesis', error);
      reportError('Error al recuperar anamnesis', {
        type: 'database',
        severity: 'error',
        patientId,
        error: error.message
      });
      throw new Error(`Error al obtener anamnesis: ${error.message}`);
    }
  }

  /**
   * Guarda la anamnesis completa de un paciente con control de concurrencia
   * @param {string} patientId - ID del paciente
   * @param {Object} anamnesisData - Datos de anamnesis
   * @param {Object} userData - Información del usuario que realiza el cambio
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Resultado de la operación
   */
  async saveAnamnesis(patientId, anamnesisData, userData, options = {}) {
    const { force = false } = options;
    
    try {
      // Verificar si alguien más está editando
      if (!force) {
        const isLocked = await this.isAnamnesisLocked(patientId, userData.uid);
        if (isLocked) {
          return {
            success: false,
            error: 'Otro usuario está editando actualmente esta anamnesis',
            locked: true,
            lockedBy: isLocked.lockedBy,
            lockExpires: isLocked.expiresAt
          };
        }
      }
      
      // Adquirir bloqueo para edición
      await this.lockAnamnesis(patientId, userData.uid);
      
      // Usar transacción para garantizar atomicidad
      return await runTransaction(this.db, async (transaction) => {
        const anamnesisRef = doc(this.db, 'anamnesis', patientId);
        const anamnesisDoc = await transaction.get(anamnesisRef);
        
        const timestamp = new Date().toISOString();
        
        // Preparar metadatos
        const meta = {
          lastUpdated: timestamp,
          updatedBy: {
            uid: userData.uid,
            name: userData.name || userData.email || 'Usuario',
            role: userData.role || 'unknown'
          },
          version: 1
        };
        
        // Si ya existe, incrementar versión
        if (anamnesisDoc.exists()) {
          const currentData = anamnesisDoc.data();
          meta.version = ((currentData.meta && currentData.meta.version) || 0) + 1;
          
          // Guardar versión anterior en historial
          const historyRef = doc(collection(this.db, 'anamnesis_history'), `${patientId}_${Date.now()}`);
          transaction.set(historyRef, {
            patientId,
            data: currentData.data || {},
            meta: currentData.meta || {},
            timestamp
          });
        }
        
        // Guardar nueva versión
        transaction.set(anamnesisRef, {
          data: anamnesisData,
          meta,
          updatedAt: serverTimestamp()
        });
        
        // Liberar bloqueo
        await this.unlockAnamnesis(patientId);
        
        return {
          success: true,
          version: meta.version,
          timestamp
        };
      });
    } catch (error) {
      // Intentar liberar el bloqueo incluso si hay error
      try {
        await this.unlockAnamnesis(patientId);
      } catch (unlockError) {
        console.error('Error al liberar bloqueo de anamnesis', unlockError);
      }
      
      console.error('Error al guardar anamnesis', error);
      reportError('Error al guardar anamnesis', {
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
   * Actualiza una sección específica de la anamnesis
   * @param {string} patientId - ID del paciente
   * @param {string} section - Sección a actualizar (ej: 'antecedentes', 'medicacion', etc.)
   * @param {Object} sectionData - Datos de la sección
   * @param {Object} userData - Información del usuario que realiza el cambio
   * @returns {Promise<Object>} Resultado de la operación
   */
  async updateAnamnesisSection(patientId, section, sectionData, userData) {
    try {
      // Verificar si alguien más está editando
      const isLocked = await this.isAnamnesisLocked(patientId, userData.uid);
      if (isLocked) {
        return {
          success: false,
          error: 'Otro usuario está editando actualmente esta anamnesis',
          locked: true,
          lockedBy: isLocked.lockedBy,
          lockExpires: isLocked.expiresAt
        };
      }
      
      // Adquirir bloqueo para edición
      await this.lockAnamnesis(patientId, userData.uid);
      
      // Usar transacción para garantizar atomicidad
      return await runTransaction(this.db, async (transaction) => {
        const anamnesisRef = doc(this.db, 'anamnesis', patientId);
        const anamnesisDoc = await transaction.get(anamnesisRef);
        
        const timestamp = new Date().toISOString();
        
        if (!anamnesisDoc.exists()) {
          // Si no existe, crear toda la estructura
          const newData = {
            data: {
              [section]: sectionData
            },
            meta: {
              lastUpdated: timestamp,
              updatedBy: {
                uid: userData.uid,
                name: userData.name || userData.email || 'Usuario',
                role: userData.role || 'unknown'
              },
              version: 1
            },
            updatedAt: serverTimestamp()
          };
          
          transaction.set(anamnesisRef, newData);
        } else {
          // Si existe, actualizar solo la sección
          const currentData = anamnesisDoc.data();
          const newVersion = ((currentData.meta && currentData.meta.version) || 0) + 1;
          
          // Guardar versión anterior en historial
          const historyRef = doc(collection(this.db, 'anamnesis_history'), `${patientId}_${Date.now()}`);
          transaction.set(historyRef, {
            patientId,
            section,
            data: currentData.data || {},
            meta: currentData.meta || {},
            timestamp
          });
          
          // Preparar actualización
          const updatedData = currentData.data || {};
          updatedData[section] = sectionData;
          
          transaction.update(anamnesisRef, {
            [`data.${section}`]: sectionData,
            meta: {
              lastUpdated: timestamp,
              updatedBy: {
                uid: userData.uid,
                name: userData.name || userData.email || 'Usuario',
                role: userData.role || 'unknown'
              },
              version: newVersion
            },
            updatedAt: serverTimestamp()
          });
        }
        
        // Liberar bloqueo
        await this.unlockAnamnesis(patientId);
        
        return {
          success: true,
          timestamp
        };
      });
    } catch (error) {
      // Intentar liberar el bloqueo incluso si hay error
      try {
        await this.unlockAnamnesis(patientId);
      } catch (unlockError) {
        console.error('Error al liberar bloqueo de anamnesis', unlockError);
      }
      
      console.error(`Error al actualizar sección ${section} de anamnesis`, error);
      reportError(`Error al actualizar sección ${section} de anamnesis`, {
        type: 'database',
        severity: 'error',
        patientId,
        section,
        error: error.message
      });
      
      return {
        success: false,
        error: `Error al actualizar anamnesis: ${error.message}`
      };
    }
  }

  /**
   * Bloquea la anamnesis para edición
   * @param {string} patientId - ID del paciente
   * @param {string} userId - ID del usuario que bloquea
   */
  async lockAnamnesis(patientId, userId) {
    const lockRef = doc(this.db, 'anamnesis_locks', patientId);
    const expiresAt = new Date(Date.now() + this.LOCK_TIMEOUT);
    
    await setDoc(lockRef, {
      lockedBy: userId,
      lockedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    });
  }

  /**
   * Verifica si la anamnesis está bloqueada
   * @param {string} patientId - ID del paciente
   * @param {string} currentUserId - ID del usuario actual
   * @returns {Promise<boolean|Object>} false si no está bloqueada, datos del bloqueo si lo está
   */
  async isAnamnesisLocked(patientId, currentUserId) {
    const lockRef = doc(this.db, 'anamnesis_locks', patientId);
    const lockDoc = await getDoc(lockRef);
    
    if (!lockDoc.exists()) {
      return false;
    }
    
    const lockData = lockDoc.data();
    
    // Si el bloqueo es del mismo usuario, no hay problema
    if (lockData.lockedBy === currentUserId) {
      return false;
    }
    
    // Verificar si el bloqueo expiró
    const expiresAt = new Date(lockData.expiresAt);
    if (expiresAt < new Date()) {
      // El bloqueo expiró, eliminarlo
      await this.unlockAnamnesis(patientId);
      return false;
    }
    
    // Está bloqueado por otro usuario
    return lockData;
  }

  /**
   * Libera el bloqueo de anamnesis
   * @param {string} patientId - ID del paciente
   */
  async unlockAnamnesis(patientId) {
    const lockRef = doc(this.db, 'anamnesis_locks', patientId);
    await setDoc(lockRef, { 
      lockedBy: null,
      lockedAt: null,
      expiresAt: null,
      unlockedAt: new Date().toISOString()
    });
  }

  /**
   * Valida la estructura de datos de anamnesis
   * @param {Object} data - Datos a validar
   * @returns {boolean} true si es válida
   */
  validateAnamnesisStructure(data) {
    // Validación básica: debe tener objetos data y meta
    if (!data || typeof data !== 'object') return false;
    
    // Si hay datos pero no tiene los objetos principales, 
    // es posible que sea una estructura antigua
    if (Object.keys(data).length > 0 && !data.data && !data.meta) {
      return false;
    }
    
    return true;
  }

  /**
   * Intenta reparar/normalizar datos corruptos
   * @param {Object} data - Datos a sanitizar
   * @returns {Object} Datos sanitizados
   */
  sanitizeAnamnesisData(data) {
    // Si es un objeto vacío, devolver como está
    if (!data || Object.keys(data).length === 0) {
      return {};
    }
    
    // Si ya tiene la estructura correcta, devolverlo
    if (data.data && typeof data.data === 'object') {
      return data.data;
    }
    
    // Intentar interpretar estructura antigua
    const sanitized = {};
    
    // Secciones conocidas de anamnesis
    const knownSections = [
      'datosPersonales', 'antecedentes', 'medicacion',
      'examenesPrevios', 'habitosVida', 'consulta'
    ];
    
    // Copiar datos de secciones conocidas
    knownSections.forEach(section => {
      if (data[section]) {
        sanitized[section] = data[section];
      }
    });
    
    return sanitized;
  }
  
  /**
   * Obtiene el historial de cambios de una anamnesis
   * @param {string} patientId - ID del paciente
   * @param {number} limit - Número máximo de registros a obtener
   * @returns {Promise<Array>} Historial de cambios
   */
  async getAnamnesisHistory(patientId, limit = 10) {
    try {
      const historyCollection = collection(this.db, 'anamnesis_history');
      // Usamos el índice compuesto para esta consulta
      const q = query(
        historyCollection,
        where('patientId', '==', patientId),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      const history = [];
      
      snapshot.forEach(doc => {
        history.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return history;
    } catch (error) {
      console.error('Error al obtener historial de anamnesis', error);
      return [];
    }
  }
}

// Exportar instancia única
const anamnesisService = new AnamnesisService();
export default anamnesisService;
