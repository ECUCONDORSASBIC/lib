'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useTranslation } from '@/app/i18n';
import { CalendarIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

export default function DoctorLayout({ children }) {
    const { t } = useTranslation();
    const { id } = useParams();
    const pathname = usePathname();

    const { user, userData } = useAuth();

    // Verificación adicional para asegurar que el médico solo acceda a su propio dashboard
    if (user && userData?.role === 'medico' && user.uid !== id) {
        console.log(`[DoctorLayout] User ${user.uid} is trying to access dashboard of doctor ${id}`);
        return null; // El useEffect en la página se encargará de la redirección
    }

    const links = [
        {
            href: `/dashboard/medico/${id}`,
            label: t('doctor.overview', 'Mi Dashboard'),
            icon: <ChartBarIcon className="w-5 h-5" />
        },
        {
            href: `/dashboard/medico/${id}/pacientes`,
            label: t('doctor.patients', 'Mis Pacientes'),
            icon: <UserGroupIcon className="w-5 h-5" />
        },
        {
            href: `/dashboard/medico/${id}/citas`,
            label: t('doctor.appointments', 'Mis Citas'),
            icon: <CalendarIcon className="w-5 h-5" />
        },
        {
            href: `/dashboard/medico/${id}/alertas`,
            label: t('doctor.alerts', 'Alertas Médicas'),
            icon: null
        },
        {
            href: `/dashboard/medico/${id}/ofertas`,
            label: t('doctor.jobOffers', 'Ofertas de Empleo'),
            icon: null
        }
    ];

    return (
        <div className="flex h-screen">
            <nav className="w-64 p-4 overflow-y-auto text-gray-800 bg-blue-100">
                <div className="mb-6">
                    <h2 className="mb-2 text-xl font-semibold text-blue-800">Portal de Médico</h2>
                    <p className="text-xs text-blue-600">ID: {id ? id.substring(0, 8) : ''}...</p>
                </div>
                <ul className="space-y-2">
                    {links.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`flex items-center py-2 px-3 rounded transition-colors ${isActive
                                        ? "bg-blue-500 text-white"
                                        : "text-blue-700 hover:bg-blue-300"
                                        }`}
                                >
                                    {link.icon && <span className="mr-2">{link.icon}</span>}
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
                {children}
            </main>
        </div>
    );
}
