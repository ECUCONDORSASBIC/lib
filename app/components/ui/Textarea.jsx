
const Textarea = ({
  label,
  name,
  value,
  onChange,
  className = '',
  rows = 3,
  required = false,
  placeholder = '',
  tooltip,
  ...props
}) => (
  <div className={`mb-2 ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
        {label}
        {required && <span className="text-red-500">*</span>}
        {tooltip && (
          <span className="ml-1 text-xs text-gray-400" title={tooltip}>ⓘ</span>
        )}
      </label>
    )}
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      rows={rows}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
      {...props}
    />
  </div>
);

export default Textarea;
