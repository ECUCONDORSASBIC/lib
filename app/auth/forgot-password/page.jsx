// app/auth/forgot-password/page.jsx
"use client";

import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-10 space-y-8 bg-white shadow-lg rounded-xl">
        <div>
          <img
            className="w-auto h-12 mx-auto"
            src="/logo-altamedica.png" // Assuming you have a logo here
            alt="Altamedica"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            Recupera tu contraseña
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>
        <ForgotPasswordForm />
        <div className="mt-6 text-sm text-center">
          <p className="text-gray-600">
            ¿Recuerdas tu contraseña?
            <Link href="/auth/login" legacyBehavior>
              <a className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
                Inicia sesión
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
