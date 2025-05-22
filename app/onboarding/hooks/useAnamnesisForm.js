'use client';

import { db, ensureFirebase } from '@firebase/client';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook to manage anamnesis form data with Firebase integration
 *
 * @param {string} patientId - The ID of the patient
 * @param {object} user - Current authenticated user object
 * @param {array} formStepsConfig - Configuration array for form steps
 * @returns {object} Form state and methods
 */
export function useAnamnesisForm(patientId, user, formStepsConfig = []) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [confirmVeracity, setConfirmVeracity] = useState(false);
  const [isAnamnesisCompleted, setIsAnamnesisCompleted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [formSteps, setFormSteps] = useState(formStepsConfig);
  const [effectiveUserId, setEffectiveUserId] = useState(null);
  // Initialize form data from Firebase
  useEffect(() => {
    async function loadFormData() {
      if (!patientId) {
        setLoading(false);
        return;
      } try {
        setError(null);

        // Ensure Firebase is initialized
        await ensureFirebase();

        // Determine effective user ID (doctor or patient)
        const userId = user?.uid;
        if (!userId) {
          throw new Error('Usuario no autenticado');
        }
        setEffectiveUserId(userId);

        // Get reference to anamnesis document
        const anamnesisRef = doc(db, 'pacientes', patientId, 'anamnesis', 'current');
        const anamnesisDoc = await getDoc(anamnesisRef);

        if (anamnesisDoc.exists()) {
          const data = anamnesisDoc.data();
          // Asegurarse de que formulario sea un objeto, incluso si es null/undefined
          setFormData(data.formulario || {});
          setCompletedSteps(data.completedSteps || []);
          setIsAnamnesisCompleted(data.isCompleted || false);

          // If there are completed steps, set current step to first incomplete step
          if (data.completedSteps && data.completedSteps.length > 0) {
            const nextStepIndex = formStepsConfig.findIndex(
              step => !data.completedSteps.includes(step.id)
            );
            if (nextStepIndex >= 0) {
              setCurrentStep(nextStepIndex);
            }
          }
          console.log('Datos de anamnesis cargados:', data.formulario);
        } else {
          // Documento no existe, inicializando con valores por defecto
          console.log('No se encontró documento de anamnesis, inicializando con valores por defecto');
          setFormData({});
          setCompletedSteps([]);
        }
      } catch (err) {
        console.error('Error loading anamnesis data:', err);
        setError(`Error al cargar los datos: ${err.message}`);
        // Manejar el error pero permitir continuar con un formulario vacío
        setFormData({});
        setCompletedSteps([]);
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    }

    loadFormData();
  }, [patientId, user, formStepsConfig]);

  // Update step data
  const updateStepData = useCallback((stepId, data) => {
    setFormData(prevData => ({
      ...prevData,
      [stepId]: {
        ...(prevData[stepId] || {}),
        ...data
      }
    }));
  }, []);
  // Save current form data to Firebase
  const handleSave = useCallback(async () => {
    if (!patientId || !effectiveUserId) {
      console.error('Falta identificación de paciente o usuario', { patientId, effectiveUserId });
      return { success: false, message: 'Falta identificación de paciente o usuario' };
    }

    try {
      const currentStepId = formSteps[currentStep]?.id;
      if (!currentStepId) {
        throw new Error('Paso no identificado');
      }

      console.log(`Guardando paso ${currentStepId} para paciente ${patientId}`);

      // Add current step to completed steps if not already included
      const updatedCompletedSteps = completedSteps.includes(currentStepId)
        ? completedSteps
        : [...completedSteps, currentStepId];

      setCompletedSteps(updatedCompletedSteps);

      // Reference to anamnesis document
      const anamnesisRef = doc(db, 'pacientes', patientId, 'anamnesis', 'current');

      try {
        // Verificar si el documento existe
        const anamnesisDoc = await getDoc(anamnesisRef);

        if (anamnesisDoc.exists()) {
          // Update existing document
          console.log('Actualizando documento existente');
          await updateDoc(anamnesisRef, {
            formulario: formData,
            completedSteps: updatedCompletedSteps,
            lastUpdatedAt: serverTimestamp(),
            lastUpdatedBy: effectiveUserId
          });
        } else {
          // Create new document
          console.log('Creando nuevo documento');
          await setDoc(anamnesisRef, {
            formulario: formData,
            completedSteps: updatedCompletedSteps,
            createdAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp(),
            createdBy: effectiveUserId,
            lastUpdatedBy: effectiveUserId,
            isCompleted: false
          });
        }

        console.log('Datos guardados correctamente');
        return { success: true };

      } catch (firebaseError) {
        // Si hay un error específico de Firebase, intentar una estrategia alternativa
        console.error('Error de Firebase, intentando método alternativo:', firebaseError);

        try {
          // Intentar simplemente escribir el documento completo (ignora si existe o no)
          await setDoc(anamnesisRef, {
            formulario: formData,
            completedSteps: updatedCompletedSteps,
            createdAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp(),
            createdBy: effectiveUserId,
            lastUpdatedBy: effectiveUserId,
            isCompleted: false
          }, { merge: true }); // Usar merge para combinar los datos

          console.log('Datos guardados con método alternativo');
          return { success: true };
        } catch (secondError) {
          throw secondError; // Si esto también falla, propagar el error
        }
      }
    } catch (err) {
      console.error('Error saving anamnesis data:', err);
      return { success: false, message: err.message };
    }
  }, [patientId, effectiveUserId, formData, currentStep, formSteps, completedSteps]);

  // Submit completed form
  const handleSubmit = useCallback(async () => {
    if (!confirmVeracity) {
      return { success: false, message: 'Debe confirmar la veracidad de los datos' };
    }

    if (!patientId || !effectiveUserId) {
      return { success: false, message: 'Falta identificación de paciente o usuario' };
    }

    try {
      // Reference to anamnesis document
      const anamnesisRef = doc(db, 'pacientes', patientId, 'anamnesis', 'current');

      // Update document as completed
      await updateDoc(anamnesisRef, {
        formulario: formData,
        isCompleted: true,
        completedAt: serverTimestamp(),
        completedBy: effectiveUserId
      });

      setIsAnamnesisCompleted(true);
      return { success: true };
    } catch (err) {
      console.error('Error submitting anamnesis:', err);
      return { success: false, message: err.message };
    }
  }, [patientId, effectiveUserId, formData, confirmVeracity]);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  }, [currentStep, formSteps.length]);

  const goToPreviousStep = useCallback(() => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, showSummary]);

  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < formSteps.length) {
      setCurrentStep(stepIndex);
      setShowSummary(false);
    }
  }, [formSteps.length]);

  // Get all form data
  const getAllFormData = useCallback(async () => {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    try {
      const anamnesisRef = doc(db, 'pacientes', patientId, 'anamnesis', 'current');
      const anamnesisDoc = await getDoc(anamnesisRef);

      if (anamnesisDoc.exists()) {
        return anamnesisDoc.data().formulario || {};
      }
      return {};
    } catch (err) {
      console.error('Error fetching form data:', err);
      throw err;
    }
  }, [patientId]);

  return {
    loading,
    error,
    formData,
    currentStep,
    completedSteps,
    formSteps,
    showSummary,
    confirmVeracity,
    isAnamnesisCompleted,
    initialLoadComplete,
    effectiveUserId,
    updateStepData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    handleSave,
    handleSubmit,
    setConfirmVeracity,
    getAllFormData
  };
}
