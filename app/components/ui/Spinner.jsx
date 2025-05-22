'use client';


export function Spinner({ className = '', size = 'md', ...props }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={"inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent " + sizeClass + " " + className}
      role="status"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
