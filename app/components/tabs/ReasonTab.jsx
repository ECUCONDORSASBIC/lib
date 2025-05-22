export function ReasonTab({ formData, handleInputChange }) {
  return (
    <div role="group" aria-label="Motivo de Consulta">
      <h2 className="mb-4 text-xl font-semibold">Motivo de Consulta</h2>

      <div>
        <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">
          Describa el motivo principal de su consulta
        </label>
        <textarea
          id="motivo"
          name="mot
ivo"
          rows="4"
          value={formData.motivo}
          onChange={handleInputChange}
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
    </div>
  );
}
