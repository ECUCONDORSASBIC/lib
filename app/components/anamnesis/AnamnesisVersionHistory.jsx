'use client';

import { getAnamnesisVersions } from '@/app/services/structuredAnamnesisService';
import { useEffect, useState } from 'react';

/**
 * Componente que muestra un historial de versiones de anamnesis
 * @param {Object} props
 * @param {string} props.patientId - ID del paciente
 * @param {function} props.onVersionSelect - Función a llamar cuando se selecciona una versión
 */
export default function AnamnesisVersionHistory({ patientId, onVersionSelect }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadVersions = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        setError(null);

        const versionList = await getAnamnesisVersions(patientId);
        setVersions(versionList);
      } catch (err) {
        console.error('Error loading anamnesis versions:', err);
        setError('No fue posible cargar el historial de versiones');
      } finally {
        setLoading(false);
      }
    };

    loadVersions();
  }, [patientId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha desconocida';

    // If it's a Firebase Timestamp, convert to JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return new Intl.DateTimeFormat('es', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 rounded-lg bg-gray-50">
        <div className="w-5 h-5 border-2 border-gray-700 rounded-full border-t-transparent animate-spin"></div>
        <span className="ml-2 text-sm text-gray-700">Cargando historial...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <span className="font-medium">Error:</span> {error}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="p-4 text-sm text-blue-700 rounded-lg bg-blue-50">
        No hay versiones anteriores de esta historia clínica.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-medium text-gray-900">Historial de cambios ({versions.length})</h3>
        <button className="p-1 text-gray-500 hover:text-gray-700">
          {expanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          <ul className="divide-y divide-gray-200">
            {versions.map((version, index) => (
              <li
                key={version.metadata.versionId}
                className="py-2"
              >
                <button
                  onClick={() => onVersionSelect(version)}
                  className="flex flex-col w-full p-2 text-left rounded hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Versión {versions.length - index}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(version.metadata.createdAt)}
                    </span>
                  </div>

                  {version.metadata.changedSections && (
                    <span className="mt-1 text-xs text-gray-500">
                      Secciones modificadas: {version.metadata.changedSections.join(', ')}
                    </span>
                  )}

                  <span className="mt-1 text-xs text-gray-600">
                    Modificado por: {version.metadata.createdByName || version.metadata.createdBy}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
