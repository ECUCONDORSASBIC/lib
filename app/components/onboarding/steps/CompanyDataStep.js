import FormField from '../common/FormField';

const CompanyDataStep = ({ stepConfig, onDataChange, formData, role }) => {
  const handleChange = (e) => {
    onDataChange({ ...formData, [e.target.name]: e.target.value });
  };

  // Fields are defined in onboardingConfig.js for this step
  // Example: ["nombreEmpresa", "ruc", "direccionEmpresa"]

  return (
    <div>
      <p className="text-gray-700 mb-6">Por favor, proporciona los datos de tu empresa.</p>

      {stepConfig.fields?.includes('nombreEmpresa') && (
        <FormField
          label="Nombre de la Empresa"
          name="nombreEmpresa"
          type="text"
          value={formData.nombreEmpresa}
          onChange={handleChange}
          placeholder="Ingresa el nombre de la empresa"
          required
        />
      )}

      {stepConfig.fields?.includes('ruc') && (
        <FormField
          label="RUC / Identificación Fiscal"
          name="ruc"
          type="text"
          value={formData.ruc}
          onChange={handleChange}
          placeholder="Ingresa el RUC o ID fiscal"
          required
        />
      )}

      {stepConfig.fields?.includes('direccionEmpresa') && (
        <FormField
          label="Dirección de la Empresa"
          name="direccionEmpresa"
          type="textarea"
          value={formData.direccionEmpresa}
          onChange={handleChange}
          placeholder="Ingresa la dirección completa"
          required
        />
      )}

      {/* Add other fields as defined in stepConfig.fields if necessary */}
    </div>
  );
};

export default CompanyDataStep;
