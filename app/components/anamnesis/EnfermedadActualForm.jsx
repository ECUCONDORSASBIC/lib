'use client';
import FormField from '@/app/components/ui/FormField';

// Simplified component that doesn't rely on translation hooks directly
const EnfermedadActualForm = ({ formData = {}, updateData, errors = {} }) => {
  // Handler for form changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateData({ [name]: type === 'checkbox' ? checked : value });
  };

  // Static options - no need for translation here
  const duracionOptions = [
    { value: 'dias', label: 'Días' },
    { value: 'semanas', label: 'Semanas' },
    { value: 'meses', label: 'Meses' },
    { value: 'anos', label: 'Años' }
  ];

  const intensidadOptions = [
    { value: 'leve', label: 'Leve' },
    { value: 'moderada', label: 'Moderada' },
    { value: 'severa', label: 'Severa' },
    { value: 'variable', label: 'Variable' }
  ]; return (<div className="space-y-6">
    <div className="p-4 border border-blue-100 rounded-md bg-blue-50">
      <h3 className="mb-1 font-medium text-blue-800 text-md">
        Historia de la Enfermedad Actual
      </h3>
      <p className="text-sm text-blue-600">
        Describa detalladamente los síntomas actuales que le han llevado a buscar atención médica. Sea específico sobre cuándo comenzaron, cómo han evolucionado y qué factores los afectan. Si no tiene síntomas actuales y solo desea crear su historial médico, puede indicarlo y continuar.
      </p>
    </div>
    <div className="space-y-6">      <FormField
      label="¿Tiene síntomas específicos actualmente?"
      name="tiene_sintomas_actuales"
      type="radio-group"
      value={formData.tiene_sintomas_actuales || ''}
      onChange={handleFormChange}
      error={errors.tiene_sintomas_actuales}
      options={[
        { value: 'si', label: 'Sí, tengo síntomas específicos' },
        { value: 'no', label: 'No, solo estoy creando mi historial médico' }
      ]}
    />{formData.tiene_sintomas_actuales !== 'no' && (<FormField
      label="Describa los síntomas principales"
      name="sintomas_principales"
      type="textarea"
      value={formData.sintomas_principales || ''}
      onChange={handleFormChange}
      error={errors.sintomas_principales}
      tooltip="Describa los síntomas principales que está experimentando actualmente."
      placeholder="Ej: Dolor en el abdomen, fiebre, náuseas..."
      rows={4}
    />
    )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Fecha de inicio de los síntomas"
          name="fecha_inicio"
          type="date"
          value={formData.fecha_inicio || ''}
          onChange={handleFormChange}
          error={errors.fecha_inicio}
          tooltip="¿Cuándo comenzaron los síntomas por primera vez?"
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField label="Duración"
            name="duracion_valor"
            type="number"
            value={formData.duracion_valor || ''}
            onChange={handleFormChange}
            error={errors.duracion_valor}
            tooltip="¿Por cuánto tiempo ha tenido estos síntomas?"
          />
          <FormField label="Unidad"
            name="duracion_unidad"
            type="select"
            value={formData.duracion_unidad || ''}
            onChange={handleFormChange}
            error={errors.duracion_unidad}
            options={duracionOptions}
          />
        </div>
      </div>        <FormField label="Intensidad"
        name="intensidad"
        type="select"
        value={formData.intensidad || ''}
        onChange={handleFormChange}
        error={errors.intensidad}
        options={intensidadOptions}
        tooltip="¿Cómo calificaría la intensidad de sus síntomas?"
      />

      <FormField label="¿Los síntomas son constantes o intermitentes?"
        name="patron_sintomas"
        type="select"
        value={formData.patron_sintomas || ''}
        onChange={handleFormChange}
        error={errors.patron_sintomas}
        options={[
          { value: 'constante', label: 'Constantes' },
          { value: 'intermitente', label: 'Intermitentes' },
          { value: 'progresivo', label: 'Progresivos (empeoran con el tiempo)' },
          { value: 'variable', label: 'Variables (cambian en intensidad)' }
        ]}
      />

      <FormField label="Factores que mejoran los síntomas"
        name="factores_mejora"
        type="textarea"
        value={formData.factores_mejora || ''}
        onChange={handleFormChange}
        error={errors.factores_mejora}
        tooltip="¿Qué hace que sus síntomas mejoren? (medicamentos, posturas, actividades, etc.)"
        placeholder="Ej: Descansar, tomar analgésicos..."
        rows={2}
      />        <FormField
        label="Factores que empeoran los síntomas" name="factores_empeora"
        type="textarea"
        value={formData.factores_empeora || ''}
        onChange={handleFormChange}
        error={errors.factores_empeora}
        tooltip="¿Qué hace que sus síntomas empeoren? (alimentos, actividades, momentos del día, etc.)"
        placeholder="Ej: Actividad física, consumir ciertos alimentos..."
        rows={2}
      />

      <FormField
        label="Síntomas asociados"
        name="sintomas_asociados"
        type="textarea"
        value={formData.sintomas_asociados || ''}
        onChange={handleFormChange}
        error={errors.sintomas_asociados}
        tooltip="¿Ha notado otros síntomas que ocurren junto con el síntoma principal?"
        placeholder="Ej: Además del dolor, también experimento mareos y sudoración..."
        rows={3}
      />

      <FormField
        label="Tratamientos previos para esta condición" name="tratamientos_previos"
        type="textarea"
        value={formData.tratamientos_previos || ''}
        onChange={handleFormChange}
        error={errors.tratamientos_previos}
        tooltip="¿Qué tratamientos ha probado ya para esta condición y qué resultados ha obtenido?"
        placeholder="Ej: He tomado ibuprofeno pero solo alivia temporalmente..."
        rows={3}
      />

      <FormField
        label="Impacto en su vida diaria"
        name="impacto_vida"
        type="textarea"
        value={formData.impacto_vida || ''}
        onChange={handleFormChange}
        error={errors.impacto_vida}
        tooltip="¿Cómo han afectado estos síntomas su vida cotidiana, trabajo, relaciones, etc.?"
        placeholder="Ej: No puedo dormir bien, he tenido que ausentarme del trabajo..."
        rows={3}
      />      <FormField
        label="Información adicional relevante"
        name="informacion_adicional"
        type="textarea"
        value={formData.informacion_adicional || ''}
        onChange={handleFormChange}
        error={errors.informacion_adicional}
        tooltip="Cualquier otra información que considere importante sobre su condición actual."
        placeholder="Cualquier detalle adicional que quiera compartir con su médico..."
        rows={4}
      />
    </div>
  </div>
  );
};

export default EnfermedadActualForm;
