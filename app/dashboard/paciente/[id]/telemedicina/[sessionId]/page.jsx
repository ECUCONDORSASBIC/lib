'use client';

import VideoCall from '@/app/components/telemedicine/VideoCall';
import { Toast } from '@/app/components/ui/Toast';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  joinTelemedicineSession,
  leaveTelemedicineSession,
  subscribeToSessionChanges,
  updateTelemedicineSession
} from '@/app/services/telemedicineService';
import { app } from '@lib/firebase/firebaseClient';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TelemedicinaMeetingPage() {
  const { id, sessionId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [meetingJoined, setMeetingJoined] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [participantInfo, setParticipantInfo] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const db = getFirestore(app);

  // Verificar si el usuario tiene acceso a esta sesión y preparar la videollamada
  useEffect(() => {
    const checkSessionAndPrepare = async () => {
      if (!user || !user.uid) {
        setToast({
          show: true,
          message: 'Debe iniciar sesión para acceder a esta consulta',
          type: 'error'
        });
        router.push('/login');
        return;
      }

      try {
        // Verificar si la sesión existe y pertenece al paciente
        const sessionRef = doc(db, 'telemedicineSessions', sessionId);
        const sessionSnapshot = await getDoc(sessionRef);

        if (!sessionSnapshot.exists()) {
          setToast({
            show: true,
            message: 'La sesión solicitada no existe',
            type: 'error'
          });
          router.push(`/dashboard/paciente/${id}`);
          return;
        }

        const session = sessionSnapshot.data();

        // Verificar si el paciente es el dueño de la sesión
        if (session.patientId !== id) {
          setToast({
            show: true,
            message: 'No tiene acceso a esta sesión',
            type: 'error'
          });
          router.push(`/dashboard/paciente/${id}`);
          return;
        }

        setSessionData(session);

        // Crear información del participante para la videollamada
        const participantInfo = {
          id: user.uid,
          name: user.displayName || 'Paciente',
          role: 'patient',
          joinedAt: new Date().toISOString()
        };

        setParticipantInfo(participantInfo);

        // Iniciar la suscripción a los cambios de la sesión
        const unsubscribe = subscribeToSessionChanges(sessionId, (updatedSession) => {
          setSessionData(updatedSession);

          // Si la sesión ha terminado, mostrar un mensaje y redirigir
          if (updatedSession.status === 'ended') {
            setToast({
              show: true,
              message: 'La consulta ha finalizado',
              type: 'info'
            });

            setTimeout(() => {
              router.push(`/dashboard/paciente/${id}`);
            }, 3000);
          }
        });

        setLoading(false);

        // Limpieza al desmontar
        return () => {
          unsubscribe();
          if (meetingJoined) {
            // Abandonar la sesión al salir
            leaveTelemedicineSession(sessionId, user.uid);
          }
        };
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        setToast({
          show: true,
          message: 'Error al cargar la sesión de telemedicina',
          type: 'error'
        });
        router.push(`/dashboard/paciente/${id}`);
      }
    };

    checkSessionAndPrepare();
  }, [user, id, sessionId, router, db, meetingJoined]);

  // Función para unirse a la videollamada
  const handleJoinCall = async () => {
    try {
      if (!participantInfo) {
        setToast({
          show: true,
          message: 'Información de usuario no disponible',
          type: 'error'
        });
        return;
      }

      // Unirse a la sesión de telemedicina
      await joinTelemedicineSession(sessionId, participantInfo);
      setMeetingJoined(true);

      setToast({
        show: true,
        message: 'Te has unido a la consulta',
        type: 'success'
      });
    } catch (error) {
      console.error('Error al unirse a la videollamada:', error);
      setToast({
        show: true,
        message: 'Error al iniciar la videollamada',
        type: 'error'
      });
    }
  };

  // Función para finalizar la consulta
  const handleEndConsultation = async () => {
    try {
      if (meetingJoined) {
        // Abandonar la sesión
        await leaveTelemedicineSession(sessionId, user.uid);
      }

      // Marcar la sesión como finalizada
      await updateTelemedicineSession(sessionId, {
        status: 'ended',
        endedAt: new Date().toISOString()
      });

      setToast({
        show: true,
        message: 'Consulta finalizada correctamente',
        type: 'success'
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/dashboard/paciente/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Error al finalizar la consulta:', error);
      setToast({
        show: true,
        message: 'Error al finalizar la consulta',
        type: 'error'
      });
    }
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando su consulta...</h2>
          <p className="text-gray-600">Estamos preparando su sala de telemedicina</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Toast para notificaciones */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          autoClose={true}
        />
      )}

      {/* Cabecera de la sala */}
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-800">Consulta de Telemedicina</h1>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
              Activa
            </span>
            <span className="text-sm text-gray-600">ID: {sessionData?.meetingCode}</span>
          </div>
        </div>
      </header>

      {/* Área principal de la videoconferencia */}
      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-4">
        {/* Área de video principal */}
        <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden min-h-[500px] relative">
          {!meetingJoined ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <div className="text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold">Iniciar Videollamada</h3>
                  <p className="mb-4 text-gray-300">El médico se unirá a la sesión en breve</p>
                  <button
                    onClick={handleJoinCall}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg"
                  >
                    Unirse a la videollamada
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <VideoCall
              sessionId={sessionId}
              userId={user?.uid}
              userName={user?.displayName || 'Paciente'}
              userRole="patient"
              onError={(error) => {
                console.error('Error en la videollamada:', error);
                setToast({
                  show: true,
                  message: 'Error en la videollamada: ' + (error.message || 'Error desconocido'),
                  type: 'error'
                });
              }}
              onConnectionStateChange={setConnectionState}
            />
          )}
        </div>

        {/* Panel lateral */}
        <div className="w-full md:w-80 bg-white rounded-xl shadow-md p-4 flex flex-col h-full min-h-[500px]">
          <h3 className="font-semibold text-lg border-b pb-2 mb-4">Información de la consulta</h3>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Estado de la sesión */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Estado de la llamada</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${connectionState === 'connected' ? 'bg-green-100 text-green-800' : connectionState === 'connecting' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {connectionState === 'connected' ? 'Conectado' :
                    connectionState === 'connecting' ? 'Conectando...' :
                      meetingJoined ? 'Esperando...' : 'No iniciada'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {meetingJoined
                  ? connectionState === 'connected'
                    ? 'La llamada está activa'
                    : 'Esperando conexión con el médico'
                  : 'Presiona "Unirse a la videollamada" para comenzar'}
              </p>
            </div>

            {/* Información de la sesión */}
            <div>
              <p className="text-sm text-gray-500">ID Sesión</p>
              <p className="font-medium text-xs overflow-hidden text-ellipsis">{sessionId}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Código de sala</p>
              <p className="font-medium">{sessionData?.meetingCode || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Estado de la sesión</p>
              <p className={`font-medium ${sessionData?.status === 'active' ? 'text-green-600' : sessionData?.status === 'waiting' ? 'text-yellow-600' : 'text-gray-600'}`}>
                {sessionData?.status === 'active' ? 'Activa' :
                  sessionData?.status === 'waiting' ? 'En espera' :
                    sessionData?.status === 'ended' ? 'Finalizada' : 'Desconocido'}
              </p>
            </div>

            {meetingJoined && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Consejos para la videollamada</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Asegúrate de tener buena iluminación</li>
                  <li>• Usa auriculares para mejor audio</li>
                  <li>• Ubícate en un lugar tranquilo y sin ruido</li>
                  <li>• Ten a mano cualquier documento médico relevante</li>
                </ul>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="border-t pt-4 mt-4">
            <button
              onClick={handleEndConsultation}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Finalizar consulta
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
