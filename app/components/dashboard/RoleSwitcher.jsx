'use client';

import * as OnboardingConfigModule from '@config/onboardingConfig'; // Using namespace import
import { useAuth } from '@contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

const onboardingConfig = OnboardingConfigModule.default; // Accessing the default export

export default function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { userData, updateUserProfileAndData } = useAuth();
  const [isChangingRole, setIsChangingRole] = useState(false);

  // Manejar clic fuera para cerrar el desplegable
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNavigate = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  // Function to handle role change
  const handleRoleChange = async (newRole) => {
    if (newRole === userData?.role || isChangingRole) return;

    setIsChangingRole(true);
    try {
      await updateUserProfileAndData({ role: newRole });
      // Onboarding status is reset in AuthContext, redirection handled by DashboardLayout
    } catch (error) {
      console.error('Error al cambiar de rol:', error);
      // Optionally, show a user-facing error message here
    } finally {
      setIsChangingRole(false);
      setIsOpen(false); // Close dropdown after attempt
    }
  };

  // Get role IDs and names from onboardingConfig
  const availableRoles = useMemo(() => {
    if (!onboardingConfig) {
      console.error("RoleSwitcher: onboardingConfig is not loaded correctly!");
      return [];
    }
    return Object.keys(onboardingConfig)
      .filter(roleId => roleId !== userData?.role) // Filter out the current role
      .map(roleId => ({
        id: roleId,
        name: onboardingConfig[roleId]?.name || roleId, // Fallback to roleId if name is missing
      }));
  }, [onboardingConfig, userData?.role]); // Add userData?.role to dependencies

  return (
    <div className="fixed z-50 bottom-6 right-6">
      {isOpen && (
        <div ref={dropdownRef} className="absolute right-0 w-64 overflow-hidden bg-white rounded-lg shadow-xl bottom-16">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">Cambiar rol</h3>
          </div>
          <div className="p-2">
            <button
              onClick={() => handleNavigate('/dashboard/seleccionar-rol')}
              className="flex items-center w-full px-4 py-2 text-sm text-left text-blue-700 rounded-md hover:bg-blue-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Seleccionar Rol
            </button>

            <div className="my-2 border-t"></div>

            <div className="px-3 py-2 text-xs text-gray-500">Roles disponibles:</div>

            {availableRoles.map(({ id, name }) => {
              const isCurrentRole = userData?.role === id;
              return (
                <button
                  key={id}
                  onClick={() => !isCurrentRole && handleRoleChange(id)}
                  disabled={isChangingRole || isCurrentRole}
                  className={`flex items-center w-full px-4 py-2 text-sm text-left rounded-md
                    ${isCurrentRole
                      ? 'bg-blue-50 text-blue-700 font-medium cursor-default'
                      : isChangingRole
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                    }`}
                >
                  <span className="flex-1 capitalize">{name}</span>
                  {isCurrentRole && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      Actual
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChangingRole}
        className="p-3 text-blue-600 transition-all bg-white rounded-full shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Cambiar rol"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menú para cambiar de rol"
      >
        {isChangingRole ? (
          <span className="block w-6 h-6 border-2 border-gray-200 rounded-full border-t-blue-600 animate-spin"></span>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
