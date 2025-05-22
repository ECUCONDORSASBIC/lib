'use client';
/**
 * Servicio WebRTC para la funcionalidad de videollamadas (telemedicina)
 *
 * Este servicio maneja la conexión WebRTC entre médicos y pacientes, utilizando
 * Firebase como servidor de señalización para intercambiar ofertas y respuestas SDP
 * y candidatos ICE.
 */

import { db } from '@/lib/firebase/firebaseClient';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Configuración de WebRTC
const configuration = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    {
      urls: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com'
    }
  ],
  iceCandidatePoolSize: 10
};

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.callDoc = null;
    this.callId = null;
    this.localCandidatesCollection = null;
    this.remoteCandidatesCollection = null;
    this.callListener = null;

    this.callbacks = {
      onCallAnswered: () => { },
      onCallRejected: () => { },
      onCallEnded: () => { },
      onRemoteTrack: () => { },
      onConnected: () => { },
      onDisconnected: () => { }
    };
  }

  /**
   * Inicializa el stream local de audio y video
   */
  async initLocalStream() {
    try {
      // Crear stream remoto vacío para recibir tracks remotos posteriormente
      this.remoteStream = new MediaStream();

      // Obtener acceso a la cámara y micrófono del usuario
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      return {
        localStream: this.localStream,
        remoteStream: this.remoteStream
      };
    } catch (error) {
      console.error('Error al acceder a la cámara/micrófono:', error);
      throw new Error('No se pudo acceder a la cámara o micrófono. Verifique los permisos del navegador.');
    }
  }

  /**
   * Configura los callbacks para eventos de llamada
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Inicia una conexión WebRTC y crea una nueva llamada
   */
  async createCall(callerId, recipientId) {
    try {
      // Crear instancia de RTCPeerConnection
      this.setupPeerConnection();

      // Generar un ID único para la llamada
      const callId = uuidv4();
      this.callId = callId;

      // Crear el documento de la llamada en Firestore
      this.callDoc = doc(db, 'calls', callId);

      // Crear colecciones para los candidatos ICE
      this.localCandidatesCollection = collection(this.callDoc, 'callerCandidates');
      this.remoteCandidatesCollection = collection(this.callDoc, 'calleeCandidates');

      // Agregar los streams locales al peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Crear la oferta SDP
      const offerDescription = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offerDescription);

      // Guardar la oferta y los detalles de la llamada en Firestore

      await setDoc(this.callDoc, {
        callId,
        callerId,
        recipientId,
        offer: {
          type: offerDescription.type,
          sdp: offerDescription.sdp
        },
        status: 'calling', // calling, connected, ended, rejected
        startedAt: new Date(),
        updatedAt: new Date(),
        endedAt: null
      });

      // Escuchar cambios en el documento de la llamada
      this.startCallListener();
      
      // Iniciar escucha de candidatos ICE remotos
      this.startRemoteCandidatesListener();

      return callId;
    } catch (error) {
      console.error('Error al crear llamada:', error);
      this.cleanup();
      throw new Error('Error al crear la llamada. Inténtelo de nuevo.');
    }
  }

  /**
   * Responde a una llamada entrante
   */
  async answerCall(callId) {
    try {
      this.callId = callId;
      this.callDoc = doc(db, 'calls', callId);

      // Verificar que la llamada existe
      const callSnapshot = await getDoc(this.callDoc);
      if (!callSnapshot.exists()) {
        throw new Error('La llamada no existe');
      }

      const callData = callSnapshot.data();
      if (callData.status === 'ended' || callData.status === 'rejected') {
        throw new Error('La llamada ya ha finalizado');
      }

      // Crear instancia de RTCPeerConnection
      this.setupPeerConnection();

      // Configurar colecciones para los candidatos ICE
      this.localCandidatesCollection = collection(this.callDoc, 'calleeCandidates');
      this.remoteCandidatesCollection = collection(this.callDoc, 'callerCandidates');

      // Agregar los streams locales al peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Obtener la oferta SDP del documento de la llamada
      const offerDescription = callData.offer;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

      // Crear respuesta SDP
      const answerDescription = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answerDescription);

      // Actualizar el documento de la llamada con la respuesta SDP
      await updateDoc(this.callDoc, {
        answer: {
          type: answerDescription.type,
          sdp: answerDescription.sdp
        },
        status: 'connected',
        updatedAt: serverTimestamp()
      });

      // Escuchar cambios en el documento de la llamada
      this.startCallListener();
      
      // Iniciar escucha de candidatos ICE remotos
      this.startRemoteCandidatesListener();

      this.callbacks.onCallAnswered();
    } catch (error) {
      console.error('Error al responder llamada:', error);
      this.cleanup();
      throw new Error('Error al responder la llamada. Inténtelo de nuevo.');
    }
  }

  /**
   * Rechaza una llamada entrante
   */
  async rejectCall(callId) {
    try {
      const callDocRef = doc(db, 'calls', callId);
      await updateDoc(callDocRef, {
        status: 'rejected',
        updatedAt: serverTimestamp(),
        endedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al rechazar llamada:', error);
    }
  }

  /**
   * Finaliza la llamada actual
   */
  async hangUp() {
    try {
      if (this.callDoc) {
        // Actualizar el estado de la llamada
        await updateDoc(this.callDoc, {
          status: 'ended',
          updatedAt: serverTimestamp(),
          endedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error al finalizar llamada:', error);
    } finally {
      this.cleanup();
    }
  }

  /**
   * Configura la conexión RTCPeerConnection y sus eventos
   */
  setupPeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    // Crear nueva conexión con la configuración STUN/TURN
    this.peerConnection = new RTCPeerConnection(configuration);

    // Manejar candidatos ICE
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.localCandidatesCollection) {
        addDoc(this.localCandidatesCollection, event.candidate.toJSON());
      }
    };

    // Escuchar cambios de estado de conexión ICE
    this.peerConnection.oniceconnectionstatechange = () => {
      switch (this.peerConnection.iceConnectionState) {
        case 'connected':
        case 'completed':
          this.callbacks.onConnected();
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          this.callbacks.onDisconnected();
          break;
      }
    };

    // Manejar tracks remotos (video/audio del otro participante)
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track);
      });
      this.callbacks.onRemoteTrack();
    };
  }

  /**
   * Inicia el listener para el documento de la llamada
   */
  startCallListener() {
    if (this.callListener) {
      this.callListener();
    }

    // Escuchar cambios en el documento de la llamada
    this.callListener = onSnapshot(this.callDoc, async (snapshot) => {
      const data = snapshot.data();

      // Manejar cambios de estado
      if (data?.status === 'connected' && data?.answer) {
        // Cuando el destinatario responde a la llamada
        const answerDescription = data.answer;
        if (!this.peerConnection.currentRemoteDescription) {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerDescription));
          this.callbacks.onCallAnswered();
        }
      } else if (data?.status === 'rejected') {
        this.callbacks.onCallRejected();
        this.cleanup();
      } else if (data?.status === 'ended') {
        this.callbacks.onCallEnded();
        this.cleanup();
      }
    });
  }

  /**
   * Escuchar los candidatos ICE remotos
   */
  startRemoteCandidatesListener() {
    // Escuchar los candidatos ICE remotos
    onSnapshot(this.remoteCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Agregar candidato ICE remoto a la conexión
          try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
          } catch (error) {
            console.error('Error al agregar candidato ICE:', error);
          }
        }
      });
    });
  }

  /**
   * Limpia recursos y cierra conexiones
   */
  cleanup() {
    // Detener el listener de la llamada
    if (this.callListener) {
      this.callListener();
      this.callListener = null;
    }

    // Cerrar la conexión de pares
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Limpiar streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    this.callDoc = null;
    this.callId = null;
    this.localCandidatesCollection = null;
    this.remoteCandidatesCollection = null;
  }
}

// Exportar una instancia única del servicio
const webRTCService = new WebRTCService();
export default webRTCService;
