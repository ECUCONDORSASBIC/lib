'use client';


const StickyProgressBar = ({ currentStep, totalSteps, title = "Progreso del Formulario" }) => {
  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md p-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-700">{title}</h3>
        <span className="text-sm text-gray-600">{`${currentStep} de ${totalSteps} completado`}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StickyProgressBar;
