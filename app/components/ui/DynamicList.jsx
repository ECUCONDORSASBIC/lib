'use client';

/**
 * Add/Remove list component
 * Used for dynamically adding and removing items in lists (medications, allergies, etc.)
 */
const DynamicList = ({
  items = [],
  onAdd,
  onRemove,
  renderItem,
  newItemTemplate,
  addLabel = "Agregar"
}) => {
  return (
    <div className="space-y-4">
      {/* List of existing items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-grow">
              {renderItem(item, index)}
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="ml-2 text-red-500 hover:text-red-700"
              aria-label="Eliminar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-gray-500 text-sm italic">No hay elementos agregados</div>
        )}
      </div>

      {/* Add new item button */}
      <button
        type="button"
        onClick={() => onAdd(newItemTemplate)}
        className="flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        {addLabel}
      </button>
    </div>
  );
};

export default DynamicList;
