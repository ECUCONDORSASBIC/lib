'use client';

import GeminiTrainer from '@/app/components/dashboard/paciente/GeminiTrainer';

export default function EntrenaIAPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-slate-50 to-sky-100 min-h-screen text-gray-800">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Entrenamiento del Asistente IA</h1>
        <p className="text-gray-600">Ayuda a mejorar las respuestas del asistente virtual para ofrecer mejor atención a los pacientes.</p>
      </div>

      <GeminiTrainer />

      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">¿Por qué entrenar al asistente?</h2>
        <div className="prose max-w-none text-gray-600">
          <p>El entrenamiento continuo del asistente virtual mejora:</p>
          <ul>
            <li>La precisión de las respuestas sobre temas médicos</li>
            <li>La comprensión de las necesidades específicas de los pacientes de Altamedica</li>
            <li>La capacidad para seguir los protocolos y políticas de la organización</li>
            <li>La calidad general de la atención automatizada</li>
          </ul>
          <p className="mt-4">Tus contribuciones ayudan directamente a que todos los pacientes reciban una mejor experiencia.</p>
        </div>
      </div>
    </div>
  );
}
