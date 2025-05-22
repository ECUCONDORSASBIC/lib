'use client';

import { useAuth } from '@/app/contexts/AuthContext'; // Use AuthContext
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }) {
  const { user, loading, authInitialized } = useAuth(); // Get user, loading, and authInitialized state
  const router = useRouter();

  useEffect(() => {
    // Wait for Firebase to initialize and loading to be false
    if (authInitialized && !loading) {
      if (!user) {
        console.log('AuthGuard: No user authenticated, redirecting to /auth/login...');
        router.push('/auth/login'); // Corrected redirect path
      } else {
        console.log('AuthGuard: User authenticated:', user.email);
      }
    }
  }, [user, loading, authInitialized, router]);

  if (loading || !authInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only render children if there is a user
  // The original component called children(user), ensure this is the desired pattern.
  // If children are regular JSX, this should be: user ? <>{children}</> : null;
  // Assuming the render prop pattern is intentional:
  if (user) {
    return children(user);
  }

  return null; // Or a loading spinner, or redirect handled by useEffect
}
