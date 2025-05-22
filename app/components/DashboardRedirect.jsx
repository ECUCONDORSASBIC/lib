import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getDashboardBaseUrl } from '@/app/utils/roleUtils';

/**
 * Componente para manejar la redirección automática al dashboard
 * correspondiente según el rol del usuario
 */
export default function DashboardRedirect() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            console.log(`[DashboardRedirect] Redirecting user with role ${user.role} and uid ${user.uid}`);
            const dashboardUrl = getDashboardBaseUrl(user.role, user.uid);
            console.log(`[DashboardRedirect] Redirecting to ${dashboardUrl}`);
            router.push(dashboardUrl);
        } else if (!loading && !user) {
            // Si no hay usuario y no está cargando, redirigir a login
            router.push('/login');
        }
    }, [user, loading, router]);

    // Mostrar un indicador de carga mientras se realiza la redirección
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Redireccionando...</h2>
                <p className="text-gray-500 mt-2">Por favor espere mientras lo dirigimos al panel correspondiente.</p>
            </div>
        </div>
    );
}
