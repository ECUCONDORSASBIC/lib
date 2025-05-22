import FormField from '../common/FormField';

const PersonalDataStep = ({ stepConfig, onDataChange, formData, role }) => {
  const handleChange = (e) => {
    onDataChange({ ...formData, [e.target.name]: e.target.value });
  };

  // Fields are defined in onboardingConfig.js for this step
  // Example: ["nombreCompleto", "fechaNacimiento", "genero"]

  return (
    <div>
      <p className="text-gray-700 mb-6">Por favor, completa tus datos personales.</p>

      {stepConfig.fields?.includes('nombreCompleto') && (
        <FormField
          label="Nombre Completo"
          name="nombreCompleto"
          type="text"
          value={formData.nombreCompleto}
          onChange={handleChange}
          placeholder="Ingresa tu nombre completo"
          required
        />
      )}

      {stepConfig.fields?.includes('fechaNacimiento') && (
        <FormField
          label="Fecha de Nacimiento"
          name="fechaNacimiento"
          type="date"
          value={formData.fechaNacimiento}
          onChange={handleChange}
          required
        />
      )}

      {stepConfig.fields?.includes('genero') && (
        <FormField
          label="Género"
          name="genero"
          type="select"
          options={[
            { value: 'masculino', label: 'Masculino' },
            { value: 'femenino', label: 'Femenino' },
            { value: 'otro', label: 'Otro' },
            { value: 'prefiero_no_decir', label: 'Prefiero no decirlo' },
          ]}
          value={formData.genero}
          onChange={handleChange}
          placeholder="Selecciona tu género"
          required
        />
      )}

      {/* Add other fields as defined in stepConfig.fields if necessary */}
    </div>
  );
};

export default PersonalDataStep;
