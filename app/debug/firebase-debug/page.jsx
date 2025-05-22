"use client";

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Firebase Debug Redirect Page
 *
 * This is a simple redirect page that will take users to the Firebase debug page.
 * It's useful for quick access to Firebase diagnostics.
 */
export default function FirebaseDebugRedirect() {
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (isRedirecting) {
      redirect('/debug/firebase');
    }
  }, [isRedirecting]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold mb-4">Redireccionando...</h1>
        <p>Accediendo a la herramienta de diagnóstico de Firebase</p>
        <div className="mt-4">
          <button
            onClick={() => setIsRedirecting(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ir a Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
}
