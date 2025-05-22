import { useState } from 'react';

const TooltipMedico = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="text-primary hover:text-primary-dark focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        aria-label="Información adicional"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-9a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1zm0-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      </button>
      {isVisible && (
        <div className="absolute z-10 w-64 p-3 mt-1 text-sm bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="text-gray-700">{content}</div>
          <div className="mt-2 text-xs italic text-gray-500">🔒 Esta información es confidencial.</div>
        </div>
      )}
    </div>
  );
};

export default TooltipMedico;
