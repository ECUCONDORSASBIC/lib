'use client';

const ProgressBar = ({ currentStep, totalSteps, stepNames }) => {
  return (
    <div className="w-full bg-gray-200 py-4 px-2 md:px-8 shadow-md">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div key={stepNumber} className="flex flex-col items-center md:flex-row md:items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-semibold
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${isActive ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1' : ''}
                      ${!isCompleted && !isActive ? 'bg-gray-300 text-gray-600' : ''}
                    `}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  {stepNames && stepNames[i] && (
                    <div
                      className={`ml-2 text-xs md:text-sm hidden sm:block
                        ${isActive ? 'text-blue-700 font-semibold' : 'text-gray-600'}
                        ${isCompleted ? 'text-green-700' : ''}
                      `}
                    >
                      {stepNames[i]}
                    </div>
                  )}
                </div>
                {stepNumber < totalSteps && (
                  <div className="flex-1 h-1 bg-gray-300 mx-2 hidden md:block">
                    <div
                      className="h-1 bg-green-500"
                      style={{ width: isCompleted || isActive ? '100%' : '0%' }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {stepNames && stepNames[currentStep - 1] && (
          <div className="sm:hidden text-center mt-2 text-sm font-semibold text-blue-700">
            {currentStep}. {stepNames[currentStep - 1]}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
