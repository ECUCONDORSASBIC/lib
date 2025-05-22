'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

const QuickLookModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-5 mx-auto bg-white shadow-2xl rounded-xl">
        <button
          onClick={onClose}
          className="absolute p-1 text-gray-400 transition-colors rounded-full top-3 right-3 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Cerrar vista rápida"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h3 className="mb-3 text-lg font-semibold text-gray-800">{title}</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {children}
        </div>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickLookModal;
