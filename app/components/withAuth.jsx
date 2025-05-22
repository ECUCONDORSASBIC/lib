'use client';

import { useAuth } from '@/app/contexts/AuthContext'; // Use AuthContext
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const { user, loading, authInitialized } = useAuth(); // Get user and loading state from AuthContext
    const router = useRouter();

    useEffect(() => {
      // Wait for Firebase to initialize and loading to be false
      if (authInitialized && !loading) {
        if (!user) {
          console.log('withAuth: No user authenticated, redirecting to /auth/login...');
          router.push('/auth/login'); // Corrected redirect path
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

    // Render the wrapped component if there is a user
    return user ? <WrappedComponent {...props} user={user} /> : null; // Or a loading spinner
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthenticatedComponent;
};

export default withAuth;
