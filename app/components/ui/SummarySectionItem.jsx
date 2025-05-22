'use client';


const SummarySectionItem = ({ title, onEdit, children }) => {
  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-semibold text-gray-700">{title}</h4>
        <button
          onClick={onEdit}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:underline"
        >
          Editar esta sección
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {children}
      </div>
    </div>
  );
};

export default SummarySectionItem;
