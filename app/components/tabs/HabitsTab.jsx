export function HabitsTab({ formData, handleInputChange }) {
  return (
    <div role="group" aria-label="Hábitos">
      <h2 className="text-xl font-semibold mb-4">Hábitos</h2>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="fuma"
            name="fuma"
            checked={formData.fuma}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="fuma" className="ml-2 block text-sm text-gray-700">
            ¿Fuma?
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="alcohol"
            name="alcohol"
            checked={formData.alcohol}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="alcohol" className="ml-2 block text-sm text-gray-700">
            ¿Consume alcohol?
          </label>
        </div>

        <div>
          <label htmlFor="actividad" className="block text-sm font-medium text-gray-700">
            Actividad física
          </label>
          <input
            type="text"
            id="actividad"
            name="actividad" value={formData.actividad}
            onChange={handleInputChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>
      </div>
    </div>
  );
}
