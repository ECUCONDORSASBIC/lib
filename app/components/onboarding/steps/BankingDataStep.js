import FormField from '../common/FormField';

const BankingDataStep = ({ stepConfig, onDataChange, formData, role }) => {
  const handleChange = (e) => {
    onDataChange({ ...formData, [e.target.name]: e.target.value });
  };

  // Fields are defined in onboardingConfig.js for this step
  // Example for Medico: ["banco", "numeroCuenta", "tipoCuentaCCI"]
  // Example for Empresario: ["banco", "numeroCuenta", "tipoCuenta"]

  return (
    <div>
      <p className="text-gray-700 mb-6">Por favor, proporciona tus datos bancarios para pagos y transferencias.</p>

      {stepConfig.fields?.includes('banco') && (
        <FormField
          label="Nombre del Banco"
          name="banco"
          type="text"
          value={formData.banco}
          onChange={handleChange}
          placeholder="Ingresa el nombre de tu banco"
          required
        />
      )}

      {stepConfig.fields?.includes('numeroCuenta') && (
        <FormField
          label="Número de Cuenta"
          name="numeroCuenta"
          type="text"
          value={formData.numeroCuenta}
          onChange={handleChange}
          placeholder="Ingresa tu número de cuenta"
          required
        />
      )}

      {/* Campo condicional para tipo de cuenta (Empresario) */}
      {role === 'empresario' && stepConfig.fields?.includes('tipoCuenta') && (
        <FormField
          label="Tipo de Cuenta (Corriente/Ahorros)"
          name="tipoCuenta"
          type="select"
          options={[
            { value: 'corriente', label: 'Cuenta Corriente' },
            { value: 'ahorros', label: 'Cuenta de Ahorros' },
          ]}
          value={formData.tipoCuenta}
          onChange={handleChange}
          placeholder="Selecciona el tipo de cuenta"
          required
        />
      )}

      {/* Campo condicional para CCI (Medico) */}
      {role === 'medico' && stepConfig.fields?.includes('tipoCuentaCCI') && (
        <FormField
          label="Número de Cuenta CCI (Código de Cuenta Interbancario)"
          name="tipoCuentaCCI"
          type="text"
          value={formData.tipoCuentaCCI}
          onChange={handleChange}
          placeholder="Ingresa tu número de cuenta CCI"
          required
        />
      )}

      {/* Add other common or role-specific banking fields as needed */}
    </div>
  );
};

export default BankingDataStep;
