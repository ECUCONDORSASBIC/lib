// app/onboarding/page.jsx
"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import OnboardingStepLayout from "@/app/components/onboarding/OnboardingStepLayout";
import { getRoleDefaultPath } from "@/config/onboardingConfig";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function OnboardingPage() {
  const { user, userData, loading: authLoading, updateUserProfileAndData } = useAuth();
  const router = useRouter();

  const [currentStepComponent, setCurrentStepComponent] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Si el usuario ya completó el onboarding, redirige al dashboard
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (userData?.isOnboardingCompleted && userData?.role) {
      router.replace(getRoleDefaultPath(userData.role) || "/dashboard");
      return;
    }

    // Carga el componente de selección de rol
    import("@/app/components/onboarding/steps/RoleSelectionStep")
      .then((module) => {
        setCurrentStepComponent(() => module.default);
        setIsLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar la selección de rol.");
        setIsLoading(false);
      });
  }, [authLoading, userData, router]);

  const handleDataChange = useCallback((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleRoleSelection = async () => {
    const selectedRole = formData.selectedRole;
    if (!selectedRole) {
      setError("Por favor, selecciona un rol para continuar.");
      return;
    }

    try {
      // Guardar el rol seleccionado y marcar el onboarding como completado
      await updateUserProfileAndData(
        {},
        {
          role: selectedRole,
          isOnboardingCompleted: true,
          currentOnboardingStep: null
        }
      );

      console.log(`Rol seleccionado: ${selectedRole}. Redirigiendo al dashboard correspondiente.`);

      // Redirigir al dashboard del rol seleccionado
      const dashboardPath = getRoleDefaultPath(selectedRole);
      if (!dashboardPath) {
        console.error(`Error: No se pudo determinar la ruta del dashboard para el rol ${selectedRole}.`);
        router.replace('/dashboard');
      } else {
        router.replace(dashboardPath);
      }
    } catch (err) {
      console.error("Error al guardar la selección de rol:", err);
      setError("Error al guardar la selección de rol. Por favor, inténtalo de nuevo.");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="w-16 h-16 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    );
  }

  const RoleSelectionStep = currentStepComponent;

  if (!RoleSelectionStep) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <p className="text-red-500">Error: No se pudo cargar el componente de selección de rol.</p>
        <button
          onClick={() => router.replace('/')}
          className="px-4 py-2 mt-4 text-white bg-sky-500 rounded hover:bg-sky-600"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <OnboardingStepLayout
      title="Selecciona tu Rol"
      onNext={handleRoleSelection}
      onPrevious={null}
      nextDisabled={!formData.selectedRole}
      prevDisabled={true}
      nextLabel="Confirmar Rol y Continuar"
    >
      <RoleSelectionStep
        onDataChange={handleDataChange}
        formData={formData}
      />
      {error && (
        <div className="p-3 mt-4 text-sm text-white bg-red-500 rounded">
          {error}
        </div>
      )}
    </OnboardingStepLayout>
  );
}
