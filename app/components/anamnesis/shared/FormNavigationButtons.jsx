import React from 'react';

export default function FormNavigationButtons({
  onPrevious,
  onNext,
  onSave,
  isFirstStep = false,
  isLastStep = false,
  saving = false
}) {
  return (
    <div className="flex justify-between mt-8">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep || saving}
        className="px-6 py-2 text-sm font-medium text-gray-700 transition rounded bg-neutral-light hover:bg-neutral-DEFAULT hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>

      {onSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2 text-sm font-medium text-white transition rounded bg-secondary hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar Progreso'}
        </button>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={saving}
        className="px-6 py-2 text-sm font-medium text-white transition rounded bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLastStep ? 'Ver Resumen' : 'Siguiente'}
      </button>
    </div>
  );
}
