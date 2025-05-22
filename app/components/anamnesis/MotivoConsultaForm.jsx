'use client';
import FormField from '@/app/components/ui/FormField';
import { useTranslation } from '@/app/i18n';

const MotivoConsultaForm = ({ formData = {}, updateData, errors = {} }) => {
  const { t } = useTranslation('anamnesis');

  try {
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      updateData({ [name]: type === 'checkbox' ? checked : value });
    };

  return (
    <div className="space-y-6">
      <div className="p-4 border border-blue-100 rounded-md bg-blue-50">
        <h3 className="mb-1 font-medium text-blue-800 text-md">{t('form.chiefComplaintTitle')}</h3>
        <p className="text-sm text-blue-600">
          {t('form.chiefComplaintPrompt')}
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label={t('form.chiefComplaintLabel')}
          name="motivo_principal"
          type="textarea"
          value={formData.motivo_principal}
          onChange={handleChange}
          required
          error={errors.motivo_principal}
          tooltip={t('form.chiefComplaintTooltip', "Describa en sus propias palabras por qué ha decidido buscar atención médica ahora")}
          placeholder={t('form.chiefComplaintPlaceholder', "Ej: Dolor de cabeza persistente en los últimos 5 días, fiebre que no cede con medicación, deseo completar su historial médico...")}
          rows={4}
          translationNamespace="anamnesis"
        />

        <FormField
          label={t('form.firstConsultationLabel')}
          name="primera_consulta"
          type="radio-group"
          value={formData.primera_consulta}
          onChange={handleChange}
          error={errors.primera_consulta}
          options={[
            { value: 'si', label: t('form.firstTime', "Sí, es la primera vez") },
            { value: 'no', label: t('form.consultedBefore', "No, he consultado anteriormente") }
          ]}
          translationNamespace="anamnesis"
        />

        {formData.primera_consulta === 'no' && (
          <FormField
            label={t('form.previousConsultationsLabel')}
            name="consultas_previas"
            type="textarea"
            value={formData.consultas_previas}
            onChange={handleChange}
            translationNamespace="anamnesis"
            error={errors.consultas_previas}
            tooltip={t('form.previousConsultationsTooltip', "Describa cuándo, dónde y qué le dijeron en consultas anteriores")}
            placeholder={t('form.previousConsultationsPlaceholder', "Ej: Consulté hace 2 meses en urgencias, me diagnosticaron migraña y recetaron ibuprofeno...")}
            rows={3}
          />
        )}

        <FormField
          label={t('form.mainConcernLabel')}
          name="preocupacion_principal"
          type="textarea"
          value={formData.preocupacion_principal}
          onChange={handleChange}
          error={errors.preocupacion_principal}
          tooltip={t('form.mainConcernTooltip', "¿Qué es lo que más le preocupa sobre sus síntomas o condición actual?")}
          placeholder={t('form.mainConcernPlaceholder', "Ej: Me preocupa que pueda ser algo grave, que interfiera con mi trabajo, etc...")}
          rows={3}
          translationNamespace="anamnesis"
        />

        <FormField
          label={t('form.expectationsConsultationLabel')}
          name="expectativas_consulta"
          type="textarea"
          value={formData.expectativas_consulta}
          onChange={handleChange}
          error={errors.expectativas_consulta}
          tooltip={t('form.expectationsTooltip', "¿Qué resultado espera de esta consulta? ¿Diagnóstico, tratamiento específico, derivación, etc.?")}
          placeholder={t('form.expectationsPlaceholder', "Ej: Quisiera saber qué tengo, recibir tratamiento para aliviar el dolor, ser derivado a un especialista...")}
          rows={3}
          translationNamespace="anamnesis"
        />

        <FormField
          label={t('form.firstMedicalHistoryLabel')}
          name="primera_historia_clinica"
          type="radio-group"
          value={formData.primera_historia_clinica}
          onChange={handleChange}
          error={errors.primera_historia_clinica}
          options={[
            {
              value: 'si',
              label: t('form.firstMedicalHistoryYes', 'Sí, estoy creando mi historial médico completo por primera vez')
            },
            {
              value: 'no',
              label: t('form.firstMedicalHistoryNo', 'No, ya tengo una historia clínica en Altamedica')
            }
          ]}
          translationNamespace="anamnesis"
        />

        <FormField
          label={t('form.additionalInfoMotivoLabel')}
          name="informacion_adicional_motivo"
          type="textarea"
          value={formData.informacion_adicional_motivo}
          onChange={handleChange}
          error={errors.informacion_adicional_motivo} tooltip={t('form.additionalInfoMotivoTooltip', "Cualquier otra información relevante que quiera compartir sobre su motivo de consulta")}
          placeholder={t('form.additionalInfoMotivoPlaceholder', "Cualquier otra información relevante para el médico...")}
          rows={3}
          translationNamespace="anamnesis"
        />      </div>
    </div>
  );
  } catch (error) {
    console.error("Error rendering MotivoConsultaForm:", error);
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <h3 className="font-medium text-red-800">Error al cargar el formulario</h3>
        <p className="text-sm text-red-700">Por favor, inténtelo de nuevo más tarde.</p>
      </div>
    );
  }
};

export default MotivoConsultaForm;
