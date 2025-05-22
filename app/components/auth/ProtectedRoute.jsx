'use client';

import { useAuth } from '@/app/contexts/AuthContext'; // Corrected path
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Generic Loading Screen (TailwindCSS)
const DefaultLoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="w-12 h-12 mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
    <p className="text-lg font-medium text-gray-700">Loading...</p>
  </div>
);

export default function ProtectedRoute({ children, loadingComponent: LoadingComponent = DefaultLoadingScreen }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Preserve the current path for redirection after login
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`); // Corrected redirect path
    }
  }, [loading, user, router]);

  if (loading) {
    return <LoadingComponent />;
  }

  return user ? <>{children}</> : null; // Or <LoadingComponent /> if you prefer to show loading until redirect completes
}
