'use client';

import { db } from '@/lib/firebase/firebaseClient';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// Usaremos un icono de pastilla simple como SVG
const PillIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M10.75 3.002H9.25A5.25 5.25 0 004 8.252v3.5a5.25 5.25 0 005.25 5.25h1.5a5.25 5.25 0 005.25-5.25v-3.5A5.25 5.25 0 0010.75 3.002zM14.5 11.752a3.75 3.75 0 01-3.75 3.75H9.25a3.75 3.75 0 01-3.75-3.75v-3.5a3.75 3.75 0 013.75-3.75h1.5a3.75 3.75 0 013.75 3.75v3.5z" />
    <path d="M9.25 8.5h1.5v3h-1.5z" fillRule="evenodd" clipRule="evenodd" />
  </svg>
);

const MedicationRemindersCard = ({ patientId, reminders = [], onUpdate }) => {
  const [showAll, setShowAll] = useState(false);
  const [processing, setProcessing] = useState({});
  const [localReminders, setLocalReminders] = useState(reminders);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suscripción en tiempo real a los recordatorios de medicación
  useEffect(() => {
    if (!patientId) {
      setError('No se encontró el ID del paciente.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const medsCol = collection(db, `patients/${patientId}/medications`);
      const unsub = onSnapshot(medsCol, (snap) => {
        const meds = [];
        snap.forEach(docSnap => {
          meds.push({ id: docSnap.id, ...docSnap.data() });
        });
        setLocalReminders(meds);
        setLoading(false);
      }, (err) => {
        setError('Error al cargar recordatorios de medicación.');
        setLoading(false);
      });
      return () => unsub();
    } catch (err) {
      setError('Error al conectar con Firestore.');
      setLoading(false);
    }
  }, [patientId]);

  // Update local reminders when props change (solo si no hay suscripción activa)
  useEffect(() => {
    if (!patientId && reminders.length > 0) {
      setLocalReminders(reminders);
      setLoading(false);
    }
  }, [reminders, patientId]);

  const visibleReminders = showAll ? localReminders : localReminders.slice(0, 3);

  const handleMarkAsTaken = async (reminderId) => {
    try {
      setProcessing(prev => ({ ...prev, [reminderId]: 'taken' }));

      // In a real app, update the document in Firestore
      if (patientId) {
        const reminderRef = doc(db, `patients/${patientId}/medications/${reminderId}`);
        await updateDoc(reminderRef, {
          taken: true,
          takenAt: serverTimestamp(),
          skipped: false
        });

        // Also log this action
        const logsCollection = collection(db, `patients/${patientId}/medicationLogs`);
        await addDoc(logsCollection, {
          medicationId: reminderId,
          action: 'taken',
          timestamp: serverTimestamp()
        });
      }

      // Update local state to reflect changes
      setLocalReminders(prev => prev.map(reminder =>
        reminder.id === reminderId
          ? { ...reminder, taken: true, takenAt: new Date(), skipped: false }
          : reminder
      ));

      // Notify parent component
      if (onUpdate) {
        onUpdate('taken', reminderId);
      }
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      alert('Error al actualizar el estado del medicamento. Por favor, intenta nuevamente.');
    } finally {
      setProcessing(prev => ({ ...prev, [reminderId]: null }));
    }
  };

  const handleMarkAsSkipped = async (reminderId) => {
    try {
      setProcessing(prev => ({ ...prev, [reminderId]: 'skipped' }));

      // In a real app, update the document in Firestore
      if (patientId) {
        const reminderRef = doc(db, `patients/${patientId}/medications/${reminderId}`);
        await updateDoc(reminderRef, {
          skipped: true,
          skippedAt: serverTimestamp(),
          taken: false
        });

        // Also log this action
        const logsCollection = collection(db, `patients/${patientId}/medicationLogs`);
        await addDoc(logsCollection, {
          medicationId: reminderId,
          action: 'skipped',
          timestamp: serverTimestamp(),
          reason: 'user_marked'
        });
      }

      // Update local state to reflect changes
      setLocalReminders(prev => prev.map(reminder =>
        reminder.id === reminderId
          ? { ...reminder, skipped: true, skippedAt: new Date(), taken: false }
          : reminder
      ));

      // Notify parent component
      if (onUpdate) {
        onUpdate('skipped', reminderId);
      }
    } catch (error) {
      console.error('Error marking medication as skipped:', error);
      alert('Error al actualizar el estado del medicamento. Por favor, intenta nuevamente.');
    } finally {
      setProcessing(prev => ({ ...prev, [reminderId]: null }));
    }
  };

  if (localReminders.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Recordatorios de Medicación (Hoy)</h3>
        <div className="flex flex-col items-center justify-center p-4 text-center rounded-md bg-gray-50">
          <CheckCircleIcon className="w-12 h-12 mb-2 text-green-500" />
          <p className="text-sm text-gray-600">¡Todo en orden! No tienes recordatorios de medicación pendientes para hoy.</p>
        </div>
      </div>
    );
  }

  const pendingCount = localReminders.filter(r => !r.taken && !r.skipped).length;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recordatorios de Medicación (Hoy)</h3>
        {pendingCount > 0 && (
          <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
            {pendingCount} Pendientes
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {visibleReminders.map((reminder) => (
          <li
            key={reminder.id}
            className={`p-3 rounded-md border ${reminder.taken ? 'bg-green-50 border-green-200' :
              reminder.skipped ? 'bg-red-50 border-red-200' :
                'bg-yellow-50 border-yellow-300 hover:shadow-sm'
              }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className={`mr-3 flex-shrink-0 p-1.5 rounded-full ${reminder.taken ? 'bg-green-100' :
                  reminder.skipped ? 'bg-red-100' :
                    'bg-yellow-100'
                  }`}>
                  {reminder.taken ? <CheckCircleIcon className="w-5 h-5 text-green-600" /> :
                    reminder.skipped ? <XCircleIcon className="w-5 h-5 text-red-600" /> :
                      <PillIcon className="w-5 h-5 text-yellow-600" />}
                </div>
                <div>
                  <p className={`font-medium ${reminder.taken ? 'text-green-700' :
                    reminder.skipped ? 'text-red-700' :
                      'text-yellow-800'
                    }`}>{reminder.medicationName}</p>
                  <p className="text-sm text-gray-600">
                    {reminder.dosage} - {reminder.time}
                  </p>
                  {reminder.instructions && <p className="mt-1 text-xs text-gray-500">{reminder.instructions}</p>}
                </div>
              </div>
              {!reminder.taken && !reminder.skipped && (
                <div className="flex flex-col items-end ml-2 space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleMarkAsTaken(reminder.id)}
                    disabled={processing[reminder.id] === 'taken'}
                    title="Marcar como tomada"
                    className="p-1 text-green-600 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {processing[reminder.id] === 'taken' ? (
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    ) : (
                      <CheckCircleIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleMarkAsSkipped(reminder.id)}
                    disabled={processing[reminder.id] === 'skipped'}
                    title="Marcar como omitida"
                    className="p-1 text-red-600 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {processing[reminder.id] === 'skipped' ? (
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    ) : (
                      <XCircleIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            </div>
            {reminder.taken && (
              <p className="mt-1 text-xs text-green-600">
                Tomada {reminder.takenAt ? `a las ${new Date(reminder.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </p>
            )}
            {reminder.skipped && (
              <p className="mt-1 text-xs text-red-600">
                Omitida {reminder.skippedAt ? `a las ${new Date(reminder.skippedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </p>
            )}
          </li>
        ))}
      </ul>

      {localReminders.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            {showAll ? 'Mostrar menos' : `Mostrar todos (${localReminders.length})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicationRemindersCard;
