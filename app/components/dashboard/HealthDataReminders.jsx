'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente que muestra recordatorios y sugerencias contextuales 
 * para completar información médica faltante
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.userData - Datos del perfil del usuario
 * @param {Object} props.medicalData - Datos médicos del usuario
 */
const HealthDataReminders = ({ userData, medicalData }) => {
  const [reminders, setReminders] = useState([]);
  const [dismissedReminders, setDismissedReminders] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // Generar recordatorios relevantes basados en los datos faltantes
  useEffect(() => {
    if (!userData || !medicalData) return;

    const possibleReminders = [
      {
        id: 'height_weight',
        title: 'Completa tus medidas corporales',
        description: 'Tu altura y peso son fundamentales para calcular tu IMC y evaluar riesgos de salud.',
        priority: 'alta',
        path: '/dashboard/profile#vitals',
        condition: () => !userData.height || !userData.weight,
        ctaText: 'Añadir datos',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      },
      {
        id: 'allergies',
        title: 'Registra tus alergias',
        description: 'Conocer tus alergias es vital para evitar reacciones adversas a medicamentos o tratamientos.',
        priority: 'alta',
        path: '/dashboard/medical-history#allergies',
        condition: () => !medicalData.allergies || medicalData.allergies.length === 0,
        ctaText: 'Añadir alergias',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      },
      {
        id: 'medications',
        title: 'Actualiza tus medicamentos',
        description: 'Mantener actualizada la lista de medicamentos que tomas ayuda a prevenir interacciones peligrosas.',
        priority: 'alta',
        path: '/dashboard/medications',
        condition: () => !medicalData.currentMedications || medicalData.currentMedications.length === 0,
        ctaText: 'Añadir medicamentos',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        )
      },
      {
        id: 'anamnesis',
        title: 'Completa tu anamnesis médica',
        description: 'Una anamnesis detallada permite a los médicos entender mejor tu historial y síntomas actuales.',
        priority: 'media',
        path: '/dashboard/anamnesis',
        condition: () => !medicalData.anamnesisCompleted,
        ctaText: 'Completar anamnesis',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      {
        id: 'family_history',
        title: 'Añade antecedentes familiares',
        description: 'Los antecedentes familiares permiten evaluar tu riesgo de desarrollar ciertas condiciones hereditarias.',
        priority: 'media',
        path: '/dashboard/family-history',
        condition: () => !medicalData.familyHistory || Object.keys(medicalData.familyHistory).length === 0,
        ctaText: 'Añadir antecedentes',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
      {
        id: 'lifestyle',
        title: 'Completa información sobre tu estilo de vida',
        description: 'Tus hábitos diarios impactan directamente en tu salud. Esta información ayuda a personalizar recomendaciones.',
        priority: 'baja',
        path: '/dashboard/lifestyle',
        condition: () => !medicalData.lifestyle || Object.keys(medicalData.lifestyle).length < 3,
        ctaText: 'Añadir información',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      },
      {
        id: 'emergency_contact',
        title: 'Agrega un contacto de emergencia',
        description: 'En caso de emergencia, es crucial tener información de contacto de alguien de confianza.',
        priority: 'alta',
        path: '/dashboard/profile#emergency',
        condition: () => !userData.emergencyContact || !userData.emergencyContact.name,
        ctaText: 'Añadir contacto',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      }
    ];

    // Recuperar recordatorios descartados de localStorage
    const getDismissedReminders = () => {
      if (typeof window === 'undefined') return [];
      
      try {
        const stored = localStorage.getItem(`dismissed-reminders-${userData.id}`);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error("Error al recuperar recordatorios descartados:", error);
        return [];
      }
    };

    // Filtrar recordatorios aplicables y no descartados
    const dismissed = getDismissedReminders();
    setDismissedReminders(dismissed);
    
    const filteredReminders = possibleReminders
      .filter(reminder => reminder.condition())
      .filter(reminder => !dismissed.includes(reminder.id))
      .sort((a, b) => {
        const priorityMap = { alta: 0, media: 1, baja: 2 };
        return priorityMap[a.priority] - priorityMap[b.priority];
      });
    
    setReminders(filteredReminders);
  }, [userData, medicalData]);

  // Descartar recordatorio
  const dismissReminder = (id) => {
    const updated = [...dismissedReminders, id];
    setDismissedReminders(updated);
    
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dismissed-reminders-${userData?.id}`, JSON.stringify(updated));
    }
    
    // Actualizar lista visible
    setReminders(prevReminders => prevReminders.filter(r => r.id !== id));
  };

  // Si no hay recordatorios, no renderizar
  if (reminders.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
      <h3 className="text-base font-medium text-gray-800 mb-3">
        Sugerencias para tu perfil médico
      </h3>
      
      <div className="space-y-3">
        <AnimatePresence>
          {reminders.slice(0, showAll ? reminders.length : 3).map((reminder) => (
            <motion.div 
              key={reminder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start p-3 bg-blue-50 rounded-lg relative"
            >
              <div className="mr-3 mt-0.5">
                {reminder.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800">{reminder.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{reminder.description}</p>
                
                <div className="mt-2">
                  <Link 
                    href={reminder.path}
                    className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    {reminder.ctaText}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <button 
                onClick={() => dismissReminder(reminder.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                aria-label="Descartar recordatorio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {reminder.priority === 'alta' && (
                <span className="absolute top-0 left-0 w-0 h-0 border-t-[20px] border-l-[20px] border-t-red-500 border-l-transparent border-r-transparent rotate-45 transform -translate-x-2 -translate-y-2" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {reminders.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 w-full text-center"
        >
          {showAll ? 'Mostrar menos' : `Ver ${reminders.length - 3} sugerencias más`}
        </button>
      )}
    </div>
  );
};

export default HealthDataReminders;
