'use client';

import LoginForm from '@/app/components/auth/LoginForm';
import Link from 'next/link';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left panel with illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col items-center justify-center p-12 relative">
        <div className="absolute top-8 left-8">
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
            src="/illustrations/login-illustration.svg"
            alt="Login"
            className="w-full max-w-sm mx-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.innerHTML = '<div class="h-64 w-64 rounded-full bg-indigo-500 bg-opacity-30 flex items-center justify-center text-white text-4xl font-light">Altamedica</div>';
            }}
          />
          <h2 className="mt-8 text-3xl font-bold text-white">Bienvenido de nuevo</h2>
          <p className="mt-4 text-lg text-indigo-200">
            Accede a tu cuenta para gestionar tus servicios médicos y consultas en línea.
          </p>
        </div>
        <div className="absolute bottom-8 left-8 right-8 text-indigo-200 text-sm">
          © {new Date().getFullYear()} Altamedica. Todos los derechos reservados.
        </div>
      </div>

      {/* Right panel with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
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

          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 text-center">
              Inicia sesión
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Accede a todos tus servicios médicos en un solo lugar
            </p>
          </div>

          <LoginForm />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">O continúa con</span>
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

          <div className="flex flex-col space-y-4 text-sm text-center mt-8">
            <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              ¿No tienes una cuenta? Regístrate ahora
            </Link>

            <Link href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
