import { FormField } from '../FormField';

export function IdentificationTab({ formData, handleInputChange }) {
  return (
    <div role="group" aria-label="Datos de Identificación">
      <h2 className="text-xl font-semibold mb-4" id="identification-heading">Datos de Identificación</h2>

      <div className="space-y-4">
        <FormField
          id="nombre"
          label="Nombre completo"
          value={formData.nombre}
          onChange={handleInputChange}
          required
          help="Nos permite registrar su historia clínica de forma individual. Información confidencial."
          aria-labelledby="identification-heading"
        />

        <FormField
          id="edad"
          label="Edad"
          type="number"
          min={0}
          max={120}
          value={formData.edad}
          onChange={handleInputChange}
          required
          help="La edad es clave para orientar la probabilidad de enfermedades. Información estrictamente confidencial."
          aria-labelledby="identification-heading"
        />

        <FormField
          id="sexo"
          label="Sexo"
          type="select"
          value={formData.sexo}
          onChange={handleInputChange}
          options={[
            { value: '', label: 'Seleccione una opción' },
            { value: 'Masculino', label: 'Masculino' },
            { value: 'Femenino', label: 'Femenino' },
            { value: 'Otro', label: 'Otro' }
          ]}
          required
          help="El sexo es un factor biológico importante en la evaluación médica. Sus datos serán resguardados."
          aria-labelledby="identification-heading"
        />

        <FormField
          id="ocupacion"
          label="Ocupación"
          value={formData.ocupacion}
          onChange={handleInputChange}
          help="Algunas enfermedades tienen relación con la actividad laboral. Su ocupación es confidencial."
          aria-labelledby="identification-heading"
        />
      </div>
    </div>
  );
}
