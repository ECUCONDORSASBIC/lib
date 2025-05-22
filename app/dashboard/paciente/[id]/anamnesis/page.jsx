'use client';

import ConversationalAnamnesis from '@/app/components/anamnesis/ConversationalAnamnesis.simplified';
import AIConversationalAnamnesis from '@/app/components/anamnesis/AIConversationalAnamnesis';
import NavegacionAnamnesis from '@/app/components/anamnesis/NavegacionAnamnesis';
import FirebaseDebug from '@/app/components/debug/FirebaseDebug';
import LoadingIndicator from '@/app/components/ui/LoadingIndicator';
import { ToastProvider, useToast } from '@/app/components/ui/Toast';
import { useAuth } from '@/app/onboarding/hooks/useAuth';
import { db } from '@/lib/firebase/firebaseClient'; // Updated to use the centralized Firebase client
import { prepareAnamnesisForFirestore } from '@/utils/anamnesisFormatter';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Dynamic components
const DynamicAnamnesisFormSummary = dynamic(
  () => import('@/app/components/anamnesis/AnamnesisFormSummary')
    .catch(err => {
      console.error('Error loading AnamnesisFormSummary:', err);
      return {
        default: props => (
          <div className="p-4 border border-red-200 rounded-md bg-red-50">
            <h3 className="font-medium text-red-800">Error al cargar el resumen del formulario</h3>
            <p className="text-sm text-red-600">Por favor, intente recargar la página.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 mt-2 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-100"
            >
              Recargar página
            </button>
          </div>
        )
      };
    }),
  {
    loading: () => <div className="p-4 text-center">Cargando resumen...</div>,
    ssr: false
  }
);

// Tooltip component for helper text
const Tooltip = ({ text }) => {
  return (
    <div className="relative flex group">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 cursor-help" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
      </svg>
      <span className="absolute z-10 hidden w-64 p-2 mb-2 text-xs text-white bg-gray-800 rounded shadow-lg bottom-full group-hover:block">
        {text}
      </span>
    </div>
  );
};

