import FormField from '../common/FormField';

const ProfessionalInfoStep = ({ stepConfig, onDataChange, formData, role }) => {
  const handleChange = (e) => {
    onDataChange({ ...formData, [e.target.name]: e.target.value });
  };

  // Fields are defined in onboardingConfig.js for this step
  // Example: ["especialidad", "numeroColegiatura", "universidad"]

  return (
    <div>
      <p className="text-gray-700 mb-6">Por favor, completa tu información profesional.</p>

      {stepConfig.fields?.includes('especialidad') && (
        <FormField
          label="Especialidad Médica"
          name="especialidad"
          type="text"
          value={formData.especialidad}
          onChange={handleChange}
          placeholder="Ej: Cardiología, Pediatría"
          required
        />
      )}

      {stepConfig.fields?.includes('numeroColegiatura') && (
        <FormField
          label="Número de Colegiatura / Licencia"
          name="numeroColegiatura"
          type="text"
          value={formData.numeroColegiatura}
          onChange={handleChange}
          placeholder="Ingresa tu número de colegiatura o licencia"
          required
        />
      )}

      {stepConfig.fields?.includes('universidad') && (
        <FormField
          label="Universidad / Institución Emisora"
          name="universidad"
          type="text"
          value={formData.universidad}
          onChange={handleChange}
          placeholder="Nombre de la universidad"
          required
        />
      )}

      {/* Add other fields like "añosExperiencia", "certificaciones" if needed */}
      {/* Consider a file upload for diplomas or certificates */}
    </div>
  );
};

export default ProfessionalInfoStep;
