// Recetas electrónicas
import React from 'react';

const ElectronicPrescriptions = ({ prescriptions = [], onCreate }) => (
  // Removed bg-white, rounded, shadow, p-4. Styling is now handled by InfoCard.
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold text-gray-700">Recetas Electrónicas</h3>
      <button
        className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        onClick={onCreate}
      >
        + Nueva
      </button>
    </div>
    {prescriptions.length === 0 ? (
      <p className="text-gray-500 text-sm py-2">No hay recetas recientes.</p>
    ) : (
      <ul className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
        {prescriptions.map((rx, idx) => (
          <li key={idx} className="py-2.5 flex justify-between items-center">
            <span className="text-sm text-gray-800">{rx.name}</span>
            <span className="text-xs text-gray-400">{rx.date}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default ElectronicPrescriptions;
