import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function AuthGuard({ children }) {
    const { user, loading, authInitialized } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authInitialized && !loading) {
            if (!user) {
                console.log('AuthGuard: No user authenticated, redirecting to login...');
                router.push('/login'); // Ruta estandarizada
            } else {
                // ...existing code...
            }
        }
    }, [user, loading, authInitialized, router]);

    return children;
}