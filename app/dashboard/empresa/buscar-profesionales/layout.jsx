'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { CalendarIcon, ChartBarIcon, UsersIcon, BellIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Buscar Profesionales | Mercado P2P Salud',
  description: 'Encuentra profesionales de la salud cerca de tu ubicación',
};

export default function SearchProfessionalsLayout({ children }) {
  const { id } = useParams();
  const pathname = usePathname();

  const links = [
    {
      href: `/dashboard/medico/${id}`,
      label: 'Dashboard',
      icon: <ChartBarIcon className="w-5 h-5" />
    },
    {
      href: `/dashboard/medico/${id}/pacientes`,
      label: 'Pacientes',
      icon: <UsersIcon className="w-5 h-5" />
    },
    {
      href: `/dashboard/medico/${id}/consultas`,
      label: 'Consultas',
      icon: <CalendarIcon className="w-5 h-5" />
    },
    {
      href: `/dashboard/medico/${id}/notificaciones`,
      label: 'Notificaciones',
      icon: <BellIcon className="w-5 h-5" />
    },
    {
      href: `/dashboard/medico/${id}/ayuda`,
      label: 'Ayuda y Soporte',
      icon: <QuestionMarkCircleIcon className="w-5 h-5" />
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 w-64 px-5 py-8 overflow-y-auto bg-white border-r rtl:border-r-0 rtl:border-l">
        <div className="flex flex-col justify-between h-full">
          <div>
            <nav className="mt-6 space-y-1">
              {links.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-4 py-2 text-gray-700 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  >
                    {link.icon && <span className="mr-3">{link.icon}</span>}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center text-sm font-medium text-gray-500">
              <span>Dr. {id}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}