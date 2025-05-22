'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AnamnesisLink({ patientId, hasData = false, isComplete = false }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/dashboard/paciente/${patientId}/anamnesis`}
      legacyBehavior
      passHref
    >
      <a
        className={`block px-6 py-4 rounded-lg shadow-md transition-colors border border-blue-100 bg-white hover:bg-blue-50 ${isHovered ? 'ring-2 ring-blue-400' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-blue-800">Anamnesis</h2>
            <p className="text-sm text-gray-600">
              {hasData
                ? isComplete
                  ? 'Anamnesis completa'
                  : 'Anamnesis incompleta'
                : 'Aún no has completado tu anamnesis'}
            </p>
          </div>
          <span className={`inline-block px-3 py-1 text-xs rounded-full ${hasData ? (isComplete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700') : 'bg-gray-100 text-gray-500'}`}>
            {hasData ? (isComplete ? 'Completa' : 'Incompleta') : 'Pendiente'}
          </span>
        </div>
      </a>
    </Link>
  );
}
