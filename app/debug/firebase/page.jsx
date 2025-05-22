"use client";

import FirebaseDebugger from '@/app/components/debug/FirebaseDebugger';
import { db, ensureFirebase } from '@/lib/firebase/firebaseClient';
import { collection, doc, getDoc, getDocs, limit, query } from 'firebase/firestore';
import { useState } from 'react';

/**
 * Firebase Diagnostics Page
 *
 * This page allows you to diagnose Firebase connectivity issues
 * and test Firestore read operations.
 */
export default function FirebaseDiagnosticsPage() {
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runFirebaseTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    setTestError(null);

    try {
      // Ensure Firebase is initialized
      const isReady = await ensureFirebase();
      if (!isReady || !db) {
        throw new Error("Firebase no está inicializado correctamente");
      }

      // Try to read a simple document from Firestore using v9 SDK
      try {
        const testDocRef = doc(db, 'system', 'status');
        const testDocSnap = await getDoc(testDocRef);
        const exists = testDocSnap.exists();

        setTestResult({
          success: true,
          docExists: exists,
          data: exists ? testDocSnap.data() : null
        });
      } catch (firestoreError) {
        // Try a different collection if the first one fails
        try {
          const patientsRef = collection(db, 'patients');
          const patientsQuery = query(patientsRef, limit(1));
          const patientsSnapshot = await getDocs(patientsQuery);
          setTestResult({
            success: true,
            docExists: !patientsSnapshot.empty,
            count: patientsSnapshot.size
          });
        } catch (secondError) {
          throw new Error(`No se pudo leer de Firestore: ${secondError.message}`);
        }
      }
    } catch (error) {
      setTestError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Firebase</h1>

      <div className="mb-8">
        <FirebaseDebugger />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Prueba de Conectividad Firestore</h2>
        <p className="mb-4 text-gray-600">
          Ejecuta una prueba para verificar la conectividad a Firestore intentando leer un documento.
        </p>

        <button
          onClick={runFirebaseTest}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Ejecutando prueba...' : 'Probar Conexión Firestore'}
        </button>

        {testResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-medium text-green-800">Prueba exitosa</h3>
            <div className="mt-2 text-sm">
              <p>Documento existe: {testResult.docExists ? 'Sí' : 'No'}</p>
              {testResult.count !== undefined && (
                <p>Documentos encontrados: {testResult.count}</p>
              )}
              {testResult.data && (
                <div className="mt-2">
                  <p className="font-medium">Datos:</p>
                  <pre className="mt-1 p-2 bg-gray-50 rounded overflow-auto text-xs">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {testError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-medium text-red-800">Error en la prueba</h3>
            <p className="mt-1 text-sm text-red-600">{testError}</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-medium text-blue-800 mb-3">Pasos para Resolver Problemas de Firebase</h2>
        <ol className="list-decimal ml-5 space-y-2 text-sm text-blue-700">          <li>Verifica que todas las variables de entorno estén correctamente establecidas en <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
          <li>Asegúrate de que estás usando la importación unificada: <code className="bg-blue-100 px-1 rounded">import &#123; db &#125; from &apos;@/lib/firebase/firebaseClient&apos;;</code></li>
          <li>Si hay errores en componentes de servidor, considera mover la lógica de Firebase a componentes cliente (<code className="bg-blue-100 px-1 rounded">&quot;use client&quot;;</code>)</li>
          <li>Reinicia el servidor de desarrollo con <code className="bg-blue-100 px-1 rounded">pnpm dev</code> después de hacer cambios en las configuraciones</li>
          <li>Revisa la consola del navegador para ver errores detallados relacionados con Firebase</li>
        </ol>
      </div>
    </div>
  );
}
