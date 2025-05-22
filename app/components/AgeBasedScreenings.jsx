'use client';

import { useState } from 'react';
import { CalendarIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const AgeBasedScreenings = ({ patientAge, patientSex, completedScreenings = [] }) => {
  const [expanded, setExpanded] = useState(false);

  // Define screening recommendations by age and sex
  const getRecommendedScreenings = (age, sex) => {
    const screenings = [];

    // Screenings for all adults
    if (age >= 18) {
      screenings.push({
        id: 'blood-pressure',
        name: 'Presión arterial',
        frequency: 'Anual',
        recommendedAge: '18+ años',
        description: 'Detección temprana de hipertensión',
        importance: 'La hipertensión no tratada puede aumentar el riesgo de enfermedades cardíacas y accidentes cerebrovasculares.'
      });

      screenings.push({
        id: 'cholesterol',
        name: 'Perfil lipídico',
        frequency: 'Cada 4-6 años',
        recommendedAge: '20+ años',
        description: 'Medición de colesterol total, HDL, LDL y triglicéridos',
        importance: 'Los niveles elevados de colesterol aumentan el riesgo de enfermedades cardiovasculares.'
      });

      screenings.push({
        id: 'diabetes',
        name: 'Glucosa en sangre',
        frequency: 'Cada 3 años',
        recommendedAge: '45+ años',
        description: 'Detección de diabetes o prediabetes',
        importance: 'La diabetes no diagnosticada puede causar daños en órganos vitales con el tiempo.'
      });

      screenings.push({
        id: 'depression',
        name: 'Evaluación de depresión',
        frequency: 'Según necesidad',
        recommendedAge: '18+ años',
        description: 'Detección de trastornos de salud mental',
        importance: 'La depresión no tratada afecta significativamente la calidad de vida y puede llevar a otros problemas de salud.'
      });
    }

    // Screenings for adults 45+
    if (age >= 45) {
      screenings.push({
        id: 'colorectal',
        name: 'Cáncer colorrectal',
        frequency: 'Variable según método',
        recommendedAge: '45-75 años',
        description: 'Colonoscopia, análisis de heces, sigmoidoscopia',
        importance: 'La detección temprana del cáncer colorrectal puede aumentar significativamente las tasas de supervivencia.'
      });
    }

    // Screenings for older adults
    if (age >= 65) {
      screenings.push({
        id: 'bone-density',
        name: 'Densidad ósea',
        frequency: 'Según factores de riesgo',
        recommendedAge: '65+ años',
        description: 'Evaluación de osteoporosis',
        importance: 'La detección temprana de la pérdida ósea puede prevenir fracturas y complicaciones.'
      });
    }

    // Female-specific screenings
    if (sex === 'female') {
      if (age >= 21) {
        screenings.push({
          id: 'cervical',
          name: 'Cáncer cervical',
          frequency: 'Cada 3-5 años',
          recommendedAge: '21-65 años',
          description: 'Papanicolaou y/o prueba de VPH',
          importance: 'La detección temprana del cáncer cervical tiene una alta tasa de tratamiento exitoso.'
        });
      }

      if (age >= 40) {
        screenings.push({
          id: 'mammogram',
          name: 'Mamografía',
          frequency: 'Anual o bienal',
          recommendedAge: '40-74 años',
          description: 'Detección de cáncer de mama',
          importance: 'La detección temprana del cáncer de mama puede reducir significativamente la mortalidad.'
        });
      }
    }

    // Male-specific screenings
    if (sex === 'male') {
      if (age >= 55) {
        screenings.push({
          id: 'prostate',
          name: 'Cáncer de próstata',
          frequency: 'Discutir con médico',
          recommendedAge: '55-69 años',
          description: 'Prueba de PSA y/o examen rectal',
          importance: 'La detección del cáncer de próstata debe ser una decisión informada basada en los factores de riesgo individuales.'
        });
      }
    }

    return screenings;
  };

  const recommendedScreenings = getRecommendedScreenings(patientAge, patientSex);

  // Filter screenings that are most important based on age (top 3 for collapsed view)
  const priorityScreenings = recommendedScreenings
    .sort((a, b) => {
      // Check if screening is completed
      const aCompleted = completedScreenings.includes(a.id);
      const bCompleted = completedScreenings.includes(b.id);

      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      return 0;
    })
    .slice(0, 3);

  // Show all screenings or just the priority ones
  const screeningsToShow = expanded ? recommendedScreenings : priorityScreenings;

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between px-4 py-3 text-white bg-teal-600">
        <h3 className="flex items-center font-medium">
          <CalendarIcon className="w-5 h-5 mr-2" />
          Exámenes de Prevención Recomendados
        </h3>
        <span className="bg-white text-teal-700 px-2 py-0.5 text-xs font-medium rounded-full">
          {completedScreenings.length}/{recommendedScreenings.length}
        </span>
      </div>

      <div className="divide-y">
        {screeningsToShow.map((screening) => {
          const isCompleted = completedScreenings.includes(screening.id);

          return (
            <div key={screening.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationCircleIcon className="w-5 h-5 text-amber-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900">{screening.name}</h4>
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded">
                      {screening.recommendedAge}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    {screening.description}
                  </div>

                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <ClockIcon className="h-3.5 w-3.5 mr-1" />
                    Frecuencia: {screening.frequency}
                  </div>

                  {!isCompleted && (
                    <div className="mt-2 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md">
                      <p><strong>Importante:</strong> {screening.importance}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {recommendedScreenings.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center w-full px-4 py-2 text-sm text-teal-700 transition bg-teal-50 hover:bg-teal-100"
        >
          {expanded ? 'Ver menos' : 'Ver todos los exámenes recomendados'}
          <ChevronRightIcon
            className={`h-4 w-4 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </button>
      )}

      <div className="p-3 text-center border-t bg-gray-50">
        <button className="text-sm font-medium text-teal-600 hover:text-teal-800">
          Programar exámenes preventivos
        </button>
      </div>
    </div>
  );
};

export default AgeBasedScreenings;
