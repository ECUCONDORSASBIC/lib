'use client';

import { AcademicCapIcon, BookOpenIcon, ClockIcon, HeartIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

/**
 * Renders dashboard sections personalized for each patient based on their characteristics
 * @param {Object} props - Component props
 * @param {Object} props.patientData - The patient data object
 * @returns {JSX.Element} Personalized dashboard sections
 */
const PersonalizedDashboardSections = ({ patientData }) => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (!patientData) return;

    // Determine which sections to show based on patient characteristics
    const relevantSections = [];

    // Get patient age from DOB or age property
    const getPatientAge = () => {
      if (patientData.age) return patientData.age;

      const dobField = patientData.dob || patientData.fechaNacimiento || patientData.birthDate || patientData.dateOfBirth;
      if (!dobField) return null;

      const dob = new Date(dobField);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      return age;
    };

    const patientAge = getPatientAge();

    // Section: Senior Health Tips (for patients over 60)
    if (patientAge && patientAge >= 60) {
      relevantSections.push({
        id: 'seniorHealth',
        title: 'Consejos para Salud Senior',
        icon: <HeartIcon className="w-6 h-6 text-blue-500" />,
        content: (
          <div className="p-4 space-y-3 rounded-lg bg-blue-50">
            <h4 className="font-medium text-blue-700">Recomendaciones para adultos mayores</h4>
            <ul className="pl-5 space-y-1 text-sm list-disc text-blue-800">
              <li>Mantén una rutina diaria de ejercicios de baja intensidad</li>
              <li>Monitoriza tu presión arterial regularmente</li>
              <li>Programa revisiones periódicas de audición y visión</li>
              <li>Consulta con tu médico sobre suplementos de vitamina D y calcio</li>
            </ul>
            <a href="/recursos/salud-senior" className="block mt-2 text-sm font-medium text-blue-600 hover:underline">
              Ver más recursos para adultos mayores →
            </a>
          </div>
        )
      });
    }

    // Section: Pediatric Care (for patients under 18)
    if (patientAge && patientAge < 18) {
      relevantSections.push({
        id: 'pediatricCare',
        title: 'Cuidado Pediátrico',
        icon: <ShieldCheckIcon className="w-6 h-6 text-green-500" />,
        content: (
          <div className="p-4 space-y-3 rounded-lg bg-green-50">
            <h4 className="font-medium text-green-700">Seguimiento de desarrollo infantil</h4>
            <p className="text-sm text-green-800">
              Es importante mantener al día el calendario de vacunación y las revisiones pediátricas periódicas.
            </p>
            <a href={`/dashboard/paciente/${patientData.id}/desarrollo`} className="block mt-2 text-sm font-medium text-green-600 hover:underline">
              Ver calendario de desarrollo →
            </a>
          </div>
        )
      });
    }

    // Section: Chronic Condition Management
    const chronicConditions = patientData.conditions || patientData.medicalConditions || [];
    const hasChronicCondition = chronicConditions.some(condition =>
      ['diabetes', 'hipertensión', 'asma', 'EPOC', 'artritis', 'fibromialgia'].some(
        keyword => condition.toLowerCase().includes(keyword)
      )
    );

    if (hasChronicCondition) {
      relevantSections.push({
        id: 'chronicCare',
        title: 'Gestión de Condiciones Crónicas',
        icon: <ClockIcon className="w-6 h-6 text-purple-500" />,
        content: (
          <div className="p-4 space-y-3 rounded-lg bg-purple-50">
            <h4 className="font-medium text-purple-700">Seguimiento de condiciones crónicas</h4>
            <p className="text-sm text-purple-800">
              Hemos personalizado un plan de seguimiento para tus condiciones médicas crónicas.
            </p>
            <a href={`/dashboard/paciente/${patientData.id}/condiciones-cronicas`} className="block mt-2 text-sm font-medium text-purple-600 hover:underline">
              Ver plan de manejo →
            </a>
          </div>
        )
      });
    }

    // Section: Preventive Health (for everyone)
    relevantSections.push({
      id: 'preventiveHealth',
      title: 'Salud Preventiva',
      icon: <ShieldCheckIcon className="w-6 h-6 text-indigo-500" />,
      content: (
        <div className="p-4 space-y-3 rounded-lg bg-indigo-50">
          <h4 className="font-medium text-indigo-700">Recomendaciones preventivas personalizadas</h4>
          {patientAge && patientAge > 40 ? (
            <p className="text-sm text-indigo-800">
              Basado en tu perfil, te recomendamos programar revisiones anuales de presión arterial y colesterol.
            </p>
          ) : (
            <p className="text-sm text-indigo-800">
              Es recomendable realizar una revisión física general al menos una vez al año.
            </p>
          )}
          <a href={`/dashboard/paciente/${patientData.id}/preventiva`} className="block mt-2 text-sm font-medium text-indigo-600 hover:underline">
            Ver recomendaciones completas →
          </a>
        </div>
      )
    });

    // Section: Medical Education Based on Recent Diagnoses
    if (patientData.recentDiagnoses && patientData.recentDiagnoses.length > 0) {
      relevantSections.push({
        id: 'medicalEducation',
        title: 'Educación Médica',
        icon: <AcademicCapIcon className="w-6 h-6 text-amber-500" />,
        content: (
          <div className="p-4 space-y-3 rounded-lg bg-amber-50">
            <h4 className="font-medium text-amber-700">Recursos educativos sobre tus diagnósticos</h4>
            <p className="text-sm text-amber-800">
              Hemos seleccionado recursos informativos sobre tus diagnósticos recientes para ayudarte a entender mejor tu condición.
            </p>
            <a href={`/dashboard/paciente/${patientData.id}/educacion-medica`} className="block mt-2 text-sm font-medium text-amber-600 hover:underline">
              Explorar recursos educativos →
            </a>
          </div>
        )
      });
    }

    // Set the sections state
    setSections(relevantSections);
  }, [patientData]);

  if (!sections.length) {
    return null;
  }

  return (
    <section className="p-6 mt-6 space-y-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center space-x-2">
        <BookOpenIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800">Secciones Personalizadas</h3>
      </div>

      <p className="text-sm text-gray-600">
        Estas secciones han sido seleccionadas específicamente para ti en base a tu perfil médico.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.map(section => (
          <div key={section.id} className="p-4 transition-shadow bg-white rounded-lg shadow hover:shadow-md">
            <div className="flex items-center space-x-2 mb-2">
              {section.icon}
              <h4 className="font-semibold text-gray-700">{section.title}</h4>
            </div>
            {section.content}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PersonalizedDashboardSections;
