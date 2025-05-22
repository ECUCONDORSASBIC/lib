import React from 'react';
import Textarea from '../../ui/Textarea';
import Input from '../../ui/Input';

/**
 * @param {object} props
 * @param {import('../../../types/anamnesis').PercepcionPacienteData} props.data
 * @param {function(Partial<import('../../../types/anamnesis').PercepcionPacienteData>): void} props.updateData
 * @param {function(string, string): void} props.setSectionError
 * @param {function(string): void} props.clearSectionError
 * @param {import('../../../types/anamnesis').AnamnesisSectionKey} props.sectionKey
 */
const PercepcionPacienteSection = ({
  data,
  updateData,
  setSectionError,
  clearSectionError,
}) => {
  const handleChange = (field, value) => {
    updateData({ [field]: value });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">10. Percepción y Expectativas del Paciente</h2>
      <p className="text-gray-600 mb-6">
        Esta sección permite registrar cómo interpreta el paciente su problema, sus preocupaciones, expectativas y preguntas para el profesional de salud.
      </p>
      <Textarea
        label="¿Cómo interpreta usted su problema de salud?"
        name="interpretacion_problema"
        value={data.interpretacion_problema || ''}
        onChange={e => handleChange('interpretacion_problema', e.target.value)}
        rows={2}
        placeholder="Ej: Creo que es por estrés, pienso que puede ser algo grave, etc."
        className="mb-4"
      />
      <Textarea
        label="¿Cuál es su mayor preocupación respecto a este problema?"
        name="mayor_preocupacion"
        value={data.mayor_preocupacion || ''}
        onChange={e => handleChange('mayor_preocupacion', e.target.value)}
        rows={2}
        placeholder="Ej: Que sea una enfermedad grave, que no pueda trabajar, etc."
        className="mb-4"
      />
      <Textarea
        label="¿Tiene algún temor específico?"
        name="temores_especificos"
        value={data.temores_especificos || ''}
        onChange={e => handleChange('temores_especificos', e.target.value)}
        rows={2}
        placeholder="Ej: Miedo a cirugía, a perder movilidad, etc."
        className="mb-4"
      />
      <Textarea
        label="¿Qué espera obtener de esta consulta? (Expectativas)"
        name="expectativas_consulta"
        value={data.expectativas_consulta || ''}
        onChange={e => handleChange('expectativas_consulta', e.target.value)}
        rows={2}
        placeholder="Ej: Un diagnóstico claro, alivio de síntomas, orientación sobre tratamiento, etc."
        className="mb-4"
      />
      <Textarea
        label="¿Cómo ha impactado este problema en su vida diaria?"
        name="impacto_vida_resumen"
        value={data.impacto_vida_resumen || ''}
        onChange={e => handleChange('impacto_vida_resumen', e.target.value)}
        rows={2}
        placeholder="Ej: No puedo trabajar, afecta mi ánimo, limita mis actividades, etc."
        className="mb-4"
      />
      <Textarea
        label="¿Tiene alguna pregunta específica para el médico?"
        name="preguntas_para_medico"
        value={data.preguntas_para_medico || ''}
        onChange={e => handleChange('preguntas_para_medico', e.target.value)}
        rows={2}
        placeholder="Ej: ¿Esto es grave?, ¿Necesito estudios?, ¿Hay cura?, etc."
        className="mb-4"
      />
    </div>
  );
};

export default PercepcionPacienteSection;
