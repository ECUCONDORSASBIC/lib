'use client';
/**
 * Servicio para gestionar videollamadas
 */

import { db, serverTimestamp } from '@/lib/firebase/firebaseConfig';
import { addDoc, arrayUnion, collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import axios from 'axios';
import DailyIframe from '@daily-co/daily-js';

const COLLECTION_NAME = 'videoCalls';

/**
 * Obtiene el historial de videollamadas de un usuario
 * @param {string} userId - ID del usuario (paciente o médico)
 * @param {string} role - Rol del usuario ('patient' o 'doctor')
 * @returns {Promise<Array>} Lista de videollamadas
 */
export const getUserVideoCallHistory = async (userId, role) => {
  try {
    const fieldName = role === 'doctor' ? 'doctorId' : 'patientId';
    const videoCallsCollection = collection(db, COLLECTION_NAME);
    const q = query(
      videoCallsCollection,
      where(fieldName, "==", userId),
      orderBy("startTime", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al obtener historial de videollamadas:", error);
    throw error;
  }
};

/**
 * Crea un registro de videollamada
 * @param {Object} callData - Datos de la videollamada
 * @returns {Promise<string>} ID de la videollamada creada
 */
export const createVideoCallRecord = async (callData) => {
  try {
    const videoCallsCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(videoCallsCollection, {
      ...callData,
      startTime: callData.startTime || new Date(),
      status: callData.status || 'initiated',
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al crear registro de videollamada:", error);
    throw error;
  }
};

/**
 * Actualiza el estado de una videollamada
 * @param {string} callId - ID de la videollamada
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateVideoCallStatus = async (callId, updateData) => {
  try {
    const callRef = doc(db, COLLECTION_NAME, callId);
    await updateDoc(callRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error al actualizar estado de videollamada:", error);
    throw error;
  }
};

/**
 * Finaliza una videollamada
 * @param {string} callId - ID de la videollamada
 * @param {Object} endCallData - Datos de finalización
 * @returns {Promise<void>}
 */
export const endVideoCall = async (callId, endCallData = {}) => {
  try {
    const callRef = doc(db, COLLECTION_NAME, callId);
    await updateDoc(callRef, {
      endTime: new Date(),
      status: 'completed',
      duration: endCallData.duration,
      notes: endCallData.notes,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error al finalizar videollamada:", error);
    throw error;
  }
};

/**
 * Inicializa una conexión WebRTC y devuelve las streams
 * @returns {Promise<Object>} Objeto con streams local y remota
 */
export const initLocalStream = async () => {
  try {
    // Solicitar acceso a cámara y micrófono
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });

    // Crear una stream remota vacía que se llenará cuando el otro usuario se conecte
    const remoteStream = new MediaStream();

    return { localStream, remoteStream };
  } catch (error) {
    console.error("Error al inicializar stream local:", error);
    throw error;
  }
};

/**
 * Establece los manejadores de eventos para la videollamada
 * @param {Object} handlers - Funciones manejadoras de eventos
 */
export const setCallEventHandlers = (handlers) => {
  // En una implementación completa, aquí se configurarían todos los listeners
  // para los eventos de la videollamada (conexión, desconexión, etc.)
  console.log("Handlers configurados:", handlers);
  // Esta es una implementación simplificada para el MVP
};

/**
 * Responde a una llamada entrante
 * @param {string} callId - ID de la llamada a responder
 * @returns {Promise<Object>} Objeto con streams local y remota
 */
export const answerCall = async (callId) => {
  try {
    // Actualizar el estado de la llamada a 'conectado'
    await updateVideoCallStatus(callId, { status: 'connected' });

    // Inicializar streams
    const { localStream, remoteStream } = await initLocalStream();

    return { localStream, remoteStream };
  } catch (error) {
    console.error("Error al responder llamada:", error);
    throw error;
  }
};

/**
 * Service para gestionar sesiones de video para telemedicina
 * Utiliza Daily.co como proveedor de video
 */
class VideoCallService {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_DAILY_API_KEY;
    this.apiUrl = 'https://api.daily.co/v1';
    this.callInstance = null;
  }

  /**
   * Crea una nueva sala de videollamada para una consulta médica
   * @param {string} appointmentId - ID de la cita médica asociada
   * @param {string} doctorId - ID del médico
   * @param {string} patientId - ID del paciente
   * @returns {Promise<Object>} Datos de la sala creada
   */
  async createVideoRoom(appointmentId, doctorId, patientId) {
    try {
      // Crear sala en Daily.co
      const expirationTime = Math.floor(Date.now() / 1000) + 3600; // Expira en 1 hora

      const response = await axios.post(`${this.apiUrl}/rooms`, {
        name: `consultation-${appointmentId}`,
        properties: {
          exp: expirationTime,
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          eject_at_room_exp: true
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Guardar información de la sala en Firestore
      const videoSessionData = {
        appointmentId,
        doctorId,
        patientId,
        roomName: response.data.name,
        roomUrl: response.data.url,
        createdAt: serverTimestamp(),
        status: 'active',
        expiresAt: new Date(expirationTime * 1000).toISOString(),
        participants: [],
        events: [{
          type: 'room_created',
          timestamp: new Date().toISOString()
        }]
      };

      const docRef = await addDoc(collection(db, 'telemedicineRooms'), videoSessionData);

      // Actualizar la cita con la información de la videollamada
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        videoSession: {
          id: docRef.id,
          url: response.data.url,
          status: 'active'
        },
        updatedAt: serverTimestamp()
      });

      return {
        sessionId: docRef.id,
        roomName: response.data.name,
        roomUrl: response.data.url,
        expiresAt: new Date(expirationTime * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error creating video room:', error);
      throw new Error('Failed to create video room for telemedicine');
    }
  }

  /**
   * Inicializa la videollamada del lado del cliente
   * @param {string} roomUrl - URL de la sala de Daily.co
   * @param {HTMLElement} videoContainer - Contenedor HTML para el video
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Instancia de la videollamada
   */  async joinVideoCall(roomUrl, videoContainer, options = {}) {
    try {
      this.callInstance = DailyIframe.createFrame({
        url: roomUrl,
        showLeaveButton: true,
        iframeStyle: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px'
        },
        ...options
      });

      videoContainer.appendChild(this.callInstance.iframe);
      await this.callInstance.join();

      // Registrar entrada del participante
      const { user_id, user_name } = this.callInstance.participants().local;

      this._logParticipantEvent(options.sessionId, user_id, 'joined', {
        name: user_name || 'Unknown user'
      });

      // Configurar listeners para eventos importantes
      this._setupEventListeners(options.sessionId);

      return this.callInstance;
    } catch (error) {
      console.error('Error joining video call:', error);
      throw new Error('Failed to join video call');
    }
  }

  /**
   * Configura los listeners para eventos de la videollamada
   * @param {string} sessionId - ID de la sesión de telemedicina
   * @private
   */
  _setupEventListeners(sessionId) {
    if (!this.callInstance) return;

    // Evento cuando un participante se une
    this.callInstance.on('participant-joined', (event) => {
      const { participant } = event;
      this._logParticipantEvent(sessionId, participant.user_id, 'joined', {
        name: participant.user_name || 'Unknown user'
      });
    });

    // Evento cuando un participante se va
    this.callInstance.on('participant-left', (event) => {
      const { participant } = event;
      this._logParticipantEvent(sessionId, participant.user_id, 'left');
    });

    // Errores en la videollamada
    this.callInstance.on('error', (event) => {
      console.error('Video call error:', event);
      this._logEvent(sessionId, 'error', {
        error: event.errorMsg || 'Unknown error'
      });
    });
  }

  /**
   * Registra un evento de participante en la sesión de telemedicina
   * @param {string} sessionId - ID de la sesión
   * @param {string} participantId - ID del participante
   * @param {string} eventType - Tipo de evento (joined, left, etc)
   * @param {Object} metadata - Metadatos adicionales
   * @private
   */
  async _logParticipantEvent(sessionId, participantId, eventType, metadata = {}) {
    try {
      const sessionRef = doc(db, 'telemedicineRooms', sessionId);
      await updateDoc(sessionRef, {
        events: arrayUnion({
          type: `participant_${eventType}`,
          participantId,
          timestamp: new Date().toISOString(),
          ...metadata
        }),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error logging participant ${eventType} event:`, error);
    }
  }

  /**
   * Registra un evento general en la sesión de telemedicina
   * @param {string} sessionId - ID de la sesión
   * @param {string} eventType - Tipo de evento
   * @param {Object} metadata - Metadatos adicionales
   * @private
   */
  async _logEvent(sessionId, eventType, metadata = {}) {
    try {
      const sessionRef = doc(db, 'telemedicineRooms', sessionId);
      await updateDoc(sessionRef, {
        events: arrayUnion({
          type: eventType,
          timestamp: new Date().toISOString(),
          ...metadata
        }),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error logging ${eventType} event:`, error);
    }
  }

  /**
   * Finaliza la sesión de videollamada
   * @param {string} sessionId - ID de la sesión de telemedicina
   */
  async endVideoCall(sessionId) {
    try {
      if (this.callInstance) {
        await this.callInstance.leave();
        this.callInstance = null;
      }

      // Actualizar estado de la sesión en Firestore
      const sessionRef = doc(db, 'telemedicineRooms', sessionId);
      await updateDoc(sessionRef, {
        status: 'ended',
        endedAt: serverTimestamp(),
        events: arrayUnion({
          type: 'room_ended',
          timestamp: new Date().toISOString()
        }),
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error ending video call:', error);
      throw new Error('Failed to end video call');
    }
  }

  /**
   * Activa o desactiva el micrófono
   * @param {boolean} enabled - true para activar, false para desactivar
   * @returns {boolean} Nuevo estado del micrófono
   */
  toggleAudio(enabled) {
    if (!this.callInstance) return enabled;

    this.callInstance.setLocalAudio(enabled);
    return enabled;
  }

  /**
   * Activa o desactiva la cámara
   * @param {boolean} enabled - true para activar, false para desactivar
   * @returns {boolean} Nuevo estado de la cámara
   */
  toggleVideo(enabled) {
    if (!this.callInstance) return enabled;

    this.callInstance.setLocalVideo(enabled);
    return enabled;
  }

  /**
   * Comparte la pantalla
   * @returns {Promise<boolean>} true si se inició correctamente la compartición
   */
  async shareScreen() {
    if (!this.callInstance) return false;

    try {
      await this.callInstance.startScreenShare();
      return true;
    } catch (error) {
      console.error('Error sharing screen:', error);
      return false;
    }
  }

  /**
   * Detiene la compartición de pantalla
   * @returns {Promise<boolean>} true si se detuvo correctamente la compartición
   */
  async stopScreenShare() {
    if (!this.callInstance) return false;

    try {
      await this.callInstance.stopScreenShare();
      return true;
    } catch (error) {
      console.error('Error stopping screen share:', error);
      return false;
    }
  }
}

export const videoCallService = new VideoCallService();
