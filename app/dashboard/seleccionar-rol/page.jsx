'use client';

import RoleSelectorCard from '@/app/components/dashboard/RoleSelectorCard';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

export default function SelectRolePage() {
  const { userData, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Selección de Rol</h1>
          <p className="text-gray-600">
            Selecciona el rol con el que deseas utilizar la plataforma
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <RoleSelectorCard />
          )}
        </div>

        {userData && (
          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Volver al Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
