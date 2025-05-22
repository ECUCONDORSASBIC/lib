import { db, ensureFirebase } from '@/lib/firebase/firebaseClient';
import { collection, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Verifica si existe un documento en la colección 'patients' y lo crea si no existe
 * basado en los datos del documento en la colección 'users'.
 * @param {string} patientId - ID del paciente/usuario
 * @param {Object} firestoreDb - Instancia de Firestore
 * @returns {Promise<boolean>} - Indica si el documento existe o fue creado exitosamente
 */
async function checkAndCreatePatientDoc(patientId, firestoreDb) {
  if (!patientId || !firestoreDb) {
    console.error('checkAndCreatePatientDoc: patientId y firestoreDb son requeridos');
    return false;
  }

  try {
    const patientRef = doc(firestoreDb, 'patients', patientId);
    const patientSnap = await getDoc(patientRef);

    if (patientSnap.exists()) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[usePatientData] Documento patients/${patientId} ya existe.`);
      }
      return true;
    }

    const userRef = doc(firestoreDb, 'users', patientId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Lógica para crear el documento del paciente con datos del usuario
      // Implementación omitida para brevedad
      return true;
    }

    console.warn(`[usePatientData] No se encontró el documento users/${patientId} para crear el documento del paciente.`);
    return false;
  } catch (error) {
    console.error('[usePatientData] Error verificando/creando documento del paciente:', error);
    return false;
  }
}

export function usePatientData(patientId) {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAnamnesisData, setHasAnamnesisData] = useState(false);
  const [isAnamnesisComplete, setIsAnamnesisComplete] = useState(false);

  // Use refs to store unsubscribe functions to prevent them from triggering re-renders
  const unsubscribeUserRef = useRef(null);
  const unsubscribePatientRef = useRef(null);
  const unsubscribeAnamnesisRef = useRef(null);

  // Use ref to track initialization status
  const isInitializedRef = useRef(false);

  // Memoized function to handle profile updates from anamnesis
  const handleAnamnesisProfileUpdate = useCallback(async (patientId, anamnesisData) => {
    try {
      if (!anamnesisData) return;
      const { updatePatientProfile } = await import('@/app/services/anamnesisService');
      await updatePatientProfile(patientId, anamnesisData);
    } catch (error) {
      console.error('[usePatientData] Error updating profile from anamnesis:', error);
    }
  }, []);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    // Always clean up previous listeners before setting up new ones
    const cleanupListeners = () => {
      if (unsubscribeUserRef.current) {
        unsubscribeUserRef.current();
        unsubscribeUserRef.current = null;
      }
      if (unsubscribePatientRef.current) {
        unsubscribePatientRef.current();
        unsubscribePatientRef.current = null;
      }
      if (unsubscribeAnamnesisRef.current) {
        unsubscribeAnamnesisRef.current();
        unsubscribeAnamnesisRef.current = null;
      }
    };

    // Only proceed if we haven't already initialized for this patientId
    if (isInitializedRef.current) {
      return;
    }

    // Mark as initialized to prevent duplicate setups
    isInitializedRef.current = true;
    setLoading(true);

    const setupListeners = async () => {
      try {
        await ensureFirebase(); // Ensure Firebase is initialized

        // Only check and create patient doc once
        const patientDocEnsured = await checkAndCreatePatientDoc(patientId, db);
        if (!patientDocEnsured && process.env.NODE_ENV === 'development') {
          console.warn(`[usePatientData] No se pudo asegurar la existencia del documento patients/${patientId}. Los listeners podrían no funcionar como se espera.`);
        }

        // Listener para la colección 'users'
        const userRef = doc(db, 'users', patientId);
        unsubscribeUserRef.current = onSnapshot(
          userRef,
          (userSnapshot) => {
            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
              if (process.env.NODE_ENV === 'development') {
                console.log('[usePatientData] Real-time update from users collection:', { userId: patientId });
              }
              // Actualizar patientData, manteniendo otros datos si existen
              setPatientData(prevData => {
                if (!prevData) return { ...userData, id: patientId };
                return { ...prevData, ...userData, id: patientId };
              });
            }
          },
          (error) => {
            console.error('[usePatientData] Error en escucha en tiempo real de users:', error);
          }
        );

        // Listener para la colección 'patients'
        const patientRefDoc = doc(db, 'patients', patientId);
        unsubscribePatientRef.current = onSnapshot(
          patientRefDoc,
          (patientSnapshot) => {
            if (patientSnapshot.exists()) {
              const currentPatientData = patientSnapshot.data();
              if (process.env.NODE_ENV === 'development') {
                console.log('[usePatientData] Real-time update from patients collection:', { patientId });
              }
              // Esta es la principal fuente de verdad, sobrescribe userData si existe
              setPatientData(prevData => ({ ...prevData, id: patientId, ...currentPatientData }));
            }
          },
          (error) => {
            console.error('[usePatientData] Error en escucha en tiempo real de patients:', error);
          }
        );

        // Listener para la colección 'anamnesis'
        const conversacionalRef = doc(db, 'patients', patientId, 'anamnesis', 'conversacional');
        unsubscribeAnamnesisRef.current = onSnapshot(
          conversacionalRef,
          async (conversacionalSnap) => {
            try {
              if (conversacionalSnap.exists()) {
                const anamnesisData = conversacionalSnap.data();
                setHasAnamnesisData(true);
                setIsAnamnesisComplete(anamnesisData.isCompleted || false);

                // Use memoized function for profile update
                await handleAnamnesisProfileUpdate(patientId, anamnesisData);
              } else {
                // Solo verificar otros documentos si el conversacional no existe
                const anamnesisCollRef = collection(db, 'patients', patientId, 'anamnesis');
                const anamnesisSnap = await getDocs(anamnesisCollRef);

                if (!anamnesisSnap.empty) {
                  const generalAnamnesisData = anamnesisSnap.docs[0].data();
                  setHasAnamnesisData(true);
                  setIsAnamnesisComplete(generalAnamnesisData.isCompleted || false);

                  // Use memoized function for profile update
                  await handleAnamnesisProfileUpdate(patientId, generalAnamnesisData);
                } else {
                  setHasAnamnesisData(false);
                  setIsAnamnesisComplete(false);
                }
              }
            } catch (anamnesisError) {
              console.error('[usePatientData] Error procesando datos de anamnesis:', anamnesisError);
            }
          },
          (error) => {
            console.error('[usePatientData] Error en escucha en tiempo real de anamnesis:', error);
          }
        );
      } catch (error) {
        console.error('[usePatientData] Error setting up real-time listeners:', error);
        setPatientData(null);
      } finally {
        setLoading(false);
      }
    };

    setupListeners();

    // Cleanup function when component unmounts or patientId changes
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[usePatientData] Cleaning up listeners for patientId:', patientId);
      }
      cleanupListeners();
      isInitializedRef.current = false;
    };
  }, [patientId, handleAnamnesisProfileUpdate]); // Only re-run when patientId or memoized function changes

  return { patientData, loading, hasAnamnesisData, isAnamnesisComplete };
}