// Componente para mostrar alertas de riesgo
const RiskAlertComponent = ({ risks, onClose }) => {
  if (!risks || risks.length === 0) return null;
  
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'alta': return 'bg-red-100 border-red-400 text-red-700';
      case 'media': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'baja': return 'bg-blue-100 border-blue-400 text-blue-700';
      default: return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };
  
  return (
    <div className="mb-6 border rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-orange-100 border-b border-orange-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-orange-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Patrones de riesgo detectados
          </h3>
          <button
            onClick={onClose}
            className="text-orange-700 hover:text-orange-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-white">
        <p className="mb-4 text-sm text-gray-600">
          Basado en la información proporcionada, se han identificado los siguientes factores que podrían requerir atención:
        </p>
        
        <div className="space-y-3">
          {risks.map((risk, index) => (
            <div key={index} className={`p-3 rounded border ${getSeverityColor(risk.severity)}`}>
              <div className="font-medium">{risk.description}</div>
              {risk.recommendation && (
                <div className="mt-1 text-sm">
                  <span className="font-medium">Recomendación:</span> {risk.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Nota: Esta información es generada automáticamente basada en sus respuestas y debe ser confirmada por un profesional de la salud.
        </div>
      </div>
    </div>
  );
};

// Form steps configuration with lazy-loaded components
const BASE_FORM_STEPS = [{
  id: 'datos-personales',
  title: 'Datos Personales',
  component: dynamic(() => import('@/app/components/anamnesis/DatosPersonalesForm'), {
    loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
    ssr: false
  })
},
{
  id: 'motivo-consulta',
  title: 'Motivo de Consulta',
  component: dynamic(() =>
    import('@/app/components/anamnesis/MotivoConsultaForm')
      .catch(err => {
        console.error('Error loading MotivoConsultaForm:', err);
        return {
          default: props => (
            <div className="p-4 border border-red-200 rounded-md bg-red-50">
              <h3 className="font-medium text-red-800">Error al cargar el formulario</h3>
              <p className="text-sm text-red-700">Por favor, inténtelo de nuevo más tarde.</p>
            </div>
          )
        };
      }), {
    loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
    ssr: false
  })
}, {
  id: 'historia-enfermedad',
  title: 'Historia de la Enfermedad Actual', component: dynamic(() =>
    import('@/app/components/anamnesis/EnfermedadActualForm')
      .catch(err => {
        console.error('Error loading EnfermedadActualForm:', err);
        return {
          default: props => (
            <div className="p-4 border border-red-200 rounded-md bg-red-50">
              <h3 className="font-medium text-red-800">Error al cargar el formulario</h3>
              <p className="text-sm text-red-600">Por favor, intente recargar la página.</p>
            </div>
          )
        };
      }),
    {
      loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
      ssr: false
    }
  )
}, {
  id: 'antecedentes-personales',
  title: 'Antecedentes Personales',
  component: dynamic(() => import('@/app/components/anamnesis/AntecedentesPersonalesForm'), {
    loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
    ssr: false
  })
},
{
  id: 'antecedentes-gineco',
  title: 'Antecedentes Gineco-Obstétricos',
  description: 'Información sobre embarazos previos, ciclo menstrual y otros aspectos ginecológicos',
  component: dynamic(() => import('@/app/components/anamnesis/AntecedentesGinecoForm'), {
    loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
    ssr: false
  })
}, {
  id: 'antecedentes-familiares',
  title: 'Antecedentes Familiares',
  description: 'Historia médica de familiares directos relevante para su atención',
  component: dynamic(() => import('@/app/components/anamnesis/AntecedentesFamiliaresForm'), {
    loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
    ssr: false
  })
}, {
  id: 'habitos',
  title: 'Hábitos y Estilo de Vida',
  component: dynamic(() => import('@/app/components/anamnesis/HabitosForm'), {
    loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
    ssr: false
  })
},
{
  id: 'revision-sistemas',
  title: 'Revisión por Sistemas',
  component: dynamic(() => import('@/app/components/anamnesis/RevisionSistemasForm'), {
    loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
    ssr: false
  })
}, {
  id: 'pruebas-previas',
  title: 'Pruebas e Informes Previos',
  component: dynamic(() => import('@/app/components/anamnesis/PruebasInformesForm'), {
    loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
    ssr: false
  })
},
{
  id: 'salud-mental',
  title: 'Salud Mental y Bienestar',
  component: dynamic(() => import('@/app/components/anamnesis/SaludMentalForm'), {
    loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
    ssr: false
  })
},
{
  id: 'percepcion-paciente',
  title: 'Percepción del Paciente',
  component: dynamic(() => import('@/app/components/anamnesis/PercepcionForm'), {
    loading: () => <div className="p-4 text-center">Cargando formulario...</div>,
    ssr: false
  })
}
];

export default function AnamnesisPage() {
  const { id: patientId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isConversational, setIsConversational] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(BASE_FORM_STEPS.filter(step => step.id !== 'antecedentes-gineco'));
  const [completedSteps, setCompletedSteps] = useState([]);
  
  // Nuevos estados para las mejoras solicitadas
  const [contextualQuestions, setContextualQuestions] = useState({});
  const [patientAgeGroup, setPatientAgeGroup] = useState(null);
  const [detectedRiskPatterns, setDetectedRiskPatterns] = useState([]);
  const [showRiskAlert, setShowRiskAlert] = useState(false);

  // Function to find the step index by its ID
  const findStepIndexById = (stepId) => {
    return visibleSteps.findIndex(step => step.id === stepId);
  };

  // Calcular edad a partir de fecha de nacimiento
  const calculateAgeFromBirthdate = (birthdateStr) => {
    if (!birthdateStr) return '';
    
    try {
      const birthdate = new Date(birthdateStr);
      if (isNaN(birthdate.getTime())) return '';
      
      const today = new Date();
      let age = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
      }
      
      return age.toString();
    } catch (error) {
      console.error('Error calculando edad:', error);
      return '';
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/dashboard/paciente/${patientId}/anamnesis`);
      return;
    }

    if (user) {
      loadPatientData();
    }
  }, [user, authLoading, patientId, router]);

  // Determinar el grupo de edad del paciente basado en su fecha de nacimiento
  const determineAgeGroup = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    
    try {
      // Convertir la fecha de nacimiento a objeto Date
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) return null;
      
      // Calcular edad
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      // Determinar grupo de edad
      if (age < 2) return 'infante';
      if (age < 12) return 'infantil';
      if (age < 18) return 'adolescente';
      if (age < 40) return 'adulto-joven';
      if (age < 65) return 'adulto-medio';
      return 'adulto-mayor';
    } catch (error) {
      console.error('Error al determinar el grupo de edad:', error);
      return null;
    }
  };

  // Generar preguntas contextuales basadas en respuestas previas
  const generateContextualQuestions = useCallback(() => {
    const newContextualQuestions = {};
    
    // Verificar datos disponibles
    if (!formData) return newContextualQuestions;
    
    // Preguntas contextuales para motivo de consulta
    if (formData['motivo-consulta']?.motivo_principal?.toLowerCase().includes('dolor')) {
      newContextualQuestions['motivo-consulta'] = [
        { id: 'intensidad_dolor', text: '¿Cuál es la intensidad del dolor en una escala de 1 a 10?', type: 'number' },
        { id: 'caracteristicas_dolor', text: '¿Cómo describiría el dolor (punzante, sordo, pulsátil, etc)?', type: 'text' },
        { id: 'factores_alivio_dolor', text: '¿Qué factores alivian el dolor?', type: 'text' }
      ];
    }
    
    // Preguntas contextuales para antecedentes personales si hay medicamentos
    if (formData['antecedentes-personales']?.medicamentos) {
      newContextualQuestions['antecedentes-personales'] = [
        { id: 'adherencia_medicamentos', text: '¿Toma sus medicamentos según lo prescrito?', type: 'boolean' },
        { id: 'efectos_secundarios', text: '¿Ha experimentado efectos secundarios con algún medicamento?', type: 'text' }
      ];
    }
    
    // Preguntas contextuales para hábitos si hay consumo de tabaco
    if (formData['habitos']?.tabaco && formData['habitos'].tabaco.toLowerCase().includes('sí')) {
      newContextualQuestions['habitos'] = [
        { id: 'cantidad_tabaco', text: '¿Cuántos cigarrillos fuma al día?', type: 'number' },
        { id: 'intentos_dejar', text: '¿Ha intentado dejar de fumar?', type: 'boolean' },
        { id: 'exposicion_pasiva', text: '¿Hay fumadores en su hogar o trabajo?', type: 'boolean' }
      ];
    }
    
    // Más preguntas contextuales según la edad
    if (patientAgeGroup === 'adulto-mayor') {
      if (!newContextualQuestions['antecedentes-personales']) {
        newContextualQuestions['antecedentes-personales'] = [];
      }
      newContextualQuestions['antecedentes-personales'].push(
        { id: 'caidas_ultimo_anio', text: '¿Ha sufrido caídas en el último año?', type: 'boolean' },
        { id: 'vive_solo', text: '¿Vive solo/a?', type: 'boolean' },
        { id: 'uso_ayudas', text: '¿Utiliza bastón, andador u otra ayuda para movilizarse?', type: 'text' }
      );
    }
    
    return newContextualQuestions;
  }, [formData, patientAgeGroup]);

  // Detectar patrones de riesgo en las respuestas
  const detectRiskPatterns = useCallback(() => {
    const risks = [];
    
    if (!formData) return risks;
    
    // Riesgos cardiovasculares
    const hasHypertension = formData['antecedentes-personales']?.hipertension_arterial;
    const hasDiabetes = formData['antecedentes-personales']?.diabetes;
    const hasHighCholesterol = formData['antecedentes-personales']?.colesterol_alto;
    const isSmoker = formData['habitos']?.tabaco && !formData['habitos']?.tabaco.toLowerCase().includes('no');
    
    if ((hasHypertension && hasDiabetes) || 
        (hasHypertension && isSmoker) || 
        (hasDiabetes && hasHighCholesterol)) {
      risks.push({
        type: 'cardiovascular',
        description: 'Múltiples factores de riesgo cardiovascular detectados',
        severity: 'alta'
      });
    }
    
    // Riesgos de salud mental
    const hasSleepIssues = formData['habitos']?.sueno && 
      (formData['habitos'].sueno.toLowerCase().includes('mal') || 
       formData['habitos'].sueno.toLowerCase().includes('insomnio'));
       
    const hasAnxietySymptoms = formData['salud-mental']?.ansiedad && 
      formData['salud-mental'].ansiedad.toLowerCase().includes('sí');
      
    const hasDepressionSymptoms = formData['salud-mental']?.depresion && 
      formData['salud-mental'].depresion.toLowerCase().includes('sí');
    
    if ((hasSleepIssues && hasAnxietySymptoms) || hasDepressionSymptoms) {
      risks.push({
        type: 'salud-mental',
        description: 'Indicadores de posibles problemas de salud mental',
        severity: 'media',
        recommendation: 'Considerar evaluación de salud mental'
      });
    }
    
    // Riesgos específicos por edad
    if (patientAgeGroup === 'adulto-mayor') {
      const hasFalls = formData['antecedentes-personales']?.caidas_ultimo_anio;
      const livesAlone = formData['antecedentes-personales']?.vive_solo;
      
      if (hasFalls && livesAlone) {
        risks.push({
          type: 'geriatrico',
          description: 'Riesgo de caídas en adulto mayor que vive solo',
          severity: 'alta',
          recommendation: 'Evaluación de riesgo de caídas y adecuación del hogar'
        });
      }
    }
    
    return risks;
  }, [formData, patientAgeGroup]);

  // Determine visible steps based on patient's characteristics and update contextual questions
  useEffect(() => {
    if (authLoading || isLoading) {
      return;
    }

    // 1. Determinar si mostrar antecedentes ginecológicos basado en sexo
    let showGineco = false;
    if (formData && (formData.sexo === 'femenino' || formData['datos-personales']?.sexo === 'femenino')) {
      showGineco = true;
    }

    const newVisibleSteps = showGineco
      ? BASE_FORM_STEPS
      : BASE_FORM_STEPS.filter(step => step.id !== 'antecedentes-gineco');

    setVisibleSteps(newVisibleSteps);

    // 2. Actualizar los pasos completados basado en datos del formulario
    const completed = [];
    for (const step of newVisibleSteps) {
      const stepData = formData[step.id];
      if (stepData && Object.keys(stepData).length > 0) {
        completed.push(step.id);
      }
    }
    setCompletedSteps(completed);

    // 3. Determinar grupo de edad del paciente
    const birthDate = formData['datos-personales']?.fecha_nacimiento || formData.fecha_nacimiento;
    const ageGroup = determineAgeGroup(birthDate);
    setPatientAgeGroup(ageGroup);
    
    // 4. Generar preguntas contextuales basadas en respuestas previas
    const contextQuestions = generateContextualQuestions();
    setContextualQuestions(contextQuestions);
    
    // 5. Detectar patrones de riesgo
    const risks = detectRiskPatterns();
    setDetectedRiskPatterns(risks);
    setShowRiskAlert(risks.length > 0);

    setCurrentStep(prev => Math.min(prev, newVisibleSteps.length - 1));
  }, [formData, authLoading, isLoading, generateContextualQuestions, detectRiskPatterns]);

  // Load patient data and any existing anamnesis information
  const loadPatientData = async () => {
    try {
      setIsLoading(true);

      // Log for debugging
      console.log('Loading patient data for ID:', patientId);
      console.log('Current user:', user);

      if (!user) {
        console.error('No authenticated user found');
        toast.error('Debe iniciar sesión para acceder a esta página');
        router.push(`/login?redirect=/dashboard/paciente/${patientId}/anamnesis`);
        return;
      }

      // Get patient details
      const patientRef = doc(db, 'users', patientId);
      const patientSnap = await getDoc(patientRef);
      if (!patientSnap.exists()) {
        console.error('Patient document not found in users collection for ID:', patientId);
        toast.error('Paciente no encontrado');
        router.push(`/dashboard/paciente/${user.uid}`);
        return;
      }

      const patientData = patientSnap.data();
      console.log('Patient data loaded from users collection:', patientData);

      // Set visible steps based on patient gender
      let steps = [...BASE_FORM_STEPS];
      if (patientData.sexo !== 'femenino') {
        // Filter out gynecological history for non-female patients
        steps = steps.filter(step => step.id !== 'antecedentes-gineco');
      }
      setVisibleSteps(steps);

      // Check for existing anamnesis data
      const anamnesisRef = doc(db, 'users', patientId, 'anamnesis', 'current');
      const anamnesisSnap = await getDoc(anamnesisRef);

      if (anamnesisSnap.exists()) {
        const anamnesisData = anamnesisSnap.data();
        console.log('Found existing anamnesis data:', anamnesisData);

        // Carga de datos existentes con preferencia por el formato estructurado
        if (anamnesisData.structuredData && anamnesisData.structuredData.sections) {
          console.log('Loading data from structured format');

          // Convertir datos estructurados al formato plano para el formulario
          const formattedData = {};
          Object.entries(anamnesisData.structuredData.sections).forEach(([sectionId, section]) => {
            formattedData[sectionId] = section.data || {};
          });

          setFormData(formattedData);

          // Actualizar pasos completados
          if (anamnesisData.structuredData.metadata.completedSections) {
            setCompletedSteps(anamnesisData.structuredData.metadata.completedSections);
          }
        }
        // Fall back al formato tradicional si no hay datos estructurados
        else if (anamnesisData.formulario) {
          console.log('Loading data from traditional format');
          setFormData(anamnesisData.formulario);

          // Actualizar pasos completados
          if (anamnesisData.completedSteps) {
            setCompletedSteps(anamnesisData.completedSteps);
          }
        }

        // If there was a previous session, offer to continue where they left off
        if (anamnesisData.lastModifiedStep) {
          const lastStepIndex = findStepIndexById(anamnesisData.lastModifiedStep);
          console.log('Last modified step:', anamnesisData.lastModifiedStep, 'Index:', lastStepIndex);

          // Only show the prompt if this isn't a completed form
          if (!anamnesisData.isCompleted && lastStepIndex > 0) {
            // Use browser confirm for simplicity, but could use a modal component
            if (typeof window !== 'undefined' && window.confirm('Encontramos un formulario incompleto. ¿Desea continuar donde lo dejó?')) {
              setCurrentStep(lastStepIndex);
            }
          }

          // If the form was already completed, show a warning
          if (anamnesisData.isCompleted) {
            toast.info('Esta historia clínica ya está completa. Los cambios que haga modificarán la versión existente.');
          }
        }
      } else {
        // Initialize with patient's basic information from patient record
        console.log('No existing anamnesis data, initializing new form');
        setFormData({
          nombre_completo: patientData.nombre || patientData.name || '',
          fecha_nacimiento: patientData.fechaNacimiento || patientData.dob || '',
          sexo: patientData.sexo || patientData.gender || '',
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast.error(`Error al cargar los datos del paciente: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Create historical version of the anamnesis for record keeping
  const createHistoricalVersion = async () => {
    try {
      if (!patientId || !user) return;

      // Import the functionality to create a version record
      const { createAnamnesisVersionRecord } = await import('@/app/services/structuredAnamnesisService');

      // Create a version record with the current user as the author
      await createAnamnesisVersionRecord(patientId, user.uid);

      console.log('Historical version of anamnesis created successfully');
    } catch (error) {
      console.error('Error creating historical version of anamnesis:', error);
      // Not showing an error toast since this is a background operation
      // and should not disrupt the user experience
    }
  };

  // Update form data
  const updateFormData = useCallback((stepData) => {
    console.log('Updating form data with:', stepData);
    setFormData(prev => {
      const newData = {
        ...prev,
        ...stepData
      };

      // Schedule an autosave after data update
      if (typeof window !== 'undefined') {
        if (window.autosaveTimeout) {
          clearTimeout(window.autosaveTimeout);
          console.log('Cleared previous autosave timeout');
        }

        window.autosaveTimeout = setTimeout(() => {
          console.log('Autosaving form data...');
          saveFormDataQuietly(newData);
        }, 3000); // Autosave after 3 seconds of inactivity
      }

      return newData;
    });
  }, [patientId, user]);
  // Save form data quietly (without toast notification)
  const saveFormDataQuietly = async (dataToSave = formData) => {
    try {
      if (!user) {
        console.error('No authenticated user found for autosave');
        return;
      }

      if (!patientId) {
        console.error('No patient ID found for autosave');
        return;
      }

      // Prepare structured data for Firestore using the formatter
      // No necesitamos la versión completa para guardar automáticamente
      // Solo estructurar el último paso actualizado para hacer el autosave más eficiente

      // Determine the current section - could be from form or conversation
      const currentStepId = isConversational
        ? Object.keys(dataToSave).find(key =>
          dataToSave[key] && typeof dataToSave[key] === 'object' &&
          Object.keys(dataToSave[key]).length > 0 &&
          !completedSteps.includes(key)
        ) || visibleSteps[currentStep]?.id
        : visibleSteps[currentStep]?.id;

      const lastUpdatedSection = {
        [currentStepId]: dataToSave[currentStepId] || {}
      };

      // Store anamnesis data in a subcollection of the users collection
      const anamnesisRef = doc(db, 'users', patientId, 'anamnesis', 'current');

      console.log('Saving form data to:', `users/${patientId}/anamnesis/current`, dataToSave);

      await setDoc(anamnesisRef, {
        formulario: dataToSave,
        // Solo actualizamos los metadatos, no toda la estructura para el autosave
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid,
        lastModifiedStep: currentStepId,
        isCompleted: false
      }, { merge: true });

      // Verify the save was successful by checking the document exists
      const savedDoc = await getDoc(anamnesisRef);
      if (savedDoc.exists()) {
        console.log('Autosaved form data successfully - verified in Firebase');
      } else {
        console.error('Failed to verify saved document in Firebase');
      }
    } catch (error) {
      console.error('Error autosaving data:', error);
      // No need to show an error toast for background saves
    }
  };

  // Save current form data to Firestore with user notification
  const saveFormData = async (dataToSave = null) => {
    try {
      // Store anamnesis data in a subcollection of the users collection
      const anamnesisRef = doc(db, 'users', patientId, 'anamnesis', 'current');

      // Get current step info
      const currentStepId = visibleSteps[currentStep]?.id;

      // Use provided data or default to current formData
      const formDataToSave = dataToSave || formData;      // Vamos a preparar los datos estructurados de la sección actual
      // Esto es más eficiente que procesar toda la anamnesis cada vez que guardamos
      const currentSectionData = formDataToSave[currentStepId] || {};

      // Debug log for data being saved
      console.log('Guardando datos del formulario en Firebase:', formDataToSave);
      console.log('Paso actual:', currentStepId);
      console.log('Pasos completados:', completedSteps);

      // Check if document exists first
      const docSnap = await getDoc(anamnesisRef);

      // Actualizar los términos de búsqueda solo para esta sección
      const updatedCompletedSteps = Array.from(
        new Set([...completedSteps, currentStepId])
      );

      if (docSnap.exists()) {        // Update existing document
        const updateData = {
          // Mantener compatibilidad con el formato original
          formulario: formDataToSave,
          updatedAt: serverTimestamp(),
          updatedBy: user?.uid,
          lastModifiedStep: currentStepId,
          isCompleted: currentStep === visibleSteps.length - 1,
          completedSteps: updatedCompletedSteps
        };

        // Actualizamos la sección actual en los datos estructurados, si ya existen
        if (docSnap.data().structuredData) {
          const currentSubSection = prepareAnamnesisForFirestore(
            { [currentStepId]: formDataToSave[currentStepId] },
            [visibleSteps[currentStep]],
            { uid: patientId }
          );

          if (currentSubSection.sections[currentStepId]) {
            updateData[`structuredData.sections.${currentStepId}`] =
              currentSubSection.sections[currentStepId];

            // Actualizamos también los términos de búsqueda
            if (currentSubSection.searchableData?.searchTerms) {
              updateData.searchTerms = currentSubSection.searchableData.searchTerms;
            }
          }
        }

        await setDoc(anamnesisRef, updateData, { merge: true });
        console.log('Documento existente actualizado en Firebase');
      } else {        // Create new document - primera vez que se guarda
        // En este caso, comenzamos con la estructura completa
        const structuredData = prepareAnamnesisForFirestore(
          formDataToSave,
          visibleSteps,
          { uid: patientId }
        );

        await setDoc(anamnesisRef, {
          formulario: formDataToSave,
          structuredData: structuredData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user?.uid,
          lastModifiedStep: currentStepId,
          isCompleted: currentStep === visibleSteps.length - 1,
          completedSteps: [currentStepId],
          searchTerms: structuredData.searchableData?.searchTerms || []
        });
        console.log('Nuevo documento creado en Firebase con estructura optimizada');
      }

      toast.success('Datos guardados correctamente');

      // Update completed steps
      if (!completedSteps.includes(visibleSteps[currentStep]?.id)) {
        setCompletedSteps([...completedSteps, visibleSteps[currentStep]?.id]);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Error al guardar los datos: ' + error.message);
    }
  };

  // Handle next step
  const handleNextStep = async () => {
    const currentStepId = visibleSteps[currentStep]?.id;
    if (!currentStepId) return;

    const validationErrors = validateStep(currentStepId);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Mensaje personalizado según el paso actual
      if (currentStepId === 'historia-enfermedad') {
        toast.error('Por favor complete al menos un campo sobre su condición actual o indique que está creando su historial médico');
      } else {
        toast.error('Por favor complete todos los campos requeridos');
      }
      return;
    }

    await saveFormData();

    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    } else {
      // Show summary instead of immediately completing
      setShowSummary(true);
    }
  };
  // Handle form submission after summary confirmation
  const handleSubmitForm = async () => {
    try {
      setIsSubmitting(true);
      console.log('Submitting completed form');

      // Prepare structured data for Firestore using the formatter
      const structuredData = prepareAnamnesisForFirestore(formData, visibleSteps, {
        uid: patientId,
        sexo: formData['datos-personales']?.sexo || formData.sexo
      });

      // Logging the complete form data for debugging
      console.log('Datos completos del formulario a enviar:', formData);
      console.log('Datos estructurados para Firestore:', structuredData);
      console.log('Ruta de almacenamiento:', `users/${patientId}/anamnesis/current`);

      // Before updating the current version, create a historical version
      // if there's an existing anamnesis
      const anamnesisRef = doc(db, 'users', patientId, 'anamnesis', 'current');
      const docSnap = await getDoc(anamnesisRef);
      if (docSnap.exists() && docSnap.data().isCompleted) {
        // This means we're modifying an existing completed anamnesis,
        // so we should save the previous version
        await createHistoricalVersion();
      }

      // Submit to Firebase with optimized data structure
      await setDoc(anamnesisRef, {
        // Mantenemos el formato original para compatibilidad
        formulario: formData,
        // Agregamos la estructura optimizada
        structuredData: structuredData,
        isCompleted: true,
        completedAt: serverTimestamp(),
        completedBy: user?.uid,
        updatedAt: serverTimestamp(),
        completedSteps: visibleSteps.map(step => step.id), // Mark all steps as completed
        // Añadimos términos de búsqueda a nivel raíz para facilitar las consultas
        searchTerms: structuredData.searchableData.searchTerms
      }, { merge: true });

      // Create a historical version of the anamnesis
      await createHistoricalVersion();

      // Verify the document was saved
      try {
        const savedDoc = await getDoc(doc(db, 'users', patientId, 'anamnesis', 'current'));
        if (savedDoc.exists()) {
          console.log('Verificación: Documento guardado con éxito en Firebase');
        } else {
          console.error('Verificación: El documento no se encontró después de guardarlo');
        }
      } catch (verifyError) {
        console.error('Error al verificar el documento guardado:', verifyError);
      }

      toast.success('Historia clínica completada');
      router.push(`/dashboard/paciente/${patientId}`);
    } catch (error) {
      console.error('Error finalizing anamnesis:', error);
      toast.error('Error al finalizar la historia clínica: ' + error.message);
      setIsSubmitting(false);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  // Basic validation for form fields
  const validateStep = (stepId) => {
    let validationErrors = {};

    switch (stepId) {
      case 'datos-personales':
        if (!formData.nombre_completo?.trim()) {
          validationErrors.nombre_completo = 'El nombre completo es obligatorio';
        }
        if (!formData.fecha_nacimiento?.trim()) {
          validationErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
        }
        if (!formData.sexo) {
          validationErrors.sexo = 'El sexo es obligatorio';
        }
        break; case 'motivo-consulta':
        // Si cualquiera de los campos principales del motivo de consulta tiene información, el paso es válido
        const hasMotivoConsulta =
          formData.motivo_principal?.trim() ||
          formData.preocupacion_principal?.trim() ||
          formData.expectativas_consulta?.trim() ||
          formData.informacion_adicional_motivo?.trim() ||
          formData.primera_historia_clinica === 'si'; // Contar como válido si está creando su historia por primera vez

        if (!hasMotivoConsulta) {
          validationErrors['motivo_principal'] = 'Por favor complete al menos uno de los campos sobre el motivo de consulta';
        }
        break; case 'historia-enfermedad':
        // Si el usuario está creando su primera historia clínica sin síntomas específicos,
        // o ha indicado que solo quiere un historial, hacemos este campo opcional
        const esPrimeraHistoria = formData.primera_historia_clinica === 'si';
        const tieneDescripcion = formData.enfermedad_actual?.descripcion?.trim();
        const tieneSintomas = formData.sintomas_principales?.trim();
        const sinSintomasActuales = formData.tiene_sintomas_actuales === 'no';

        // Si hay descripción o síntomas, o si es primera historia clínica, o si explícitamente indicó que no tiene síntomas,
        // consideramos válido
        if (!tieneDescripcion && !tieneSintomas && !esPrimeraHistoria && !sinSintomasActuales) {
          // Permitimos continuar si hay alguna información en cualquier campo del formulario
          const tieneAlgunaInformacion = Object.values(formData).some(value => {
            if (typeof value === 'string' && value.trim()) return true;
            if (typeof value === 'object' && value && Object.values(value).some(v => v)) return true;
            return false;
          });

          if (!tieneAlgunaInformacion) {
            validationErrors['enfermedad_actual'] = 'Por favor complete al menos un campo, indique que está creando su historial médico sin síntomas específicos, o seleccione la opción de no tener síntomas actuales';
          }
        }
        break;

      case 'salud-mental':
        // La sección de salud mental es opcional, no requiere validación estricta
        break;

      case 'percepcion-paciente':
        // La sección de percepción del paciente es opcional, no requiere validación estricta
        break;

      // Additional validations for other steps can be added here
      // Most form steps will be optional to allow for a flexible workflow
    }

    return validationErrors;
  };

  if (authLoading || isLoading || visibleSteps.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingIndicator message="Cargando información..." size="medium" variant="primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const StepComponent = visibleSteps[currentStep]?.component;

  if (!StepComponent) {
    return <LoadingIndicator message="Cargando paso..." size="medium" variant="primary" />;
  }

  return (
    <div className="container max-w-6xl px-4 py-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Historia Clínica Digital</h1>
        <div className="flex items-center">
          {patientAgeGroup && (
            <span className="px-2 py-1 mr-2 text-sm text-blue-600 bg-blue-50 rounded-md">
              Grupo: {patientAgeGroup.replace('-', ' ').toUpperCase()}
            </span>
          )}
          <span className="px-2 py-1 text-sm text-gray-500 bg-gray-100 rounded-md">
            ID: {patientId.substring(0, 8)}
          </span>
        </div>
      </div>
      
      {/* Mostrar alertas de patrones de riesgo si existen */}
      {showRiskAlert && detectedRiskPatterns.length > 0 && (
        <RiskAlertComponent 
          risks={detectedRiskPatterns} 
          onClose={() => setShowRiskAlert(false)} 
        />
      )}

      {/* Form header and navigation */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-800">
              {visibleSteps[currentStep]?.title || 'Anamnesis'}
            </h2>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsConversational(!isConversational)}
                className="flex items-center px-3 py-2 text-sm bg-white border border-blue-300 rounded-md hover:bg-blue-50 shadow-sm"
              >
                <span className="font-medium">{isConversational ? 'Modo Formulario' : 'Modo Conversacional'}</span>
                {isConversational ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setUseAI(!useAI)}
                className={`flex items-center px-3 py-2 text-sm ${useAI ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} rounded-md hover:${useAI ? 'bg-indigo-700' : 'bg-gray-50'} shadow-sm transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{useAI ? 'IA Activada' : 'IA Desactivada'}</span>
              </button>

              <Tooltip
                text="El modo conversacional muestra las preguntas en un formato de chat natural. Cuando la IA está activada, realizará preguntas y extraerá información automáticamente."
              />
              
              {/* Botón para ver resumen rápido */}
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="flex items-center px-3 py-2 text-sm bg-white border border-green-300 rounded-md hover:bg-green-50 shadow-sm"
                title="Ver resumen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Ver Resumen</span>
              </button>
            </div>
          </div>
        </div>        {/* Progress bar navigation */}
        <NavegacionAnamnesis
          currentSection={currentStep}
          sections={visibleSteps.map((step, index) => ({
            key: step.id,
            title: step.title,
            completed: completedSteps.includes(step.id)
          }))}
          onSectionChange={(index) => {
            // Check if current step is valid before navigating
            if (currentStep !== index) {
              const validationErrors = validateStep(visibleSteps[currentStep].id);
              if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                toast.error('Por favor complete los campos requeridos antes de navegar');
                return;
              }
              saveFormData();
              setCurrentStep(index);
              setErrors({});
            }
          }}
        />
      </div>      {/* Mostrar el resumen visual cuando showSummary es true */}
      {showSummary && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-800">Resumen de Historia Clínica</h2>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <DynamicAnamnesisFormSummary 
              formData={formData} 
              visibleSteps={visibleSteps} 
              patientAgeGroup={patientAgeGroup}
              riskPatterns={detectedRiskPatterns}
              completedSteps={completedSteps}
            />
          </div>
        </div>
      )}
      
      {/* Form content */}
      {isConversational ? (
        <div className="p-6 bg-white rounded-lg shadow-md">        
          <div className="p-4 mb-6 border border-blue-100 rounded-md bg-blue-50">
            <p className="text-blue-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              {useAI ? 
                'El asistente inteligente le hará preguntas específicas y extraerá información automáticamente para completar su historia clínica.' : 
                'El modo conversacional le permite completar su historia clínica en un formato de chat. Responda las preguntas del asistente.'}
            </p>
          </div>
          <ToastProvider>
            {useAI ? (
              <AIConversationalAnamnesis
                patientId={patientId}
                formData={formData}
                updateFormData={updateFormData}
                visibleSteps={visibleSteps}
                currentStepIndex={currentStep}
                onSaveProgress={saveFormData}
                isSubmitting={isSubmitting}
                patientContext={{
                  age: formData['datos-personales']?.edad || calculateAgeFromBirthdate(formData['datos-personales']?.fecha_nacimiento),
                  gender: formData['datos-personales']?.sexo || formData.sexo,
                  medicalConditions: formData['antecedentes-personales']?.enfermedades
                }}
              />
            ) : (
              <ConversationalAnamnesis
                patientId={patientId}
                existingData={formData} 
                patientAgeGroup={patientAgeGroup}
                onInsightsGenerated={(insights) => {
                  console.log('Insights received from conversation:', insights);

                  // Update form data with insights extracted from conversation
                  const updatedFormData = { ...formData };
                  const updatedSections = [];

                  // Process each section of insights
                  Object.entries(insights).forEach(([sectionId, sectionData]) => {
                    if (sectionData && typeof sectionData === 'object') {
                      // Normalize section ID format (with dashes)
                      const normalizedSectionId = sectionId.includes('-') ? sectionId : sectionId.replace('_', '-');

                      // Only merge non-empty objects
                      if (Object.keys(sectionData).length > 0) {
                        updatedFormData[normalizedSectionId] = {
                          ...(updatedFormData[normalizedSectionId] || {}),
                          ...sectionData
                        };

                        updatedSections.push(normalizedSectionId);

                        // Mark section as completed if it has meaningful data
                        if (!completedSteps.includes(normalizedSectionId)) {
                          setCompletedSteps(prev => [...prev, normalizedSectionId]);
                        }
                      }
                    }
                  });

                  if (updatedSections.length > 0) {
                    // Update form data with new insights
                    setFormData(updatedFormData);

                    // Log updates for debugging
                    console.log('Updated form data with insights:', updatedFormData);
                    console.log('Updated sections:', updatedSections);

                    // Save insights to Firebase with notification
                    toast.success('Información actualizada desde la conversación');
                    saveFormData(updatedFormData);
                  }
                }}
              />
            )}
          </ToastProvider>
        </div>
      ) : showSummary ? (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <DynamicAnamnesisFormSummary
            formData={formData}
            visibleSteps={visibleSteps}
            onEditSection={(stepIndex) => {
              setShowSummary(false);
              setCurrentStep(stepIndex);
            }}
            onConfirm={handleSubmitForm}
            onBack={() => {
              setShowSummary(false);
              setCurrentStep(visibleSteps.length - 1);
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md">
          {/* If showing summary, render summary view */}
          {!showSummary ? (
            <>
              {/* Mostrar preguntas contextuales si existen para este paso */}
              {contextualQuestions[visibleSteps[currentStep]?.id] && contextualQuestions[visibleSteps[currentStep]?.id].length > 0 && (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <h3 className="text-md font-medium text-indigo-800 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    Preguntas adicionales relevantes a su caso
                  </h3>
                  
                  <div className="space-y-4">
                    {contextualQuestions[visibleSteps[currentStep]?.id].map((question, index) => (
                      <div key={index} className="p-3 bg-white border border-indigo-100 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{question.text}</label>
                        {question.type === 'boolean' ? (
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                name={question.id} 
                                value="si"
                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                onChange={() => {
                                  const currentStepId = visibleSteps[currentStep]?.id;
                                  const currentData = formData[currentStepId] || {};
                                  updateFormData({ 
                                    [currentStepId]: { 
                                      ...currentData, 
                                      [question.id]: 'si' 
                                    } 
                                  });
                                }}
                                checked={formData[visibleSteps[currentStep]?.id]?.[question.id] === 'si'}
                              />
                              <span className="ml-2 text-sm text-gray-700">Sí</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                name={question.id} 
                                value="no"
                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                onChange={() => {
                                  const currentStepId = visibleSteps[currentStep]?.id;
                                  const currentData = formData[currentStepId] || {};
                                  updateFormData({ 
                                    [currentStepId]: { 
                                      ...currentData, 
                                      [question.id]: 'no' 
                                    } 
                                  });
                                }}
                                checked={formData[visibleSteps[currentStep]?.id]?.[question.id] === 'no'}
                              />
                              <span className="ml-2 text-sm text-gray-700">No</span>
                            </label>
                          </div>
                        ) : question.type === 'number' ? (
                          <input
                            type="number"
                            id={question.id}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={formData[visibleSteps[currentStep]?.id]?.[question.id] || ''}
                            onChange={(e) => {
                              const currentStepId = visibleSteps[currentStep]?.id;
                              const currentData = formData[currentStepId] || {};
                              updateFormData({ 
                                [currentStepId]: { 
                                  ...currentData, 
                                  [question.id]: e.target.value 
                                } 
                              });
                            }}
                          />
                        ) : (
                          <input
                            type="text"
                            id={question.id}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={formData[visibleSteps[currentStep]?.id]?.[question.id] || ''}
                            onChange={(e) => {
                              const currentStepId = visibleSteps[currentStep]?.id;
                              const currentData = formData[currentStepId] || {};
                              updateFormData({ 
                                [currentStepId]: { 
                                  ...currentData, 
                                  [question.id]: e.target.value 
                                } 
                              });
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Mostrar adaptaciones específicas según la edad */}
              {patientAgeGroup && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-sm text-blue-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Formulario adaptado para paciente del grupo: <span className="font-medium">{patientAgeGroup.replace('-', ' ').toUpperCase()}</span>
                  </p>
                </div>
              )}
              
              <StepComponent
                formData={formData[visibleSteps[currentStep]?.id] || {}}
                updateFormData={(data) => updateFormData({ [visibleSteps[currentStep]?.id]: data })}
                nextStep={handleNextStep}
                prevStep={handlePrevStep}
                isLastStep={currentStep === visibleSteps.length - 1}
                isFirstStep={currentStep === 0}
                isSubmitting={isSubmitting}
                errors={errors}
                patientAgeGroup={patientAgeGroup}
              />
            </> 
          ) : (
            <DynamicAnamnesisFormSummary
              formData={formData}
              visibleSteps={visibleSteps}
              onBack={() => setShowSummary(false)}
              onConfirm={handleSubmitForm}
              isSubmitting={isSubmitting}
              patientAgeGroup={patientAgeGroup}
              riskPatterns={detectedRiskPatterns}
              completedSteps={completedSteps}
            />
          )}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={`px-4 py-2 border border-gray-300 rounded-md ${currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Anterior
              </span>
            </button>

            <button
              onClick={handleNextStep}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="flex items-center">
                {currentStep === visibleSteps.length - 1 ? 'Revisar y Finalizar' : 'Siguiente'}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </button>          </div>
        </div>
      )}

      {/* Debug component for development */}
      <FirebaseDebug
        user={user}
        formData={formData}
        errors={errors}
        lastSaved={formData.updated_at ? new Date(formData.updated_at.seconds * 1000) : null}
      />
    </div>
  );
}
