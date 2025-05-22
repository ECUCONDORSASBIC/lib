import FormField from '../common/FormField'; // Assuming FormField is in a common directory

const IdentityVerificationStep = ({ stepConfig, onDataChange, formData, role }) => {
  // In a real scenario, this step might involve file uploads for ID documents,
  // or integration with a third-party verification service.

  const handleChange = (e) => {
    onDataChange({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <p className="text-gray-700 mb-4">
        Para continuar, necesitamos verificar tu identidad. Por favor, completa los siguientes campos o sigue las instrucciones proporcionadas.
      </p>

      {/* Example field: Document Type (could be dynamic based on role or country) */}
      <FormField
        label="Tipo de Documento"
        name="documentType"
        type="select"
        options={[
          { value: 'dni', label: 'DNI/Cédula' },
          { value: 'passport', label: 'Pasaporte' },
          // Add other types as needed
        ]}
        value={formData.documentType}
        onChange={handleChange}
        placeholder="Selecciona un tipo de documento"
        required
      />

      <FormField
        label="Número de Documento"
        name="documentNumber"
        type="text"
        value={formData.documentNumber}
        onChange={handleChange}
        placeholder="Ingresa tu número de documento"
        required
      />

      {/*
        Placeholder for more complex verification UI, e.g., file upload:
        <div className="mt-4 p-4 border-dashed border-2 border-gray-300 rounded-md text-center">
          <p className="text-sm text-gray-500">Arrastra y suelta tu documento aquí o haz clic para seleccionar.</p>
          <input type="file" className="hidden" />
        </div>
      */}
      <p className="mt-4 text-sm text-gray-500">
        Asegúrate de que la información sea clara y legible.
      </p>
    </div>
  );
};

export default IdentityVerificationStep;
