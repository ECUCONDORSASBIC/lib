'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * ProfileCompletionProgress - Shows the user's profile and medical record completion status
 * and encourages them to complete missing sections
 *
 * @param {Object} props
 * @param {Object} props.patientData - Patient profile data
 * @param {Object} props.medicalRecords - Patient medical records data
 * @param {string} props.patientId - Patient ID
 * @param {boolean} props.isOwnProfile - Whether this is the user's own profile
 */
export default function ProfileCompletionProgress({
  patientData = {},
  medicalRecords = {},
  patientId,
  isOwnProfile = false
}) {
  const [completionData, setCompletionData] = useState({
    profileCompletion: 0,
    anamnesisCompletion: 0,
    missingProfileFields: [],
    missingAnamnesisFields: [],
    priorityAction: null
  });

  // Calculate completion percentages and missing fields
  useEffect(() => {
    // Required profile fields
    const requiredProfileFields = [
      { key: 'nombre', label: 'Nombre completo' },
      { key: 'fechaNacimiento', label: 'Fecha de nacimiento' },
      { key: 'sexo', label: 'Sexo' },
      { key: 'telefono', label: 'Teléfono de contacto' },
      { key: 'email', label: 'Correo electrónico' },
      { key: 'direccion', label: 'Dirección' }
    ];

    // Required anamnesis sections
    const requiredAnamnesisFields = [
      { key: 'datos-personales', label: 'Datos personales' },
      { key: 'motivo-consulta', label: 'Motivo de consulta' },
      { key: 'antecedentes-personales', label: 'Antecedentes personales' },
      { key: 'habitos', label: 'Hábitos' }
    ];

    // Calculate profile completion
    const missingProfile = requiredProfileFields.filter(field =>
      !patientData[field.key] || patientData[field.key].trim?.() === ''
    );

    const profileCompletion = Math.round(
      ((requiredProfileFields.length - missingProfile.length) / requiredProfileFields.length) * 100
    );

    // Calculate anamnesis completion
    let anamnesisCompletion = 0;
    let missingAnamnesis = [...requiredAnamnesisFields];

    if (medicalRecords && medicalRecords.anamnesis) {
      // If using the structured data format
      if (medicalRecords.anamnesis.structuredData?.sections) {
        const completedSections = Object.keys(medicalRecords.anamnesis.structuredData.sections);
        missingAnamnesis = requiredAnamnesisFields.filter(field =>
          !completedSections.includes(field.key) ||
          !medicalRecords.anamnesis.structuredData.sections[field.key]?.data ||
          Object.keys(medicalRecords.anamnesis.structuredData.sections[field.key].data).length === 0
        );
      }
      // If using the traditional format
      else if (medicalRecords.anamnesis.formulario) {
        missingAnamnesis = requiredAnamnesisFields.filter(field =>
          !medicalRecords.anamnesis.formulario[field.key] ||
          Object.keys(medicalRecords.anamnesis.formulario[field.key]).length === 0
        );
      }

      anamnesisCompletion = Math.round(
        ((requiredAnamnesisFields.length - missingAnamnesis.length) / requiredAnamnesisFields.length) * 100
      );
    }

    // Determine priority action
    let priorityAction = null;

    if (profileCompletion < 50) {
      priorityAction = {
        type: 'profile',
        message: 'Completa tu perfil con información básica',
        link: `/dashboard/paciente/${patientId}/perfil`,
        priority: 'alta'
      };
    } else if (anamnesisCompletion < 25) {
      priorityAction = {
        type: 'anamnesis',
        message: 'Completa tu historia clínica',
        link: `/dashboard/paciente/${patientId}/anamnesis`,
        priority: 'alta'
      };
    } else if (profileCompletion < 80) {
      priorityAction = {
        type: 'profile',
        message: 'Agrega datos faltantes a tu perfil',
        link: `/dashboard/paciente/${patientId}/perfil`,
        priority: 'media'
      };
    } else if (anamnesisCompletion < 70) {
      priorityAction = {
        type: 'anamnesis',
        message: 'Continúa completando tu historia clínica',
        link: `/dashboard/paciente/${patientId}/anamnesis`,
        priority: 'media'
      };
    } else if (profileCompletion < 100 || anamnesisCompletion < 100) {
      priorityAction = {
        type: 'general',
        message: 'Completa la información restante para mejorar tu atención',
        link: `/dashboard/paciente/${patientId}`,
        priority: 'baja'
      };
    }

    setCompletionData({
      profileCompletion,
      anamnesisCompletion,
      missingProfileFields: missingProfile,
      missingAnamnesisFields: missingAnamnesis,
      priorityAction
    });
  }, [patientData, medicalRecords, patientId]);

  // Determine card color based on completion
  const getProfileCompletionColor = () => {
    if (completionData.profileCompletion >= 80) return 'bg-green-50 border-green-200';
    if (completionData.profileCompletion >= 50) return 'bg-blue-50 border-blue-200';
    return 'bg-amber-50 border-amber-200';
  };

  const getAnamnesisCompletionColor = () => {
    if (completionData.anamnesisCompletion >= 80) return 'bg-green-50 border-green-200';
    if (completionData.anamnesisCompletion >= 40) return 'bg-blue-50 border-blue-200';
    return 'bg-amber-50 border-amber-200';
  };

  // Get text for completion status
  const getCompletionText = (percentage) => {
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 50) return 'Progresando';
    if (percentage >= 25) return 'Iniciado';
    return 'Por completar';
  };

  // Color for progress bar
  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 50) return 'bg-blue-600';
    if (percentage >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Priority action banner style
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'media':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Warning text if the profile completion is too low
  const getWarningText = () => {
    if (!isOwnProfile) return null;

    if (completionData.profileCompletion < 30 && completionData.anamnesisCompletion < 30) {
      return "Tu perfil e historia clínica están muy incompletos. Completarlos ayudará a brindarte una mejor atención médica.";
    }
    if (completionData.profileCompletion < 50) {
      return "Tu perfil tiene información básica incompleta. Complétala para mejorar la precisión de tu atención.";
    }
    return null;
  };

  // Don't show this component if we don't have the patientId
  if (!patientId) return null;

  return (
    <div className="mb-6">
      {/* Priority action banner */}
      {completionData.priorityAction && isOwnProfile && (completionData.profileCompletion < 100 || completionData.anamnesisCompletion < 100) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 mb-4 rounded-lg border shadow-sm ${getPriorityStyle(completionData.priorityAction.priority)}`}
        >
          <div className="flex items-start">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {completionData.priorityAction.priority === 'alta' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="ml-3">
              <h3 className="text-sm font-medium">Acción recomendada</h3>
              <div className="mt-1 text-sm">
                <p>{completionData.priorityAction.message}</p>
                <div className="mt-2">
                  <Link
                    href={completionData.priorityAction.link}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {completionData.priorityAction.type === 'profile' ? 'Completar perfil' :
                      completionData.priorityAction.type === 'anamnesis' ? 'Completar historia clínica' :
                        'Ver detalles'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Warning text for very incomplete profiles */}
      {getWarningText() && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{getWarningText()}</p>
        </div>
      )}

      {/* Progress cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile completion card */}
        <div className={`p-4 rounded-lg border shadow-sm ${getProfileCompletionColor()}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Perfil</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${completionData.profileCompletion >= 80 ? 'bg-green-100 text-green-800' :
                completionData.profileCompletion >= 50 ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
              }`}>
              {getCompletionText(completionData.profileCompletion)}
            </span>
          </div>

          <div className="flex items-center mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getProgressBarColor(completionData.profileCompletion)}`}
                style={{ width: `${completionData.profileCompletion}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm font-medium">{completionData.profileCompletion}%</span>
          </div>

          {completionData.missingProfileFields.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium mb-1">Falta completar:</p>
              <ul className="text-xs space-y-1">
                {completionData.missingProfileFields.slice(0, 3).map((field, index) => (
                  <li key={index} className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {field.label}
                  </li>
                ))}
                {completionData.missingProfileFields.length > 3 && (
                  <li className="text-xs text-gray-500 italic">
                    y {completionData.missingProfileFields.length - 3} campos más...
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="mt-3">
            <Link
              href={`/dashboard/paciente/${patientId}/perfil`}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center"
            >
              Editar perfil
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Historia clínica completion card */}
        <div className={`p-4 rounded-lg border shadow-sm ${getAnamnesisCompletionColor()}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Historia Clínica</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${completionData.anamnesisCompletion >= 80 ? 'bg-green-100 text-green-800' :
                completionData.anamnesisCompletion >= 50 ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
              }`}>
              {getCompletionText(completionData.anamnesisCompletion)}
            </span>
          </div>

          <div className="flex items-center mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getProgressBarColor(completionData.anamnesisCompletion)}`}
                style={{ width: `${completionData.anamnesisCompletion}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm font-medium">{completionData.anamnesisCompletion}%</span>
          </div>

          {completionData.missingAnamnesisFields.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium mb-1">Secciones pendientes:</p>
              <ul className="text-xs space-y-1">
                {completionData.missingAnamnesisFields.slice(0, 3).map((field, index) => (
                  <li key={index} className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {field.label}
                  </li>
                ))}
                {completionData.missingAnamnesisFields.length > 3 && (
                  <li className="text-xs text-gray-500 italic">
                    y {completionData.missingAnamnesisFields.length - 3} secciones más...
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="mt-3">
            <Link
              href={`/dashboard/paciente/${patientId}/anamnesis`}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center"
            >
              {completionData.anamnesisCompletion > 0 ? 'Continuar historia clínica' : 'Iniciar historia clínica'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
