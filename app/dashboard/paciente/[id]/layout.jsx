'use client';

import { useTranslation } from '@/app/i18n';
import {
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  DocumentChartBarIcon, // Changed from DocumentReportIcon which doesn't exist
  BeakerIcon, // Changed from PrescriptionBottleIcon which doesn't exist
  BellIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';

// Componente para los separadores de categoría
const CategoryDivider = ({ title }) => (
  <div className="py-2 px-3 mt-4 mb-1 text-xs font-semibold text-blue-800 uppercase tracking-wider bg-blue-50 rounded">
    {title}
  </div>
);

export default function PacienteLayout({ children }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Enlaces organizados por categorías para mejor organización
  const navigationLinks = [
    {
      category: 'Mi Salud',
      items: [
        {
          href: `/dashboard/paciente/${id}`,
          label: 'Resumen',
          icon: <UserIcon className="w-5 h-5" />
        },
        {
          href: `/dashboard/paciente/${id}/anamnesis`,
          label: t('anamnesis.title', 'Anamnesis'),
          icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />
        },
        {
          href: `/dashboard/paciente/${id}/metricas-salud`,
          label: 'Métricas de Salud',
          icon: <ChartBarIcon className="w-5 h-5" />
        }
      ]
    },
    {
      category: 'Atención Médica',
      items: [
        {
          href: `/dashboard/paciente/${id}/consultas`,
          label: t('patient.appointments', 'Consultas'),
          icon: <CalendarIcon className="w-5 h-5" />
        },
        {
          href: `/dashboard/paciente/${id}/telemedicina`,
          label: 'Telemedicina',
          icon: <VideoCameraIcon className="w-5 h-5" />,
          badge: 'Nuevo'
        },
        {
          href: `/dashboard/paciente/${id}/resultados`,
          label: t('assessments.results', 'Resultados'),
          icon: <DocumentChartBarIcon className="w-5 h-5" /> // Changed icon
        },
        {
          href: `/dashboard/paciente/${id}/recetas`,
          label: t('patient.prescriptions', 'Recetas'),
          icon: <BeakerIcon className="w-5 h-5" /> // Changed icon
        },
      ]
    },
    {
      category: 'Mi Cuenta',
      items: [
        {
          href: `/dashboard/paciente/${id}/notificaciones`,
          label: t('patient.notifications', 'Notificaciones'),
          icon: <BellIcon className="w-5 h-5" />,
          badge: '3'
        },
        {
          href: `/dashboard/paciente/${id}/perfil`,
          label: 'Perfil',
          icon: <DocumentTextIcon className="w-5 h-5" />
        },
        {
          href: `/dashboard/paciente/${id}/ayuda`,
          label: t('patient.helpSupport', 'Ayuda'),
          icon: <QuestionMarkCircleIcon className="w-5 h-5" />
        },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar con opción de colapsar */}
      <nav className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 p-4 overflow-y-auto text-gray-800 bg-gradient-to-b from-blue-50 to-sky-100 border-r border-sky-200 shadow-sm flex flex-col`}>
        <div className="mb-6 flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-semibold text-blue-800">Portal Paciente</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-full hover:bg-blue-200 text-blue-700"
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isCollapsed ?
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /> :
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              }
            </svg>
          </button>
        </div>

        {!isCollapsed && (
          <div className="py-2 px-3 mb-4 bg-white rounded-lg shadow-sm border border-blue-100">
            <p className="text-xs text-blue-600 mb-1">ID Paciente:</p>
            <p className="font-mono text-sm text-blue-800">{id.substring(0, 8)}...</p>
          </div>
        )}

        <div className="flex-1">
          {navigationLinks.map((section, index) => (
            <div key={index}>
              {!isCollapsed && <CategoryDivider title={section.category} />}
              <ul className="space-y-1 mb-4">
                {section.items.map((link) => {
                  const isActive = pathname === link.href ||
                    (pathname.includes(link.href) && link.href !== `/dashboard/paciente/${id}`);

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} py-2 px-3 rounded-md transition-colors ${isActive
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-blue-800 hover:bg-blue-200"
                          }`}
                        title={isCollapsed ? link.label : ''}
                      >
                        <span className="flex items-center">
                          <span className={`${isCollapsed ? '' : 'mr-3'}`}>{link.icon}</span>
                          {!isCollapsed && link.label}
                        </span>

                        {!isCollapsed && link.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-blue-200">
          <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center text-xs text-blue-600`}>
            {!isCollapsed && <span>Altamédica</span>}
            <span>v1.2.0</span>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
