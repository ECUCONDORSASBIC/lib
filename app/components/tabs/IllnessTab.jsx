export function IllnessTab({ formData, handleInputChange }) {
  return (
    <div role="group" aria-label="Enfermedad Actual">
      <h2 className="mb-4 text-xl font-semibold">Enfermedad Actual</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="inicio" className="block text-sm font-medium text-gray-700">
            ¿Cuándo comenzaron los síntomas?
          </label>          <input
            type="text"
            id="inicio"
            name="inicio" value={formData.inicio}
            onChange={handleInputChange}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            required
          />
        </div>

        <div>
          <label htmlFor="curso" className="block text-sm font-medium text-gray-700">
            ¿Cómo ha evolucionado?
          </label>          <textarea
            id="curso"
            name="curso"
            rows="3" value={formData.curso}
            onChange={handleInputChange}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="sintomas" className="block text-sm font-medium text-gray-700">
            ¿Tiene otros síntomas asociados?
          </label>          <textarea
            id="sintomas"
            name="sintomas"
            rows="3" value={formData.sintomas}
            onChange={handleInputChange}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>
      </div>
    </div>
  );
}
