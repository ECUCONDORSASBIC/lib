'use client';

import React from 'react';

/**
 * Navigation component for the anamnesis form
 * Shows progress and allows quick navigation between sections
 */
const AnamnesisNavigation = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  canNavigate = true
}) => {
  return (
    <div className="mb-6">
      {/* Mobile navigation (step indicators) */}
      <div className="mb-4 md:hidden">
        <div className="flex justify-between mb-1">
          {steps.map((step, index) => (
            <div
              key={step.id}
              onClick={() => canNavigate && onStepClick(index)}
              className={`flex items-center justify-center w-6 h-6 text-xs rounded-full cursor-pointer
                ${completedSteps.includes(step.id)
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }
                ${canNavigate ? 'hover:opacity-80' : 'cursor-default'}
              `}
            >
              {completedSteps.includes(step.id) ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600 font-medium my-2">
          {steps[currentStep]?.title}
        </div>
      </div>

      {/* Desktop navigation (pills) */}
      <div className="hidden md:flex items-center justify-center border-b border-gray-200 overflow-x-auto">
        {steps.map((step, index) => (
          <div
            key={step.id}
            onClick={() => canNavigate && onStepClick(index)}
            className={`px-4 py-2 mx-1 text-sm font-medium border-b-2 cursor-pointer whitespace-nowrap
              ${index === currentStep
                ? 'border-blue-600 text-blue-600'
                : completedSteps.includes(step.id)
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              ${canNavigate ? 'hover:opacity-80' : 'cursor-default'}
            `}
          >
            <div className="flex items-center">
              {completedSteps.includes(step.id) && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {step.title}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-gray-200 rounded-full mt-2">
        <div
          className="absolute h-full bg-blue-600 rounded-full"
          style={{
            width: `${Math.round(
              ((currentStep + (completedSteps.length > 0 ? 1 : 0)) / steps.length) * 100
            )}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default AnamnesisNavigation;
