'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * AnamnesisProgress - A component that shows progress through anamnesis sections
 * with navigation capabilities and visual feedback
 *
 * @param {Object} props
 * @param {Array<Object>} props.steps - Array of step objects with id and title
 * @param {Array<string>} props.completedSteps - Array of completed step IDs
 * @param {number} props.currentStep - Current active step index
 * @param {Function} props.onStepClick - Callback when a step is clicked (receives step index)
 * @param {boolean} props.canNavigate - Whether navigation between steps is allowed
 */
export default function AnamnesisProgress({
  steps = [],
  completedSteps = [],
  currentStep = 0,
  onStepClick = () => { },
  canNavigate = true
}) {
  const [scrollable, setScrollable] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);
  const progressBarRef = useRef(null);

  // Calculate completion percentage
  const completionPercentage = steps.length > 0
    ? Math.round((completedSteps.length / steps.length) * 100)
    : 0;

  // Check if scroll controls are needed
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollable(scrollWidth > clientWidth);
    }
  }, [steps]);

  // Handle scrolling
  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = direction === 'left' ? -200 : 200;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });

    // Update scroll position for UI
    setScrollPosition(container.scrollLeft + scrollAmount);
  };

  // Update scroll position on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScrollEvent = () => {
      setScrollPosition(container.scrollLeft);
    };

    container.addEventListener('scroll', handleScrollEvent);
    return () => {
      container.removeEventListener('scroll', handleScrollEvent);
    };
  }, []);

  // Scroll to the current step when it changes
  useEffect(() => {
    if (scrollContainerRef.current && steps[currentStep]) {
      const container = scrollContainerRef.current;
      const stepElement = container.querySelector(`[data-step-index="${currentStep}"]`);

      if (stepElement) {
        // Calculate position to center the element in the container
        const elementCenterPosition = stepElement.offsetLeft + stepElement.offsetWidth / 2;
        const containerCenter = container.offsetWidth / 2;
        const scrollPosition = elementCenterPosition - containerCenter;

        // Smooth scroll to position
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    }
  }, [currentStep, steps]);

  return (
    <div className="relative bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Progress bar at the top */}
      <div className="h-1.5 bg-gray-100 w-full overflow-hidden" ref={progressBarRef}>
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: '0%' }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Mobile progress indicator */}
      <div className="md:hidden px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">
            Paso {currentStep + 1} de {steps.length}
          </div>
          <div className="text-sm font-medium text-blue-600">
            {completionPercentage}% completado
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {steps[currentStep]?.title || 'Sección actual'}
        </div>
      </div>

      {/* Steps navigation */}
      <div className="relative">
        {/* Left scroll button */}
        {scrollable && scrollPosition > 0 && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-75 rounded-r-full p-1 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Steps container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center overflow-x-auto overflow-y-hidden scrollbar-hide snap-x pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex px-2 py-2 space-x-1 min-w-full justify-center md:justify-start">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStep;
              const isClickable = canNavigate && (isCompleted || isCurrent);

              return (
                <div
                  key={step.id}
                  data-step-index={index}
                  className="snap-start"
                >
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick(index)}
                    className={`
                      flex items-center px-3 py-2 rounded-full transition-colors whitespace-nowrap
                      ${isCurrent ? 'bg-blue-100 text-blue-800' :
                        isCompleted ? 'bg-green-50 text-green-800 hover:bg-green-100' :
                          'bg-gray-50 text-gray-400'}
                      ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                    `}
                    disabled={!isClickable}
                  >
                    <span className={`
                      flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs
                      ${isCurrent ? 'bg-blue-600 text-white' :
                        isCompleted ? 'bg-green-600 text-white' :
                          'bg-gray-200 text-gray-500'}
                    `}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="text-sm font-medium">
                      {step.title}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right scroll button */}
        {scrollable && scrollContainerRef.current &&
          scrollPosition < (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10) && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-75 rounded-l-full p-1 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
      </div>
    </div>
  );
}
