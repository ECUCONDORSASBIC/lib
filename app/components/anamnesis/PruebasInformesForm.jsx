'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';

// Importaciones dinámicas para reducir la carga inicial
const FormField = dynamic(() => import('../../components/ui/FormField'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
});

const DatePicker = dynamic(() => import('../../components/ui/DatePicker'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
});

// Importar el componente Tooltip correctamente
const Tooltip = dynamic(() => import('../../components/ui/Tooltip').then(mod => mod.Tooltip), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
});

// Importar el componente MedicalDocumentUploader
const MedicalDocumentUploader = dynamic(() => import('../../components/ui/MedicalDocumentUploader'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
});

// Componente de respaldo por si hay problemas
const FallbackInput = ({ label, value, onChange, placeholder, type = "text" }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>
  );
};

/**
 * PruebasInformesForm component - Used for tracking previous medical tests, imaging studies and reports
 */
const PruebasInformesForm = ({ formData = {}, updateData }) => {
  // Inicializar estado con valores por defecto y datos del formulario
  const [localData, setLocalData] = useState({
    pruebas_realizadas: [],
    otros_informes: '',
    ultima_analitica_fecha: null,
    ultima_radiografia_fecha: null,
  });

  // Estado para los documentos médicos
  const [medicalDocuments, setMedicalDocuments] = useState([]);

  // Sincronizar con formData cuando cambie
  useEffect(() => {
    if (formData && typeof formData === 'object') {
      setLocalData(prevData => ({
        ...prevData,
        ...formData
      }));

      // Si hay documentos en el formData, los cargamos
      if (Array.isArray(formData.documentos)) {
        setMedicalDocuments(formData.documentos);
      }
    }
  }, [formData]);

  // Manejar cambios en las pruebas realizadas (checkboxes)
  const handlePruebaChange = (pruebaId) => {
    const currentPruebas = Array.isArray(localData.pruebas_realizadas)
      ? localData.pruebas_realizadas
      : [];

    const updatedPruebas = currentPruebas.includes(pruebaId)
      ? currentPruebas.filter(id => id !== pruebaId)
      : [...currentPruebas, pruebaId];

    const updatedData = {
      ...localData,
      pruebas_realizadas: updatedPruebas
    };

    setLocalData(updatedData);

    if (updateData && typeof updateData === 'function') {
      updateData(updatedData);
    }
  };

  // Manejar cambios en los campos de texto
  const handleInputChange = (field, value) => {
    const updatedData = {
      ...localData,
      [field]: value,
    };

    setLocalData(updatedData);

    if (updateData && typeof updateData === 'function') {
      updateData(updatedData);
    }
  };

  // Manejar subida de documentos
  const handleDocumentUpload = async (file) => {
    try {
      // En un entorno real, aquí subiríamos el archivo a un servidor
      // Por ahora simulamos la respuesta
      const newDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file) // Esto es solo para la vista previa
      };

      const updatedDocs = [...medicalDocuments, newDocument];
      setMedicalDocuments(updatedDocs);

      const updatedData = {
        ...localData,
        documentos: updatedDocs
      };

      setLocalData(updatedData);

      if (updateData && typeof updateData === 'function') {
        updateData(updatedData);
      }

      return newDocument;
    } catch (error) {
      console.error('Error al subir documento:', error);
      throw error;
    }
  };

  // Manejar eliminación de documentos
  const handleDocumentRemove = (docId) => {
    const updatedDocs = medicalDocuments.filter(doc => doc.id !== docId);
    setMedicalDocuments(updatedDocs);

    const updatedData = {
      ...localData,
      documentos: updatedDocs
    };

    setLocalData(updatedData);

    if (updateData && typeof updateData === 'function') {
      updateData(updatedData);
    }
  };

  // Lista de pruebas médicas comunes
  const pruebasMedicas = [
    { id: 'analitica', label: 'Análisis de sangre' },
    { id: 'radiografia', label: 'Radiografía' },
    { id: 'resonancia', label: 'Resonancia Magnética' },
    { id: 'ecografia', label: 'Ecografía' },
    { id: 'tac', label: 'TAC (Tomografía)' },
    { id: 'ekg', label: 'Electrocardiograma' },
    { id: 'espirometria', label: 'Espirometría' },
    { id: 'densitometria', label: 'Densitometría Ósea' },
    { id: 'endoscopia', label: 'Endoscopía' },
    { id: 'otros', label: 'Otros exámenes o pruebas' },
  ];

  // Componente para manejar errores y mostrar un respaldo
  const ErrorBoundary = ({ children, fallback }) => {
    try {
      return children;
    } catch (error) {
      console.error("Error en componente:", error);
      return fallback;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Pruebas e Informes Previos</h2>
        <ErrorBoundary fallback={null}>
          <Suspense fallback={<div className="w-4 h-4 bg-gray-200 rounded-full"></div>}>
            <Tooltip content="Información sobre pruebas médicas e informes previos relevantes para su consulta actual.">
              <span className="inline-block w-4 h-4 bg-blue-500 rounded-full cursor-help text-white text-xs font-bold flex items-center justify-center">?</span>
            </Tooltip>
          </Suspense>
        </ErrorBoundary>
      </div>

      <div className="p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          Por favor, indique si se ha realizado alguna prueba médica relacionada con su consulta actual
          y proporcione detalles sobre los resultados si los conoce.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">Pruebas realizadas recientemente</h3>
        <p className="mb-2 text-sm text-gray-600">Seleccione todas las opciones que apliquen</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {pruebasMedicas.map((prueba) => (
            <div key={prueba.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`prueba-${prueba.id}`}
                checked={Array.isArray(localData.pruebas_realizadas) && localData.pruebas_realizadas.includes(prueba.id)}
                onChange={() => handlePruebaChange(prueba.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`prueba-${prueba.id}`} className="text-gray-700">{prueba.label}</label>
            </div>
          ))}
        </div>
      </div>

      {Array.isArray(localData.pruebas_realizadas) && localData.pruebas_realizadas.includes('otros') && (
        <ErrorBoundary
          fallback={
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Especifique otras pruebas realizadas
              </label>
              <textarea
                value={localData.otros_informes || ''}
                onChange={(e) => handleInputChange('otros_informes', e.target.value)}
                placeholder="Describa otras pruebas o exámenes realizados"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                rows={3}
              />
            </div>
          }
        >
          <Suspense fallback={<div className="animate-pulse h-28 bg-gray-200 rounded"></div>}>
            <FormField
              label="Especifique otras pruebas realizadas"
              type="textarea"
              value={localData.otros_informes || ''}
              onChange={(e) => handleInputChange('otros_informes', e.target.value)}
              placeholder="Describa otras pruebas o exámenes realizados"
              rows={3}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {Array.isArray(localData.pruebas_realizadas) && localData.pruebas_realizadas.includes('analitica') && (
        <ErrorBoundary
          fallback={
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Fecha del último análisis de sangre
              </label>
              <input
                type="date"
                value={localData.ultima_analitica_fecha || ''}
                onChange={(e) => handleInputChange('ultima_analitica_fecha', e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          }
        >
          <Suspense fallback={<div className="animate-pulse h-10 bg-gray-200 rounded"></div>}>
            <DatePicker
              label="Fecha del último análisis de sangre"
              value={localData.ultima_analitica_fecha}
              onChange={(date) => handleInputChange('ultima_analitica_fecha', date)}
              placeholder="DD/MM/YYYY"
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {Array.isArray(localData.pruebas_realizadas) && localData.pruebas_realizadas.includes('radiografia') && (
        <ErrorBoundary
          fallback={
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Fecha de la última radiografía
              </label>
              <input
                type="date"
                value={localData.ultima_radiografia_fecha || ''}
                onChange={(e) => handleInputChange('ultima_radiografia_fecha', e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          }
        >
          <Suspense fallback={<div className="animate-pulse h-10 bg-gray-200 rounded"></div>}>
            <DatePicker
              label="Fecha de la última radiografía"
              value={localData.ultima_radiografia_fecha}
              onChange={(date) => handleInputChange('ultima_radiografia_fecha', date)}
              placeholder="DD/MM/YYYY"
            />
          </Suspense>
        </ErrorBoundary>
      )}

      <div>
        <h3 className="mb-4 text-lg font-medium">Documentos médicos</h3>
        <p className="mb-4 text-sm text-gray-600">
          Si dispone de los informes o resultados de las pruebas mencionadas, puede subirlos a continuación para que el médico pueda revisarlos durante la consulta.
        </p>

        <div className="pt-4 border-t border-gray-200">
          <MedicalDocumentUploader
            documents={medicalDocuments}
            onUpload={handleDocumentUpload}
            onRemove={handleDocumentRemove}
          />
        </div>
      </div>
    </div>
  );
};

export default PruebasInformesForm;
