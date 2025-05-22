// app/auth/register/page.jsx
"use client";

import RegisterForm from "@/app/components/auth/RegisterForm";
import Link from "next/link";
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left panel with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center lg:hidden mb-8">
            <img
              src="/logo-altamedica.png"
              alt="Altamedica"
              className="h-12 w-auto mx-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Únete a nuestra plataforma de servicios médicos
          </p>

          <div className="mt-8">
            <RegisterForm />
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">O regístrate con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                className="inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
              >
                <FaGoogle className="text-red-500" />
              </button>
              <button
                type="button"
                className="inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
              >
                <FaFacebook className="text-blue-600" />
              </button>
              <button
                type="button"
                className="inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
              >
                <FaApple className="text-gray-800" />
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>

          <div className="mt-8 text-xs text-center text-gray-500">
            Al registrarte, aceptas nuestros{' '}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
              Términos de servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>

      {/* Right panel with illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col items-center justify-center p-12 relative">
        <div className="absolute top-8 right-8">
          <img
            src="/logo-altamedica-white.png"
            alt="Altamedica"
            className="h-10 w-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div className="max-w-md text-center">
          <img
            src="/illustrations/register-illustration.svg"
            alt="Registration"
            className="w-full max-w-sm mx-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.innerHTML = '<div class="h-64 w-64 rounded-full bg-indigo-500 bg-opacity-30 flex items-center justify-center text-white text-4xl font-light">Altamedica</div>';
            }}
          />
          <h2 className="mt-8 text-3xl font-bold text-white">Bienvenido a Altamedica</h2>
          <p className="mt-4 text-lg text-indigo-200">
            Accede a servicios médicos de calidad, agenda citas y consulta tu historial médico en cualquier momento.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center text-left">
              <div className="flex-shrink-0 p-2 bg-indigo-500 bg-opacity-30 rounded-full">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-3 text-white">Consultas médicas en línea</span>
            </div>

            <div className="flex items-center text-left">
              <div className="flex-shrink-0 p-2 bg-indigo-500 bg-opacity-30 rounded-full">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-3 text-white">Acceso a tu historial médico</span>
            </div>

            <div className="flex items-center text-left">
              <div className="flex-shrink-0 p-2 bg-indigo-500 bg-opacity-30 rounded-full">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-3 text-white">Resultados de exámenes en línea</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 right-8 text-indigo-200 text-sm">
          © {new Date().getFullYear()} Altamedica. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}
