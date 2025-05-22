'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n';
import useRobustAnamnesis from '@/app/hooks/useRobustAnamnesis';
import FormNavigationButtons from './shared/FormNavigationButtons';
import AnamnesisFormFeedback from './AnamnesisFormFeedback';
import ExperimentalFeatureBanner from '../common/ExperimentalFeatureBanner';
import { useToast } from '../ui/Toast';

// Definir pasos del formulario aquí o importarlos
const FORM_STEPS = [
  { id: 'datos-personales', title: 'Datos Personales' },
  { id: 'motivo-consulta', title: 'Motivo de Consulta' },
  { id: 'antecedentes', title: 'Antecedentes' },
  // Añade el resto de pasos según tu aplicación
];

export default function AnamnesisForm({ patientId, userId, patientData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation(['anamnesis', 'common']);
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);
  
  // Inicializar directamente con los IDs
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const formSteps = FORM_STEPS;

  const {
    anamnesis,
    history,
    loading,
    error,
    saving,
    syncError,
    saveAnamnesis,
    validate,
    reload,
    reloadHistory
  } = useRobustAnamnesis(patientId, formSteps, patientData, userId);

  const updateStepData = (stepId, data) => {
    setFormData(prev => ({ ...prev, [stepId]: { ...prev[stepId], ...data } }));
  };

  const goToNextStep = () => setCurrentStep(s => Math.min(s + 1, formSteps.length - 1));
  const goToPreviousStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  const handleSaveWithFeedback = async () => {
    const validation = validate(formData);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      toast.error(t('common:form.validationError'));
      return;
    }
    setValidationErrors(null);
    
    try {
      await saveAnamnesis(formData);
      setLastSaved(new Date().toLocaleTimeString());
      toast.success(t('common:feedback.successful'));
      reloadHistory();
    } catch (err) {
      toast.error(err.message || t('common:feedback.dataNotSaved'));
    }
  };

  const handleSubmitWithFeedback = async () => {
    setIsSubmitting(true);
    const validation = validate(formData);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      toast.error(t('common:form.validationError'));
      setIsSubmitting(false);
      return;
    }
    setValidationErrors(null);
    
    try {
      await saveAnamnesis(formData);
      setLastSaved(new Date().toLocaleTimeString());
      toast.success(t('common:feedback.successful'));
      reloadHistory();
    } catch (err) {
      toast.error(err.message || t('common:feedback.dataNotSaved'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Solo mostrar loading si no hay datos cargados aún
  if (loading && !anamnesis) {
    return (
      <div className="flex justify-center items-center p-8 flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">{t('common:feedback.loading')}</p>
      </div>
    );
  }

  // El formulario en sí
  return (
    <div className="space-y-6">
      {/* Banner informativo de fase de desarrollo si es necesario */}
      <ExperimentalFeatureBanner 
        featureName={t('anamnesis:title')} 
        severity="info"
        dismissible
      />
      
      {/* Mostrar feedback visual de estado */}
      <AnamnesisFormFeedback
        loading={loading}
        saving={saving}
        error={error}
        syncError={syncError}
        validationErrors={validationErrors}
        lastSaved={lastSaved}
        retrySave={reload}
        retryLoad={reload}
      />
      <h2 className="text-xl font-semibold text-gray-800">
        {formSteps[currentStep]?.title || t('anamnesis:title')}
      </h2>
      
      {/* Aquí va el contenido específico del paso actual */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p>{t('common:step', { current: currentStep + 1, total: formSteps.length })}</p>
        
        {/* Ejemplo de formulario básico */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Campo de ejemplo
            </label>
            <input 
              type="text" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                // Actualiza los datos para este paso
                updateStepData(formSteps[currentStep].id, {
                  ejemplo: e.target.value
                });
              }}
            />
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <FormNavigationButtons
        onPrevious={goToPreviousStep}
        onNext={goToNextStep}
        onSave={handleSaveWithFeedback}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep === formSteps.length - 1}
        saving={saving || isSubmitting}
      />

      {/* Mostrar conflictos de sincronización */}
      {syncError && (
        <div className="text-orange-600 mt-2">Conflicto de edición: {syncError}</div>
      )}

      {/* Mostrar historial de versiones */}
      <div className="mt-6">
        <h3 className="font-semibold">Historial de versiones:</h3>
        <ul className="text-xs text-gray-500">
          {history && history.length > 0 ? (
            history.map((h, i) => (
              <li key={h.id || i}>
                {h.metadata?.versionId || h.id} - {h.metadata?.createdAt || h.timestamp?.toDate?.().toLocaleString?.() || '-'}
              </li>
            ))
          ) : (
            <li>No hay historial disponible.</li>
          )}
        </ul>
      </div>
    </div>
  );
}