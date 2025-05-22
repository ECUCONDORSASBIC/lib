
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/firebaseClient';
import { doc, onSnapshot } from 'firebase/firestore';

export default function PatientVitals({ patientId: propPatientId }) {
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: Reemplazar esto por el contexto global de usuario si existe
  const patientId = propPatientId || (typeof window !== 'undefined' && localStorage.getItem('patientId'));

  useEffect(() => {
    if (!patientId) {
      setError('No se encontró el ID del paciente.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const vitalsDocRef = doc(db, `patients/${patientId}/vitals/main`);
    const unsub = onSnapshot(vitalsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setVitals(docSnap.data());
        setError(null);
      } else {
        setVitals(null);
        setError('No hay datos de signos vitales registrados.');
      }
      setLoading(false);
    }, (err) => {
      setError('Error al cargar signos vitales.');
      setLoading(false);
    });
    return () => unsub();
  }, [patientId]);

  if (loading) {
    return (
      <div className="p-4 bg-white border rounded-lg text-gray-700 flex items-center justify-center">
        <span className="animate-spin mr-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
        Cargando signos vitales...
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {error}
      </div>
    );
  }
  if (!vitals) {
    return null;
  }

  // Mostrar los signos vitales principales
  const VITALS = [
    { label: 'Presión arterial', value: vitals.bloodPressure, unit: 'mmHg' },
    { label: 'Frecuencia cardíaca', value: vitals.heartRate, unit: 'lpm' },
    { label: 'Glucosa', value: vitals.glucose, unit: 'mg/dL' },
    { label: 'IMC', value: vitals.bmi, unit: '' },
    { label: 'Temperatura', value: vitals.temperature, unit: '°C' },
  ];

  return (
    <div className="p-4 bg-white border rounded-lg text-gray-700">
      <h3 className="text-base font-semibold mb-2">Signos Vitales</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {VITALS.map((v, idx) => (
          <div key={idx} className="flex flex-col items-start bg-gray-50 rounded-md p-3 shadow-sm">
            <span className="text-xs text-gray-500 mb-1">{v.label}</span>
            <span className="text-lg font-bold text-primary">
              {v.value !== undefined && v.value !== null ? v.value : '--'} {v.unit}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Última actualización: {vitals.updatedAt ? new Date(vitals.updatedAt.seconds * 1000).toLocaleString() : 'N/D'}
      </div>
    </div>
  );
}
