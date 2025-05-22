
export function Alert({ variant = 'default', className = '', children, ...props }) {
  const base = 'rounded border p-4 mb-2';
  const variants = {
    default: 'border-gray-300 bg-white',
    destructive: 'border-red-300 bg-red-50 text-red-800',
    success: 'border-green-200 bg-green-50 text-green-800',
  };
  return (
    <div className={`${base} ${variants[variant] || ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = '' }) {
  return <div className={`font-bold mb-1 ${className}`}>{children}</div>;
}

export function AlertDescription({ children, className = '' }) {
  return <div className={`text-sm ${className}`}>{children}</div>;
}
