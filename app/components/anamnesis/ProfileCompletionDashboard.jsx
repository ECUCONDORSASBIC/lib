'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useMemo } from 'react';

/**
 * ProfileCompletionDashboard - A component that shows the user's profile completion status
 * with visual feedback and motivational messages to encourage completing missing information
 *
 * @param {Object} props
 * @param {Object} props.formData - The anamnesis form data
 * @param {Array<Object>} props.sections - Array of section objects with id and title
 * @param {Array<string>} props.completedSections - Array of completed section IDs
 * @param {string} props.patientId - Patient ID for navigation links
 */
export default function ProfileCompletionDashboard({
  formData = {},
  sections = [],
  completedSections = [],
  patientId
}) {
  // Calculate completion percentage
  const completionPercentage = sections.length > 0
    ? Math.round((completedSections.length / sections.length) * 100)
    : 0;

  // Categorize sections into completed and incomplete
  const { completedItems, incompleteItems } = useMemo(() => {
    const completed = [];
    const incomplete = [];

    sections.forEach(section => {
      const isCompleted = completedSections.includes(section.id);

      if (isCompleted) {
        completed.push(section);
      } else {
        incomplete.push(section);
      }
    });

    return { completedItems: completed, incompleteItems: incomplete };
  }, [sections, completedSections]);

  // Get motivational message based on completion percentage
  const getCompletionMessage = () => {
    if (completionPercentage === 100) {
      return "¡Felicidades! Has completado toda tu historia clínica.";
    }
    if (completionPercentage >= 75) {
      return "¡Estás muy cerca de completar tu historia clínica! Solo faltan algunos detalles.";
    }
    if (completionPercentage >= 50) {
      return "¡Gran progreso! Has completado más de la mitad de tu historia clínica.";
    }
    if (completionPercentage >= 25) {
      return "Buen comienzo. Continúa completando tu historial para una mejor atención médica.";
    }
    return "Comienza a completar tu historia clínica para una atención más personalizada.";
  };

  // Get visual representation based on completion percentage
  const getStatusLevel = () => {
    if (completionPercentage >= 90) return "excellent";
    if (completionPercentage >= 70) return "good";
    if (completionPercentage >= 40) return "fair";
    return "needs-attention";
  };

  // Status level to color mapping
  const statusColors = {
    "excellent": {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      progress: "bg-green-500",
      trail: "bg-green-100"
    },
    "good": {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      progress: "bg-blue-500",
      trail: "bg-blue-100"
    },
    "fair": {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      progress: "bg-amber-500",
      trail: "bg-amber-100"
    },
    "needs-attention": {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      progress: "bg-orange-500",
      trail: "bg-orange-100"
    }
  };

  const currentStatus = statusColors[getStatusLevel()];

  return (
    <div className={`mb-8 p-4 rounded-lg border ${currentStatus.border} ${currentStatus.bg}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-lg font-medium ${currentStatus.text}`}>Mi Historia Clínica</h2>
          <p className="text-sm text-gray-600">{getCompletionMessage()}</p>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-500">
                {completedSections.length} de {sections.length} secciones completadas
              </span>
              <span className={`text-sm font-medium ${currentStatus.text}`}>
                {completionPercentage}%
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${currentStatus.trail}`}>
              <motion.div
                className={`h-full rounded-full ${currentStatus.progress}`}
                initial={{ width: "0%" }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {incompleteItems.slice(0, 2).map(section => (
            <Link
              key={section.id}
              href={`/dashboard/paciente/${patientId}/anamnesis?section=${section.id}`}
              className="text-xs px-3 py-1.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="truncate max-w-[120px]">Agregar {section.title}</span>
            </Link>
          ))}

          {incompleteItems.length > 2 && (
            <Link
              href={`/dashboard/paciente/${patientId}/anamnesis`}
              className={`text-xs px-3 py-1.5 rounded-md ${currentStatus.text} bg-white border ${currentStatus.border} hover:bg-gray-50 transition-colors flex items-center shadow-sm`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              <span>{incompleteItems.length - 2} más</span>
            </Link>
          )}
        </div>
      </div>

      {completionPercentage < 100 && (
        <div className="mt-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-gray-500">
            Completar tu historia clínica ayuda a tus médicos a brindarte una mejor atención personalizada.
          </span>
        </div>
      )}
    </div>
  );
}
