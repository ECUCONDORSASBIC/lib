'use client';

import { MicrophoneIcon, MicrophoneSlashIcon, PhoneXMarkIcon, VideoCameraIcon, VideoCameraSlashIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createVideoCallRecord, updateVideoCallStatus, endVideoCall } from '@/app/services/videoCallService';

export default function VideoCallPage() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('initializing'); // initializing, connecting, connected, ended, error
  const [error, setError] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);

  const searchParams = useSearchParams();
  const callId = searchParams.get('id');
  const { user } = useAuth();

  // Initialize the call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        setStatus('initializing');

        // Set up event handlers
        setCallEventHandlers({
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

        // If there's a callId, we're answering a call
        if (callId) {
          setStatus('connecting');
          const { localStream, remoteStream } = await answerCall(callId);
          setLocalStream(localStream);
          setRemoteStream(remoteStream);
        }
      } catch (err) {
        console.error('Error setting up call:', err);
        setStatus('error');
        setError(err.message || 'Error al configurar la llamada');
      }
    };

    initializeCall();

    // Clean up on unmount
    return () => {
      if (callId) {
        endVideoCall(callId, { duration: callDuration }).catch(err => 
          console.error('Error cleaning up call:', err)
        );
      }
      clearCallTimer();

      // Stop local streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
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

  // Start call timer
  const startCallTimer = () => {
    clearCallTimer();
    setCallDuration(0);

    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Clear call timer
  const clearCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoDisabled(!videoTrack.enabled);
      }
    }
  };

  // End the call
  const endCall = async () => {
    try {
      await endVideoCall(callId, { duration: callDuration });
      setStatus('ended');
      clearCallTimer();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  // Format call duration time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-2 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-800">Videollamada</h1>
          {status === 'connected' && (
            <p className="text-sm text-gray-500">Duración: {formatTime(callDuration)}</p>
          )}
        </div>
        <div className="flex items-center">
          {status === 'initializing' && <p className="text-sm text-gray-500">Inicializando...</p>}
          {status === 'connecting' && <p className="text-sm text-gray-500">Conectando...</p>}
          {status === 'error' && <p className="text-sm text-red-500">{error || 'Error'}</p>}
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 p-4 flex flex-col md:flex-row gap-4">
        {/* Remote video (large) */}
        <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${remoteStream ? 'opacity-100' : 'opacity-0'}`}
          />
          {(!remoteStream || status !== 'connected') && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-lg">Esperando conexión...</p>
            </div>
          )}
        </div>

        {/* Local video (small) */}
        <div className="w-full md:w-1/4 h-32 md:h-auto bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white px-4 py-3 flex justify-center space-x-4">
        <button
          onClick={toggleMicrophone}
          className={`p-3 rounded-full ${isMicMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200`}
        >
          {isMicMuted ? <MicrophoneSlashIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
        </button>
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          <PhoneXMarkIcon className="w-6 h-6" />
        </button>
        <button
          onClick={toggleCamera}
          className={`p-3 rounded-full ${isVideoDisabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200`}
        >
          {isVideoDisabled ? <VideoCameraSlashIcon className="w-6 h-6" /> : <VideoCameraIcon className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
