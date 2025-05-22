import { MicrophoneIcon } from '@heroicons/react/24/outline';
import { PhoneXMarkIcon } from '@heroicons/react/24/outline';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
// Crear componentes personalizados para los iconos que faltan
const MicrophoneSlashIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 15h.008v.008H9.75V15Zm.375 0h.008v.008h-.008V15Zm-.375.375h.008v.008H9.75v-.008Zm.375 0h.008v.008h-.008v-.008Z" />
  </svg>
);

const VideoCameraSlashIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
  </svg>
);
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { db } from '../../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import webRTCService from '../services/webrtcService';

const VideoCall = ({ callId, recipientId, recipientName, onClose }) => {
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('initializing'); // initializing, connecting, connected, ended, error
  const [error, setError] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [callDetails, setCallDetails] = useState(null);
  const [callTimer, setCallTimer] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);

  // On component load
  useEffect(() => {
    const setupCall = async () => {
      try {
        setStatus('initializing');

        // Get call details if callId is provided
        if (callId) {
          const callDoc = await getDoc(doc(db, 'calls', callId));
          if (callDoc.exists()) {
            setCallDetails(callDoc.data());
          } else {
            throw new Error('Llamada no encontrada');
          }
        }

        // Initialize with both video and audio
        const { localStream, remoteStream } = await webRTCService.initLocalStream();

        setLocalStream(localStream);
        setRemoteStream(remoteStream);

        // Set up WebRTC callbacks
        webRTCService.setCallbacks({
          onCallAnswered: () => {
            setStatus('connected');
            startCallTimer();
          },
          onCallRejected: () => {
            setStatus('ended');
            setError('Llamada rechazada');
          },
          onCallEnded: () => {
            setStatus('ended');
            clearCallTimer();
          },
          onRemoteTrack: () => {
            setStatus('connected');
            startCallTimer();
          },
          onConnected: () => setStatus('connected'),
          onDisconnected: () => {
            setStatus('ended');
            clearCallTimer();
          }
        });

        // If existing callId provided, answer the call
        if (callId) {
          setStatus('connecting');
          await webRTCService.answerCall(callId);
        }
      } catch (err) {
        console.error('Error setting up call:', err);
        setStatus('error');
        setError(err.message || 'Error al configurar la llamada');
      }
    };

    setupCall();

    // Clean up on unmount
    return () => {
      webRTCService.hangUp();
      clearCallTimer();
    };
  }, [callId]);

  // Attach media streams to video elements when available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call timer
  const startCallTimer = () => {
    setCallTimer(0);
    timerRef.current = setInterval(() => {
      setCallTimer(prev => prev + 1);
    }, 1000);
  };

  const clearCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Format timer to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Toggle mic
  const toggleMic = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      for (const track of audioTracks) {
        track.enabled = !track.enabled;
      }
      setIsMicMuted(!isMicMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      for (const track of videoTracks) {
        track.enabled = !track.enabled;
      }
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  // End the call
  const endCall = async () => {
    await webRTCService.hangUp();
    clearCallTimer();
    setStatus('ended');
    if (onClose) onClose();
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium mr-2">
            {recipientName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-white font-medium">{recipientName || 'Usuario'}</h3>
            <div className="flex items-center">
              {status === 'connected' && (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  <span className="text-xs text-green-400">Conectado - {formatTime(callTimer)}</span>
                </>
              )}
              {status === 'connecting' && (
                <>
                  <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse mr-1"></span>
                  <span className="text-xs text-yellow-400">Conectando...</span>
                </>
              )}
              {status === 'initializing' && (
                <>
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse mr-1"></span>
                  <span className="text-xs text-blue-400">Inicializando...</span>
                </>
              )}
              {status === 'ended' && (
                <span className="text-xs text-gray-400">Llamada finalizada</span>
              )}
              {status === 'error' && (
                <span className="text-xs text-red-400">Error: {error}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 bg-black relative overflow-hidden">
        {/* Remote Video (Big) */}
        {remoteStream && status === 'connected' ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-gray-700 mx-auto mb-3 flex items-center justify-center">
                <span className="text-3xl text-white">{recipientName?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              {status === 'initializing' && <p className="text-white">Preparando llamada...</p>}
              {status === 'connecting' && <p className="text-white">Esperando a que conteste...</p>}
              {status === 'ended' && <p className="text-white">Llamada finalizada</p>}
              {status === 'error' && <p className="text-red-400">Error: {error}</p>}
            </div>
          </div>
        )}

        {/* Local Video (Small overlay) */}
        <div className="absolute bottom-4 right-4 w-1/4 max-w-[180px] rounded-lg overflow-hidden border-2 border-gray-800 shadow-lg">
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full ${isVideoDisabled ? 'hidden' : ''}`}
            />
          ) : (
            <div className="bg-gray-800 h-24 flex items-center justify-center">
              <span className="text-gray-400">Cargando...</span>
            </div>
          )}

          {isVideoDisabled && (
            <div className="bg-gray-800 h-24 flex items-center justify-center">
              <span className="text-gray-400">Cámara desactivada</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 py-3 flex justify-center items-center space-x-4">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${isMicMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
        >
          {isMicMuted ? (
            <MicrophoneSlashIcon className="h-5 w-5 text-white" />
          ) : (
            <MicrophoneIcon className="h-5 w-5 text-white" />
          )}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoDisabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
        >
          {isVideoDisabled ? (
            <VideoCameraSlashIcon className="h-5 w-5 text-white" />
          ) : (
            <VideoCameraIcon className="h-5 w-5 text-white" />
          )}
        </button>
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
        >
          <PhoneXMarkIcon className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
