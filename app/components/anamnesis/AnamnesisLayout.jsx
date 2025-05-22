import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useToast } from '../ui/Toast';

import AntecedentesFamiliaresForm from './AntecedentesFamiliaresForm';
import AntecedentesPersonalesForm from './AntecedentesPersonalesForm';
import DatosPersonalesForm from './DatosPersonalesForm';
import EnfermedadActualForm from './EnfermedadActualForm';
import HabitosForm from './HabitosForm';
import MotivoConsultaForm from './MotivoConsultaForm';
import PercepcionForm from './PercepcionForm';
import RevisionSistemasForm from './RevisionSistemasForm';

import ProgressBar from './shared/ProgressBar';

const ANAMNESIS_SECTIONS = [
  { id: 'datos_personales', name: 'Datos Personales', component: DatosPersonalesForm },
  { id: 'motivo_consulta', name: 'Motivo de Consulta', component: MotivoConsultaForm },
  { id: 'enfermedad_actual', name: 'Enfermedad Actual', component: EnfermedadActualForm },
  { id: 'antecedentes_personales', name: 'Antecedentes Personales', component: AntecedentesPersonalesForm },
  { id: 'antecedentes_familiares', name: 'Antecedentes Familiares', component: AntecedentesFamiliaresForm },
  { id: 'habitos', name: 'Hábitos Psicobiológicos', component: HabitosForm },
  { id: 'revision_sistemas', name: 'Revisión por Sistemas', component: RevisionSistemasForm },
  { id: 'percepcion_paciente', name: 'Percepción del Paciente', component: PercepcionForm },
];

