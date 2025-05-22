export function EnvironmentTab({ formData, handleInputChange }) {
  return (
    <div role="group" aria-label="Entorno Socioambiental">
      <h2 className="mb-4 text-xl font-semibold">Entorno Socioambiental</h2>

      <div>
        <label htmlFor="condiciones" className="block text-sm font-medium text-gray-700">
          Describa sus condiciones de vivienda
        </label>
        <textarea
          id="condiciones"
          name="condiciones"
          rows="4" value={formData.condiciones}
          onChange={handleInputChange}
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>
    </div>
  );
}
