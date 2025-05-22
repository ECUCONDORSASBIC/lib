export function SystemReviewTab({ formData, handleInputChange }) {
  return (
    <div role="group" aria-label="Revisión por Sistemas">
      <h2 className="mb-4 text-xl font-semibold">Revisión por Sistemas</h2>

      <div>
        <label htmlFor="sintomas_gen" className="block text-sm font-medium text-gray-700">
          Síntomas generales
        </label>
        <textarea
          id="sintomas_gen"
          name="sintomas_gen"
          rows="4"
          value={formData.sintomas_gen}
          onChange={handleInputChange}
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}
