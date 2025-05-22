'use client';
import FormField from '@/app/components/ui/FormField';
import { useTranslation } from '@/app/i18n';

const DatosPersonalesForm = ({ formData = {}, updateData, errors = {}, setErrors }) => {
  const { t } = useTranslation('anamnesis');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateData({ [name]: type === 'checkbox' ? checked : value });

    // Clear error on field change if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  const sexoOptions = [
    { value: 'masculino', label: t('form.gender.male', 'Masculino') },
    { value: 'femenino', label: t('form.gender.female', 'Femenino') },
    { value: 'otro', label: t('form.gender.other', 'Otro') }
  ];

  const estadoCivilOptions = [
    { value: 'soltero', label: t('form.maritalStatus.single', 'Soltero/a') },
    { value: 'casado', label: t('form.maritalStatus.married', 'Casado/a') },
    { value: 'viudo', label: t('form.maritalStatus.widowed', 'Viudo/a') },
    { value: 'divorciado', label: t('form.maritalStatus.divorced', 'Divorciado/a') },
    { value: 'separado', label: t('form.maritalStatus.separated', 'Separado/a') },
    { value: 'union_libre', label: t('form.maritalStatus.civilUnion', 'Unión libre') }
  ];

  const nivelEducativoOptions = [
    { value: 'primaria_incompleta', label: t('form.educationLevel.primaryIncomplete', 'Primaria incompleta') },
    { value: 'primaria_completa', label: t('form.educationLevel.primaryComplete', 'Primaria completa') },
    { value: 'secundaria_incompleta', label: t('form.educationLevel.secondaryIncomplete', 'Secundaria incompleta') },
    { value: 'secundaria_completa', label: t('form.educationLevel.secondaryComplete', 'Secundaria completa') },
    { value: 'tecnico', label: t('form.educationLevel.technical', 'Técnico/Tecnológico') },
    { value: 'universitario_incompleto', label: t('form.educationLevel.universityIncomplete', 'Universitario incompleto') },
    { value: 'universitario_completo', label: t('form.educationLevel.universityComplete', 'Universitario completo') },
    { value: 'postgrado', label: t('form.educationLevel.graduate', 'Postgrado') }
  ];
  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <h3 className="text-md font-medium text-blue-800 mb-1">{t('personalData', 'Datos Personales')}</h3>
        <p className="text-sm text-blue-600">
          {t('personalDataPrompt', 'Por favor complete o verifique sus datos personales. Esta información es importante para su historial clínico.')}
        </p>
      </div>      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label={t('form.fullName', 'Nombre completo')}
          name="nombre_completo"
          type="text"
          value={formData.nombre_completo}
          onChange={handleChange}
          error={errors.nombre_completo}
          required
          translationNamespace="anamnesis"
        />

        <FormField
          label={t('form.idDocument', 'Documento de identidad')}
          name="documento_identidad"
          type="text"
          value={formData.documento_identidad}
          onChange={handleChange}
          error={errors.documento_identidad}
          required
          translationNamespace="anamnesis"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label="Fecha de nacimiento"
          name="fecha_nacimiento"
          type="date"
          value={formData.fecha_nacimiento}
          onChange={handleChange}
          error={errors.fecha_nacimiento}
          required
        />

        <FormField
          label="Sexo"
          name="sexo"
          type="select"
          value={formData.sexo}
          onChange={handleChange}
          options={sexoOptions}
          error={errors.sexo}
          required
        />

        <FormField
          label="Estado civil"
          name="estado_civil"
          type="select"
          value={formData.estado_civil}
          onChange={handleChange}
          options={estadoCivilOptions}
          error={errors.estado_civil}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Lugar de nacimiento"
          name="lugar_nacimiento"
          type="text"
          value={formData.lugar_nacimiento}
          onChange={handleChange}
          error={errors.lugar_nacimiento}
        />

        <FormField
          label="Ocupación actual"
          name="ocupacion"
          type="text"
          value={formData.ocupacion}
          onChange={handleChange}
          error={errors.ocupacion}
          placeholder="Ej: Ingeniero, Docente, Jubilado, Estudiante..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Dirección domicilio"
          name="direccion"
          type="text"
          value={formData.direccion}
          onChange={handleChange}
          error={errors.direccion}
        />

        <FormField
          label="Ciudad/Localidad"
          name="ciudad"
          type="text"
          value={formData.ciudad}
          onChange={handleChange}
          error={errors.ciudad}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Teléfono de contacto"
          name="telefono"
          type="tel"
          value={formData.telefono}
          onChange={handleChange}
          error={errors.telefono}
          required
        />

        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
      </div>

      <FormField
        label="Nivel educativo"
        name="nivel_educativo"
        type="select"
        value={formData.nivel_educativo}
        onChange={handleChange}
        options={nivelEducativoOptions}
        error={errors.nivel_educativo}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Contacto de emergencia (nombre)"
          name="contacto_emergencia_nombre"
          type="text"
          value={formData.contacto_emergencia_nombre}
          onChange={handleChange}
          error={errors.contacto_emergencia_nombre}
        />

        <FormField
          label="Contacto de emergencia (teléfono)"
          name="contacto_emergencia_telefono"
          type="tel"
          value={formData.contacto_emergencia_telefono}
          onChange={handleChange}
          error={errors.contacto_emergencia_telefono}
        />
      </div>

      <FormField
        label="Relación con el contacto de emergencia"
        name="contacto_emergencia_relacion"
        type="text"
        value={formData.contacto_emergencia_relacion}
        onChange={handleChange}
        error={errors.contacto_emergencia_relacion}
        placeholder="Ej: Cónyuge, Hijo/a, Hermano/a, Amigo/a"
      />

      <FormField
        label="Información adicional relevante"
        name="informacion_adicional"
        type="textarea"
        value={formData.informacion_adicional}
        onChange={handleChange}
        error={errors.informacion_adicional}
        placeholder="Cualquier otra información personal relevante para su atención médica..."
        rows={3}
      />
    </div>
  );
};

export default DatosPersonalesForm;
