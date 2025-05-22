'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import VirtualClinicRoom from '@/app/components/immersive/VirtualClinicRoom';
import { db } from '@/lib/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Página para la experiencia de consulta inmersiva
 * Carga los datos de la cita y muestra el entorno virtual 3D
 */
const ConsultaInmersivaPage = ({ params }) => {
    const { id: appointmentId } = params;
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appointment, setAppointment] = useState(null);

    // Cargar datos de la cita
    useEffect(() => {
        if (!user || !appointmentId) return;

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

                // Verificar permisos para acceder
                const isAuthorized = user.uid === appointmentData.doctorId || user.uid === appointmentData.patientId;

                if (!isAuthorized) {
                    throw new Error('No tiene autorización para acceder a esta cita');
                }

                setAppointment({
                    id: appointmentDoc.id,
                    ...appointmentData
                });

            } catch (error) {
                console.error('Error loading appointment:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadAppointmentData();
    }, [appointmentId, user]);

    // Manejar la salida del entorno inmersivo
    const handleExit = () => {
        // Si es médico, redirigir al dashboard del médico
        if (user?.uid === appointment?.doctorId) {
            router.push(`/dashboard/medico/consultas/${appointmentId}`);
        } else {
            // Si es paciente, redirigir a su dashboard
            router.push(`/dashboard/paciente`);
        }
    };

    // Pantalla de carga
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-medium text-white">Preparando entorno virtual...</h2>
                <p className="text-gray-400 mt-2">Esto puede tomar unos segundos</p>
            </div>
        );
    }

    // Pantalla de error
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Error</h3>
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

    // Verificar que tenemos los datos necesarios
    if (!appointment) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <p className="text-lg text-gray-600">No se encontró información de la cita</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <VirtualClinicRoom
            appointmentId={appointmentId}
            patientId={appointment.patientId}
            doctorId={appointment.doctorId}
            onExit={handleExit}
        />
    );
};

export default ConsultaInmersivaPage;
