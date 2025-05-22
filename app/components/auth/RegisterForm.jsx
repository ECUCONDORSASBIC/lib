'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { signUp, loading } = useAuth();
  const router = useRouter();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword || !name) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await signUp(email, password, name);
      if (isMounted.current) {
        console.log('[RegisterForm] Registration successful. Redirecting to /dashboard.');
        router.push('/dashboard');
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('Error en registro:', err);
        setError(
          err.code === 'auth/email-already-in-use'
            ? 'Este correo electrónico ya está registrado'
            : err.code === 'auth/invalid-email'
              ? 'Correo electrónico inválido'
              : 'Error al crear la cuenta. Intenta nuevamente'
        );
      }
    }
  };

return (
  <div className="w-full max-w-md space-y-8">
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="relative px-4 py-3 text-red-700 border border-red-200 rounded bg-red-50" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="-space-y-px rounded-md shadow-sm">
        <div>
          <label htmlFor="name" className="sr-only">
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Nombre completo"
          />
        </div>
        <div>
          <label htmlFor="email-address" className="sr-only">
            Correo electrónico
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Correo electrónico"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Contraseña"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="sr-only">
            Confirmar contraseña
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Confirmar contraseña"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Procesando...' : 'Registrarse'}
        </button>
      </div>
    </form>
  </div>
);
};

export default RegisterForm;
