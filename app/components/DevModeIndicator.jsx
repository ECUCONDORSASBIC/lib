'use client';

export default function DevModeIndicator() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium z-50 flex items-center">
      <span className="w-2 h-2 bg-yellow-900 rounded-full mr-1 animate-pulse"></span>
      DESARROLLO
    </div>
  );
}
