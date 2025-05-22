'use client';

import { getAnamnesisVersion, getStructuredAnamnesis } from '@/app/services/structuredAnamnesisService';
import { useEffect, useState } from 'react';

/**
 * Componente que muestra las diferencias entre dos versiones de anamnesis
 * @param {Object} props
 * @param {string} props.patientId - ID del paciente
 * @param {Object} props.version - Versión para comparar (opcional, si no se proporciona se usa la actual)
 * @param {Object} props.compareWithVersion - Versión a comparar (opcional, si no se proporciona se usa la versión anterior)
 */
export default function AnamnesisDiffViewer({ patientId, version, compareWithVersion }) {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [previousVersion, setPreviousVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [differences, setDifferences] = useState([]);

  useEffect(() => {
    const loadVersions = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        setError(null);

        // Si se proporcionó una versión, usarla; de lo contrario, obtener la versión actual
        const currentData = version || await getStructuredAnamnesis(patientId);
        setCurrentVersion(currentData);

        // Si se proporcionó una versión para comparar, usarla
        if (compareWithVersion) {
          setPreviousVersion(compareWithVersion);
        }
        // De lo contrario, si tenemos una versión actual y esta tiene un ID de versión anterior, obtenerla
        else if (currentData?.metadata?.previousVersionId) {
          const prevVersion = await getAnamnesisVersion(
            patientId,
            currentData.metadata.previousVersionId
          );
          setPreviousVersion(prevVersion);
        }

      } catch (err) {
        console.error('Error loading anamnesis versions for diff:', err);
        setError('No fue posible cargar las versiones para comparar');
      } finally {
        setLoading(false);
      }
    };

    loadVersions();
  }, [patientId, version, compareWithVersion]);

  // Calcular diferencias cuando tenemos ambas versiones
  useEffect(() => {
    if (currentVersion && previousVersion) {
      const diffs = findDifferences(previousVersion, currentVersion);
      setDifferences(diffs);
    }
  }, [currentVersion, previousVersion]);

  // Función para encontrar diferencias entre dos objetos de anamnesis
  const findDifferences = (oldVersion, newVersion) => {
    const differences = [];

    // Comparar las secciones
    const oldSections = oldVersion?.sections || {};
    const newSections = newVersion?.sections || {};

    // Recorrer todas las secciones de la nueva versión
    Object.keys(newSections).forEach(sectionId => {
      const oldSection = oldSections[sectionId];
      const newSection = newSections[sectionId];

      // Si la sección no existe en la versión anterior, es nueva
      if (!oldSection) {
        differences.push({
          type: 'section-added',
          sectionId,
          title: getSectionTitle(sectionId),
          newData: newSection.data
        });
        return;
      }

      // Si ambas versiones tienen la sección, comparar los datos
      const sectionDiffs = findObjectDifferences(
        oldSection.data || {},
        newSection.data || {},
        sectionId
      );

      if (sectionDiffs.length > 0) {
        differences.push(...sectionDiffs);
      }
    });

    // Buscar secciones eliminadas
    Object.keys(oldSections).forEach(sectionId => {
      if (!newSections[sectionId]) {
        differences.push({
          type: 'section-removed',
          sectionId,
          title: getSectionTitle(sectionId),
          oldData: oldSections[sectionId].data
        });
      }
    });

    return differences;
  };

  // Función para encontrar diferencias entre dos objetos
  const findObjectDifferences = (oldObj, newObj, sectionId, prefix = '') => {
    const differences = [];

    // Buscar campos modificados o añadidos
    Object.keys(newObj).forEach(key => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const oldValue = oldObj[key];
      const newValue = newObj[key];

      // Si el campo es un objeto, buscar diferencias recursivamente
      if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue) &&
        typeof oldValue === 'object' && oldValue !== null && !Array.isArray(oldValue)) {
        const nestedDiffs = findObjectDifferences(oldValue, newValue, sectionId, fullPath);
        differences.push(...nestedDiffs);
      }
      // Para arrays, comparamos como valores simples (no recursivamente)
      else if (!deepEqual(oldValue, newValue)) {
        differences.push({
          type: 'field-changed',
          sectionId,
          title: getSectionTitle(sectionId),
          field: key,
          fieldPath: fullPath,
          fieldLabel: getFieldLabel(key),
          oldValue,
          newValue
        });
      }
    });

    // Buscar campos eliminados
    Object.keys(oldObj).forEach(key => {
      const fullPath = prefix ? `${prefix}.${key}` : key;

      if (newObj[key] === undefined) {
        differences.push({
          type: 'field-removed',
          sectionId,
          title: getSectionTitle(sectionId),
          field: key,
          fieldPath: fullPath,
          fieldLabel: getFieldLabel(key),
          oldValue: oldObj[key]
        });
      }
    });

    return differences;
  };

  // Comparación profunda de valores
  const deepEqual = (a, b) => {
    if (a === b) return true;

    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => deepEqual(val, b[idx]));
    }

    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      return keysA.every(key => {
        if (!b.hasOwnProperty(key)) return false;
        return deepEqual(a[key], b[key]);
      });
    }

    return false;
  };

  // Función para obtener un título legible para una sección
  const getSectionTitle = (sectionId) => {
    const sectionTitles = {
      'datos-personales': 'Datos Personales',
      'motivo-consulta': 'Motivo de Consulta',
      'historia-enfermedad': 'Historia de la Enfermedad Actual',
      'antecedentes-personales': 'Antecedentes Personales',
      'antecedentes-gineco': 'Antecedentes Gineco-Obstétricos',
      'antecedentes-familiares': 'Antecedentes Familiares',
      'habitos': 'Hábitos y Estilo de Vida',
      'revision-sistemas': 'Revisión por Sistemas',
      'pruebas-previas': 'Pruebas e Informes Previos',
      'salud-mental': 'Salud Mental y Bienestar',
      'percepcion-paciente': 'Percepción del Paciente'
    };

    return sectionTitles[sectionId] || sectionId;
  };

  // Función para obtener una etiqueta legible para un campo
  const getFieldLabel = (fieldId) => {
    const fieldLabels = {
      'nombre_completo': 'Nombre completo',
      'fecha_nacimiento': 'Fecha de nacimiento',
      'sexo': 'Sexo',
      'motivo_principal': 'Motivo principal',
      'preocupacion_principal': 'Preocupación principal',
      'expectativas_consulta': 'Expectativas de la consulta',
      'sintomas_principales': 'Síntomas principales',
      'fecha_inicio': 'Fecha de inicio',
      'tiene_sintomas_actuales': 'Tiene síntomas actuales',
      // Añadir más campos según sea necesario
    };

    return fieldLabels[fieldId] || fieldId;
  };

  // Formatear un valor para mostrarlo
  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 rounded-lg bg-gray-50">
        <div className="w-5 h-5 border-2 border-gray-700 rounded-full border-t-transparent animate-spin"></div>
        <span className="ml-2 text-sm text-gray-700">Comparando versiones...</span>
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

  if (!currentVersion) {
    return (
      <div className="p-4 text-sm text-blue-700 rounded-lg bg-blue-50">
        No hay versión actual para comparar.
      </div>
    );
  }

  if (!previousVersion) {
    return (
      <div className="p-4 text-sm text-blue-700 rounded-lg bg-blue-50">
        No hay versión anterior para comparar.
      </div>
    );
  }

  if (differences.length === 0) {
    return (
      <div className="p-4 text-sm text-green-700 rounded-lg bg-green-50">
        No se encontraron diferencias entre las versiones.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Cambios detectados ({differences.length})</h3>
      </div>

      <div className="p-4">
        <ul className="divide-y divide-gray-100">
          {differences.map((diff, index) => (
            <li key={index} className="py-3">
              {diff.type === 'section-added' && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-green-600">
                    <span className="inline-block mr-1">+</span>
                    Sección añadida: {diff.title}
                  </span>
                  <div className="pl-5 mt-1 text-xs text-gray-500">
                    {Object.keys(diff.newData || {}).map(key => (
                      <div key={key}>
                        {getFieldLabel(key)}: {formatValue(diff.newData[key])}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diff.type === 'section-removed' && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-red-600">
                    <span className="inline-block mr-1">-</span>
                    Sección eliminada: {diff.title}
                  </span>
                </div>
              )}

              {diff.type === 'field-changed' && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-blue-600">
                    <span className="inline-block mr-1">•</span>
                    {diff.title}: {diff.fieldLabel}
                  </span>
                  <div className="grid grid-cols-2 gap-2 pl-5 mt-1">
                    <div className="text-xs">
                      <span className="text-red-500">- </span>
                      {formatValue(diff.oldValue)}
                    </div>
                    <div className="text-xs">
                      <span className="text-green-500">+ </span>
                      {formatValue(diff.newValue)}
                    </div>
                  </div>
                </div>
              )}

              {diff.type === 'field-removed' && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-red-600">
                    <span className="inline-block mr-1">-</span>
                    {diff.title}: {diff.fieldLabel} eliminado
                  </span>
                  <div className="pl-5 mt-1 text-xs text-gray-500">
                    Valor anterior: {formatValue(diff.oldValue)}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
