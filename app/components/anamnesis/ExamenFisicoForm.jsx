import React, { useState } from 'react';

const ExamenFisicoForm = ({ initialData = {}, onSave, patientId }) => {
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveInternal = () => {
    if (onSave) {
      onSave(formData, patientId);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Examen Físico</h3>
      <form>
        <div>
          <label htmlFor="peso">Peso:</label>
          <input
            type="text"
            id="peso"
            name="peso"
            value={formData.peso || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="altura">Altura:</label>
          <input
            type="text"
            id="altura"
            name="altura"
            value={formData.altura || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="presion">Presión:</label>
          <input
            type="text"
            id="presion"
            name="presion"
            value={formData.presion || ''}
            onChange={handleInputChange}
          />
        </div>
      </form>
      <div className="mt-6">
        <button
          onClick={handleSaveInternal}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          Guardar Examen Físico
        </button>
      </div>
    </div>
  );
};

export default ExamenFisicoForm;
