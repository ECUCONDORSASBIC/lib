"use client";

import { ensureFirebase, getFirebaseStatus } from '@/lib/firebase/firebaseClient';
import { useEffect, useState } from 'react';

/**
 * FirebaseDebugger Component
 *
 * A utility component that shows the current status of Firebase initialization
 * and provides tools to diagnose and potentially fix common issues.
 *
 * Place this component in a development environment to help troubleshoot
 * Firebase connection problems.
 */
const FirebaseDebugger = () => {
  const [status, setStatus] = useState(null);
  const [envVars, setEnvVars] = useState({});
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState(null);

  useEffect(() => {
    // Get initial Firebase status
    const initialStatus = getFirebaseStatus();
    setStatus(initialStatus);

    // Check environment variables
    const vars = {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    setEnvVars(vars);
  }, []);

  const attemptRepair = async () => {
    setIsRepairing(true);
    try {
      const result = await ensureFirebase();
      if (result) {
        // Update status after successful repair
        setStatus(getFirebaseStatus());
        setRepairResult({ success: true, message: "Firebase reinicializado con éxito" });
      } else {
        setRepairResult({ success: false, message: "No se pudo reinicializar Firebase" });
      }
    } catch (error) {
      setRepairResult({
        success: false,
        message: "Error al reinicializar Firebase",
        error: error.message
      });
    } finally {
      setIsRepairing(false);
    }
  };

  if (!status) {
    return <div className="p-4 bg-gray-100 rounded">Cargando estado de Firebase...</div>;
  }

  // Determine overall health status
  const isHealthy = status.isInitialized &&
    Object.values(status.services).every(Boolean) &&
    Object.values(envVars).every(Boolean);

  const healthStatus = isHealthy ? "healthy" : "unhealthy";

  return (
    <div className="p-6 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Firebase Debugger
        <span className={`ml-2 text-sm px-2 py-1 rounded-full ${healthStatus === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {healthStatus === 'healthy' ? 'Saludable' : 'Problemas Detectados'}
        </span>
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-700 mb-1">Estado General</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p>Entorno: <span className="font-mono">{status.environment}</span></p>
            <p>Inicializado: {status.isInitialized ? '✅' : '❌'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-1">Servicios</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p>Auth: {status.services.auth ? '✅' : '❌'}</p>
            <p>Firestore: {status.services.firestore ? '✅' : '❌'}</p>
            <p>Storage: {status.services.storage ? '✅' : '❌'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-1">Variables de Entorno</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            {Object.entries(envVars).map(([key, exists]) => (
              <p key={key}>
                {key}: {exists ? '✅' : '❌'}
              </p>
            ))}
          </div>
        </div>

        {!isHealthy && (
          <div className="mt-4">
            <button
              onClick={attemptRepair}
              disabled={isRepairing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isRepairing ? 'Reinicializando...' : 'Intentar Reinicializar Firebase'}
            </button>
          </div>
        )}

        {repairResult && (
          <div className={`mt-3 p-3 rounded text-sm ${repairResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p>{repairResult.message}</p>
            {repairResult.error && <p className="font-mono mt-1">{repairResult.error}</p>}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>
            ℹ️ Nota: Este componente solo debe usarse en entornos de desarrollo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDebugger;
