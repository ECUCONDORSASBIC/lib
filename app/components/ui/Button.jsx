'use client';


const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // e.g., primary, secondary, danger
  size = 'md', // e.g., sm, md, lg
  disabled = false,
  loading = false, // New prop for loading state
  loadingText = 'Guardando...', // New prop for loading text
  className = '',
  // ... any other props
}) => {
  const baseStyle = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150';
  const variantStyles = {
    primary: `bg-sky-400 hover:bg-sky-500 text-white focus:ring-sky-300 ${disabled || loading ? 'bg-sky-300 hover:bg-sky-300 cursor-not-allowed' : ''}`,
    secondary: `bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500 ${disabled || loading ? 'bg-gray-100 hover:bg-gray-100 cursor-not-allowed' : ''}`,
    danger: `bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 ${disabled || loading ? 'bg-red-400 hover:bg-red-400 cursor-not-allowed' : ''}`,
    // Add more variants as needed
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    // ... any other props
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
