'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { videoCallService } from '@/app/services/videoCallService';
import { db } from '@/lib/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/app/contexts/AuthContext';
import { MicrophoneIcon, MicrophoneSlashIcon, VideoCameraIcon, VideoCameraSlashIcon, PhoneXMarkIcon, ComputerDesktopIcon, ChatBubbleLeftIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';

/**
 * Componente para sesiones de telemedicina
 * Proporciona una interfaz completa para videollamadas médico-paciente
 */
const TelemedicineSession = ({ appointmentId }) => {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [appointment, setAppointment] = useState(null);
    const [isDoctor, setIsDoctor] = useState(false);

    // Estados para controles de video
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Refs
    const videoContainerRef = useRef(null);
    const callInstanceRef = useRef(null);

    // Cargar datos de la cita y la sesión de video
    useEffect(() => {
        const loadAppointmentData = async () => {
            try {
                setLoading(true);

                // Obtener datos de la cita
                const appointmentRef = doc(db, 'appointments', appointmentId);
                const appointmentDoc = await getDoc(appointmentRef);

                if (!appointmentDoc.exists()) {
                    throw new Error('La cita no existe');
                }

                const appointmentData = appointmentDoc.data();
                setAppointment(appointmentData);

                // Determinar si el usuario actual es el médico
                const currentUserIsDoctor = user?.uid === appointmentData.doctorId;
                setIsDoctor(currentUserIsDoctor);

                // Verificar permiso para acceder
                const isAuthorized = user?.uid === appointmentData.doctorId || user?.uid === appointmentData.patientId;
                if (!isAuthorized) {
                    throw new Error('No tiene permiso para acceder a esta consulta');
                }

                // Verificar si ya existe una sesión de video
                if (appointmentData.videoSession?.id) {
                    // Suscribirse a cambios en la sesión de video
                    const unsubscribe = onSnapshot(
                        doc(db, 'telemedicineRooms', appointmentData.videoSession.id),
                        (doc) => {
                            if (doc.exists()) {
                                setSessionData({ id: doc.id, ...doc.data() });
                            }
                        },
                        (err) => {
                            console.error('Error al observar sesión de video:', err);
                            setError(err.message);
                        }
                    );

                    return () => unsubscribe();
                } else if (currentUserIsDoctor) {
                    // Si es el médico y no hay sesión, crear una
                    await createVideoSession(appointmentData);
                } else {
                    // Si es el paciente, esperar a que el médico cree la sesión
                    setError('El médico aún no ha iniciado la consulta. Por favor, espere.');
                }
            } catch (err) {
                console.error('Error cargando datos:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (appointmentId && user) {
            loadAppointmentData();
        }
    }, [appointmentId, user]);

    // Crear una nueva sesión de video (solo médicos)
    const createVideoSession = async (appointmentData) => {
        try {
            const { doctorId, patientId } = appointmentData;

            const result = await videoCallService.createVideoRoom(
                appointmentId,
                doctorId,
                patientId
            );

            setSessionData(result);
        } catch (err) {
            console.error('Error al crear sesión de video:', err);
            setError('No se pudo crear la sala de videollamada. Por favor, intente de nuevo.');
        }
    };

    // Unirse a la videollamada cuando haya datos de sesión disponibles
    useEffect(() => {
        if (sessionData?.roomUrl && videoContainerRef.current && !callInstanceRef.current) {
            const joinCall = async () => {
                try {
                    const userName = isDoctor ? 'Dr. ' + (user?.displayName || 'Médico') : (user?.displayName || 'Paciente');

                    const callInstance = await videoCallService.joinVideoCall(
                        sessionData.roomUrl,
                        videoContainerRef.current,
                        {
                            userName,
                            sessionId: sessionData.id,
                            showFullscreenButton: true
                        }
                    );

                    callInstanceRef.current = callInstance;

                    // Registrar entrada en la consulta
                    await updateDoc(doc(db, 'appointments', appointmentId), {
                        participants: {
                            [user.uid]: {
                                joinedAt: serverTimestamp(),
                                role: isDoctor ? 'doctor' : 'patient'
                            }
                        }
                    });

                } catch (err) {
                    console.error('Error al unirse a la llamada:', err);
                    setError('Error al conectarse a la videollamada. Por favor, recargue la página.');
                }
            };

            joinCall();

            return () => {
                // Limpiar al desmontar
                if (callInstanceRef.current) {
                    callInstanceRef.current.leave();
                    callInstanceRef.current = null;
                }
            };
        }
    }, [sessionData, isDoctor, user]);

    // Manejar controles de videollamada
    const toggleAudio = () => {
        const newState = !isAudioEnabled;
        videoCallService.toggleAudio(newState);
        setIsAudioEnabled(newState);
    };

    const toggleVideo = () => {
        const newState = !isVideoEnabled;
        videoCallService.toggleVideo(newState);
        setIsVideoEnabled(newState);
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            await videoCallService.stopScreenShare();
        } else {
            await videoCallService.shareScreen();
        }
        setIsScreenSharing(!isScreenSharing);
    };

    const endCall = async () => {
        try {
            if (callInstanceRef.current) {
                callInstanceRef.current.leave();
                callInstanceRef.current = null;
            }

            if (isDoctor && sessionData?.id) {
                await videoCallService.endVideoCall(sessionData.id);
            }

            // Redirigir al finalizar
            const redirectPath = isDoctor
                ? `/dashboard/medico/consultas/${appointmentId}/finalizar`
                : `/dashboard/paciente/${user.uid}`;

            router.push(redirectPath);
        } catch (err) {
            console.error('Error al finalizar la llamada:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-xl font-medium text-gray-700">Cargando consulta...</h3>
                    <p className="text-gray-500">Estamos preparando su sala de telemedicina</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PhoneXMarkIcon className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Error en la consulta</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Datos de la consulta */}
            <div className="bg-white shadow-sm p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-medium">
                        Consulta de Telemedicina
                    </h1>
                    <p className="text-gray-600">
                        {isDoctor
                            ? `Paciente: ${appointment?.patientName || 'Paciente'}`
                            : `Dr(a). ${appointment?.doctorName || 'Médico'}`
                        }
                    </p>
                </div>
                <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Consulta en curso
                    </span>
                </div>
            </div>

            {/* Contenedor principal */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Área de video */}
                <div className="flex-1 relative bg-black">
                    <div ref={videoContainerRef} className="w-full h-full"></div>

                    {/* Controles de video */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-900/80 px-6 py-3 rounded-full">
                        <button
                            onClick={toggleAudio}
                            className={`p-3 rounded-full ${isAudioEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
                        >
                            {isAudioEnabled ? <MicrophoneIcon className="h-5 w-5" /> : <MicrophoneSlashIcon className="h-5 w-5" />}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`p-3 rounded-full ${isVideoEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
                        >
                            {isVideoEnabled ? <VideoCameraIcon className="h-5 w-5" /> : <VideoCameraSlashIcon className="h-5 w-5" />}
                        </button>

                        <button
                            onClick={toggleScreenShare}
                            className={`p-3 rounded-full ${isScreenSharing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                        >
                            <ComputerDesktopIcon className="h-5 w-5" />
                        </button>

                        <button
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            className={`p-3 rounded-full ${isChatOpen ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                        >
                            {isChatOpen ? <ChatBubbleLeftEllipsisIcon className="h-5 w-5" /> : <ChatBubbleLeftIcon className="h-5 w-5" />}
                        </button>

                        <button
                            onClick={endCall}
                            className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        >
                            <PhoneXMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Panel lateral (notas, chat, etc.) - Visible si el chat está abierto */}
                {isChatOpen && (
                    <div className="w-full md:w-96 h-80 md:h-auto bg-white shadow-lg">
                        <div className="h-full flex flex-col">
                            <div className="p-4 border-b">
                                <h3 className="font-medium">Chat de consulta</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                {/* Aquí iría la implementación del chat */}
                                <div className="text-center text-gray-500 py-8">
                                    El chat está disponible durante la consulta
                                </div>
                            </div>

                            <div className="p-4 border-t">
                                <div className="flex">
                                    <input
                                        type="text"
                                        placeholder="Escriba su mensaje..."
                                        className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg">
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TelemedicineSession;
