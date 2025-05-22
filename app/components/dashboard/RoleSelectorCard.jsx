'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import * as OnboardingConfigModule from '@/config/onboardingConfig';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function RoleSelectorCard() {
  const { user, userData, updateUserProfileAndData } = useAuth();
  const [selectedRole, setSelectedRole] = useState(userData?.role || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const onboardingConfig = OnboardingConfigModule.default;

  // Define display-specific properties for roles in this card
  const roleDisplayProperties = {
    paciente: {
      description: 'Accede a tu historia clínica, gestiona citas y consulta resultados',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'blue'
    },
    medico: {
      description: 'Gestiona pacientes, consultas médicas y registros clínicos',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'green'
    },
    empresa: {
      description: 'Gestiona perfiles médicos y servicios de salud para tus colaboradores',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'purple'
    },
    administrador: {
      description: 'Acceso completo al sistema para desarrollo y configuración',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'red'
    }
  };

  const roles = useMemo(() => {
    if (!onboardingConfig) {
      console.warn("RoleSelectorCard: onboardingConfig is not available or not yet loaded.");
      return []; // Return an empty array if onboardingConfig is not available
    }
    return Object.keys(onboardingConfig)
      .map(roleId => {
        const config = onboardingConfig[roleId];
        const displayProps = roleDisplayProperties[roleId];
        if (config && displayProps) {
          return {
            id: roleId,
            name: config.name, // Name from onboardingConfig
            ...displayProps    // Description, icon, color from local mapping
          };
        }
        return null;
      })
      .filter(role => role !== null);
  }, [onboardingConfig]);

  const handleRoleChange = async (roleId) => {
    if (roleId === selectedRole) return; // No cambiar si es el mismo rol

    setSelectedRole(roleId);
    setIsUpdating(true);
    setError(null);

    try {
      // Solo actualizamos el rol en Firestore
      await updateUserProfileAndData({}, { role: roleId });

      // El cambio de rol probablemente restablecerá isOnboardingCompleted a false
      // y el DashboardLayout se encargará de la redirección adecuada

      // No hacemos redirección aquí porque el DashboardLayout manejará eso
      // basado en el nuevo userData después de la actualización

    } catch (err) {
      console.error("Error al actualizar el rol:", err);
      setError("No se pudo actualizar el rol. Por favor intente nuevamente.");
      setSelectedRole(userData?.role || null); // Revertir a rol anterior en caso de error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => !isUpdating && handleRoleChange(role.id)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
              ${selectedRole === role.id
                ? `bg-${role.color}-50 border-${role.color}-500 shadow-lg`
                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
            `}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full bg-${role.color}-100`}>
                {role.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                {userData?.role === role.id && (
                  <span className="inline-block px-2 py-1 mt-2 text-xs font-semibold text-green-800 bg-green-100 rounded-md">
                    Rol Actual
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isUpdating && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Actualizando rol...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 mt-6 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
          {error}
        </div>
      )}
    </div>
  );
}
