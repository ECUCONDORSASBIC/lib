export function PerceptionTab({ formData, handleInputChange }) {
  return (
    <div role="group" aria-label="Percepción del Paciente">
      <h2 className="mb-4 text-xl font-semibold">Percepción del Paciente</h2>

      <div>
        <label htmlFor="interpretacion" className="block text-sm font-medium text-gray-700">
          ¿Cómo interpreta usted su problema?
        </label>
        <textarea
          id="interpretacion"
          name="interpretacion"
          rows="4" value={formData.interpretacion}
          onChange={handleInputChange}
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>
    </div>
  );
}
