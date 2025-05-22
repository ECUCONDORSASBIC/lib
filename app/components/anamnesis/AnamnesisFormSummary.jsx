'use client';

import { useEffect, useState } from 'react';

/**
 * AnamnesisFormSummary - Displays a summary of all completed sections of the anamnesis form
 * and allows the user to confirm and finalize the submission
 *
 * @param {Object} props
 * @param {Object} props.formData - All form data collected so far
 * @param {Array} props.visibleSteps - Array of step objects visible in the form
 * @param {Function} props.onConfirm - Function to call when user confirms the submission
 * @param {Function} props.onBack - Function to go back to previous step
 * @param {boolean} props.isSubmitting - Whether form is currently being submitted
 * @param {Function} [props.onEditSection] - Optional function to edit a specific section
 * @param {Array} props.completedSteps - Array of step IDs that have been completed
 */
const AnamnesisFormSummary = ({
  formData,
  visibleSteps,
  onConfirm,
  onBack,
  isSubmitting = false,
  onEditSection,
  completedSteps = []
}) => {
  const [confirmVeracity, setConfirmVeracity] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Calculate completion percentage
  useEffect(() => {
    if (!visibleSteps || visibleSteps.length === 0) return;

    const percentage = Math.round((completedSteps.length / visibleSteps.length) * 100);
    setCompletionPercentage(percentage);
  }, [completedSteps, visibleSteps]);
  // Renderer for each section summary
  const renderSectionSummary = (sectionId, sectionTitle) => {
    const sectionData = formData[sectionId];
    const isCompleted = completedSteps.includes(sectionId);

    // Define rendering logic for each specific section
    const renderSectionContent = () => {
      if (!sectionData || Object.keys(sectionData).length === 0) {
        return <p className="text-gray-500 italic">No se ha proporcionado información para esta sección.</p>;
      }

      switch (sectionId) {
        case 'datos-personales':
          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Nombre:</span> {sectionData.nombre_completo || 'No especificado'}</p>
                  <p><span className="font-medium">Fecha de nacimiento:</span> {sectionData.fecha_nacimiento || 'No especificado'}</p>
                  <p><span className="font-medium">Edad:</span> {sectionData.edad || 'No especificado'}</p>
                </div>
                <div>
                  <p><span className="font-medium">Sexo:</span> {sectionData.sexo || 'No especificado'}</p>
                  <p><span className="font-medium">Estado civil:</span> {sectionData.estado_civil || 'No especificado'}</p>
                  <p><span className="font-medium">Ocupación:</span> {sectionData.ocupacion || 'No especificado'}</p>
                </div>
              </div>
            </>
          );

        case 'motivo-consulta':
          return (
            <>
              <p><span className="font-medium">Motivo principal:</span> {sectionData.motivo_principal || 'No especificado'}</p>
              {sectionData.tiempo_evolucion && (
                <p><span className="font-medium">Tiempo de evolución:</span> {sectionData.tiempo_evolucion}</p>
              )}
              {sectionData.sintomas_asociados && (
                <p><span className="font-medium">Síntomas asociados:</span> {sectionData.sintomas_asociados}</p>
              )}
            </>
          );

        case 'historia-enfermedad':
          return (
            <>
              <p><span className="font-medium">Inicio y evolución:</span> {sectionData.inicio_evolucion || 'No especificado'}</p>
              {sectionData.tratamientos_previos && (
                <p><span className="font-medium">Tratamientos previos:</span> {sectionData.tratamientos_previos}</p>
              )}
            </>
          );

        case 'antecedentes-personales':
          return (
            <>
              <p><span className="font-medium">Enfermedades previas:</span> {formatList(sectionData.enfermedades) || 'Ninguna reportada'}</p>
              <p><span className="font-medium">Cirugías:</span> {formatList(sectionData.cirugias) || 'Ninguna reportada'}</p>
              <p><span className="font-medium">Alergias:</span> {formatList(sectionData.alergias) || 'Ninguna reportada'}</p>
              <p><span className="font-medium">Medicamentos actuales:</span> {formatList(sectionData.medicamentos) || 'Ninguno reportado'}</p>
            </>
          );

        case 'antecedentes-gineco':
          return (
            <>
              {sectionData.menarca && <p><span className="font-medium">Edad de primera menstruación:</span> {sectionData.menarca} años</p>}
              {sectionData.gestas !== undefined && <p><span className="font-medium">Embarazos:</span> {sectionData.gestas}</p>}
              {sectionData.partos !== undefined && <p><span className="font-medium">Partos:</span> {sectionData.partos}</p>}
              {sectionData.cesareas !== undefined && <p><span className="font-medium">Cesáreas:</span> {sectionData.cesareas}</p>}
              {sectionData.abortos !== undefined && <p><span className="font-medium">Abortos:</span> {sectionData.abortos}</p>}
              {sectionData.metodo_anticonceptivo && <p><span className="font-medium">Método anticonceptivo:</span> {sectionData.metodo_anticonceptivo}</p>}
            </>
          );

        case 'antecedentes-familiares':
          return (
            <>
              {Object.entries(sectionData).map(([enfermedad, familiares]) =>
                familiares && familiares.length > 0 ? (
                  <p key={enfermedad}><span className="font-medium">{formatEnfermedad(enfermedad)}:</span> {formatList(familiares)}</p>
                ) : null
              )}
              {Object.values(sectionData).every(val => !val || val.length === 0) && (
                <p className="text-gray-500 italic">No se han reportado antecedentes familiares relevantes.</p>
              )}
            </>
          );

        case 'habitos':
          return (
            <>
              {sectionData.tabaco && <p><span className="font-medium">Tabaco:</span> {sectionData.tabaco}</p>}
              {sectionData.alcohol && <p><span className="font-medium">Alcohol:</span> {sectionData.alcohol}</p>}
              {sectionData.actividad_fisica && <p><span className="font-medium">Actividad física:</span> {sectionData.actividad_fisica}</p>}
              {sectionData.dieta && <p><span className="font-medium">Alimentación:</span> {sectionData.dieta}</p>}
              {sectionData.sueno && <p><span className="font-medium">Sueño:</span> {sectionData.sueno}</p>}
            </>
          );

        case 'revision-sistemas':
          const sistemasConProblemas = Object.entries(sectionData).filter(([_, valor]) => valor && valor !== 'normal' && valor !== 'No');
          return (
            <>
              {sistemasConProblemas.length > 0 ? (
                sistemasConProblemas.map(([sistema, descripcion]) => (
                  <p key={sistema}><span className="font-medium">{formatSistema(sistema)}:</span> {descripcion}</p>
                ))
              ) : (
                <p className="text-gray-500 italic">No se reportan problemas en los sistemas corporales.</p>
              )}
            </>
          );

        case 'pruebas-previas':
          return (
            <>
              {sectionData.pruebas_realizadas && (
                <div>
                  <span className="font-medium">Pruebas realizadas:</span>
                  <ul className="list-disc pl-5 mt-1">
                    {sectionData.pruebas_realizadas.split('\n').map((prueba, idx) => (
                      <li key={idx}>{prueba}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sectionData.resultados_relevantes && (
                <p className="mt-2"><span className="font-medium">Resultados relevantes:</span> {sectionData.resultados_relevantes}</p>
              )}
              {(!sectionData.pruebas_realizadas && !sectionData.resultados_relevantes) && (
                <p className="text-gray-500 italic">No se han reportado pruebas o estudios previos.</p>
              )}
            </>
          );

        case 'salud-mental':
          return (
            <>
              {sectionData.estado_animo && <p><span className="font-medium">Estado de ánimo:</span> {sectionData.estado_animo}</p>}
              {sectionData.estres && <p><span className="font-medium">Nivel de estrés:</span> {sectionData.estres}</p>}
              {sectionData.trastornos_psicologicos && <p><span className="font-medium">Antecedentes psicológicos:</span> {sectionData.trastornos_psicologicos}</p>}
            </>
          );

        case 'percepcion-paciente':
          return (
            <>
              {sectionData.preocupacion_principal && <p><span className="font-medium">Principal preocupación:</span> {sectionData.preocupacion_principal}</p>}
              {sectionData.expectativas && <p><span className="font-medium">Expectativas del tratamiento:</span> {sectionData.expectativas}</p>}
              {sectionData.impacto_vida && <p><span className="font-medium">Impacto en su vida:</span> {sectionData.impacto_vida}</p>}
            </>
          );

        default:
          return (
            <p className="text-gray-600">Información registrada para esta sección.</p>
          );
      }
    };

    return (
      <div key={sectionId} className={`p-4 border rounded-md ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-700'}`}>
            {sectionTitle}
            {isCompleted && (
              <span className="inline-flex items-center ml-2 text-xs font-medium text-green-600 bg-green-100 rounded px-2 py-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Completado
              </span>
            )}          </h3>
          <button
            type="button"
            onClick={() => onEditSection ? onEditSection(sectionId) : null}
            className={`px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors ${!onEditSection ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Editar
          </button>
        </div>
        <div className="pl-1 text-sm">{renderSectionContent()}</div>
      </div>
    );
  };

  // Helper to format lists of items
  const formatList = (items) => {
    if (!items) return null;
    if (typeof items === 'string') return items;
    if (Array.isArray(items)) {
      return items.filter(Boolean).join(', ') || 'Ninguno';
    }
    return 'No especificado';
  };

  // Helper to format enfermedad names
  const formatEnfermedad = (key) => {
    const map = {
      'diabetes': 'Diabetes',
      'hipertension': 'Hipertensión',
      'cancer': 'Cáncer',
      'cardiopatias': 'Cardiopatías',
      'enfermedades_mentales': 'Enfermedades mentales',
      'enfermedades_autoinmunes': 'Enfermedades autoinmunes',
      'otros': 'Otras enfermedades'
    };
    return map[key] || key.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Helper to format sistema names
  const formatSistema = (key) => {
    const map = {
      'sistema_cardiovascular': 'Sistema cardiovascular',
      'sistema_respiratorio': 'Sistema respiratorio',
      'sistema_digestivo': 'Sistema digestivo',
      'sistema_neurologico': 'Sistema neurológico',
      'sistema_musculoesqueletico': 'Sistema musculoesquelético',
      'sistema_genitourinario': 'Sistema genitourinario',
      'piel': 'Piel',
      'sistema_endocrino': 'Sistema endocrino'
    };
    return map[key] || key.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div>
      <div className="p-4 mb-6 border border-blue-100 rounded-md bg-blue-50">
        <h2 className="mb-2 text-lg font-medium text-blue-800">Resumen de la Historia Clínica</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-blue-700">
            Revise la información proporcionada para asegurarse de que sea correcta y completa.
            Puede editar cualquier sección haciendo clic en el botón &quot;Editar&quot;.
          </p>

          <div className="flex flex-col items-end ml-4">
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium text-blue-800">{completionPercentage}%</span>
              <span className="ml-1 text-xs text-blue-600">completado</span>
            </div>
            <div className="w-24 h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {visibleSteps.map(step => renderSectionSummary(step.id, step.title))}
      </div>

      <div className="p-4 mt-8 border border-gray-200 rounded-md bg-gray-50">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={confirmVeracity}
            onChange={(e) => setConfirmVeracity(e.target.checked)}
            className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="ml-3 text-gray-700">
            Confirmo que la información proporcionada es correcta y completa según mi mejor conocimiento.
            Entiendo que esta información será utilizada como parte de mi historia clínica.
          </span>
        </label>
      </div>

      <div className="flex justify-between mt-6">        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Volver
        </button>

        <button
          type="button"
          onClick={onConfirm ? onConfirm : () => console.warn('onConfirm function not provided')}
          disabled={!confirmVeracity || isSubmitting || !onConfirm}
          className={`px-4 py-2 border border-transparent rounded-md text-white
              ${confirmVeracity && !isSubmitting && onConfirm
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
            }`}
        >
          {isSubmitting ? 'Guardando...' : 'Confirmar y finalizar'}
        </button>
      </div>
    </div>
  );
};

export default AnamnesisFormSummary;
