'use client';

import { useEffect, useRef, useState } from 'react';
import { MicrophoneIcon, MicrophoneSlashIcon, PhoneXMarkIcon, VideoCameraIcon, VideoCameraSlashIcon, ChatBubbleLeftIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { updateVideoCallStatus, endVideoCall } from '@/app/services/dailyVideoService';
import DailyIframe from '@daily-co/daily-js';

/**
 * Componente mejorado de videollamada utilizando Daily.co
 * Ofrece una interfaz simplificada para videollamadas médicas
 */
export default function DailyVideoCall({ callId, roomUrl, onCallEnded }) {
  const iframeRef = useRef(null);
  const [callFrame, setCallFrame] = useState(null);
  const [status, setStatus] = useState('loading');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [networkQuality, setNetworkQuality] = useState('good');
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);
  const router = useRouter();

  // Inicializar la videollamada con Daily.co
  useEffect(() => {
    initializeCall();

    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Inicializar la videollamada
  const initializeCall = async () => {
    try {
      // Configurar el iframe de Daily
      const dailyFrame = DailyIframe.createFrame({
        iframeStyle: {
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: 'black'
        },
        showLeaveButton: false,
        showFullscreenButton: true,
        showLocalVideo: true,
        dailyConfig: {
          experimentalChromeVideoMuteLightOff: true
        }
      });

      // Montar el iframe en el DOM
      if (iframeRef.current) {
        iframeRef.current.appendChild(dailyFrame.iframe);
      }

      // Configurar los eventos de videollamada
      dailyFrame
        .on('joining-meeting', () => {
          setStatus('connecting');
          updateCallStatus('connecting');
        })
        .on('joined-meeting', () => {
          setStatus('connected');
          updateCallStatus('active');
          startCallTimer();
        })
        .on('left-meeting', () => {
          setStatus('ended');
          clearCallTimer();
          if (onCallEnded) onCallEnded();
        })
        .on('error', (e) => {
          console.error('Error en Daily.co:', e);
          setStatus('error');
        })
        .on('participant-joined', () => {
          updateParticipantCount(dailyFrame);
        })
        .on('participant-left', () => {
          updateParticipantCount(dailyFrame);
        })
        .on('network-quality-change', (event) => {
          setNetworkQuality(event.quality);
        });

      // Unirse a la reunión
      await dailyFrame.join({ url: roomUrl });
      setCallFrame(dailyFrame);
    } catch (error) {
      console.error('Error al inicializar la videollamada:', error);
      setStatus('error');
    }
  };

  // Actualizar el recuento de participantes
  const updateParticipantCount = (frame) => {
    if (!frame) return;

    const participants = frame.participants();
    const count = Object.keys(participants).length;
    setParticipantCount(count);
  };

  // Actualizar el estado de la llamada en Firebase
  const updateCallStatus = async (status) => {
    if (!callId) return;

    try {
      await updateVideoCallStatus(callId, { status });
    } catch (error) {
      console.error('Error al actualizar estado de la llamada:', error);
    }
  };

  // Iniciar temporizador de duración de la llamada
  const startCallTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Limpiar temporizador
  const clearCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Finalizar la videollamada
  const handleEndCall = async () => {
    if (callFrame) {
      callFrame.leave();
    }

    try {
      await endVideoCall(callId, {
        duration: callDuration,
        endedBy: 'user'
      });

      clearCallTimer();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error al finalizar la videollamada:', error);
    }
  };

  // Alternar micrófono
  const toggleMicrophone = () => {
    if (!callFrame) return;

    const audioState = !isMicMuted;
    callFrame.setLocalAudio(audioState);
    setIsMicMuted(!audioState);
  };

  // Alternar video
  const toggleVideo = () => {
    if (!callFrame) return;

    const videoState = !isVideoOff;
    callFrame.setLocalVideo(videoState);
    setIsVideoOff(!videoState);
  };

  // Compartir pantalla
  const toggleScreenShare = () => {
    if (!callFrame) return;

    callFrame.startScreenShare();
  };

  // Alternar chat
  const toggleChat = () => {
    if (!callFrame) return;

    // Daily.co maneja el chat dentro de su interfaz
    callFrame.showChat();
  };

  // Formatear tiempo de duración
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mostrar calidad de red
  const renderNetworkQuality = () => {
    switch (networkQuality) {
      case 'good':
        return <span className="text-green-500 text-xs">Conexión buena</span>;
      case 'poor':
        return <span className="text-yellow-500 text-xs">Conexión limitada</span>;
      case 'bad':
        return <span className="text-red-500 text-xs">Conexión inestable</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Encabezado */}
      <div className="bg-white shadow-sm px-4 py-2 flex items-center justify-between z-10">
        <div>
          <h1 className="text-lg font-medium text-gray-800">Telemedicina</h1>
          {status === 'connected' && (
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">Duración: {formatTime(callDuration)}</p>
              <span className="mx-1">•</span>
              <p className="text-sm text-gray-500">Participantes: {participantCount}</p>
              <span className="mx-1">•</span>
              {renderNetworkQuality()}
            </div>
          )}
        </div>
        <div className="flex items-center">
          {status === 'loading' && <p className="text-sm text-gray-500">Inicializando...</p>}
          {status === 'connecting' && <p className="text-sm text-gray-500">Conectando...</p>}
          {status === 'error' && <p className="text-sm text-red-500">Error de conexión</p>}
        </div>
      </div>

      {/* Contenedor de video */}
      <div className="flex-1 relative">
        <div ref={iframeRef} className="absolute inset-0"></div>

        {/* Mensaje de estado */}
        {status !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-white text-center">
              {status === 'loading' && (
                <>
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Inicializando videollamada...</p>
                </>
              )}
              {status === 'connecting' && (
                <>
                  <div className="animate-pulse flex space-x-4 mb-4 justify-center">
                    <div className="rounded-full bg-blue-400 h-3 w-3"></div>
                    <div className="rounded-full bg-blue-400 h-3 w-3"></div>
                    <div className="rounded-full bg-blue-400 h-3 w-3"></div>
                  </div>
                  <p>Conectando con el participante...</p>
                </>
              )}
              {status === 'error' && (
                <>
                  <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>No se pudo establecer la conexión</p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-4 px-4 py-2 bg-white text-gray-800 rounded-md hover:bg-gray-200"
                  >
                    Volver al dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="bg-white px-4 py-3 flex justify-center space-x-4 z-10">
        <button
          onClick={toggleMicrophone}
          className={`p-3 rounded-full ${isMicMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200`}
          title={isMicMuted ? "Activar micrófono" : "Silenciar micrófono"}
        >
          {isMicMuted ? <MicrophoneSlashIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
          title="Finalizar llamada"
        >
          <PhoneXMarkIcon className="w-6 h-6" />
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200`}
          title={isVideoOff ? "Activar cámara" : "Desactivar cámara"}
        >
          {isVideoOff ? <VideoCameraSlashIcon className="w-6 h-6" /> : <VideoCameraIcon className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleScreenShare}
          className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          title="Compartir pantalla"
        >
          <ComputerDesktopIcon className="w-6 h-6" />
        </button>

        <button
          onClick={toggleChat}
          className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          title="Abrir chat"
        >
          <ChatBubbleLeftIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
