'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { reportError } from '@/lib/errorReporting';
import dailyService from '@/lib/dailyService';
import { useTranslation } from '@/app/i18n';

// Componentes
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import ErrorAlert from '@/app/components/common/ErrorAlert';
import RealtimeChat from '@/app/components/chat/RealtimeChat';

// Iconos
import { 
  MdVideocam, MdVideocamOff, 
  MdMic, MdMicOff, 
  MdScreenShare, MdStopScreenShare,
  MdCallEnd, MdChat, MdPeople
} from 'react-icons/md';

/**
 * Componente de videoconsulta mejorado con Daily.co
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.sessionId - ID de la sesión de telemedicina
 * @param {Object} props.user - Objeto con información del usuario
 * @param {Object} props.patient - Objeto con información del paciente (si el usuario es médico)
 * @param {Object} props.doctor - Objeto con información del médico (si el usuario es paciente)
 */
const VideoConsultation = ({ sessionId, user, patient, doctor }) => {
  // i18n setup
  const { t } = useTranslation('telemedicine');
  // Referencias y estado para Daily call
  const videoContainerRef = useRef(null);
  const callRef = useRef(null);
  const [callState, setCallState] = useState('disconnected'); // disconnected, connecting, connected
  const [participants, setParticipants] = useState([]);
  const [localVideo, setLocalVideo] = useState(true);
  const [localAudio, setLocalAudio] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [networkQuality, setNetworkQuality] = useState('good');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);
  
  const router = useRouter();
  const db = getFirestore();

  // Determinar si el usuario es médico o paciente
  const isDoctor = user?.role === 'medico';
  const otherParticipant = isDoctor ? patient : doctor;

  // Carga inicial y configuración de la sala
  useEffect(() => {
    const setupCall = async () => {
      try {
        setLoading(true);
        
        // Obtener información de la sesión desde Firestore
        const sessionRef = doc(db, 'telemedicine_sessions', sessionId);
        const sessionDoc = await getDoc(sessionRef);
        
        if (!sessionDoc.exists()) {
          setError(t('videoConsultation.errorMessages.sessionNotFound'));
          setLoading(false);
          return;
        }
        
        const sessionData = sessionDoc.data();
        
        // Si la sesión ya tiene una sala creada
        if (sessionData.roomName && sessionData.roomUrl) {
          setRoomInfo({
            roomName: sessionData.roomName,
            roomUrl: sessionData.roomUrl
          });
        } else {
          // Si somos el médico y no hay sala, crearla
          if (isDoctor) {
            try {
              // Crear room en Daily
              const roomOptions = {
                name: `consultation-${sessionId}`,
                privacy: 'private',
                properties: {
                  start_audio_off: false,
                  start_video_off: false,
                  enable_chat: true,
                  enable_knocking: true,
                  enable_screenshare: true,
                  exp: Math.floor(Date.now()/1000) + 3600, // 1 hora
                  eject_at_room_exp: true
                }
              };
              
              const room = await dailyService.createRoom(roomOptions);
              
              // Guardar la información de la sala en Firestore
              await updateDoc(sessionRef, {
                roomName: room.name,
                roomUrl: room.url,
                updatedAt: serverTimestamp()
              });
              
              setRoomInfo({
                roomName: room.name,
                roomUrl: room.url
              });
              
              // Registrar en la actividad
              await addDoc(collection(db, 'telemedicine_sessions', sessionId, 'activity'), {
                type: 'room_created',
                timestamp: serverTimestamp(),
                user: user.uid,
                metadata: { roomName: room.name }
              });
              
            } catch (roomError) {
              console.error('Error al crear sala:', roomError);
              reportError('Error al crear sala de videollamada', {
                type: 'telemedicine',
                sessionId,
                error: roomError.message
              });
              setError('Error al crear la sala de videollamada');
            }
          } else {
            // Si somos el paciente y no hay sala, mostrar mensaje de espera
            setError('El médico aún no ha iniciado la consulta. Por favor, espera un momento.');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al configurar videollamada:', err);
        reportError('Error al configurar videollamada', {
          type: 'telemedicine',
          sessionId,
          error: err.message
        });
        setError('Error al configurar la videollamada');
        setLoading(false);
      }
    };
    
    setupCall();
    
    // Limpieza al desmontar
    return () => {
      if (callRef.current) {
        callRef.current.leave();
        callRef.current = null;
      }
    };
  }, [db, sessionId, user, isDoctor, t]);

  // Iniciar la videollamada cuando tengamos la información de la sala
  useEffect(() => {
    if (!roomInfo || !videoContainerRef.current || callRef.current) return;
    
    const joinCall = async () => {
      try {
        setCallState('connecting');
        
        // Registrar actividad de inicio de llamada
        await addDoc(collection(db, 'telemedicine_sessions', sessionId, 'activity'), {
          type: 'call_joining',
          timestamp: serverTimestamp(),
          user: user.uid
        });
        
        // Inicializar Daily iframe
        callRef.current = DailyIframe.createFrame(videoContainerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '8px',
          },
          showLeaveButton: false,
          showFullscreenButton: true,
          userName: user?.name || user?.email,
        });
        
        // Configurar event listeners
        callRef.current.on('joined-meeting', handleJoinedMeeting);
        callRef.current.on('left-meeting', handleLeftMeeting);
        callRef.current.on('participant-joined', handleParticipantUpdate);
        callRef.current.on('participant-left', handleParticipantUpdate);
        callRef.current.on('participant-updated', handleParticipantUpdate);
        callRef.current.on('error', handleCallError);
        callRef.current.on('network-quality-change', handleNetworkQuality);
        
        // Unirse a la llamada
        await callRef.current.join({ url: roomInfo.roomUrl });
      } catch (err) {
        console.error('Error al unirse a la videollamada:', err);
        reportError('Error al unirse a la videollamada', {
          type: 'telemedicine',
          sessionId,
          roomName: roomInfo.roomName,
          error: err.message
        });
        setError('Error al unirse a la videollamada: ' + err.message);
        setCallState('disconnected');
      }
    };
    
    joinCall();
  }, [roomInfo, db, sessionId, user, patient, doctor, t, handleJoinedMeeting, handleLeftMeeting, handleParticipantJoined, handleParticipantLeft, handleParticipantUpdated, handleNetworkQualityChange, handleCallError]);

  // Handlers para eventos de Daily
  const handleJoinedMeeting = useCallback(async () => {
    setCallState('connected');
    
    // Registrar actividad de conexión exitosa
    await addDoc(collection(db, 'telemedicine_sessions', sessionId, 'activity'), {
      type: 'call_joined',
      timestamp: serverTimestamp(),
      user: user.uid
    });
    
    // Actualizar estado de la sesión en Firestore
    const sessionRef = doc(db, 'telemedicine_sessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'in_progress',
      lastActivity: serverTimestamp()
    });
    
    toast.success('Te has unido a la videollamada');
  }, [db, sessionId, user]);

  const handleLeftMeeting = useCallback(async () => {
    setCallState('disconnected');
    
    // Registrar actividad
    await addDoc(collection(db, 'telemedicine_sessions', sessionId, 'activity'), {
      type: 'call_left',
      timestamp: serverTimestamp(),
      user: user.uid
    });
    
    toast.info('Has salido de la videollamada');
  }, [db, sessionId, user]);

  const handleParticipantUpdate = useCallback(() => {
    if (!callRef.current) return;
    
    // Actualizar lista de participantes
    const participants = callRef.current.participants();
    const participantsArray = Object.values(participants);
    setParticipants(participantsArray);
  }, []);

  const handleCallError = useCallback((error) => {
    console.error('Error en la videollamada:', error);
    reportError('Error en la videollamada', {
      type: 'telemedicine',
      sessionId,
      error: error.errorMsg || error.message
    });
    
    toast.error(`Error en la videollamada: ${error.errorMsg}`);
  }, [sessionId]);

  const handleNetworkQuality = useCallback((quality) => {
    // quality es un valor entre 0 y 1, donde 1 es la mejor calidad
    if (quality > 0.7) {
      setNetworkQuality('good');
    } else if (quality > 0.4) {
      setNetworkQuality('fair');
    } else {
      setNetworkQuality('poor');
      toast.warn('La calidad de tu conexión es baja, esto puede afectar la videollamada');
    }
  }, []);

  // Controles de la videollamada
  const toggleVideo = useCallback(() => {
    if (!callRef.current) return;
    
    if (localVideo) {
      callRef.current.setLocalVideo(false);
    } else {
      callRef.current.setLocalVideo(true);
    }
    
    setLocalVideo(!localVideo);
  }, [localVideo]);

  const toggleAudio = useCallback(() => {
    if (!callRef.current) return;
    
    if (localAudio) {
      callRef.current.setLocalAudio(false);
    } else {
      callRef.current.setLocalAudio(true);
    }
    
    setLocalAudio(!localAudio);
  }, [localAudio]);

  const toggleScreenShare = useCallback(async () => {
    if (!callRef.current) return;
    
    try {
      if (isScreenSharing) {
        await callRef.current.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        await callRef.current.startScreenShare();
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error('Error al compartir pantalla:', err);
      toast.error('Error al compartir pantalla: ' + err.message);
    }
  }, [isScreenSharing]);

  const endCall = useCallback(async () => {
    if (!callRef.current) return;
    
    try {
      // Registrar actividad
      await addDoc(collection(db, 'telemedicine_sessions', sessionId, 'activity'), {
        type: 'call_ended',
        timestamp: serverTimestamp(),
        user: user.uid
      });
      
      // Si somos el médico, actualizar el estado de la sesión
      if (isDoctor) {
        const sessionRef = doc(db, 'telemedicine_sessions', sessionId);
        await updateDoc(sessionRef, {
          status: 'completed',
          endedAt: serverTimestamp(),
          lastActivity: serverTimestamp()
        });
      }
      
      // Salir de la llamada
      callRef.current.leave();
      
      // Redireccionar
      if (isDoctor) {
        router.push(`/dashboard/medico/pacientes/${patient.id}`);
      } else {
        router.push('/dashboard/paciente');
      }
    } catch (err) {
      console.error('Error al finalizar la llamada:', err);
      toast.error(t('videoConsultation.errorMessages.endCallFailed', 'Error al finalizar la llamada'));
    }
  }, [callRef, db, sessionId, user, isDoctor, patient, router, t]);

  // Renderizado condicional
  if (loading) {
    return (
      <div className="text-center py-20">
        <LoadingSpinner />
        <h3 className="mt-3 text-lg font-medium text-gray-700">{t('videoConsultation.waitingForParticipants')}</h3>
        <div className="flex justify-center items-center mt-2">
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-2 rounded">
            <span className="text-sm">{t('videoConsultation.experimentalWarning')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <ErrorAlert message={error} />
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          {t('videoConsultation.goBack')}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Banner experimental en la parte superior */}
      {(callState === 'disconnected' || callState === 'connecting') && (
        <div className="bg-yellow-50 border-b border-yellow-100 p-2 flex justify-center items-center">
          <span className="text-yellow-800 text-sm">
            <strong>{t('videoConsultation.experimental')}:</strong> {t('videoConsultation.experimentalWarning')}
          </span>
        </div>
      )}
      
      {/* Cabecera con información de la llamada */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center">
        <h2 className="text-lg font-medium text-gray-800">{t('videoConsultation.title')} {isDoctor ? `con ${patient?.name || 'Paciente'}` : `con Dr. ${doctor?.name || 'Médico'}`}</h2>
        <div className="flex items-center mt-2">
          <div 
            className={`w-2 h-2 rounded-full mr-2 ${
              callState === 'connected' ? 'bg-green-500' : 
              callState === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {callState === 'connected' ? t('videoConsultation.connected') : 
             callState === 'connecting' ? t('videoConsultation.connecting') : t('videoConsultation.disconnected')}
          </span>
          
          {callState === 'connected' && (
            <div className="ml-4 flex items-center">
              <span 
                className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  networkQuality === 'good' ? 'bg-green-500' : 
                  networkQuality === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
              />
              <span className="text-xs text-gray-500">
                {t('videoConsultation.networkQuality.label')}: {
                  networkQuality === 'good' ? t('videoConsultation.networkQuality.good') : 
                  networkQuality === 'fair' ? t('videoConsultation.networkQuality.fair') : t('videoConsultation.networkQuality.poor')
                }
              </span>
            </div>
          )}
          
          {/* Banner de funcionalidad experimental */}
          <div className="ml-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-1 px-2 rounded flex items-center">
            <span className="text-xs font-medium">{t('videoConsultation.experimental')}</span>
          </div>
          {/* Número de participantes (si está conectado o hay cambios) */}
          {(callState === 'connected' || callState === 'participant-joined' || callState === 'participant-left') && (
            <div className="ml-4 flex items-center">
              <MdPeople className="text-gray-600 mr-1" />
              <span className="text-sm text-gray-600">
                {participants.filter(p => !p.local).length + 1} {t('videoConsultation.participants')}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        <div className={`lg:col-span-${showChat ? '2' : '3'} relative bg-gray-800 rounded-lg overflow-hidden h-full`}>
          {/* Contenedor del video */}
          <div ref={videoContainerRef} className="absolute inset-0" />
          
          {/* Controles de video flotantes */}
          {callState === 'connected' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 bg-opacity-75 rounded-full p-2 space-x-2 z-10">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${localVideo ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                aria-label={localVideo ? t('videoConsultation.toggleVideo.on') : t('videoConsultation.toggleVideo.off')}
                title={localVideo ? t('videoConsultation.toggleVideo.on') : t('videoConsultation.toggleVideo.off')}
              >
                {localVideo ? <MdVideocam className="text-white text-lg" /> : <MdVideocamOff className="text-white text-lg" />}
              </button>
              
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${localAudio ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
                aria-label={localAudio ? t('videoConsultation.toggleAudio.on') : t('videoConsultation.toggleAudio.off')}
                title={localAudio ? t('videoConsultation.toggleAudio.on') : t('videoConsultation.toggleAudio.off')}
              >
                {localAudio ? <MdMic className="text-white text-lg" /> : <MdMicOff className="text-white text-lg" />}
              </button>
              
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full ${isScreenSharing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                aria-label={isScreenSharing ? t('videoConsultation.toggleScreen.on') : t('videoConsultation.toggleScreen.off')}
                title={isScreenSharing ? t('videoConsultation.toggleScreen.on') : t('videoConsultation.toggleScreen.off')}
              >
                {isScreenSharing ? <MdStopScreenShare className="text-white text-lg" /> : <MdScreenShare className="text-white text-lg" />}
              </button>
              
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-full ${showChat ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                aria-label={showChat ? t('videoConsultation.toggleChat.on') : t('videoConsultation.toggleChat.off')}
                title={showChat ? t('videoConsultation.toggleChat.on') : t('videoConsultation.toggleChat.off')}
              >
                <MdChat className="text-white text-lg" />
              </button>
              
              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700"
                aria-label={t('videoConsultation.endCall')}
                title={t('videoConsultation.endCall')}
              >
                <MdCallEnd className="text-white text-lg" />
              </button>
            </div>
          )}
        </div>
        
        {showChat && (
          <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden h-full">
            <RealtimeChat 
              sessionId={sessionId} 
              user={user}
              receiver={otherParticipant}
            />
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default VideoConsultation;
