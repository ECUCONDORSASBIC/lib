// Acceso a videollamada con el paciente
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { createVideoCallRecord } from '@/app/services/videoCallService';

const VideoCallAccess = () => {
  const [isStartingCall, setIsStartingCall] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleStartCall = async () => {
    if (isStartingCall) return;
    setIsStartingCall(true);

    try {
      // In a full implementation, you would select a patient here
      // For the MVP, we'll assume a default patient or show a selection dialog
      const patientId = "DEMO_PATIENT_ID"; // Replace with actual patient selection logic

      // Initialize the call
      const callData = {
        doctorId: user.uid,
        patientId: patientId,
        status: 'initiated',
        startTime: new Date(),
        role: 'doctor'
      };
      const callId = await createVideoCallRecord(callData);

      // Add a small delay to prevent navigation throttling
      setTimeout(() => {
        router.push(`/videocall?id=${callId}`);
      }, 100);
    } catch (error) {
      console.error("Error starting call:", error);
      alert("Error al iniciar la videollamada. Por favor intente de nuevo.");
    } finally {
      setIsStartingCall(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-2 text-lg font-semibold text-gray-700">Videollamada Rápida</h3>
      <button
        className="w-full px-4 py-2 text-white transition duration-150 ease-in-out bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        onClick={handleStartCall}
        disabled={isStartingCall}
      >
        {isStartingCall ? 'Iniciando...' : 'Iniciar Nueva Consulta'}
      </button>
    </div>
  );
};

export default VideoCallAccess;
