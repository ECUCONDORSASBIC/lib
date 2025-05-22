
const ProgressBar = ({ steps, currentStepId, onStepClick }) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

  const getStepClass = (idx) => {
    if (idx < currentStepIndex) return 'bg-primary text-white';
    if (idx === currentStepIndex) return 'border-2 border-primary text-primary';
    return 'border-2 border-gray-300 text-gray-500'; // Default for future steps
  };

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center border border-gray-200 rounded-md divide-x divide-gray-200 md:flex md:divide-y-0">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="relative md:flex-1 md:flex">
            <button
              type="button"
              onClick={() => onStepClick && onStepClick(step.id)}
              className={`group flex items-center w-full ${onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
              aria-current={step.id === currentStepId ? 'step' : undefined}
              disabled={!onStepClick} // Disable if no click handler
            >
              <span className="px-6 py-4 flex items-center text-sm font-medium">
                <span
                  className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${getStepClass(stepIdx)}`}
                >
                  {stepIdx < currentStepIndex ? (
                    <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className={`${step.id === currentStepId ? 'text-primary' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      {step.icon ? <step.icon className="w-5 h-5" /> : step.id.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className={`ml-4 text-sm font-medium ${step.id === currentStepId ? 'text-primary' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  {step.name}
                </span>
              </span>
            </button>

            {/* Arrow separator for md+ screens */}
            {stepIdx !== steps.length - 1 ? (
              <div className="hidden md:block absolute top-0 right-0 h-full w-5" aria-hidden="true">
                <svg className="h-full w-full text-gray-200" viewBox="0 0 22 80" fill="none" preserveAspectRatio="none">
                  <path d="M0 -2L20 40L0 82" vectorEffect="non-scaling-stroke" stroke="currentcolor" strokeLinejoin="round" />
                </svg>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ProgressBar;
