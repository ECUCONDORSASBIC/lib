// src/components/dashboard/EmployerDashboard.tsx
'use client';

import { BriefcaseIcon, ChartBarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import React from 'react';
import MapsComponent from './maps'; // Assuming maps.jsx exports MapsComponent
import ProfessionalDashboardComponent from './ProfessionalDashboard'; // Assuming ProfessionalDashboard.jsx exports ProfessionalDashboardComponent

// Placeholder Stat Card component
const StatCard = ({ title, value, icon }) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <div className="flex items-center">
      <div className="flex-shrink-0 p-3 mr-4 text-white bg-indigo-600 rounded-full">
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const EmployerDashboard = () => {
  // Placeholder data
  const stats = [
    { title: 'Total de Empleados', value: '1,250', icon: <UsersIcon /> },
    { title: 'Proyectos Activos', value: '75', icon: <BriefcaseIcon /> },
    { title: 'Satisfacción General', value: '85%', icon: <ChartBarIcon /> },
    { title: 'Departamentos', value: '12', icon: <UsersIcon /> },
  ];

  return (
    <div className="p-4 space-y-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control de Empresa</h1>
        <p className="mt-1 text-gray-600">¡Bienvenido de nuevo, [Nombre de Empresa]!</p>
      </header>

      {/* Stats Grid */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-700">Métricas Clave</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} />
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-700">
          <MapPinIcon className="w-6 h-6 mr-2 text-indigo-600" />
          Resumen de Ubicaciones de Empleados
        </h2>
        <div className="h-96"> {/* Fixed height for map container */}
          <MapsComponent />
        </div>
      </section>

      {/* Professional Insights Section */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-700">Perspectivas Profesionales</h2>
        <ProfessionalDashboardComponent />
      </section>

      {/* Additional sections can be added here */}
      {/* For example: Recent Hires, Department Performance, Upcoming Events */}

    </div>
  );
};

export default EmployerDashboard;
