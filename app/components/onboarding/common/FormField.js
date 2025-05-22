
const FormField = ({ id, label, type = 'text', name, value, onChange, error, placeholder, required, options }) => {
  const commonProps = {
    id: id || name,
    name: name,
    value: value || '',
    onChange: onChange,
    placeholder: placeholder,
    required: required,
    className: `mt-1 block w-full px-3 py-2 bg-white border text-gray-900 ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`,
  };

  if (type === 'select') {
    return (
      <div className="mb-4">
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <select {...commonProps}>
          <option value="">{placeholder || 'Seleccione una opción'}</option>
          {options && options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="mb-4">
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <textarea {...commonProps} rows={3}></textarea>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor={id || name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} {...commonProps} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;
