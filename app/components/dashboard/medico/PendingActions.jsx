import React from 'react';
import Link from 'next/link';

const PendingActions = () => {
  // Simulación de acciones pendientes
  const actions = [
    { id: 'a1', label: 'Revisar resultados de laboratorio', href: '/dashboard/acciones/a1' },
    { id: 'a2', label: 'Firmar recetas pendientes', href: undefined },
    { id: 'a3', label: 'Actualizar expediente de paciente', href: '/dashboard/acciones/a3' },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="mb-2 text-lg font-semibold">Acciones Pendientes</h2>
      {actions.length === 0 ? (
        <div className="text-gray-500">No hay acciones pendientes.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {actions.map((action) => (
            <li key={action.id} className="flex items-center justify-between py-2">
              <span>{action.label}</span>
              {typeof action.href === 'string' && action.href ? (
                <Link href={action.href} className="text-sm text-blue-600 hover:underline">
                  Ir
                </Link>
              ) : (
                <span className="text-sm text-gray-400 cursor-not-allowed">Ir</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingActions;
