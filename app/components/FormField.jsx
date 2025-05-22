import { forwardRef } from 'react';

export const FormField = forwardRef(
  ({ id, label, help, error, required, type = 'text', options, value, onChange, ...props }, ref) => {
    const inputId = `field-${id}`;
    const helpId = help ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(' ');

    const sharedProps = {
      id: inputId,
      name: id,
      'aria-describedby': describedBy || undefined,
      'aria-required': required,
      'aria-invalid': error ? true : undefined,
      onChange,
      ...props
    }; const inputClassName = `w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 ${error
      ? 'border-red-500 text-red-900 placeholder-red-400 focus:ring-red-600 focus:border-red-600'
      : 'border-gray-400'
      }`;

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-900"
        >
          {label}
          {required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}
        </label>

        {type === 'textarea' ? (
          <textarea
            ref={ref}
            className={inputClassName}
            value={value}
            {...sharedProps}
          />
        ) : type === 'select' ? (
          <select
            ref={ref}
            className={inputClassName}
            value={value}
            {...sharedProps}
          >
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'checkbox' ? (
          <div className="flex items-center">
            <input
              ref={ref}
              type="checkbox"
              checked={value}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              {...sharedProps}
            />
          </div>
        ) : (
          <input
            ref={ref}
            type={type}
            className={inputClassName}
            value={value}
            {...sharedProps}
          />
        )}

        {help && (
          <p id={helpId} className="mt-1 text-xs text-gray-500">
            {help}
          </p>
        )}

        {error && (
          <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
