'use client';

const Checkbox = ({ label, checked, onChange, name, className = '', disabled, ...props }) => {
  return (
    <label htmlFor={name} className={`flex items-center space-x-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        {...props}
      />
      {label && <span className="text-gray-700 select-none">{label}</span>}
    </label>
  );
};

export default Checkbox;
