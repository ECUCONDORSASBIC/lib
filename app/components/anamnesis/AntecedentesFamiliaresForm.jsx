'use client';
import FormField from '@/app/components/ui/FormField';

// Componente para la entrada de una condición familiar
const FamilyConditionEntry = ({ condition, formData, updateData }) => {
  const conditionId = condition.id;
  const conditionData = formData[conditionId] || { presente: false, familiares: '' };

  const handleConditionToggle = () => {
    updateData({
      [conditionId]: {
        ...conditionData,
        presente: !conditionData.presente,
      }
    });
  };

  const handleRelativesChange = (e) => {
    updateData({
      [conditionId]: {
        ...conditionData,
        familiares: e.target.value,
      }
    });
  };

  return (
    <div className="border-b border-gray-200 py-3 last:border-b-0">
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={conditionData.presente || false}
            onChange={handleConditionToggle}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">{condition.title}</span>
        </label>
      </div>

      {conditionData.presente && (
        <div className="mt-2 pl-7">
          <textarea
            value={conditionData.familiares || ''}
            onChange={handleRelativesChange}
            rows={2}
            placeholder={`Especifique qué familiar(es) tiene(n) ${condition.title.toLowerCase()} y a qué edad fue diagnosticado...`}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      )}
    </div>
  );
};

const AntecedentesFamiliaresForm = ({ formData = {}, updateData, errors = {} }) => {
  const handleSingleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateData({ [name]: type === 'checkbox' ? checked : value });
  };

  // Lista de condiciones médicas familiares comunes a verificar
  const familyConditions = [
    { id: "diabetes_familiar", title: "Diabetes" },
    { id: "hipertension_familiar", title: "Hipertensión Arterial" },
    { id: "cardiopatia_familiar", title: "Enfermedades Cardíacas" },
    { id: "avc_familiar", title: "AVC/Derrame Cerebral" },
    { id: "cancer_familiar", title: "Cáncer" },
    { id: "asma_familiar", title: "Asma o Enfermedades Pulmonares" },
    { id: "renal_familiar", title: "Enfermedad Renal" },
    { id: "tiroides_familiar", title: "Problemas de Tiroides" },
    { id: "alzheimer_familiar", title: "Alzheimer o Demencia" },
    { id: "autoinmune_familiar", title: "Enfermedades Autoinmunes" },
    { id: "mental_familiar", title: "Enfermedades Mentales" },
    { id: "genetica_familiar", title: "Enfermedades Genéticas o Hereditarias" },
    { id: "obesidad_familiar", title: "Obesidad" }
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <h3 className="text-md font-medium text-blue-800 mb-1">Antecedentes Familiares</h3>
        <p className="text-sm text-blue-600">
          Proporcione información sobre condiciones médicas presentes en su familia biológica directa (padres, hermanos, abuelos, tíos).
          Esta información es importante para evaluar su riesgo genético.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Estado de Salud de Familiares Directos</h4>
        </div>
        <div className="p-4">
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Padres</h5>
            <FormField
              label="Estado de salud del padre"
              name="salud_padre"
              type="textarea"
              value={formData.salud_padre}
              onChange={handleSingleFieldChange}
              error={errors.salud_padre}
              placeholder="Edad actual (o edad y causa de fallecimiento), estado de salud general, enfermedades relevantes..."
              rows={2}
            />
            <FormField
              label="Estado de salud de la madre"
              name="salud_madre"
              type="textarea"
              value={formData.salud_madre}
              onChange={handleSingleFieldChange}
              error={errors.salud_madre}
              placeholder="Edad actual (o edad y causa de fallecimiento), estado de salud general, enfermedades relevantes..."
              rows={2}
            />
          </div>

          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Hermanos</h5>
            <FormField
              label="¿Tiene hermanos?"
              name="tiene_hermanos"
              type="checkbox"
              value={formData.tiene_hermanos}
              onChange={handleSingleFieldChange}
              error={errors.tiene_hermanos}
            />

            {formData.tiene_hermanos && (
              <FormField
                label="Estado de salud de hermanos"
                name="salud_hermanos"
                type="textarea"
                value={formData.salud_hermanos}
                onChange={handleSingleFieldChange}
                error={errors.salud_hermanos}
                placeholder="Número de hermanos, edades, estado de salud general, enfermedades relevantes..."
                rows={2}
              />
            )}
          </div>

          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Abuelos</h5>
            <FormField
              label="Estado de salud de abuelos paternos"
              name="salud_abuelos_paternos"
              type="textarea"
              value={formData.salud_abuelos_paternos}
              onChange={handleSingleFieldChange}
              error={errors.salud_abuelos_paternos}
              placeholder="Edad actual (o edad y causa de fallecimiento), enfermedades relevantes..."
              rows={2}
            />
            <FormField
              label="Estado de salud de abuelos maternos"
              name="salud_abuelos_maternos"
              type="textarea"
              value={formData.salud_abuelos_maternos}
              onChange={handleSingleFieldChange}
              error={errors.salud_abuelos_maternos}
              placeholder="Edad actual (o edad y causa de fallecimiento), enfermedades relevantes..."
              rows={2}
            />
          </div>

          <div>
            <FormField
              label="¿Tiene hijos?"
              name="tiene_hijos"
              type="checkbox"
              value={formData.tiene_hijos}
              onChange={handleSingleFieldChange}
              error={errors.tiene_hijos}
            />

            {formData.tiene_hijos && (
              <FormField
                label="Estado de salud de hijos"
                name="salud_hijos"
                type="textarea"
                value={formData.salud_hijos}
                onChange={handleSingleFieldChange}
                error={errors.salud_hijos}
                placeholder="Número de hijos, edades, estado de salud general, enfermedades relevantes..."
                rows={2}
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Historial de Condiciones Médicas en la Familia</h4>
          <p className="text-sm text-gray-500">Marque las condiciones presentes en su familia y especifique qué familiar(es) las padecen</p>
        </div>
        <div className="p-4">
          {familyConditions.map(condition => (
            <FamilyConditionEntry
              key={condition.id}
              condition={condition}
              formData={formData}
              updateData={updateData}
            />
          ))}

          <FamilyConditionEntry
            condition={{ id: "otra_condicion_familiar", title: "Otra condición médica relevante" }}
            formData={formData}
            updateData={updateData}
          />
        </div>
      </div>

      <FormField
        label="¿Hay alguna enfermedad que sea particularmente prevalente en su familia o grupo étnico?"
        name="enfermedades_prevalentes_familia"
        type="textarea"
        value={formData.enfermedades_prevalentes_familia}
        onChange={handleSingleFieldChange}
        error={errors.enfermedades_prevalentes_familia}
        placeholder="Describa cualquier patrón de enfermedad notable en su familia extendida..."
        rows={3}
      />

      <FormField
        label="Información adicional sobre la historia médica familiar"
        name="informacion_adicional_antecedentes_familiares"
        type="textarea"
        value={formData.informacion_adicional_antecedentes_familiares}
        onChange={handleSingleFieldChange}
        error={errors.informacion_adicional_antecedentes_familiares}
        placeholder="Cualquier otra información importante sobre antecedentes familiares..."
        rows={3}
      />
    </div>
  );
};

export default AntecedentesFamiliaresForm;
