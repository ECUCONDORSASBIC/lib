import React from 'react';

export default function AnamnesisCard({ anamnesis }) {
  if (!anamnesis || Object.keys(anamnesis).length === 0) {
    return (
      <div className="h-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Anamnesis</h2>
        <div className="flex flex-col items-center justify-center h-32 rounded-lg bg-gray-50">
          <p className="text-gray-500">No hay información disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Anamnesis</h2>
      <div className="space-y-4">
        {anamnesis.motivoConsulta && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Motivo de consulta:</h3>
            <p className="text-gray-600">{anamnesis.motivoConsulta}</p>
          </div>
        )}

        {anamnesis.antecedentesPersonales && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Antecedentes personales:</h3>
            <p className="text-gray-600">{anamnesis.antecedentesPersonales}</p>
          </div>
        )}

        {anamnesis.antecedentesPatologicos && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Antecedentes patológicos:</h3>
            <p className="text-gray-600">{anamnesis.antecedentesPatologicos}</p>
          </div>
        )}

        {anamnesis.antecedentesFamiliares && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Antecedentes familiares:</h3>
            <p className="text-gray-600">{anamnesis.antecedentesFamiliares}</p>
          </div>
        )}

        {anamnesis.alergias && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Alergias:</h3>
            <p className="text-gray-600">{anamnesis.alergias}</p>
          </div>
        )}

        {anamnesis.medicacionActual && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Medicación actual:</h3>
            <p className="text-gray-600">{anamnesis.medicacionActual}</p>
          </div>
        )}
      </div>
    </div>
  );
}
