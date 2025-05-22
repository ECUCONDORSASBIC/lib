'use client';

import React, { useState } from 'react';

const NotificationSystem = ({ patientData, riskAnalysis, futureRisk, onBack, onComplete }) => {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    // Aquí podrías integrar la lógica real de envío de notificación
    setSent(true);
    setTimeout(() => {
      onComplete && onComplete();
    }, 1200);
  };

  return (
    <div className="max-w-2xl p-6 mx-auto bg-white rounded-lg shadow">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Notificaciones y Recomendaciones</h2>
      <div className="mb-6">
        <p className="mb-2 text-gray-700"><span className="font-medium">Paciente:</span> {patientData?.name}</p>
        <p className="mb-2 text-gray-700"><span className="font-medium">Riesgo:</span> {riskAnalysis?.riskLevel}</p>
        {/* Puedes mostrar más información relevante */}
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Mensaje para el paciente</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Escribe una recomendación o notificación personalizada..."
        />
      </div>
      {sent ? (
        <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">¡Notificación enviada correctamente!</div>
      ) : null}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          Volver
        </button>
        <button
          onClick={handleSend}
          className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          disabled={sent}
        >
          Enviar y Finalizar
        </button>
      </div>
    </div>
  );
};

export default NotificationSystem;
