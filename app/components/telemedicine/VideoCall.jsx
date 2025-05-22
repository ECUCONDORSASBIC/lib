'use client';

import { useState, useEffect, useRef } from 'react';
import { listenToSignalingMessages, sendSignalingMessage } from '@/app/services/telemedicineService';

const VideoCall = ({ 
  sessionId, 
  userId, 
  userName, 
  userRole, 
  onError, 
  onConnectionStateChange 
}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const signalingUnsubscribeRef = useRef(null);
  
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ];
  
  const handleError = (error) => {
    console.error('VideoCall error:', error);
    if (onError) onError(error);
  };

  // Gestionar cambios en el estado de conexión
  const handleConnectionStateChange = (state) => {
    setConnectionState(state);
    if (onConnectionStateChange) onConnectionStateChange(state);
  };

  // Configurar WebRTC
  useEffect(() => {
    let unsubscribe;
    
    const setupWebRTC = async () => {
      try {
        // Obtener acceso a la cámara y micrófono del usuario
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Crear conexión peer
        const peerConnection = new RTCPeerConnection({ iceServers });
        peerConnectionRef.current = peerConnection;
        
        // Añadir tracks al peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
        
        // Escuchar ICE candidates
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            sendSignalingMessage(sessionId, {
              type: 'ice-candidate',
              candidate: event.candidate,
              from: userId,
              role: userRole
            });
          }
        };
        
        // Cambios en el estado de conexión
        peerConnection.onconnectionstatechange = () => {
          handleConnectionStateChange(peerConnection.connectionState);
        };
        
        // Manejar streams remotos
        peerConnection.ontrack = event => {
          const [remoteStream] = event.streams;
          setRemoteStream(remoteStream);
          
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        };
        
        // Escuchar mensajes de señalización
        unsubscribe = listenToSignalingMessages(sessionId, async (message) => {
          // Ignorar mensajes propios
          if (message.from === userId) return;
          
          try {
            if (message.type === 'offer') {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
              
              const answer = await peerConnection.createAnswer();
              await peerConnection.setLocalDescription(answer);
              
              sendSignalingMessage(sessionId, {
                type: 'answer',
                answer,
                from: userId,
                role: userRole
              });
            }
            
            else if (message.type === 'answer') {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
            }
            
            else if (message.type === 'ice-candidate') {
              await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
          } catch (error) {
            handleError(error);
          }
        });
        
        // Si el usuario es un doctor, enviar la oferta inicial
        if (userRole === 'doctor') {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          sendSignalingMessage(sessionId, {
            type: 'offer',
            offer,
            from: userId,
            role: userRole
          });
        }
        
        signalingUnsubscribeRef.current = unsubscribe;
      } catch (error) {
        handleError(error);
      }
    };
    
    setupWebRTC();
    
    return () => {
      // Limpieza
      if (signalingUnsubscribeRef.current) {
        signalingUnsubscribeRef.current();
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [sessionId, userId, userRole]);
  
  // Funciones para controlar la llamada
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };
  
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };
  
  return (
    <div className="relative">
      {/* Pantalla completa para el video remoto */}
      <div className="relative w-full h-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <div className="animate-pulse mb-3">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Esperando a que se conecte el otro participante...</p>
              <p className="text-sm text-gray-400 mt-2">Estado: {connectionState}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Video local (pequeño, esquina) */}
      <div className="absolute top-3 right-3 w-1/4 max-w-[180px] aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        {localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Controles de la llamada */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-800 bg-opacity-70 px-6 py-3 rounded-full">
        <button
          onClick={toggleMute}
          className={`rounded-full p-3 ${isMuted ? 'bg-red-500' : 'bg-blue-500'} text-white transition-colors`}
          title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`rounded-full p-3 ${isVideoOff ? 'bg-red-500' : 'bg-blue-500'} text-white transition-colors`}
          title={isVideoOff ? "Activar cámara" : "Apagar cámara"}
        >
          {isVideoOff ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Indicador de estado de conexión */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-opacity-70">
        {connectionState === 'connected' && (
          <span className="flex items-center text-green-500">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Conectado
          </span>
        )}
        {connectionState === 'connecting' && (
          <span className="flex items-center text-yellow-500">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></span>
            Conectando...
          </span>
        )}
        {connectionState === 'disconnected' && (
          <span className="flex items-center text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            Desconectado
          </span>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
