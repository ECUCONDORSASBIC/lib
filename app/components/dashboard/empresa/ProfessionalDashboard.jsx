// src/components/dashboard/ProfessionalDashboard.tsx
'use client';

import React from 'react';
import { ArrowTrendingUpIcon, UserGroupIcon, LightBulbIcon } from '@heroicons/react/24/outline';

// Placeholder Insight Card component
const InsightCard = ({ title, description, icon, trend }) => (
  <div className="p-4 rounded-lg shadow bg-gray-50">
    <div className="flex items-start">
      <div className="flex-shrink-0 p-2 mr-3 text-indigo-700 bg-indigo-100 rounded-md">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 text-md">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        {trend && (
          <div className="flex items-center mt-2 text-xs text-green-600">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const ProfessionalDashboardComponent = () => {
  // Placeholder data for professional insights
  const insights = [
    {
      title: 'Tendencias de Desarrollo de Habilidades',
      description: 'Los empleados están cada vez más interesados en cursos de IA y Machine Learning.',
      icon: <LightBulbIcon />,
      trend: '+15% de interés este trimestre'
    },
    {
      title: 'Índice de Colaboración de Equipos',
      description: 'Los proyectos interdepartamentales han mejorado las puntuaciones de sinergia de equipos.',
      icon: <UserGroupIcon />,
      trend: '+8 puntos de mejora'
    },
    {
      title: 'Rol Emergente: Eticista de Datos',
      description: 'Considere crear roles enfocados en las implicaciones éticas del uso de datos.',
      icon: <ArrowTrendingUpIcon />,
    },
  ];

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <InsightCard
          key={index}
          title={insight.title}
          description={insight.description}
          icon={insight.icon}
          trend={insight.trend}
        />
      ))}
      {/* You can add more specific professional-related charts or data tables here */}
      <div className="p-4 text-sm text-center text-gray-500 bg-gray-100 rounded-md">
        Más análisis profesionales detallados próximamente.
      </div>
    </div>
  );
};

export default ProfessionalDashboardComponent;
