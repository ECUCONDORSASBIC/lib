'use client';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid'; // Using heroicons for the chevron

const Accordion = ({ title, children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <button
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 rounded-t-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75"
      >
        <span className="font-medium">{title}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
