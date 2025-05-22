// components/onboarding/OnboardingStepLayout.jsx
"use client";

export default function OnboardingStepLayout({
  title,
  children,
  onNext,
  onPrevious,
  nextDisabled,
  prevDisabled,
  nextLabel = "Siguiente",
  prevLabel = "Anterior",
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <header className="bg-slate-800 p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-white">
            {title || "Proceso de Onboarding"}
          </h1>
        </header>

        <main className="p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
          {children}
        </main>

        <footer className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              disabled={prevDisabled}
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium tracking-wide text-gray-700 capitalize transition-colors duration-300 transform bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prevLabel}
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {nextLabel}
            </button>
          )}
        </footer>
      </div>
      <p className="mt-8 text-center text-sm text-gray-400">
        Altamedica Onboarding &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
