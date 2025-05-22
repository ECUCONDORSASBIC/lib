
const OnboardingStepLayout = ({ title, children, onNext, onPrevious, nextDisabled, prevDisabled, nextLabel, prevLabel }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">{title}</h1>
        <div className="mb-6">
          {children}
        </div>
        <div className={`flex ${onPrevious ? 'justify-between' : 'justify-end'}`}>
          {onPrevious && (
            <button
              onClick={onPrevious}
              disabled={prevDisabled}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {prevLabel || 'Anterior'}
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              disabled={nextDisabled}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {nextLabel || 'Siguiente'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingStepLayout;
