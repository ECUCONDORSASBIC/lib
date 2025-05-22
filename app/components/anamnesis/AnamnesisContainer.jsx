import { useCallback, useState } from 'react';
import AntecedentesFamiliaresSection from './AntecedentesFamiliaresSection';
import AntecedentesPersonalesSection from './AntecedentesPersonalesSection';
import EnfermedadActualSection from './EnfermedadActualSection';
import HabitosEstiloVidaSection from './HabitosEstiloVidaSection';
import IdentificacionSection from './IdentificacionSection';
import MotivoConsultaSection from './MotivoConsultaSection';
import NavegacionAnamnesis from './NavegacionAnamnesis';
// Importaremos los nuevos componentes a medida que los creemos

/**
 * @typedef {import('../../types/anamnesis').AnamnesisFormData} AnamnesisFormData
 * @typedef {import('../../types/anamnesis').AnamnesisSectionKey} AnamnesisSectionKey
 * @typedef {import('../../types/anamnesis').FormErrors} FormErrors
 */

/**
 * @param {object} props
 * @param {AnamnesisFormData} props.formData - Datos del formulario completo
 * @param {function(AnamnesisSectionKey, any): void} props.updateFormData - Función para actualizar sección específica
 * @param {FormErrors} props.errors - Errores del formulario
 * @param {function(AnamnesisSectionKey, string, string): void} props.setSectionError - Establecer error específico
 * @param {function(AnamnesisSectionKey, string): void} props.clearSectionError - Limpiar error específico
 */
const AnamnesisContainer = ({
  formData,
  updateFormData,
  errors = {},
  setSectionError,
  clearSectionError,
}) => {
  const [currentSection, setCurrentSection] = useState(0);

  const handleUpdateData = useCallback(
    (sectionKey) => (data) => {
      updateFormData(sectionKey, data);
    },
    [updateFormData]
  );

  const handleSectionError = useCallback(
    (sectionKey) => (field, message) => {
      setSectionError(sectionKey, field, message);
    },
    [setSectionError]
  );

  const handleClearSectionError = useCallback(
    (sectionKey) => (field) => {
      clearSectionError(sectionKey, field);
    },
    [clearSectionError]
  );

  // Define todas las secciones del formulario
  const sections = [
    {
      key: 'identificacion',
      title: 'Datos de Identificación',
      component: IdentificacionSection,
      data: formData.identificacion || {},
      completed: false, // Aquí podrías implementar una lógica de validación
    },
    {
      key: 'motivo_consulta',
      title: 'Motivo de Consulta',
      component: MotivoConsultaSection,
      data: formData.motivo_consulta || {},
      completed: false,
    },
    {
      key: 'enfermedad_actual',
      title: 'Historia de Enfermedad Actual',
      component: EnfermedadActualSection,
      data: formData.enfermedad_actual || {},
      completed: false,
    },
    {
      key: 'antecedentes_personales',
      title: 'Antecedentes Personales',
      component: AntecedentesPersonalesSection,
      data: formData.antecedentes_personales || {},
      completed: false,
    },
    {
      key: 'antecedentes_familiares',
      title: 'Antecedentes Familiares',
      component: AntecedentesFamiliaresSection,
      data: formData.antecedentes_familiares || {},
      completed: false,
    },
    {
      key: 'habitos_estilo_vida',
      title: 'Hábitos y Estilo de Vida',
      component: HabitosEstiloVidaSection,
      data: formData.habitos_estilo_vida || {},
      completed: false,
    },
    // Añadiremos las nuevas secciones que vamos a crear
  ];

  // Obtiene la sección actual
  const CurrentSectionComponent = sections[currentSection].component;
  const currentSectionKey = sections[currentSection].key;
  const currentSectionData = sections[currentSection].data;

  // Controladores para la navegación entre secciones
  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0); // Regresa al inicio de la página
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-6 text-center">
          Anamnesis Clínica
        </h1>
        <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
          Complete el siguiente formulario para registrar la historia clínica completa del paciente.
          Navegue entre secciones utilizando el menú lateral o los botones de navegación.
        </p>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Navegación lateral */}
          <div className="md:w-1/4">
            <NavegacionAnamnesis
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
              sections={sections.map(s => ({
                key: s.key,
                title: s.title,
                completed: s.completed
              }))}
            />
          </div>

          {/* Contenido principal */}
          <div className="md:w-3/4">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
              {/* Indicador de progreso */}
              <div className="bg-indigo-600 h-2">
                <div
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                />
              </div>

              {/* Sección actual */}
              <div className="p-6">
                <CurrentSectionComponent
                  data={currentSectionData}
                  updateData={handleUpdateData(currentSectionKey)}
                  setSectionError={handleSectionError(currentSectionKey)}
                  clearSectionError={handleClearSectionError(currentSectionKey)}
                  sectionKey={currentSectionKey}
                  errors={errors[currentSectionKey]}
                />

                {/* Navegación entre secciones */}
                <div className="flex justify-between mt-8 pt-4 border-t">
                  <button
                    onClick={handlePrev}
                    disabled={currentSection === 0}
                    className={`px-6 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors
                      ${currentSection === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    Anterior
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentSection === sections.length - 1}
                    className="px-6 py-2 ml-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnamnesisContainer;
