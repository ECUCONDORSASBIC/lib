import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VideoCall from './VideoCall';
import IncomingCallNotification from './IncomingCallNotification';

/**
 * Componente que gestiona las videollamadas, manejando tanto 
 * llamadas entrantes como llamadas activas.
 */
const CallManager = () => {
  const { user } = useAuth();
  const [activeCall, setActiveCall] = useState(null);
  const [isCallVisible, setIsCallVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const videoContainerRef = useRef(null);

  // Manejar llamada entrante aceptada
  const handleAcceptCall = (callData) => {
    setActiveCall({
      callId: callData.callId,
      recipientId: callData.callerId, // La persona que llama es ahora el destinatario para nosotros
      recipientName: callData.callerName || 'Usuario',
      direction: 'incoming'
    });
    setIsCallVisible(true);
    setIsMinimized(false);
  };

  // Manejar cierre de llamada
  const handleCloseCall = () => {
    setActiveCall(null);
    setIsCallVisible(false);
    setIsMinimized(false);
  };

  // Manejar minimizar/maximizar llamada
  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Hacer un seguimiento de arrastre para el contenedor de la llamada
  useEffect(() => {
    if (!videoContainerRef.current || !isMinimized) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const element = videoContainerRef.current;

    const dragMouseDown = (e) => {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    };

    const elementDrag = (e) => {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      // Establecer la nueva posición
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    };

    const closeDragElement = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };

    // Configurar evento de arrastre
    element.onmousedown = dragMouseDown;

    return () => {
      element.onmousedown = null;
      document.onmouseup = null;
      document.onmousemove = null;
    };
  }, [isMinimized, videoContainerRef.current]);

  // Si no hay usuario autenticado, no mostrar nada
  if (!user) return null;

  return (
    <>
      {/* Componente de notificación para llamadas entrantes */}
      <IncomingCallNotification onAccept={handleAcceptCall} />

      {/* Contenedor de videollamada activa */}
      {activeCall && isCallVisible && (
        <div
          ref={videoContainerRef}
          className={`${
            isMinimized 
              ? 'fixed bottom-4 right-4 w-72 h-40 z-50 cursor-move shadow-xl' 
              : 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center'
          }`}
        >
          {/* Botón para minimizar/maximizar */}
          <button
            onClick={handleToggleMinimize}
            className="absolute top-2 right-14 z-10 text-white bg-gray-700 hover:bg-gray-600 rounded-full p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {isMinimized ? (
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm3 0v12h10V4H6z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5zm0 1h10v10H5V5z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>

          {/* Componente principal de videollamada */}
          <div className={isMinimized ? 'h-full w-full overflow-hidden' : 'w-full max-w-4xl h-[80vh]'}>
            <VideoCall
              callId={activeCall.callId}
              recipientId={activeCall.recipientId}
              recipientName={activeCall.recipientName}
              onClose={handleCloseCall}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CallManager;
