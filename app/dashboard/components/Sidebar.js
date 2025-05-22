"use client";

import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBarChart2, FiCalendar, FiFileText, FiFolder, FiHelpCircle, FiHome, FiSettings, FiUsers } from 'react-icons/fi';

const navItems = [
  { href: '/dashboard', label: 'Resumen', icon: FiHome },
  { href: '/dashboard/patients', label: 'Pacientes', icon: FiUsers },
  { href: '/dashboard/appointments', label: 'Citas', icon: FiCalendar },
  { href: '/dashboard/reports', label: 'Informes', icon: FiBarChart2 },
  { href: '/dashboard/records', label: 'Expedientes', icon: FiFileText },
  { href: '/dashboard/settings', label: 'Configuración', icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, userData, loading: authLoading } = useAuth();

  const getAvatarContent = () => {
    if (authLoading) return '';
    if (userData?.avatarUrl) {
      return <img src={userData.avatarUrl} alt="Perfil" className="object-cover w-full h-full rounded-full" />;
    }
    if (userData?.name) {
      return userData.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'P';
  };

  return (
    <aside className="flex flex-col w-64 h-screen px-4 py-8 overflow-y-auto border-r bg-white rtl:border-r-0 rtl:border-l border-gray-200 shadow-sm">
      <Link href="/dashboard" className="mx-auto mb-8">
        <h2 className="text-2xl font-semibold text-sky-200 dark:text-sky-200">Altamedica</h2>
      </Link>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav className="-mx-3 space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-gray-700 transition-colors duration-200 transform rounded-lg hover:bg-gray-50 ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:text-blue-500'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className="mx-3 text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 mt-8 border-t border-sky-200 dark:border-sky-400">
          {authLoading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full dark:bg-gray-700 animate-pulse"></div>
                <div className="w-32 h-4 bg-gray-300 rounded dark:bg-gray-700 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 mt-2">
                <div className="w-5 h-5 bg-gray-300 rounded dark:bg-gray-700 animate-pulse"></div>
                <div className="w-40 h-4 bg-gray-300 rounded dark:bg-gray-700 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 mt-2">
                <div className="w-5 h-5 bg-gray-300 rounded dark:bg-gray-700 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-36 dark:bg-gray-700 animate-pulse"></div>
              </div>
            </div>
          ) : userData?.role === 'paciente' && user?.uid ? (
            <>
              <Link href={`/dashboard/paciente/${user.uid}`} className="flex items-center gap-2 px-3 py-2 transition-colors rounded-lg text-sky-700 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-700">
                <FiHome className="w-5 h-5" />
                <span className="text-sm font-medium">Mi Panel de Salud</span>
              </Link>
              <Link href={`/dashboard/paciente/${user.uid}/profile`} className="flex items-center gap-2 px-3 py-2 mt-2 transition-colors rounded-lg text-sky-700 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-700">
                <span className="flex items-center justify-center inline-block w-8 h-8 overflow-hidden font-bold rounded-full bg-sky-200 dark:bg-sky-600 text-sky-700 dark:text-sky-100">
                  {getAvatarContent()}
                </span>
                <span className="text-sm font-medium">Mi Perfil</span>
              </Link>
              <Link href={`/dashboard/paciente/${user.uid}/citas`} className="flex items-center gap-2 px-3 py-2 mt-2 transition-colors rounded-lg text-sky-700 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-700">
                <FiCalendar className="w-5 h-5" />
                <span className="text-sm font-medium">Mis Citas</span>
              </Link>
              <Link href={`/dashboard/paciente/${user.uid}/expedientes`} className="flex items-center gap-2 px-3 py-2 mt-2 transition-colors rounded-lg text-sky-700 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-700">
                <FiFolder className="w-5 h-5" />
                <span className="text-sm font-medium">Mis Expedientes</span>
              </Link>
              <Link href={`/dashboard/paciente/${user.uid}/configuracion`} className="flex items-center gap-2 px-3 py-2 mt-2 transition-colors rounded-lg text-sky-700 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-700">
                <FiSettings className="w-5 h-5" />
                <span className="text-sm font-medium">Configuración</span>
              </Link>
            </>
          ) : null}
          <Link href="/ayuda" className="flex items-center gap-2 px-3 py-2 mt-2 transition-colors rounded-lg text-sky-700 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-700">
            <FiHelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Ayuda</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
