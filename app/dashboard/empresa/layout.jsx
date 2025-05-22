export const metadata = {
  title: 'Dashboard de Empresa | Mercado P2P Salud',
  description: 'Gestiona tus ofertas laborales y encuentra profesionales de la salud',
};

import { BriefcaseIcon, BuildingOffice2Icon, Cog6ToothIcon, MapIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function EmployerDashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden bg-white border-r md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
        <div className="flex flex-col h-full">      <div className="flex items-center justify-center h-16 px-4 border-b">
          <span className="text-lg font-semibold text-sky-500">MercadoSalud</span>
        </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link href="/dashboard/empresa" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
              <BuildingOffice2Icon className="w-5 h-5 mr-3 text-gray-500" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/empresa/ofertas" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
              <BriefcaseIcon className="w-5 h-5 mr-3 text-gray-500" />
              <span>Ofertas Laborales</span>
            </Link>
            <Link href="/dashboard/empresa/buscar-profesionales" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
              <UserGroupIcon className="w-5 h-5 mr-3 text-gray-500" />
              <span>Buscar Profesionales</span>
            </Link>
            <Link href="/dashboard/empresa/mapa" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
              <MapIcon className="w-5 h-5 mr-3 text-gray-500" />
              <span>Mapa de Profesionales</span>
            </Link>
            <div className="pt-4 mt-4 border-t">
              <Link href="/dashboard/empresa/configuracion" className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-500" />
                <span>Configuración</span>
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 font-medium text-blue-600 bg-blue-100 rounded-full">
                H
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Hospital Metropolitano</p>
                <p className="text-xs text-gray-500">Empleador Verificado</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  );
}
