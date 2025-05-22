// app/dashboard/user-setup-required/page.jsx
"use client";

import Link from "next/link";

export default function UserSetupRequiredPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          Configuración de Cuenta Requerida
        </h1>
        <p className="mb-6 text-gray-600">
          Parece que tu perfil necesita algunos detalles adicionales o no se pudo determinar tu estado de onboarding.
          Por favor, completa tu configuración para continuar.
        </p>
        <div className="space-y-4">
          <Link href="/onboarding" legacyBehavior>
            <a className="block w-full px-4 py-3 font-semibold text-white transition duration-150 ease-in-out bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Ir a Onboarding
            </a>
          </Link>
          <Link href="/auth/login" legacyBehavior>
            <a className="block w-full px-4 py-3 font-semibold text-gray-700 transition duration-150 ease-in-out bg-gray-200 rounded-lg hover:bg-gray-300">
              Volver a Iniciar Sesión
            </a>
          </Link>
        </div>
        <p className="mt-6 text-xs text-gray-500">
          Si crees que esto es un error, por favor contacta a soporte.
        </p>
      </div>
    </div>
  );
}
