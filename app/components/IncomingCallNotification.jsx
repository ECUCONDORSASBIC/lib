import { useEffect, useState } from 'react';
import { doc, onSnapshot, query, collection, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase/firebaseClient';
import { useAuth } from '../contexts/AuthContext';
import webRTCService from '../services/webrtcService';

/**
 * Componente que muestra una notificación cuando hay una llamada entrante
 * y permite al usuario aceptar o rechazar la llamada
 */
const IncomingCallNotification = ({ onAccept }) => {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);

  // Escuchar llamadas entrantes
  useEffect(() => {
    if (!user?.uid) return;

    // Consulta para buscar llamadas entrantes dirigidas al usuario actual
    const callsQuery = query(
      collection(db, 'calls'),
      where('recipientId', '==', user.uid),
      where('status', '==', 'calling'),
      orderBy('startedAt', 'desc'),
      limit(1)
    );

    // Configurar listener para llamadas entrantes
    const unsubscribe = onSnapshot(callsQuery, async (snapshot) => {
      // Verificar si hay documentos en el resultado
      if (snapshot.empty) {
        setIncomingCall(null);
        setCallerInfo(null);
        return;
      }

      // Obtener datos de la llamada entrante más reciente
      const callDoc = snapshot.docs[0];
      const callData = callDoc.data();
      
      // Si ya teníamos esta llamada, no hacer nada
      if (incomingCall?.callId === callData.callId) return;

      // Configurar la llamada entrante
      setIncomingCall({
        callId: callDoc.id,
        callerId: callData.callerId,
        startedAt: callData.startedAt?.toDate() || new Date(),
      });

      // Intentar obtener información del llamante
      try {
        const callerDoc = await getDocs(doc(db, 'users', callData.callerId));
        if (callerDoc.exists()) {
          const userData = callerDoc.data();
          setCallerInfo({
            name: userData.displayName || userData.email || 'Usuario',
            photoURL: userData.photoURL || null,
            role: userData.role || 'usuario'
          });
        }
      } catch (error) {
        console.error('Error al obtener información del llamante:', error);
      }
    });

    return () => unsubscribe();
  }, [user?.uid, incomingCall?.callId]);

  // Aceptar la llamada
  const handleAccept = async () => {
    if (!incomingCall) return;

    try {
      // Notificar al componente padre
      if (onAccept) {
        onAccept({
          callId: incomingCall.callId,
          callerId: incomingCall.callerId,
          callerName: callerInfo?.name || 'Usuario'
        });
      }

      // Limpiar el estado
      setIncomingCall(null);
      setCallerInfo(null);
    } catch (error) {
      console.error('Error al aceptar llamada:', error);
    }
  };

  // Rechazar la llamada
  const handleReject = async () => {
    if (!incomingCall) return;

    try {
      await webRTCService.rejectCall(incomingCall.callId);
      // Limpiar el estado
      setIncomingCall(null);
      setCallerInfo(null);
    } catch (error) {
      console.error('Error al rechazar llamada:', error);
    }
  };

  // Si no hay llamada entrante, no mostrar nada
  if (!incomingCall) {
    return null;
  }

  // Calcular tiempo transcurrido desde el inicio de la llamada
  const elapsedSeconds = Math.floor((new Date() - incomingCall.startedAt) / 1000);
  const formattedTime = elapsedSeconds < 60
    ? `${elapsedSeconds}s`
    : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-primary p-3 text-white">
        <h3 className="font-medium text-sm">Llamada entrante</h3>
      </div>

      <div className="p-4">
        <div className="flex items-center mb-3">
          {callerInfo?.photoURL ? (
            <img 
              src={callerInfo.photoURL} 
              alt={callerInfo.name}
              className="h-12 w-12 rounded-full mr-3 object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
              {callerInfo?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h4 className="font-medium">{callerInfo?.name || 'Usuario'}</h4>
            <p className="text-xs text-gray-500">
              {callerInfo?.role === 'doctor' ? 'Médico' : 
                callerInfo?.role === 'patient' ? 'Paciente' : 'Usuario'}
            </p>
            <div className="text-xs text-gray-400 mt-1">
              Llamando hace {formattedTime}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleReject}
            className="flex-1 py-2 px-3 bg-red-100 text-red-600 rounded-md text-sm font-medium hover:bg-red-200 transition"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-2 px-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition"
          >
            Contestar
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallNotification;
