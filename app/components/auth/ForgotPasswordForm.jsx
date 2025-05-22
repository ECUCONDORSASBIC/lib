'use client';

import { auth } from '@/lib/firebase';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    error: null,
    success: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormState({
      error: null,
      success: false
    });

    try {
      await sendPasswordResetEmail(auth, email);
      setFormState({
        error: null,
        success: true
      });
      setEmail('');
    } catch (error) {
      // Handle different error codes
      let errorMessage = 'Error al enviar el correo de recuperación';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Por favor, intente más tarde';
      }

      setFormState({
        error: errorMessage,
        success: false
      });
      console.error('Error sending password reset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6 py-8 bg-white rounded-lg shadow-md">
      <Link
        href="/auth/login"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" />
        Volver al inicio de sesión
      </Link>

      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Recuperar contraseña
      </h2>

      {formState.success ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-6">
          <p className="text-green-700 text-center">
            ¡Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña!
          </p>
          <p className="text-green-700 text-center mt-2 text-sm">
            Revisa tu bandeja de entrada y sigue los pasos indicados en el correo.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            {formState.error && (
              <p className="mt-2 text-sm text-red-600">
                {formState.error}
              </p>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Ingresa el correo electrónico asociado con tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>
      )}
    </div>
  );
}
