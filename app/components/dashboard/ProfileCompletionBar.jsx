'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Componente de barra de progreso de completitud del perfil médico
 * Muestra visualmente el progreso del usuario y ofrece enlaces para completar secciones faltantes
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.userData - Datos del perfil del usuario
 * @param {Function} props.onSectionClick - Función a ejecutar cuando se hace clic en una sección
 */
const ProfileCompletionBar = ({ userData, onSectionClick }) => {
  const [completionStats, setCompletionStats] = useState({
    totalSections: 0,
    completedSections: 0,
    percentage: 0,
    incompleteItems: []
  });

  // Calcular estadísticas de completitud del perfil
  useEffect(() => {
    if (!userData) return;

    // Definir secciones del perfil y sus campos requeridos
    const profileSections = {
      personalInfo: {
        name: 'Información Personal',
        path: '/dashboard/profile',
        fields: ['name', 'birthDate', 'gender', 'height', 'weight', 'bloodType'],
        completedFields: 0,
        required: true
      },
      contactInfo: {
        name: 'Información de Contacto',
        path: '/dashboard/profile',
        fields: ['email', 'phone', 'address', 'emergencyContact'],
        completedFields: 0,
        required: true
      },
      medicalHistory: {
        name: 'Historial Médico',
        path: '/dashboard/medical-history',
        fields: ['chronicConditions', 'surgeries', 'hospitalizations'],
        completedFields: 0,
        required: true
      },
      medications: {
        name: 'Medicamentos',
        path: '/dashboard/medications',
        fields: ['currentMedications', 'allergies'],
        completedFields: 0,
        required: true
      },
      familyHistory: {
        name: 'Historial Familiar',
        path: '/dashboard/family-history',
        fields: ['familyConditions'],
        completedFields: 0,
        required: false
      },
      lifestyle: {
        name: 'Estilo de Vida',
        path: '/dashboard/lifestyle',
        fields: ['smokingStatus', 'alcoholConsumption', 'exerciseFrequency', 'diet'],
        completedFields: 0,
        required: false
      }
    };

    // Mapear datos del usuario a las secciones
    const flattenedUserData = flattenObject(userData);
    let completedSectionsCount = 0;
    let totalRequiredSections = 0;
    const incomplete = [];

    Object.entries(profileSections).forEach(([key, section]) => {
      // Contar campos completados en cada sección
      section.fields.forEach(field => {
        if (flattenedUserData[field] && 
           (typeof flattenedUserData[field] !== 'string' || flattenedUserData[field].trim() !== '')) {
          section.completedFields++;
        }
      });

      // Calcular completitud de la sección (%)
      const sectionPercentage = Math.round((section.completedFields / section.fields.length) * 100);
      
      // Si la sección está incompleta, añadirla a la lista
      if (sectionPercentage < 100) {
        incomplete.push({
          id: key,
          name: section.name,
          path: section.path,
          completedPercentage: sectionPercentage,
          isRequired: section.required
        });
      } else {
        completedSectionsCount++;
      }

      // Contar secciones totales requeridas
      if (section.required) {
        totalRequiredSections++;
      }
    });

    // Calcular porcentaje total (dando más peso a las secciones requeridas)
    const totalSectionsCount = Object.keys(profileSections).length;
    const overallPercentage = Math.round(
      (completedSectionsCount / totalSectionsCount) * 100
    );

    setCompletionStats({
      totalSections: totalSectionsCount,
      completedSections: completedSectionsCount,
      percentage: overallPercentage,
      incompleteItems: incomplete.sort((a, b) => {
        // Ordenar por requerido primero, luego por menor porcentaje
        if (a.isRequired && !b.isRequired) return -1;
        if (!a.isRequired && b.isRequired) return 1;
        return a.completedPercentage - b.completedPercentage;
      })
    });
  }, [userData]);

  // Función auxiliar para aplanar objetos anidados
  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  // Determinar el color de la barra de progreso según el porcentaje
  const getProgressColor = (percentage) => {
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-medium text-gray-800">Completitud de tu Perfil Médico</h3>
        <span className="text-lg font-semibold text-gray-700">
          {completionStats.percentage}%
        </span>
      </div>
      
      {/* Barra de progreso */}
      <div className="h-3 bg-gray-200 rounded-full mb-3">
        <motion.div 
          className={`h-full rounded-full ${getProgressColor(completionStats.percentage)}`}
          initial={{ width: 0 }}
          animate={{ width: `${completionStats.percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="text-xs text-gray-500 flex justify-between mb-4">
        <span>{completionStats.completedSections} de {completionStats.totalSections} secciones completadas</span>
        {completionStats.percentage < 100 && (
          <span className="text-indigo-600">
            ¡Completa tu perfil para un mejor cuidado médico!
          </span>
        )}
      </div>
      
      {/* Secciones incompletas */}
      {completionStats.incompleteItems.length > 0 && (
        <div>
          <div className="border-t border-gray-100 pt-3 mt-1">
            <h4 className="text-xs font-medium text-gray-500 mb-2">
              Secciones por completar:
            </h4>
            <ul className="space-y-2">
              {completionStats.incompleteItems.slice(0, 3).map((item) => (
                <li key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {item.isRequired && (
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2" title="Requerido"></span>
                    )}
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <Link 
                    href={item.path}
                    onClick={() => onSectionClick && onSectionClick(item.id)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full transition-colors"
                  >
                    Completar
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {completionStats.incompleteItems.length > 3 && (
            <div className="text-center mt-3">
              <Link 
                href="/dashboard/profile"
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Ver todas las secciones ({completionStats.incompleteItems.length})
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* Mensaje de perfil completo */}
      {completionStats.percentage === 100 && (
        <div className="flex items-center justify-center py-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-green-700">¡Perfil médico completo!</span>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionBar;
