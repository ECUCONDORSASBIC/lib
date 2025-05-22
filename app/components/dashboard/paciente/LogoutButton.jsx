'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      // The signOut function already handles navigation to /login
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error al cerrar sesión.');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center justify-center px-4 py-2 font-semibold text-white transition-colors bg-red-500 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
    >
      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
      Cerrar Sesión
    </button>
  );
};

export default LogoutButton;