const AnamnesisLayout = ({ patientId }) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [currentSectionId, setCurrentSectionId] = useState(ANAMNESIS_SECTIONS[0].id);
  const [anamnesisData, setAnamnesisData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirectTo=${encodeURIComponent(router.asPath)}`);
    }
  }, [user, authLoading, router, patientId]);

  // Efecto para cargar datos existentes de Firebase
  useEffect(() => {
    const loadAnamnesisData = async () => {
      if (!user || !patientId && !user.uid) return;

      try {
        const { db } = await import('../../lib/firebase');
        const { doc, getDoc } = await import('firebase/firestore');

        const effectivePatientId = patientId || user.uid;
        const anamnesisRef = doc(db, 'pacientes', effectivePatientId, 'anamnesis', 'current');
        const anamnesisDoc = await getDoc(anamnesisRef);

        if (anamnesisDoc.exists()) {
          const data = anamnesisDoc.data();
          if (data.formulario) {
            setAnamnesisData(data.formulario);
            toast.info('Datos de anamnesis cargados correctamente');
          }
        }
      } catch (error) {
        console.error('Error al cargar datos de anamnesis:', error);
        toast.error('No se pudieron cargar los datos anteriores');
      }
    };

    // Cargar datos solo si el usuario está autenticado
    if (!authLoading && user) {
      loadAnamnesisData();
    }
  }, [user, authLoading, patientId, toast]);
  const handleDataChange = async (sectionId, data) => {
    // Actualizar datos en el estado local
    setAnamnesisData(prevData => ({
      ...prevData,
      [sectionId]: data,
    }));

    try {
      // Guardar automáticamente en Firebase después de cada cambio
      const { db } = await import('../../lib/firebase');
      const { doc, setDoc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');

      const effectivePatientId = patientId || user.uid;
      const anamnesisRef = doc(db, 'pacientes', effectivePatientId, 'anamnesis', 'current');

      // Verificar si ya existe un documento de anamnesis
      const anamnesisDoc = await getDoc(anamnesisRef);

      if (anamnesisDoc.exists()) {
        // Actualizar documento existente
        await updateDoc(anamnesisRef, {
          [`formulario.${sectionId}`]: data,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid
        });
      } else {
        // Crear nuevo documento
        await setDoc(anamnesisRef, {
          formulario: {
            [sectionId]: data
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user.uid,
          completedSteps: [sectionId],
          isCompleted: false
        });
      }

      // Actualizar último guardado
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error al guardar sección:', error);
      toast.error('No se pudo guardar los cambios. Intente de nuevo.');
    }
  };

  const CurrentFormComponent = ANAMNESIS_SECTIONS.find(sec => sec.id === currentSectionId)?.component;

  const navigateToSection = (sectionId) => {
    setCurrentSectionId(sectionId);
  };

  const handleNext = () => {
    const currentIndex = ANAMNESIS_SECTIONS.findIndex(sec => sec.id === currentSectionId);
    if (currentIndex < ANAMNESIS_SECTIONS.length - 1) {
      let nextIndex = currentIndex + 1;
      while (ANAMNESIS_SECTIONS[nextIndex].isConditional &&
        anamnesisData['datos_personales']?.[ANAMNESIS_SECTIONS[nextIndex].conditionField] !== ANAMNESIS_SECTIONS[nextIndex].conditionValue) {
        nextIndex++;
        if (nextIndex >= ANAMNESIS_SECTIONS.length) {
          toast.info("Ha llegado al final del formulario.");
          return;
        }
      }
      setCurrentSectionId(ANAMNESIS_SECTIONS[nextIndex].id);
    } else {
      toast.info("Ha llegado al final del formulario.");
    }
  };

  const handlePrevious = () => {
    const currentIndex = ANAMNESIS_SECTIONS.findIndex(sec => sec.id === currentSectionId);
    if (currentIndex > 0) {
      let prevIndex = currentIndex - 1;
      while (ANAMNESIS_SECTIONS[prevIndex].isConditional &&
        anamnesisData['datos_personales']?.[ANAMNESIS_SECTIONS[prevIndex].conditionField] !== ANAMNESIS_SECTIONS[prevIndex].conditionValue) {
        prevIndex--;
        if (prevIndex < 0) break;
      }
      if (prevIndex >= 0) {
        setCurrentSectionId(ANAMNESIS_SECTIONS[prevIndex].id);
      }
    }
  };
  const handleFormSubmit = async () => {
    setIsSaving(true);
    toast.info('Enviando anamnesis...');
    try {
      // Importamos Firebase aquí para evitar errores de referencias cíclicas
      const { db } = await import('../../lib/firebase');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

      // Referencia al documento de anamnesis del paciente
      const anamnesisRef = doc(db, 'pacientes', patientId || user.uid, 'anamnesis', 'current');

      // Guardar los datos en Firebase
      await setDoc(anamnesisRef, {
        formulario: anamnesisData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        completedSteps: ANAMNESIS_SECTIONS.map(section => section.id),
        isCompleted: true
      });

      console.log('Anamnesis enviada:', { patientId, ...anamnesisData });
      setLastSaved(new Date());
      toast.success('Anamnesis enviada correctamente.');
    } catch (error) {
      console.error("Error al enviar anamnesis:", error);
      toast.error('Error al enviar la anamnesis. Intente de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
        <p className="ml-4 text-lg font-medium text-gray-700">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-medium text-gray-700">Redirigiendo a inicio de sesión...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl px-4 py-8 mx-auto">
      <h1 className="mb-2 text-3xl font-bold text-center text-gray-800">Ficha de Anamnesis</h1>
      <p className="mb-8 text-center text-gray-600">Paciente ID: {patientId || user?.uid} (Asegúrese de pasar patientId como prop)</p>

      <div className="mb-8">
        <ProgressBar
          steps={ANAMNESIS_SECTIONS.filter(sec =>
            !sec.isConditional ||
            (anamnesisData['datos_personales']?.[sec.conditionField] === sec.conditionValue)
          )}
          currentStepId={currentSectionId}
          onStepClick={navigateToSection}
        />
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl min-h-[400px]">
        {CurrentFormComponent ? (
          <CurrentFormComponent
            formData={anamnesisData[currentSectionId] || {}}
            patientData={anamnesisData['datos_personales']}
            onChange={(data) => handleDataChange(currentSectionId, data)}
            onSaveAndContinue={handleNext}
            onPrevious={handlePrevious}
          />
        ) : (
          <p>Sección no encontrada.</p>
        )}
      </div>

      {currentSectionId === ANAMNESIS_SECTIONS[ANAMNESIS_SECTIONS.length - 1].id && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={isSaving}
            className="px-8 py-3 font-semibold text-white transition duration-150 bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSaving ? 'Enviando...' : 'Finalizar y Enviar Anamnesis'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AnamnesisLayout;
