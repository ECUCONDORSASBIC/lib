import React from 'react';

export default function FormProgress({ steps, currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex-1 text-center text-sm font-medium py-2 border-b-4
              ${index === currentStep
                ? 'border-primary text-primary' // Active step
                : index < currentStep
                  ? 'border-success text-success' // Completed step
                  : 'border-neutral-light text-neutral-DEFAULT' // Upcoming step
              }
            `}
          >
            {step.title}
          </div>
        ))}
      </div>
      <div className="relative w-full h-2 rounded bg-neutral-light">
        <div
          className="absolute top-0 left-0 h-2 transition-all duration-300 ease-in-out rounded bg-primary"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
