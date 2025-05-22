import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import webRTCService from '../services/webrtcService';

const VideoCallCard = ({ recipientId, recipientName, onCallStarted }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle'); // idle, calling, connected, error
  const [callId, setCallId] = useState(null);
  const [error, setError] = useState(null);

  // Clean up any existing call when component unmounts
  useEffect(() => {
    return () => {
      if (callId) {
        webRTCService.hangUp();
      }
    };
  }, [callId]);

  const handleStartCall = async () => {
    setStatus('calling');
    setError(null);

    try {
      // Initialize local stream first
      await webRTCService.initLocalStream();

      // Set up callbacks
      webRTCService.setCallbacks({
        onCallAnswered: () => setStatus('connected'),
        onCallRejected: () => {
          setStatus('idle');
          setError('Llamada rechazada');
        },
        onCallEnded: () => {
          setStatus('idle');
        },
        onConnected: () => setStatus('connected'),
        onDisconnected: () => {
          setStatus('idle');
          webRTCService.hangUp();
        }
      });

      // Create the call
      const newCallId = await webRTCService.createCall(
        user.uid,
        recipientId
      );

      setCallId(newCallId);

      // Notify parent component
      if (onCallStarted) {
        onCallStarted({
          callId: newCallId,
          localStream: webRTCService.localStream,
          remoteStream: webRTCService.remoteStream,
          hangUp: webRTCService.hangUp.bind(webRTCService)
        });
      }
    } catch (err) {
      console.error("Error starting call:", err);
      setStatus('error');
      setError(err.message || 'Error al iniciar la llamada');
    }
  };

  const handleCancelCall = async () => {
    if (callId) {
      await webRTCService.hangUp();
      setCallId(null);
      setStatus('idle');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
      <h3 className="text-base font-semibold text-primary mb-2">
        Videollamada con {recipientName || 'el Médico'}
      </h3>
      <p className="text-slate-700 mb-4 text-center text-sm">
        Conéctate para una consulta en tiempo real.
      </p>

      {error && (
        <div className="mb-3 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      {status === 'idle' && (
        <button
          onClick={handleStartCall}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium shadow hover:bg-primary/90 transition text-sm"
        >
          Iniciar Videollamada
        </button>
      )}

      {status === 'calling' && (
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-sm text-gray-600 mb-3">Llamando...</p>
          <button
            onClick={handleCancelCall}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium shadow hover:bg-red-600 transition text-sm"
          >
            Cancelar
          </button>
        </div>
      )}

      {status === 'connected' && (
        <div className="text-center">
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="h-2 w-2 mr-1 rounded-full bg-green-500"></span>
              Conectado
            </span>
          </div>
          <button
            onClick={handleCancelCall}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium shadow hover:bg-red-600 transition text-sm"
          >
            Finalizar llamada
          </button>
        </div>
      )}

      {status === 'error' && (
        <button
          onClick={handleStartCall}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium shadow hover:bg-primary/90 transition text-sm"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

export default VideoCallCard;
