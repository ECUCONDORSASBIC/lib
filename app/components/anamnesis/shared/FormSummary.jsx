import React from 'react';

export default function FormSummary({
  formSteps,
  formData,
  confirmVeracity,
  setConfirmVeracity,
  onGoToStep,
  onSave,
  onSubmit,
  onBack,
  isSaving = false,
  isSubmitting = false
}) {
  return (
    <div className="max-w-3xl p-6 mx-auto my-8 bg-white rounded-lg shadow-xl">
      <h2 className="mb-6 text-3xl font-bold text-center text-primary">Resumen de Anamnesis</h2>

      {formSteps.map((step, stepIndex) => (
        <div key={step.id} className="mb-6 last:mb-0">
          <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-neutral-light">
            <h3 className="text-xl font-semibold text-primary-dark">{step.title}</h3>
            <button
              onClick={() => onGoToStep(stepIndex)}
              className="text-sm text-secondary hover:text-secondary-dark hover:underline"
            >
              Editar
            </button>
          </div>
          <div className="mt-2 text-gray-700">
            {formData[step.id] ? (
              <div className="p-3 overflow-auto text-sm rounded bg-gray-50 max-h-32">
                {Object.entries(formData[step.id]).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="font-medium">{key}:</span>{' '}
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-yellow-600">
                No se ha completado esta sección
              </p>
            )}
          </div>
        </div>
      ))}

      <div className="p-4 mt-6 border rounded bg-info-light border-info">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={confirmVeracity}
            onChange={(e) => setConfirmVeracity(e.target.checked)}
            className="w-5 h-5 mr-3 rounded text-primary focus:ring-primary-light"
          />
          <span className="text-sm text-neutral-dark">
            Confirmo que toda la información proporcionada es veraz y completa.
          </span>
        </label>
      </div>

      <div className="flex flex-col items-center justify-between mt-8 md:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="w-full px-6 py-3 mb-4 text-sm font-medium text-gray-700 transition rounded bg-neutral-light hover:bg-neutral-DEFAULT hover:text-white md:w-auto md:mb-0 disabled:opacity-50"
          disabled={isSaving || isSubmitting}
        >
          Volver a Editar
        </button>
        <div className="flex flex-col w-full space-y-4 md:w-auto md:flex-row md:space-y-0 md:space-x-4">
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || isSubmitting || !confirmVeracity}
              className="w-full px-6 py-3 text-sm font-medium text-white transition rounded bg-secondary hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed md:w-auto"
            >
              {isSaving ? 'Guardando...' : 'Guardar Borrador'}
            </button>
          )}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isSaving || !confirmVeracity}
            className="w-full px-6 py-3 text-sm font-medium text-white transition rounded bg-success hover:bg-success-dark disabled:opacity-50 disabled:cursor-not-allowed md:w-auto"
          >
            {isSubmitting ? 'Enviando...' : 'Finalizar y Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
