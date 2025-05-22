'use client';

import { Spinner } from '@components/ui/Spinner';
import { CogIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { db, ensureFirebase } from '@lib/firebase/firebaseClient';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Component that allows patients to manage their notification preferences
 * @param {Object} props - Component props
 * @param {string} props.patientId - The ID of the patient
 * @returns {JSX.Element} The notification preferences UI
 */
const NotificationPreferences = ({ patientId }) => {
  const [preferences, setPreferences] = useState({
    channels: {
      email: true,
      sms: false,
      push: true,
      browser: true,
    },
    types: {
      appointments: true,
      prescriptions: true,
      labResults: true,
      messages: true,
      billing: false,
      reminders: true,
      healthTips: false,
    },
    frequency: 'immediate', // 'immediate', 'daily', 'weekly'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        await ensureFirebase();
        const prefsRef = doc(db, 'patients', patientId, 'settings', 'notifications');
        const prefsSnap = await getDoc(prefsRef);

        if (prefsSnap.exists()) {
          setPreferences(prevPrefs => ({
            ...prevPrefs,
            ...prefsSnap.data()
          }));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading notification preferences:', err);
        setError('No se pudieron cargar tus preferencias de notificación');
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPreferences();
    }
  }, [patientId]);

  const handleChannelToggle = (channel) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel]
      }
    }));
  };

  const handleTypeToggle = (type) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
  };

  const handleFrequencyChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      frequency: e.target.value
    }));
  };

  const savePreferences = async () => {
    if (!patientId) return;

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await ensureFirebase();
      const prefsRef = doc(db, 'patients', patientId, 'settings', 'notifications');

      await setDoc(prefsRef, preferences, { merge: true });

      // Also update the main patient document with a summary of preferences
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, {
        'notificationPreferences': {
          emailEnabled: preferences.channels.email,
          smsEnabled: preferences.channels.sms,
          pushEnabled: preferences.channels.push,
          lastUpdated: new Date()
        }
      });

      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError('No se pudieron guardar tus preferencias de notificación');
    } finally {
      setSaving(false);
    }
  };

  const getToggleClasses = (isActive) => {
    return `relative inline-flex h-6 w-11 items-center rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-200'
      }`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="md" />
        <span className="ml-2 text-gray-600">Cargando preferencias...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <CogIcon className="h-6 w-6 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Preferencias de Notificaciones</h3>
      </div>

      <div className="space-y-6">
        {/* Canales de notificación */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Recibir notificaciones por:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Correo electrónico</span>
              <button
                onClick={() => handleChannelToggle('email')}
                className={getToggleClasses(preferences.channels.email)}
              >
                <span
                  className={`${preferences.channels.email ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SMS</span>
              <button
                onClick={() => handleChannelToggle('sms')}
                className={getToggleClasses(preferences.channels.sms)}
              >
                <span
                  className={`${preferences.channels.sms ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Notificaciones Push</span>
              <button
                onClick={() => handleChannelToggle('push')}
                className={getToggleClasses(preferences.channels.push)}
              >
                <span
                  className={`${preferences.channels.push ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Navegador</span>
              <button
                onClick={() => handleChannelToggle('browser')}
                className={getToggleClasses(preferences.channels.browser)}
              >
                <span
                  className={`${preferences.channels.browser ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Tipos de notificaciones */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Tipos de notificaciones:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Citas médicas</span>
              <button
                onClick={() => handleTypeToggle('appointments')}
                className={getToggleClasses(preferences.types.appointments)}
              >
                <span
                  className={`${preferences.types.appointments ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Prescripciones médicas</span>
              <button
                onClick={() => handleTypeToggle('prescriptions')}
                className={getToggleClasses(preferences.types.prescriptions)}
              >
                <span
                  className={`${preferences.types.prescriptions ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Resultados de laboratorio</span>
              <button
                onClick={() => handleTypeToggle('labResults')}
                className={getToggleClasses(preferences.types.labResults)}
              >
                <span
                  className={`${preferences.types.labResults ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mensajes</span>
              <button
                onClick={() => handleTypeToggle('messages')}
                className={getToggleClasses(preferences.types.messages)}
              >
                <span
                  className={`${preferences.types.messages ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Facturación y pagos</span>
              <button
                onClick={() => handleTypeToggle('billing')}
                className={getToggleClasses(preferences.types.billing)}
              >
                <span
                  className={`${preferences.types.billing ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recordatorios</span>
              <button
                onClick={() => handleTypeToggle('reminders')}
                className={getToggleClasses(preferences.types.reminders)}
              >
                <span
                  className={`${preferences.types.reminders ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Consejos de salud</span>
              <button
                onClick={() => handleTypeToggle('healthTips')}
                className={getToggleClasses(preferences.types.healthTips)}
              >
                <span
                  className={`${preferences.types.healthTips ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Frecuencia */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Frecuencia de notificaciones:</h4>
          <div className="grid grid-cols-3 gap-3">
            <label className={`border rounded-lg p-3 text-center text-sm ${preferences.frequency === 'immediate' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>
              <input
                type="radio"
                name="frequency"
                value="immediate"
                checked={preferences.frequency === 'immediate'}
                onChange={handleFrequencyChange}
                className="sr-only"
              />
              Inmediatas
            </label>
            <label className={`border rounded-lg p-3 text-center text-sm ${preferences.frequency === 'daily' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>
              <input
                type="radio"
                name="frequency"
                value="daily"
                checked={preferences.frequency === 'daily'}
                onChange={handleFrequencyChange}
                className="sr-only"
              />
              Diarias
            </label>
            <label className={`border rounded-lg p-3 text-center text-sm ${preferences.frequency === 'weekly' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>
              <input
                type="radio"
                name="frequency"
                value="weekly"
                checked={preferences.frequency === 'weekly'}
                onChange={handleFrequencyChange}
                className="sr-only"
              />
              Semanales
            </label>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Success message */}
        {saveSuccess && (
          <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Preferencias guardadas correctamente
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={savePreferences}
            disabled={saving}
            className={`px-4 py-2 text-white rounded-lg ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : 'Guardar preferencias'}
          </button>
        </div>
        <div className="mt-4 text-center">
          <Link href={`/dashboard/paciente/${patientId}/configuracion/notificaciones/avanzada`}
            className="text-sm text-blue-600 hover:underline">
            Configuración avanzada de notificaciones
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
