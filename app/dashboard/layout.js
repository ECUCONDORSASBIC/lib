'use client';

import RoleSwitcher from '@components/dashboard/RoleSwitcher';
import LanguageSwitcher from '@components/ui/LanguageSwitcher';
import { getRoleDefaultPath } from '@config/onboardingConfig';
import { useAuth } from '@contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { normalizeRole } from '../utils/roleUtils';

function DashboardRedirectLogic({ children }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Función para registro detallado
  const logRedirection = (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const style = level === 'ERROR'
      ? 'color: #dc2626; font-weight: bold;'
      : level === 'WARNING'
        ? 'color: #d97706; font-weight: bold;'
        : 'color: #2563eb; font-weight: bold;';

    console.log(`%c[${timestamp}] [${level}] [DashboardLayout] ${message}`, style, data);
  };

  useEffect(() => {
    if (loading) {
      logRedirection('INFO', 'AuthContext is loading. Waiting...');
      return;
    }

    if (!user) {
      logRedirection('WARNING', 'No authenticated user. Redirecting to login.', { pathname });
      router.replace('/auth/login');
      return;
    } if (!userData) {
      logRedirection('WARNING', 'User authenticated, but userData is not yet available. Waiting for userData.', { user: user.uid });
      return;
    }

    const { isOnboardingCompleted, role } = userData;
    const uid = user.uid;

    logRedirection('INFO', `User authenticated. Role: ${role}, isOnboardingCompleted: ${isOnboardingCompleted}`, {
      uid,
      currentPath: pathname
    });

    // Si el usuario no ha seleccionado un rol, redirigirlo a la página de selección de rol
    if (!role) {
      logRedirection('WARNING', 'User has no role. Redirecting to role selection.', { uid });
      if (pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
      return;
    }

    // Si el onboarding no está completo, redirigir a la página de onboarding
    if (isOnboardingCompleted === false && !pathname.startsWith('/onboarding')) {
      console.log('[DashboardLayout] Onboarding not completed. Redirecting to onboarding.');
      router.replace('/onboarding');
      return;
    }

    // Si el onboarding está completo y el usuario está intentando acceder a la página de onboarding,
    // redirigir al dashboard correspondiente
    if (isOnboardingCompleted === true && pathname.startsWith('/onboarding')) {
      const dashboardPath = getRoleDefaultPath(role, uid);
      console.log(`[DashboardLayout] Onboarding completed but user is on onboarding page. Redirecting to ${dashboardPath}`);
      router.replace(dashboardPath);
      return;
    }

    // Si el usuario está en el dashboard pero no en la ruta correcta para su rol,
    // redirigir a la ruta correcta
    if (isOnboardingCompleted === true && pathname.startsWith('/dashboard')) {
      let expectedPath;
      let isSubPath = false;

      switch (role) {
        case 'paciente':
          expectedPath = uid ? `/dashboard/paciente/${uid}` : '/dashboard/user-setup-required';
          isSubPath = pathname.startsWith(`/dashboard/paciente/${uid}`);
          break;
        case 'medico':
          expectedPath = uid ? `/dashboard/medico/${uid}` : '/dashboard/user-setup-required';
          isSubPath = pathname.startsWith(`/dashboard/medico/${uid}`);
          break;
        default:
          expectedPath = getRoleDefaultPath(role, uid);
          isSubPath = pathname.startsWith(expectedPath);
      }

      // La página /dashboard/medico o /dashboard/paciente está permitida porque
      // se encargará de redirigir al usuario a su dashboard específico
      const isBasePage = pathname === `/dashboard/${normalizeRole(role)}`;

      // Permitir navegación a subpaths del dashboard específico del usuario
      // También permitir la página base del rol que se encargará de la redirección
      if (!isSubPath && !isBasePage && pathname !== expectedPath) {
        console.log(`[DashboardLayout] User not on correct dashboard. Redirecting from ${pathname} to ${expectedPath}`);
        console.log(`isSubPath: ${isSubPath}, isBasePage: ${isBasePage}, expectedPath: ${expectedPath}`);
        router.replace(expectedPath);
      }
    }
  }, [user, userData, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="w-12 h-12 border-4 rounded-full border-sky-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, no renderizar nada (se redirigirá a login)
  if (!user || !userData) {
    return null;
  }

  // Si el usuario no ha completado el onboarding o no tiene un rol, no renderizar el dashboard
  if (!userData.role || userData.isOnboardingCompleted === false) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between p-4 bg-white shadow-sm dark:bg-slate-800">
        <RoleSwitcher />
        <LanguageSwitcher />
      </div>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return <DashboardRedirectLogic>{children}</DashboardRedirectLogic>;
}
