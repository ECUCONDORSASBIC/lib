'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const DashboardLayout = ({ children }) => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  if (loading) {
    return (<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-300"></div>
    </div>
    );
  }

  if (!user) {
    return null; // No renderizar nada mientras redirige
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  let expectedPath;
  const { role, uid } = user;

  switch (role) {
    case 'paciente':
      expectedPath = uid ? `/dashboard/paciente/${uid}` : '/dashboard/user-setup-required';
      break;
    case 'medico':
      expectedPath = uid ? `/dashboard/medico/${uid}` : '/dashboard/user-setup-required';
      break;
    case 'empresa':
      expectedPath = uid ? `/dashboard/empresa` : '/dashboard/user-setup-required'; // Las empresas no usan UID en la ruta
      break;
    default:
      expectedPath = getRoleDefaultPath(role, uid);
  }

  return (<div className="flex h-screen bg-gray-100">      {/* Sidebar para móviles (offcanvas) */}      <div
    className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 bg-sky-300 text-white transition duration-200 ease-in-out lg:relative lg:translate-x-0 z-20`}
  >
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">PR-Quality</h2>
        <button
          className="lg:hidden text-white focus:outline-none"
          onClick={toggleSidebar}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>      <nav className="px-4 py-2">
      <ul className="space-y-2">
        <li>              <Link
          href="/dashboard"
          className="block px-4 py-2 rounded hover:bg-sky-200 transition duration-150"
        >
          Panel principal
        </Link>
        </li>
        <li>              <Link
          href="/dashboard/pacientes"
          className="block px-4 py-2 rounded hover:bg-sky-200 transition duration-150"
        >
          Pacientes
        </Link>
        </li>
        <li>              <Link
          href="/dashboard/consultas"
          className="block px-4 py-2 rounded hover:bg-sky-200 transition duration-150"
        >
          Consultas
        </Link>
        </li>
        <li>              <button
          onClick={signOut}
          className="w-full text-left px-4 py-2 rounded hover:bg-sky-200 transition duration-150"
        >
          Cerrar sesión
        </button>
        </li>
      </ul>
    </nav>
  </div>

    {/* Contenido principal */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Barra superior */}
      <header className="bg-white shadow">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            className="lg:hidden text-gray-600 focus:outline-none"
            onClick={toggleSidebar}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {user?.email}
            </span>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {children}
      </main>
    </div>

    {/* Overlay para cerrar sidebar en móviles */}
    {isSidebarOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
        onClick={toggleSidebar}
      ></div>
    )}
  </div>
  );
};

export default DashboardLayout;
