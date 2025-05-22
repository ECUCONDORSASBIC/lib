'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import JobOffersList from '@/app/components/dashboard/doctor/JobOffersList';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';

/**
 * Página para que los médicos vean ofertas de trabajo
 * disponibles y gestionen sus aplicaciones
 */
export default function JobOffersPage() {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    // Redireccionar si el usuario no es un médico
    useEffect(() => {
        if (!loading && (!user || role !== 'medico')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Oportunidades Laborales</h1>

                    <div className="mb-8">
                        <p className="text-gray-600">
                            Explore las últimas oportunidades laborales en el sector médico. Aplique a posiciones
                            que se ajusten a su especialidad y preferencias, y haga seguimiento del estado de sus aplicaciones.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <JobOffersList />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
