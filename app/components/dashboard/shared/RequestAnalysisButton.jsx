'use client';

import { useAnamnesisForm } from '@/hooks/useAnamnesisForm';
import { useGenkitAnalysis } from '@/hooks/useGenkitAnalysis';
import { useState } from 'react';

const RequestAnalysisButton = ({ patientId }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestResult, setRequestResult] = useState(null);
  const { analyzeData } = useGenkitAnalysis();
  const { getAllFormData } = useAnamnesisForm(patientId);

  const handleRequestAnalysis = async () => {
    setIsRequesting(true);
    setRequestResult(null);

    try {
      // Obtener todos los datos del formulario de anamnesis
      const allFormData = await getAllFormData();

      // Enviar para análisis
      const results = await analyzeData(allFormData, patientId);

      setRequestResult({
        success: true,
        message: "Análisis completado exitosamente"
      });

      // Aquí podrías implementar cualquier lógica adicional,
      // como guardar los resultados en Firestore
    } catch (error) {
      console.error("Error al solicitar análisis:", error);
      setRequestResult({
        success: false,
        message: error.message || "Error al procesar la solicitud"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleRequestAnalysis}
        disabled={isRequesting}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isRequesting ? 'Procesando...' : 'Solicitar Análisis'}
      </button>

      {requestResult && (
        <div className={`mt-2 p-2 rounded text-xs ${requestResult.success
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
          }`}>
          {requestResult.message}
        </div>
      )}
    </div>
  );
};

export default RequestAnalysisButton;
