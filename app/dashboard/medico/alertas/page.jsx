'use client';

import PhysicianAlertList from '@/app/components/dashboard/medico/PhysicianAlertList';

export default function MedicoAlertasPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Podrías añadir un encabezado o navegación específica para médicos aquí */}
      <header className="p-6 shadow bg-gradient-to-r from-blue-700 to-indigo-700">
        <h1 className="text-3xl font-bold text-white">Panel de Alertas Médicas</h1>
      </header>

      <main className="container p-4 py-8 mx-auto md:p-8">
        <div className="max-w-4xl mx-auto">
          <PhysicianAlertList />
        </div>
      </main>

      <footer className="py-6 mt-12 text-center text-gray-600 bg-gray-200">
        <p>&copy; {new Date().getFullYear()} Altamedica. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
