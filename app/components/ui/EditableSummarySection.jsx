'use client';

import Link from 'next/link';
import { FiEdit } from 'react-icons/fi'; // Using react-icons for the edit icon

const EditableSummarySection = ({ title, editPath, children }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        {editPath && (
          <Link href={editPath} legacyBehavior>
            <a className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline">
              <FiEdit className="mr-1" />
              Editar esta sección
            </a>
          </Link>
        )}
      </div>
      <div className="text-gray-700">
        {children}
      </div>
    </div>
  );
};

export default EditableSummarySection;
