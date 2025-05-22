"use client";

import AuthDiagnostics from '@/app/components/debug/AuthDiagnostics';
import FirebaseDebugger from '@/app/components/debug/FirebaseDebugger';
import { auth, ensureFirebase } from '@/lib/firebase/firebaseClient';
import { useEffect, useState } from 'react';

/**
 * Firebase Authentication Debug Page
 *
 * This page allows you to diagnose Firebase Authentication issues specifically.
 */
export default function FirebaseAuthDebugPage() {
  const [authState, setAuthState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signInTest, setSignInTest] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        await ensureFirebase();

        if (auth) {
          const currentUser = auth.currentUser;
          setAuthState({
            initialized: true,
            currentUser: currentUser ? {
              uid: currentUser.uid,
              email: currentUser.email,
              emailVerified: currentUser.emailVerified,
              displayName: currentUser.displayName,
              phoneNumber: currentUser.phoneNumber,
              isAnonymous: currentUser.isAnonymous,
              createdAt: currentUser.metadata?.creationTime,
              lastLoginAt: currentUser.metadata?.lastSignInTime
            } : null
          });
        } else {
          setAuthState({
            initialized: false,
            error: "Firebase Auth not available"
          });
        }
      } catch (error) {
        setAuthState({
          initialized: false,
          error: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const runSignInTest = async (e) => {
    e.preventDefault();
    setSignInTest({ status: 'running' });

    try {
      // Import auth functions directly to avoid circular dependencies
      const { signInWithEmailAndPassword } = await import('firebase/auth');

      // Test sign in
      const result = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      setSignInTest({
        status: 'success',
        user: {
          uid: result.user.uid,
          email: result.user.email,
          emailVerified: result.user.emailVerified
        }
      });
    } catch (error) {
      setSignInTest({
        status: 'error',
        error: error.message,
        code: error.code
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Firebase Auth Diagnóstico</h1>

      <div className="mb-8">
        <FirebaseDebugger />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Estado de Autenticación</h2>
        <AuthDiagnostics showDetails={true} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Detalles del Estado de Auth</h2>

        {loading ? (
          <p>Cargando estado de autenticación...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Inicialización de Auth:</h3>
              <p className={authState?.initialized ? "text-green-600" : "text-red-600"}>
                {authState?.initialized ? "Inicializado correctamente" : "No inicializado"}
              </p>
            </div>

            {authState?.currentUser ? (
              <div>
                <h3 className="font-medium">Usuario actual:</h3>
                <div className="bg-gray-50 p-4 rounded text-sm">
                  <p><strong>UID:</strong> {authState.currentUser.uid}</p>
                  <p><strong>Email:</strong> {authState.currentUser.email}</p>
                  <p><strong>Email verificado:</strong> {authState.currentUser.emailVerified ? "Sí" : "No"}</p>
                  <p><strong>Nombre:</strong> {authState.currentUser.displayName || "No establecido"}</p>
                  <p><strong>Cuenta creada:</strong> {authState.currentUser.createdAt || "Desconocido"}</p>
                  <p><strong>Último login:</strong> {authState.currentUser.lastLoginAt || "Desconocido"}</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium">Usuario actual:</h3>
                <p className="text-yellow-600">No hay usuario autenticado</p>
              </div>
            )}

            {authState?.error && (
              <div>
                <h3 className="font-medium text-red-600">Error:</h3>
                <p className="bg-red-50 p-3 rounded text-red-700 border border-red-200">
                  {authState.error}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Prueba de Inicio de Sesión</h2>

        <form onSubmit={runSignInTest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="test-email">
              Email de prueba
            </label>
            <input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="example@mail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="test-password">
              Contraseña de prueba
            </label>
            <input
              id="test-password"
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={signInTest?.status === 'running'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {signInTest?.status === 'running' ? 'Probando...' : 'Probar inicio de sesión'}
          </button>
        </form>

        {signInTest && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Resultado de la prueba:</h3>

            {signInTest.status === 'running' ? (
              <p>Ejecutando prueba...</p>
            ) : signInTest.status === 'success' ? (
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <p className="text-green-700 font-medium">✅ Inicio de sesión exitoso</p>
                <div className="mt-2 text-sm">
                  <p><strong>UID:</strong> {signInTest.user.uid}</p>
                  <p><strong>Email:</strong> {signInTest.user.email}</p>
                  <p><strong>Email verificado:</strong> {signInTest.user.emailVerified ? "Sí" : "No"}</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded border border-red-200">
                <p className="text-red-700 font-medium">❌ Error de inicio de sesión</p>
                <p className="mt-1 text-sm"><strong>Código:</strong> {signInTest.code}</p>
                <p className="text-sm"><strong>Mensaje:</strong> {signInTest.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
