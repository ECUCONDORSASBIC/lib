'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';

// Importaciones dinámicas para reducir la carga inicial
const FormField = dynamic(() => import('@/app/components/ui/FormField'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
});

const IntensitySlider = dynamic(() => import('@/app/components/ui/IntensitySlider'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-6 bg-gray-200 rounded"></div>
});

const Tooltip = dynamic(() => import('../../components/ui/Tooltip').then(mod => mod.Tooltip), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
});

// Componente de respaldo por si hay problemas
const FallbackInput = ({ label, value, onChange, placeholder, type = "text" }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        />
      )}
    </div>
  );
};

const PercepcionForm = ({ formData = {}, updateData }) => {
  // Inicializar estado con valores por defecto y datos del formulario
  const [localData, setLocalData] = useState({
    interpretacion_problema: '',
    mayor_preocupacion: '',
    temores_especificos: '',
    expectativas_consulta: [],
    expectativas_otro: '',
    impacto_vida_resumen: '',
    impacto_nivel: 0,
    limitaciones_actividades: '',
    preguntas_para_medico: '',
  });

  // Sincronizar con formData cuando cambie
  useEffect(() => {
    if (formData && typeof formData === 'object') {
      setLocalData(prevData => ({
        ...prevData,
        ...formData
      }));
    }
  }, [formData]);

  // Manejar cambios en los campos de entrada
  const handleInputChange = (field, value) => {
    try {
      const updatedData = {
        ...localData,
        [field]: value,
      };

      setLocalData(updatedData);

      // Llamar a updateData con los datos actualizados
      if (updateData && typeof updateData === 'function') {
        updateData(updatedData);
      }
    } catch (error) {
      console.error('Error en handleInputChange:', error);
    }
  };

  // Manejar cambios en los checkboxes
  const handleCheckboxChange = (option) => {
    try {
      const currentExpectativas = Array.isArray(localData.expectativas_consulta)
        ? localData.expectativas_consulta
        : [];

      const updatedExpectativas = currentExpectativas.includes(option)
        ? currentExpectativas.filter((item) => item !== option)
        : [...currentExpectativas, option];

      const updatedData = {
        ...localData,
        expectativas_consulta: updatedExpectativas,
      };

      setLocalData(updatedData);

      if (updateData && typeof updateData === 'function') {
        updateData(updatedData);
      }
    } catch (error) {
      console.error('Error en handleCheckboxChange:', error);
    }
  };

  const expectativasOptions = [
    { value: 'diagnostico', label: 'Obtener un diagnóstico claro' },
    { value: 'tratamiento', label: 'Recibir un tratamiento efectivo' },
    { value: 'alivio_sintomas', label: 'Aliviar mis síntomas' },
    { value: 'informacion', label: 'Obtener más información sobre mi condición' },
    { value: 'seguimiento', label: 'Establecer un plan de seguimiento' },
    { value: 'prevencion', label: 'Recibir consejos preventivos' },
    { value: 'segunda_opinion', label: 'Confirmar una opinión médica previa' },
    { value: 'otro', label: 'Otro' },
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
        <h2 className="text-xl font-semibold text-gray-800">Percepción del Paciente</h2>
        <ErrorBoundary fallback={null}>          <Suspense fallback={<div className="w-4 h-4 bg-gray-200 rounded-full"></div>}>
          <Tooltip content="Entender la experiencia subjetiva del paciente mejora la comunicación y permite abordar sus preocupaciones específicas.">
            <span className="inline-block w-4 h-4 bg-blue-500 rounded-full cursor-help text-white text-xs font-bold flex items-center justify-center">?</span>
          </Tooltip>
        </Suspense>
        </ErrorBoundary>
      </div>

      <div className="p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          Su perspectiva sobre su condición es muy importante. Esta sección nos ayuda a comprender
          mejor su experiencia y expectativas de la consulta.
        </p>
      </div>

      <ErrorBoundary
        fallback={
          <FallbackInput
            label="¿A qué cree que se debe su problema de salud actual?"
            value={localData.interpretacion_problema}
            onChange={(e) => handleInputChange('interpretacion_problema', e.target.value)}
            placeholder="Explique brevemente lo que usted piensa que está causando sus síntomas"
            type="textarea"
          />
        }
      >
        <Suspense fallback={<div className="animate-pulse h-28 bg-gray-200 rounded mb-4"></div>}>
          <FormField
            label="¿A qué cree que se debe su problema de salud actual?"
            type="textarea"
            value={localData.interpretacion_problema || ''}
            onChange={(e) => handleInputChange('interpretacion_problema', e.target.value)}
            placeholder="Explique brevemente lo que usted piensa que está causando sus síntomas"
            rows={3}
          />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <FallbackInput
            label="¿Cuál es su mayor preocupación con respecto a estos síntomas o problema?"
            value={localData.mayor_preocupacion}
            onChange={(e) => handleInputChange('mayor_preocupacion', e.target.value)}
            placeholder="Por ejemplo: que sea algo grave, que afecte a mi trabajo, etc."
            type="textarea"
          />
        }
      >
        <Suspense fallback={<div className="animate-pulse h-20 bg-gray-200 rounded mb-4"></div>}>
          <FormField
            label="¿Cuál es su mayor preocupación con respecto a estos síntomas o problema?"
            type="textarea"
            value={localData.mayor_preocupacion || ''}
            onChange={(e) => handleInputChange('mayor_preocupacion', e.target.value)}
            placeholder="Por ejemplo: que sea algo grave, que afecte a mi trabajo, etc."
            rows={2}
          />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <FallbackInput
            label="¿Tiene algún temor específico sobre su salud en este momento?"
            value={localData.temores_especificos}
            onChange={(e) => handleInputChange('temores_especificos', e.target.value)}
            placeholder="Describa cualquier temor o preocupación específica"
            type="textarea"
          />
        }
      >
        <Suspense fallback={<div className="animate-pulse h-20 bg-gray-200 rounded mb-4"></div>}>
          <FormField
            label="¿Tiene algún temor específico sobre su salud en este momento?"
            type="textarea"
            value={localData.temores_especificos || ''}
            onChange={(e) => handleInputChange('temores_especificos', e.target.value)}
            placeholder="Describa cualquier temor o preocupación específica"
            rows={2}
          />
        </Suspense>
      </ErrorBoundary>

      <div>
        <h3 className="mb-3 text-lg font-medium">¿Qué espera conseguir con esta consulta?</h3>
        <p className="mb-2 text-sm text-gray-600">Seleccione todas las opciones que apliquen</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {expectativasOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`expectativa-${option.value}`}
                checked={Array.isArray(localData.expectativas_consulta) && localData.expectativas_consulta.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`expectativa-${option.value}`} className="text-gray-700">{option.label}</label>
            </div>
          ))}
        </div>
        {Array.isArray(localData.expectativas_consulta) && localData.expectativas_consulta.includes('otro') && (
          <ErrorBoundary
            fallback={
              <FallbackInput
                label="Especifique otras expectativas"
                value={localData.expectativas_otro}
                onChange={(e) => handleInputChange('expectativas_otro', e.target.value)}
                placeholder="Describa sus expectativas"
              />
            }
          >
            <Suspense fallback={<div className="animate-pulse h-10 bg-gray-200 rounded mt-2"></div>}>
              <FormField
                label="Especifique otras expectativas"
                type="text"
                value={localData.expectativas_otro || ''}
                onChange={(e) => handleInputChange('expectativas_otro', e.target.value)}
                placeholder="Describa sus expectativas"
                className="mt-2"
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      <div className="p-4 bg-amber-50 rounded-md">
        <h3 className="mb-4 text-lg font-medium">Impacto en su vida</h3>

        <div>
          <p className="mb-2 font-medium">¿Cuánto está afectando este problema su vida diaria?</p>
          <ErrorBoundary
            fallback={
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={localData.impacto_nivel || 0}
                onChange={(e) => handleInputChange('impacto_nivel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            }
          >
            <Suspense fallback={<div className="animate-pulse h-6 bg-gray-200 rounded"></div>}>
              <IntensitySlider
                value={localData.impacto_nivel || 0}
                onChange={(value) => handleInputChange('impacto_nivel', value)}
                min={0}
                max={10}
                step={1}
                leftLabel="No afecta en absoluto"
                rightLabel="Afecta severamente"
              />
            </Suspense>
          </ErrorBoundary>
        </div>

        <div className="mt-6">
          <ErrorBoundary
            fallback={
              <FallbackInput
                label="Resuma cómo este problema está afectando su vida diaria"
                value={localData.impacto_vida_resumen}
                onChange={(e) => handleInputChange('impacto_vida_resumen', e.target.value)}
                placeholder="Ej: dificultad para dormir, limitaciones en el trabajo, etc."
                type="textarea"
              />
            }
          >
            <Suspense fallback={<div className="animate-pulse h-28 bg-gray-200 rounded"></div>}>
              <FormField
                label="Resuma cómo este problema está afectando su vida diaria"
                type="textarea"
                value={localData.impacto_vida_resumen || ''}
                onChange={(e) => handleInputChange('impacto_vida_resumen', e.target.value)}
                placeholder="Ej: dificultad para dormir, limitaciones en el trabajo, etc."
                rows={3}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {(localData.impacto_nivel || 0) > 5 && (
        <ErrorBoundary
          fallback={
            <FallbackInput
              label="¿Qué actividades específicas se han visto limitadas por su problema de salud?"
              value={localData.limitaciones_actividades}
              onChange={(e) => handleInputChange('limitaciones_actividades', e.target.value)}
              placeholder="Actividades que ya no puede realizar o que le resultan difíciles"
              type="textarea"
            />
          }
        >
          <Suspense fallback={<div className="animate-pulse h-20 bg-gray-200 rounded"></div>}>
            <FormField
              label="¿Qué actividades específicas se han visto limitadas por su problema de salud?"
              type="textarea"
              value={localData.limitaciones_actividades || ''}
              onChange={(e) => handleInputChange('limitaciones_actividades', e.target.value)}
              placeholder="Actividades que ya no puede realizar o que le resultan difíciles"
              rows={2}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      <ErrorBoundary
        fallback={
          <FallbackInput
            label="¿Tiene alguna pregunta específica que le gustaría hacerle al médico?"
            value={localData.preguntas_para_medico}
            onChange={(e) => handleInputChange('preguntas_para_medico', e.target.value)}
            placeholder="Escriba cualquier pregunta o duda que tenga para el profesional"
            type="textarea"
          />
        }
      >
        <Suspense fallback={<div className="animate-pulse h-28 bg-gray-200 rounded"></div>}>
          <FormField
            label="¿Tiene alguna pregunta específica que le gustaría hacerle al médico?"
            type="textarea"
            value={localData.preguntas_para_medico || ''}
            onChange={(e) => handleInputChange('preguntas_para_medico', e.target.value)}
            placeholder="Escriba cualquier pregunta o duda que tenga para el profesional"
            rows={3}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default PercepcionForm;
