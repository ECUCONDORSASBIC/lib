// Asumiendo que anamnesis.js está en la ruta correcta y exporta JSDoc typedefs
// que pueden ser referenciadas en comentarios si es necesario.
import Input from '../../ui/Input'; // Ahora .jsx
import Select from '../../ui/Select'; // Ahora .jsx

/**
 * @param {object} props
 * @param {import('../../../types/anamnesis').IdentificacionData} props.data
 * @param {function(Partial<import('../../../types/anamnesis').IdentificacionData>): void} props.updateData
 * @param {function(string, string): void} props.setSectionError
 * @param {function(string): void} props.clearSectionError
 * @param {import('../../../types/anamnesis').AnamnesisSectionKey} props.sectionKey
 */
const IdentificacionSection = ({
  data,
  updateData,
  setSectionError,
  clearSectionError,
  // errors, // Si necesitas mostrar errores específicos del campo aquí
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
    // Podrías añadir validación aquí y usar setSectionError / clearSectionError
  };

  const sexoOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
  ];

  return (
    <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-xl font-semibold text-gray-800">1. Datos de Identificación</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input
          label="Nombre Completo"
          name="nombreCompleto"
          value={data.nombreCompleto || ''}
          onChange={handleChange}
          placeholder="Ej: Juan Pérez García"
          tooltip="Ingrese el nombre completo del paciente."
        />
        <Input
          label="Fecha de Nacimiento"
          name="fechaNacimiento"
          type="date"
          value={data.fechaNacimiento || ''}
          onChange={handleChange}
          tooltip="Seleccione la fecha de nacimiento."
        />
        <Select
          label="Sexo"
          name="sexo"
          value={data.sexo || ''}
          onChange={handleChange}
          options={sexoOptions}
          tooltip="Seleccione el sexo del paciente."
        />
        <Input
          label="Ocupación"
          name="ocupacion"
          value={data.ocupacion || ''}
          onChange={handleChange}
          placeholder="Ej: Ingeniero de Software"
          tooltip="Ingrese la ocupación actual del paciente."
        />
        {/* Agrega aquí más campos según la definición en Estructura Modular del Formulario.md y anamnesis.js */}
      </div>
    </div>
  );
};

export default IdentificacionSection;
