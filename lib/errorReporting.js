import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/firebaseClient';
import { getApp } from 'firebase/app';

/**
 * Servicio para registrar errores desde el cliente
 * Puede utilizar tanto Cloud Functions como Firestore directamente
 * 
 * @class ErrorReportingService
 * @description Servicio que centraliza la gestión de errores de la aplicación,
 * proporcionando múltiples métodos para reportar diferentes tipos de errores.
 * Soporta envío a Cloud Functions para procesamiento y alertas, o
 * almacenamiento directo en Firestore como respaldo.
 */
export default class ErrorReportingService {
  /**
   * Crea una instancia del servicio de reporte de errores
   * @constructor
   */
  constructor() {
    this.db = db;
    this.functions = getFunctions(getApp());
    this.logErrorFunction = httpsCallable(this.functions, 'logError');
    this.errorQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Registra un error usando una Cloud Function
   * Esto es útil cuando necesitamos que el error sea procesado por el servidor
   * o queremos asegurarnos de que se envíen notificaciones.
   * 
   * @param {Object} errorData - Datos del error a reportar
   * @param {string} errorData.message - Mensaje de error
   * @param {string} [errorData.type='general'] - Tipo de error
   * @param {string} [errorData.severity='error'] - Severidad del error
   * @param {string} [errorData.location] - Ubicación donde ocurrió el error
   * @param {string} [errorData.stack] - Stack trace del error
   * @param {Object} [errorData.metadata] - Datos adicionales sobre el error
   * @returns {Promise<Object>} Resultado de la operación
   */
  async reportErrorViaFunction(errorData) {
    try {
      const result = await this.logErrorFunction({
        message: errorData.message,
        type: errorData.type || 'general',
        severity: errorData.severity || 'error',
        location: errorData.location || (typeof window !== 'undefined' ? window.location.href : 'server'),
        stack: errorData.stack,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        metadata: errorData.metadata || {},
        timestamp: new Date().toISOString()
      });

      return result.data;
    } catch (error) {
      console.error('Error al reportar error vía Cloud Function:', error);

      // Si falla la Cloud Function, intentamos guardar directamente en Firestore
      return this.reportErrorViaFirestore(errorData);
    }
  }

  /**
   * Registra un error directamente en Firestore
   * Se usa como fallback si falla la Cloud Function o para errores no críticos
   * donde no queremos invocar una función
   * 
   * @param {Object} errorData - Datos del error a reportar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async reportErrorViaFirestore(errorData) {
    try {
      const errorRef = await addDoc(collection(this.db, 'system_errors'), {
        message: errorData.message,
        type: errorData.type || 'general',
        severity: errorData.severity || 'error',
        timestamp: serverTimestamp(),
        location: errorData.location || (typeof window !== 'undefined' ? window.location.href : 'server'),
        stack: errorData.stack,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        metadata: errorData.metadata || {},
        processed: false
      });

      return { success: true, errorId: errorRef.id };
    } catch (error) {
      console.error('Error al guardar error en Firestore:', error);

      // Añadir a la cola para reintentar más tarde
      this.addToErrorQueue(errorData);

      return { success: false, error: error.message };
    }
  }

  /**
   * Añade un error a la cola para reintentar su envío más tarde
   * 
   * @private
   * @param {Object} errorData - Datos del error
   */
  addToErrorQueue(errorData) {
    this.errorQueue.push({
      data: errorData,
      attempts: 0,
      timestamp: new Date().getTime()
    });

    // Si no estamos procesando la cola, comenzamos
    if (!this.isProcessingQueue) {
      this.processErrorQueue();
    }
  }

  /**
   * Procesa la cola de errores pendientes
   * 
   * @private
   */
  async processErrorQueue() {
    if (this.errorQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;

    // Procesamos hasta 3 errores a la vez
    const batchSize = Math.min(3, this.errorQueue.length);
    const batch = this.errorQueue.splice(0, batchSize);

    for (const item of batch) {
      if (item.attempts >= 3) {
        console.error('Máximo de intentos alcanzado para error:', item.data.message);
        continue;
      }

      try {
        await this.reportErrorViaFirestore(item.data);
      } catch (error) {
        // Si falla, lo devolvemos a la cola con un intento más
        item.attempts++;
        this.errorQueue.push(item);
      }
    }

    // Si quedan errores, seguimos procesando después de un tiempo
    if (this.errorQueue.length > 0) {
      setTimeout(() => this.processErrorQueue(), 5000);
    } else {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Registra un error crítico que requiere notificación inmediata
   * 
   * @param {string} message - Mensaje de error
   * @param {Object} [metadata={}] - Datos adicionales
   * @returns {Promise<Object>} Resultado de la operación
   */
  async reportCriticalError(message, metadata = {}) {
    return this.reportErrorViaFunction({
      message,
      type: 'critical',
      severity: 'critical',
      metadata
    });
  }

  /**
   * Registra un error de autenticación
   */
  async reportAuthError(message, metadata = {}) {
    return this.reportErrorViaFunction({
      message,
      type: 'auth',
      severity: 'error',
      metadata
    });
  }

  /**
   * Registra un error de base de datos
   */
  async reportDatabaseError(message, metadata = {}) {
    return this.reportErrorViaFunction({
      message,
      type: 'database',
      severity: 'error',
      metadata
    });
  }

  /**
   * Registra un error de API
   */
  async reportApiError(message, metadata = {}) {
    return this.reportErrorViaFunction({
      message,
      type: 'api',
      severity: 'error',
      metadata
    });
  }

  /**
   * Registra un error de telemedicina (video o chat)
   */
  async reportTelemedicineError(message, metadata = {}) {
    return this.reportErrorViaFunction({
      message,
      type: 'telemedicine',
      severity: 'error',
      metadata
    });
  }

  /**
   * Configura manejadores globales de errores no capturados
   */
  setupGlobalErrorHandlers() {
    // Capturar errores no manejados
    window.addEventListener('error', (event) => {
      this.reportErrorViaFunction({
        message: event.message || 'Error no manejado',
        stack: event.error?.stack,
        type: 'uncaught',
        severity: 'error'
      });
    });

    // Capturar promesas rechazadas no manejadas
    window.addEventListener('unhandledrejection', (event) => {
      this.reportErrorViaFunction({
        message: event.reason?.message || 'Promesa rechazada no manejada',
        stack: event.reason?.stack,
        type: 'unhandledrejection',
        severity: 'error'
      });
    });

    console.log('Manejadores globales de errores configurados');
  }
}

// Singleton para usar en toda la aplicación
let instance = null;

export const getErrorReportingService = () => {
  if (!instance) {
    instance = new ErrorReportingService();
  }
  return instance;
};

// Función de utilidad para reportar errores desde cualquier parte de la app
export const reportError = async (message, options = {}) => {
  const service = getErrorReportingService();
  return service.reportErrorViaFunction({
    message,
    ...options
  });
};
