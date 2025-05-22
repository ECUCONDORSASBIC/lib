// filepath: c:\Users\eduar\OneDrive - 0378d\Escritorio\pr-quality\components\anamnesis\SaludMentalForm.jsx
'use client';

import FormField from '@/app/components/ui/FormField';
import IntensitySlider from '@/app/components/ui/IntensitySlider';
import { Tooltip } from '@/app/components/ui/Tooltip';
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

// Helper mappings and function for sliders
const suenoOptionsToValue = { 'nunca': 0, 'ocasional': 1, 'frecuente': 2, 'constante': 3 };
const apoyoOptionsToValue = { 'nunca': 0, 'rara_vez': 1, 'a_veces': 2, 'frecuentemente': 3, 'siempre': 4 };

const getSliderValue = (stringValue, mapping, defaultValue = 0) => {
  if (typeof stringValue === 'number') {
    return stringValue;
  }
  if (typeof stringValue === 'string' && stringValue.toLowerCase() in mapping) {
    return mapping[stringValue.toLowerCase()];
  }
  return defaultValue;
};

const SaludMentalForm = ({ formData = {}, updateData }) => {
  const [localData, setLocalData] = useState(() => {
    const initialDefaults = {
      estado_animo_phq2: { decaido_deprimido: '', poco_interes_placer: '' },
      ansiedad_gad2: { nervioso_ansioso: '', no_controla_preocupaciones: '' },
      estres_percibido: 0,
      fuentes_estres: '',
      mecanismos_afrontamiento: [],
      mecanismos_afrontamiento_otros: '',
      calidad_sueno_detalle: {
        dificultad_conciliar: 0,
        despertares_nocturnos: 0,
        sueno_reparador: 0,
      },
      apoyo_social: {
        confianza_apoyo: 0,
        sentimiento_soledad: 0,
      },
      eventos_vitales_recientes: { presente: false, descripcion: '' },
    };

    let mergedData = JSON.parse(JSON.stringify(initialDefaults));

    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        if (mergedData.hasOwnProperty(key) && typeof mergedData[key] === 'object' && mergedData[key] !== null && !Array.isArray(mergedData[key])) {
          mergedData[key] = { ...mergedData[key], ...formData[key] };
        } else {
          mergedData[key] = formData[key];
        }
      }
    }

    mergedData.estres_percibido = typeof mergedData.estres_percibido === 'number' ? mergedData.estres_percibido : 0;

    if (mergedData.calidad_sueno_detalle) {
      mergedData.calidad_sueno_detalle.dificultad_conciliar = getSliderValue(mergedData.calidad_sueno_detalle.dificultad_conciliar, suenoOptionsToValue);
      mergedData.calidad_sueno_detalle.despertares_nocturnos = getSliderValue(mergedData.calidad_sueno_detalle.despertares_nocturnos, suenoOptionsToValue);
      mergedData.calidad_sueno_detalle.sueno_reparador = getSliderValue(mergedData.calidad_sueno_detalle.sueno_reparador, suenoOptionsToValue);
    }

    if (mergedData.apoyo_social) {
      mergedData.apoyo_social.confianza_apoyo = getSliderValue(mergedData.apoyo_social.confianza_apoyo, apoyoOptionsToValue);
      mergedData.apoyo_social.sentimiento_soledad = getSliderValue(mergedData.apoyo_social.sentimiento_soledad, apoyoOptionsToValue);
    }

    mergedData.mecanismos_afrontamiento = Array.isArray(mergedData.mecanismos_afrontamiento) ? mergedData.mecanismos_afrontamiento : [];
    mergedData.eventos_vitales_recientes = mergedData.eventos_vitales_recientes || { presente: false, descripcion: '' };
    if (typeof mergedData.eventos_vitales_recientes.presente !== 'boolean') {
      mergedData.eventos_vitales_recientes.presente = false;
    }

    return mergedData;
  });

  // Track which sections are open or collapsed
  const [openSections, setOpenSections] = useState({
    estado_animo_phq2: true,
    ansiedad_gad2: true,
    estres: true,
    mecanismos: true,
    calidad_sueno: true,
    apoyo_social: true,
    eventos_vitales: true
  });

  // Track completion status of each section
  const [sectionStatus, setSectionStatus] = useState({
    estado_animo_phq2: false,
    ansiedad_gad2: false,
    estres: false,
    mecanismos: false,
    calidad_sueno: false,
    apoyo_social: false,
    eventos_vitales: false
  });

  // Calculate overall progress
  const totalSections = Object.keys(sectionStatus).length;
  const completedSections = Object.values(sectionStatus).filter(status => status).length;
  const progress = Math.round((completedSections / totalSections) * 100);

  // Update section status when data changes
  useEffect(() => {
    const newStatus = {
      estado_animo_phq2:
        !!localData.estado_animo_phq2?.decaido_deprimido &&
        !!localData.estado_animo_phq2?.poco_interes_placer,
      ansiedad_gad2:
        !!localData.ansiedad_gad2?.nervioso_ansioso &&
        !!localData.ansiedad_gad2?.no_controla_preocupaciones,
      estres: typeof localData.estres_percibido === 'number',
      mecanismos: localData.mecanismos_afrontamiento && localData.mecanismos_afrontamiento.length > 0,
      calidad_sueno:
        typeof localData.calidad_sueno_detalle?.dificultad_conciliar === 'number' &&
        typeof localData.calidad_sueno_detalle?.despertares_nocturnos === 'number' &&
        typeof localData.calidad_sueno_detalle?.sueno_reparador === 'number',
      apoyo_social:
        typeof localData.apoyo_social?.confianza_apoyo === 'number' &&
        typeof localData.apoyo_social?.sentimiento_soledad === 'number',
      eventos_vitales: typeof localData.eventos_vitales_recientes?.presente === 'boolean' && (localData.eventos_vitales_recientes.presente ? !!localData.eventos_vitales_recientes.descripcion : true),
    };

    setSectionStatus(newStatus);
  }, [localData]);

  const handleInputChange = (field, value) => {
    const updatedData = { ...localData };

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedData[parent] = {
        ...updatedData[parent],
        [child]: value,
      };
    } else {
      updatedData[field] = value;
    }

    setLocalData(updatedData);

    // Directly call updateData with the appropriate section data
    if (updateData && typeof updateData === 'function') {
      updateData(updatedData);
    }
  };

  const handleCheckboxChange = (option) => {
    const updatedMecanismos = localData.mecanismos_afrontamiento.includes(option)
      ? localData.mecanismos_afrontamiento.filter((item) => item !== option)
      : [...localData.mecanismos_afrontamiento, option];

    const updatedData = {
      ...localData,
      mecanismos_afrontamiento: updatedMecanismos,
    };

    setLocalData(updatedData);

    // Directly call updateData with the updated data
    if (updateData && typeof updateData === 'function') {
      updateData(updatedData);
    }
  };

  const handleEventosVitalesChange = (value) => {
    const updatedData = {
      ...localData,
      eventos_vitales_recientes: {
        ...localData.eventos_vitales_recientes,
        presente: value,
        descripcion: value ? localData.eventos_vitales_recientes.descripcion : '',
      }
    };

    setLocalData(updatedData);

    // Directly call updateData with the updated data
    if (updateData && typeof updateData === 'function') {
      updateData(updatedData);
    }
  };

  // Toggle section open/closed
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper to scroll to the next incomplete section
  const scrollToNextIncomplete = () => {
    const sections = Object.keys(sectionStatus);
    const nextIncompleteSection = sections.find(section => !sectionStatus[section]);

    if (nextIncompleteSection) {
      // Open the section if it's closed
      if (!openSections[nextIncompleteSection]) {
        setOpenSections(prev => ({
          ...prev,
          [nextIncompleteSection]: true
        }));
      }

      // Scroll to the section
      const sectionElement = document.getElementById(`section-${nextIncompleteSection}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const phq2Options = [
    { value: '', label: 'Seleccione frecuencia...' },
    { value: 'nunca', label: 'Nunca' },
    { value: 'varios_dias', label: 'Varios días' },
    { value: 'mas_mitad_dias', label: 'Más de la mitad de los días' },
    { value: 'casi_todos_dias', label: 'Casi todos los días' },
  ];

  const gad2Options = [
    { value: '', label: 'Seleccione frecuencia...' },
    { value: 'nunca', label: 'Nunca' },
    { value: 'varios_dias', label: 'Varios días' },
    { value: 'mas_mitad_dias', label: 'Más de la mitad de los días' },
    { value: 'casi_todos_dias', label: 'Casi todos los días' },
  ];

  const mecanismosOptions = [
    { value: 'ejercicio', label: 'Ejercicio físico' },
    { value: 'meditacion', label: 'Meditación/mindfulness' },
    { value: 'hablar_amigos', label: 'Hablar con amigos/familia' },
    { value: 'terapia', label: 'Terapia psicológica' },
    { value: 'hobbies', label: 'Hobbies/actividades recreativas' },
    { value: 'otros', label: 'Otros' },
  ];

  // Section component for consistent styling and behavior
  const Section = ({ id, title, children, bgColor = "bg-white", isComplete }) => (
    <div
      id={`section-${id}`}
      className={`mb-6 rounded-lg shadow-sm border ${isComplete ? 'border-green-300' : 'border-gray-200'}`}
    >
      <div
        className={`flex items-center justify-between p-4 rounded-t-lg cursor-pointer ${bgColor}`}
        onClick={() => toggleSection(id)}
        role="button"
        tabIndex={0}
        aria-expanded={openSections[id]}
        onKeyDown={(e) => e.key === 'Enter' && toggleSection(id)}
      >
        <div className="flex items-center space-x-2">
          {isComplete && (
            <CheckCircleIcon className="w-6 h-6 text-green-500" aria-hidden="true" />
          )}
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
        <div>
          {openSections[id] ? (
            <ChevronUpIcon className="w-5 h-5" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" aria-hidden="true" />
          )}
        </div>
      </div>
      {openSections[id] && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Salud Mental y Bienestar Psicosocial</h2>
        <Tooltip text="Evalúa el estado emocional y mental del paciente, aspectos fundamentales para un abordaje integral de la salud." />
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso del formulario</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-200 rounded-full">
          <div
            className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
        {progress < 100 && (
          <button
            onClick={scrollToNextIncomplete}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
          >
            Ir a la siguiente sección incompleta
          </button>
        )}
      </div>

      {/* Estado de ánimo (PHQ-2) */}
      <Section
        id="estado_animo_phq2"
        title="Estado de ánimo (PHQ-2)"
        bgColor="bg-blue-50"
        isComplete={sectionStatus.estado_animo_phq2}
      >
        <div className="space-y-4">
          <FormField
            label="Durante las últimas 2 semanas, ¿con qué frecuencia ha sentido poco interés o placer en hacer las cosas?"
            type="select"
            value={localData.estado_animo_phq2.poco_interes_placer}
            onChange={(value) => handleInputChange('estado_animo_phq2.poco_interes_placer', value)}
            options={phq2Options}
            tooltip="Esta pregunta ayuda a detectar síntomas de depresión."
          />
          <FormField
            label="Durante las últimas 2 semanas, ¿con qué frecuencia se ha sentido decaído/a, deprimido/a o sin esperanza?"
            type="select"
            value={localData.estado_animo_phq2.decaido_deprimido}
            onChange={(value) => handleInputChange('estado_animo_phq2.decaido_deprimido', value)}
            options={phq2Options}
            tooltip="Esta pregunta también ayuda a detectar síntomas de depresión."
          />
        </div>
      </Section>

      {/* Ansiedad (GAD-2) */}
      <Section
        id="ansiedad_gad2"
        title="Ansiedad (GAD-2)"
        bgColor="bg-indigo-50"
        isComplete={sectionStatus.ansiedad_gad2}
      >
        <div className="space-y-4">
          <FormField
            label="Durante las últimas 2 semanas, ¿con qué frecuencia se ha sentido nervioso/a, ansioso/a o con los nervios de punta?"
            type="select"
            value={localData.ansiedad_gad2.nervioso_ansioso}
            onChange={(value) => handleInputChange('ansiedad_gad2.nervioso_ansioso', value)}
            options={gad2Options}
            tooltip="Esta pregunta ayuda a detectar síntomas de ansiedad."
          />
          <FormField
            label="Durante las últimas 2 semanas, ¿con qué frecuencia no ha podido parar o controlar sus preocupaciones?"
            type="select"
            value={localData.ansiedad_gad2.no_controla_preocupaciones}
            onChange={(value) => handleInputChange('ansiedad_gad2.no_controla_preocupaciones', value)}
            options={gad2Options}
            tooltip="Esta pregunta también ayuda a detectar síntomas de ansiedad."
          />
        </div>
      </Section>

      {/* Nivel de estrés */}
      <Section
        id="estres"
        title="Nivel de estrés percibido"
        bgColor="bg-indigo-50"
        isComplete={sectionStatus.estres}
      >
        <IntensitySlider
          label="Nivel de estrés percibido en el último mes (0 = Sin estrés, 10 = Estrés máximo)"
          value={localData.estres_percibido}
          onChange={(value) => handleInputChange('estres_percibido', value)}
          min={0}
          max={10}
          step={1}
          leftLabel="Sin estrés"
          rightLabel="Estrés máximo"
          tooltipText="Indique su nivel general de estrés en una escala de 0 a 10."
        />
        {localData.estres_percibido > 3 && (
          <div className="mt-4 animate-fadeIn">
            <FormField
              label="Principales fuentes de estrés"
              type="textarea"
              value={localData.fuentes_estres}
              onChange={(value) => handleInputChange('fuentes_estres', value)}
              placeholder="Ej: Trabajo, familia, salud, finanzas, estudios, relaciones personales, etc."
              tooltip="Describa brevemente las principales situaciones o factores que le generan estrés."
            />
          </div>
        )}
      </Section>

      {/* Mecanismos de afrontamiento */}
      <Section
        id="mecanismos"
        title="Mecanismos de afrontamiento"
        bgColor="bg-teal-50"
        isComplete={sectionStatus.mecanismos}
      >
        <p className="mb-3 text-sm text-gray-600">¿Qué estrategias utiliza para manejar el estrés o las emociones difíciles?</p>
        <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
          {mecanismosOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center p-2 space-x-3 transition-colors border rounded-md cursor-pointer hover:bg-gray-50"
              onClick={() => handleCheckboxChange(option.value)}
              tabIndex={0}
              role="checkbox"
              aria-checked={localData.mecanismos_afrontamiento.includes(option.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckboxChange(option.value)}
            >
              <input
                type="checkbox"
                id={`mecanismo-${option.value}`}
                checked={localData.mecanismos_afrontamiento.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`mecanismo-${option.value}`} className="text-gray-700 cursor-pointer">{option.label}</label>
            </div>
          ))}
        </div>

        {localData.mecanismos_afrontamiento.includes('otros') && (
          <div className="animate-fadeIn">
            <FormField
              label="Otros mecanismos (especifique)"
              type="text"
              value={localData.mecanismos_afrontamiento_otros}
              onChange={(value) => handleInputChange('mecanismos_afrontamiento_otros', value)}
              placeholder="Especifique otros mecanismos que utiliza"
              tooltip="Si seleccionó 'Otros', por favor especifique aquí."
            />
          </div>
        )}
      </Section>

      {/* Calidad del Sueño */}
      <Section
        id="calidad_sueno"
        title="Calidad del Sueño"
        bgColor="bg-teal-50"
        isComplete={sectionStatus.calidad_sueno}
      >
        <div className="space-y-6 p-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dificultad para conciliar el sueño
              <Tooltip text="¿Con qué frecuencia tiene problemas para quedarse dormido/a?" />
            </label>
            <IntensitySlider
              value={localData.calidad_sueno_detalle.dificultad_conciliar}
              onChange={(value) => handleInputChange('calidad_sueno_detalle.dificultad_conciliar', value)}
              min={0}
              max={3}
              step={1}
              leftLabel="Nunca"
              rightLabel="Constante"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Despertares nocturnos
              <Tooltip text="¿Con qué frecuencia se despierta durante la noche y le cuesta volver a dormir?" />
            </label>
            <IntensitySlider
              value={localData.calidad_sueno_detalle.despertares_nocturnos}
              onChange={(value) => handleInputChange('calidad_sueno_detalle.despertares_nocturnos', value)}
              min={0}
              max={3}
              step={1}
              leftLabel="Nunca"
              rightLabel="Constante"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sensación de sueño no reparador
              <Tooltip text="¿Con qué frecuencia siente que su sueño no ha sido reparador al despertar?" />
            </label>
            <IntensitySlider
              value={localData.calidad_sueno_detalle.sueno_reparador}
              onChange={(value) => handleInputChange('calidad_sueno_detalle.sueno_reparador', value)}
              min={0}
              max={3}
              step={1}
              leftLabel="Nunca"
              rightLabel="Constante"
            />
          </div>
        </div>
      </Section>

      {/* Apoyo Social y Emocional */}
      <Section
        id="apoyo_social"
        title="Apoyo Social y Emocional"
        bgColor="bg-purple-50"
        isComplete={sectionStatus.apoyo_social}
      >
        <div className="space-y-6 p-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia con la que siente que puede confiar en amigos/familiares para obtener apoyo emocional
              <Tooltip text="Evalúe la disponibilidad de apoyo emocional por parte de su red social." />
            </label>
            <IntensitySlider
              value={localData.apoyo_social.confianza_apoyo}
              onChange={(value) => handleInputChange('apoyo_social.confianza_apoyo', value)}
              min={0}
              max={4}
              step={1}
              leftLabel="Nunca"
              rightLabel="Siempre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia con la que se siente solo/a o aislado/a
              <Tooltip text="Evalúe la frecuencia con la que experimenta sentimientos de soledad o aislamiento." />
            </label>
            <IntensitySlider
              value={localData.apoyo_social.sentimiento_soledad}
              onChange={(value) => handleInputChange('apoyo_social.sentimiento_soledad', value)}
              min={0}
              max={4}
              step={1}
              leftLabel="Nunca"
              rightLabel="Siempre"
            />
          </div>
        </div>
      </Section>

      {/* Eventos Vitales */}
      <Section
        id="eventos_vitales"
        title="Eventos Vitales Recientes"
        bgColor="bg-gray-50"
        isComplete={sectionStatus.eventos_vitales}
      >
        <FormField
          label="¿Ha experimentado algún evento vital significativo en los últimos 6 meses?"
          type="radio"
          options={[
            { value: true, label: 'Sí' },
            { value: false, label: 'No' },
          ]}
          value={localData.eventos_vitales_recientes.presente}
          onChange={(e) => handleEventosVitalesChange(e.target.value === 'true')}
        />

        {localData.eventos_vitales_recientes.presente && (
          <div className="mt-4 animate-fadeIn">
            <FormField
              label="Descripción de los eventos"
              type="textarea"
              value={localData.eventos_vitales_recientes.descripcion}
              onChange={(value) => handleInputChange('eventos_vitales_recientes.descripcion', value)}
              placeholder="Ej: Mudanza reciente, pérdida de un ser querido, cambio de trabajo, matrimonio, divorcio, problemas legales, etc."
              tooltip="Describa brevemente los eventos vitales significativos que ha experimentado en los últimos 6-12 meses."
            />
          </div>
        )}
      </Section>

      {/* Add animation keyframes for fade-in effect */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SaludMentalForm;
