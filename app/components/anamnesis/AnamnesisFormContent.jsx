'use client';

import FormNavigationButtons from '@/app/components/anamnesis/shared/FormNavigationButtons';
import FormSummary from '@/app/components/anamnesis/shared/FormSummary';
import { useEffect, useState } from 'react';
import AnamnesisProgress from './AnamnesisProgress';
import EnhancedConversationalAnamnesis from './EnhancedConversationalAnamnesis';
import FatigueDetection from './FatigueDetection';
import ProfileCompletionDashboard from './ProfileCompletionDashboard';

export default function AnamnesisFormContent({
  anamnesisForm,
  useConversationalMode,
  patientId
}) {
  const {
    currentStep,
    formData,
    updateStepData,
    handleSubmit,
    handleSave, // Asumiendo que existe en anamnesisForm, si no, deberás implementarlo
    formSteps: steps,
    goToNextStep,
    goToPreviousStep,
    loading: isSaving,
    showSummary,
    confirmVeracity,
    setConfirmVeracity,
    setShowSummary,
    completedSteps
  } = anamnesisForm;

  const [formDataChanged, setFormDataChanged] = useState(false);

  useEffect(() => {
    setFormDataChanged(true);
  }, [formData]);

  const CurrentFormComponent = steps[currentStep]?.component;
  const currentStepId = steps[currentStep]?.id;
  const handleSaveStepDataAndContinue = async (stepId, stepData) => {
    console.log(`[AnamnesisFormContent] Saving data for step: ${stepId}`, stepData);
    try {
      // Actualizar datos en el estado local
      updateStepData(stepId, stepData);      // Guardar en Firebase directamente para mayor consistencia
      const { db, ensureFirebase } = await import('@/lib/firebase/firebaseClient');
      const { doc, setDoc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      await ensureFirebase();

      if (!patientId) {
        throw new Error("ID de paciente no disponible");
      }

      // Obtener referencia al documento - cambiado 'pacientes' a 'patients'
      const anamnesisRef = doc(db, 'patients', patientId, 'anamnesis', 'current');

      // Verificar si el documento existe
      const docSnap = await getDoc(anamnesisRef);

      // Crear la estructura de datos actualizada
      const updatedStepData = {
        ...formData,
        [stepId]: stepData
      };

      // Asegurar que completedSteps sea siempre un array
      const safeCompletedSteps = Array.isArray(completedSteps) ? completedSteps : [];

      if (docSnap.exists()) {
        // Actualizar documento existente
        await updateDoc(anamnesisRef, {
          [`formulario.${stepId}`]: stepData,
          updatedAt: serverTimestamp(),
          // Añadir este paso como completado si no lo está ya
          completedSteps: [...new Set([...safeCompletedSteps, stepId])]
        });
      } else {
        // Crear nuevo documento
        await setDoc(anamnesisRef, {
          formulario: {
            [stepId]: stepData
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          completedSteps: [stepId],
          isCompleted: false
        });
      }

      // Avanzar al siguiente paso
      goToNextStep();
    } catch (error) {
      console.error(`Error al guardar datos de paso ${stepId}:`, error);
      // Aquí puedes agregar un toast para notificar el error al usuario
    }
  };
  // Función mejorada para guardar datos con Firebase
  const handleSaveForm = async () => {
    console.log("[AnamnesisFormContent] Saving form data", formData);
    try {
      // Si el hook proporciona handleSave, usamos eso
      if (handleSave) {
        return await handleSave();
      } else {        // Implementación de respaldo usando Firebase directamente
        const { db, ensureFirebase } = await import('@/lib/firebase/firebaseClient');
        const { doc, setDoc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        await ensureFirebase();

        if (!patientId) {
          console.error("No hay ID de paciente para guardar");
          return { success: false, message: "ID de paciente no disponible" };
        }

        // Obtener referencia al documento - cambiado 'pacientes' a 'patients'
        const anamnesisRef = doc(db, 'patients', patientId, 'anamnesis', 'current');

        // Verificar si el documento existe
        const docSnap = await getDoc(anamnesisRef);

        if (docSnap.exists()) {
          // Actualizar documento existente
          await updateDoc(anamnesisRef, {
            formulario: formData,
            updatedAt: serverTimestamp(),
            completedSteps: completedSteps
          });
        } else {
          // Crear nuevo documento
          await setDoc(anamnesisRef, {
            formulario: formData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            completedSteps: completedSteps,
            isCompleted: false
          });
        }

        return { success: true };
      }
    } catch (error) {
      console.error("Error al guardar formulario:", error);
      return { success: false, message: error.message };
    }
  };
  const handleFormSubmitFinal = async () => {
    console.log("[AnamnesisFormContent] Submitting final anamnesis", formData);
    try {      // Importar Firebase directamente aquí para evitar referencias cíclicas
      const { db, ensureFirebase } = await import('@/lib/firebase/firebaseClient');
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      await ensureFirebase();

      // Actualizar el documento como completado - cambiado 'pacientes' a 'patients'
      const anamnesisRef = doc(db, 'patients', patientId, 'anamnesis', 'current');
      await updateDoc(anamnesisRef, {
        isCompleted: true,
        completedAt: serverTimestamp(),
      });

      const result = await handleSubmit();
      if (result.success) {
        // Mostrar mensaje de éxito o redirigir
        console.log("Anamnesis enviada con éxito");
        // Aquí se puede agregar un toast o redirección
      }
    } catch (error) {
      console.error("Error al finalizar anamnesis:", error);
      // Aquí se puede mostrar un mensaje de error
    }
  };

  const handleInsightsGenerated = (insightsFromConversation) => {
    if (insightsFromConversation && typeof insightsFromConversation === 'object') {
      for (const sectionId in insightsFromConversation) {
        const sectionData = insightsFromConversation[sectionId];
        if (sectionData && typeof sectionData === 'object') {
          console.log(`[AnamnesisFormContent] Updating section ${sectionId} with data:`, sectionData);
          updateStepData(sectionId, sectionData);
        } else {
          console.warn(`[AnamnesisFormContent] Data for section ${sectionId} from chat is not an object or is null.`);
        }
      }
    } else {
      console.warn("[AnamnesisFormContent] Received insights are not a valid object or are null/undefined:", insightsFromConversation);
    }
  };
  // Function to check if user might need to take a break, based on how much time they've spent
  const shouldOfferBreak = () => {
    // This would normally be linked to actual user activity tracking
    // For now, we'll just use a simple placeholder implementation
    return formDataChanged && Math.random() > 0.7;
  };

  // Track completion status for UI feedback
  const completionStatus = (() => {
    const percentage = steps.length > 0
      ? Math.round((completedSteps.length / steps.length) * 100)
      : 0;

    if (percentage >= 90) return "excellent";
    if (percentage >= 70) return "good";
    if (percentage >= 40) return "fair";
    return "needs-attention";
  })();

  // Progress status colors
  const progressColors = {
    "excellent": { bg: "bg-green-500", text: "text-green-700" },
    "good": { bg: "bg-blue-500", text: "text-blue-700" },
    "fair": { bg: "bg-amber-500", text: "text-amber-700" },
    "needs-attention": { bg: "bg-orange-500", text: "text-orange-700" }
  };

  return (
    <>
      {/* Dashboard de compleción del perfil */}
      <ProfileCompletionDashboard
        formData={formData}
        sections={steps}
        completedSections={completedSteps}
        patientId={patientId}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main content area */}
        <div className="md:col-span-3">
          {/* Improved anamnesis progress visualization */}
          <div className="mb-6">
            <AnamnesisProgress
              steps={steps}
              completedSteps={completedSteps}
              currentStep={currentStep}
              onStepClick={(step) => {
                if (completedSteps.includes(steps[step].id) || step === currentStep) {
                  setShowSummary(false);
                  setCurrentStep(step);
                }
              }}
              canNavigate={!isLoading && !showSummary}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Form display based on mode */}
            {showSummary ? (
              <div className="p-4">
                <FormSummary
                  formSteps={steps}
                  formData={formData}
                  completedSteps={completedSteps}
                  confirmVeracity={confirmVeracity}
                  setConfirmVeracity={setConfirmVeracity}
                  onGoToStep={(idx) => {
                    setShowSummary(false);
                    setCurrentStep(idx);
                  }}
                  onBack={goToPreviousStep}
                  onSave={handleSaveForm}
                  onSubmit={handleFormSubmitFinal}
                  isSaving={isSaving}
                />
              </div>
            ) : useConversationalMode ? (
              <div className="p-4">
                <EnhancedConversationalAnamnesis
                  patientId={patientId}
                  existingData={formData}
                  onInsightsGenerated={handleInsightsGenerated}
                />
              </div>
            ) : (
              <>
                {/* Componente de formulario actual */}
                <div className="p-4">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {steps[currentStep]?.title || 'Anamnesis'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {steps[currentStep]?.description || 'Complete la siguiente información para su historia clínica.'}
                    </p>
                  </div>

                  {CurrentFormComponent && (
                    <div className="bg-white p-4 rounded-lg">
                      <CurrentFormComponent
                        patientId={patientId}
                        initialData={formData[steps[currentStep].id] || {}}
                        onSave={(dataFromStep) => handleSaveStepDataAndContinue(steps[currentStep].id, dataFromStep)}
                      />
                    </div>
                  )}
                </div>

                {/* Botones de navegación con feedback visual y auto-guardado */}
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <FormNavigationButtons
                      currentStep={currentStep}
                      totalSteps={steps.length}
                      onNext={goToNextStep}
                      onPrevious={goToPreviousStep}
                      onSubmit={handleFormSubmitFinal}
                      isSaving={isSaving}
                      showSaveIndicator={true}
                      lastSaved={lastSaved}
                    />

                    {/* Show break suggestion if user has been filling forms for a while */}
                    {shouldOfferBreak() && (
                      <div className="hidden sm:block text-xs text-gray-500 ml-4">
                        <button
                          className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          onClick={handleSaveForm}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Guardar y continuar después
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Fatigue detection component to monitor user interaction patterns */}
          <FatigueDetection
            sessionDuration={0} // You would need to implement session timing
            timeBetweenInputs={0} // You would need to implement input timing
            completedSections={completedSteps.length}
            totalSections={steps.length}
            onPauseSuggested={() => handleSaveForm()}
            onFatigueDetected={() => console.log('Fatigue detected')}
            onDismiss={() => { }}
          />
        </div>

        {/* Side panel with improved visual progress feedback */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Tu progreso</h3>
              <span className={`text-sm font-medium ${progressColors[completionStatus].text}`}>
                {Math.round((completedSteps.length / steps.length) * 100)}%
              </span>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full mb-4">
              <div
                className={`h-full rounded-full transition-all ${progressColors[completionStatus].bg}`}
                style={{ width: `${Math.round((completedSteps.length / steps.length) * 100)}%` }}
              />
            </div>

            <div className="space-y-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    if (completedSteps.includes(step.id) || index === currentStep) {
                      setShowSummary(false);
                      setCurrentStep(index);
                    }
                  }}
                  disabled={!completedSteps.includes(step.id) && index !== currentStep}
                  className={`w-full p-2 rounded-md flex items-center transition-all ${currentStep === index && !showSummary
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : completedSteps.includes(step.id)
                        ? 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500'
                        : 'bg-gray-50 cursor-not-allowed border-l-4 border-transparent'
                    }`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${completedSteps.includes(step.id)
                      ? 'bg-green-500 text-white'
                      : currentStep === index && !showSummary
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300'
                    }`}>
                    {completedSteps.includes(step.id) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm truncate ${currentStep === index && !showSummary
                      ? 'font-medium text-blue-700'
                      : completedSteps.includes(step.id)
                        ? 'font-medium text-green-700'
                        : 'text-gray-500'
                    }`}>
                    {step.title}
                  </span>
                </button>
              ))}

              {/* Summary button */}
              <button
                onClick={() => setShowSummary(true)}
                disabled={completedSteps.length === 0}
                className={`w-full p-2 rounded-md flex items-center transition-all ${showSummary
                    ? 'bg-indigo-50 border-l-4 border-indigo-500'
                    : completedSteps.length > 0
                      ? 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
                      : 'bg-gray-50 cursor-not-allowed border-l-4 border-transparent opacity-50'
                  }`}
              >
                <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${showSummary
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-300'
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className={`text-sm ${showSummary
                    ? 'font-medium text-indigo-700'
                    : 'text-gray-700'
                  }`}>
                  Ver resumen
                </span>
              </button>
            </div>

            {/* Additional guidance and help */}
            {!showSummary && currentStep < steps.length && steps[currentStep] && (
              <div className="mt-8 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-700 mb-2">Consejos para esta sección</h4>
                <p className="text-xs text-gray-600">
                  {steps[currentStep].description ||
                    `Complete la información de ${steps[currentStep].title.toLowerCase()} para continuar con su historia clínica.`
                  }
                </p>
                <div className="mt-2 text-xs text-blue-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ¿Necesitas ayuda para completar esta sección?
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
