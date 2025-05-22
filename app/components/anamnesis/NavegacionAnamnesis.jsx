
/**
 * @param {object} props
 * @param {number} props.currentSection - Índice de la sección actual
 * @param {function(number):void} props.onSectionChange - Función para cambiar la sección
 * @param {Array<{key: string, title: string, completed: boolean}>} props.sections - Array de secciones
 */
const NavegacionAnamnesis = ({ currentSection, onSectionChange, sections }) => {  return (
    <div className="bg-white rounded-lg shadow-lg p-5 sticky top-4">
      <h2 className="text-xl font-heading font-bold text-indigo-600 mb-4 pb-2 border-b border-indigo-100">Secciones</h2>
      <nav>
        <ul className="space-y-2">
          {sections.map((section, index) => (
            <li key={section.key}>
              <button
                onClick={() => onSectionChange(index)}
                className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 flex items-center ${
                  currentSection === index
                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`mr-3 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-sm shadow-sm ${
                    section.completed
                      ? 'bg-green-500 text-white'
                      : currentSection === index
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {section.completed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`${
                  section.completed ? 'text-gray-600' : currentSection === index ? 'font-heading font-medium' : ''
                } tracking-wide`}>{section.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default NavegacionAnamnesis;
