'use client';

import { useTranslation } from '@/app/i18n';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  tooltip,
  placeholder,
  rows = 3,
  options = [],
  error,
  translationNamespace
}) => {
  const { t } = useTranslation(translationNamespace || 'common');

  // Translate label and placeholder if they're translation keys
  const translatedLabel = label && label.startsWith('form.') ? t(label) : label;
  const translatedPlaceholder = placeholder && placeholder.startsWith('form.') ? t(placeholder) : placeholder;
  const translatedTooltip = tooltip && tooltip.startsWith('form.') ? t(tooltip) : tooltip;

  return (
    <div className="mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1.5">
        <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700 sm:text-base sm:mb-0">
          {translatedLabel} {required && <span className="text-red-500">*</span>}
        </label>

        {tooltip && (
          <div className="relative flex mt-1 group sm:mt-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 cursor-help" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <span className="absolute z-10 hidden w-64 p-2 mb-2 text-xs text-white transform -translate-x-1/2 bg-gray-800 rounded shadow-lg bottom-full left-1/2 group-hover:block">
              {translatedTooltip}
              <div className="absolute -mt-1 transform -translate-x-1/2 border-t-0 border-b-4 border-l-4 border-r-4 border-transparent top-full left-1/2 border-b-gray-800"></div>
            </span>
          </div>
        )}
      </div>

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          rows={rows}
          placeholder={translatedPlaceholder}
          className="mt-1 block w-full px-3 py-2.5 rounded-md shadow-sm bg-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm border border-gray-300"
          required={required}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="mt-1 block w-full px-3 py-2.5 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm border border-gray-300"
          required={required}
        >
          <option value="">{t('form.select')}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label.startsWith('form.') ? t(option.label) : option.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="mt-1.5">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={value || false}
              onChange={onChange}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required={required}
            />
            <span className="ml-2.5 text-base sm:text-sm text-gray-700">{translatedLabel}</span>
          </label>
        </div>
      ) : type === 'radio-group' ? (
        <div className="flex flex-col mt-2 space-y-3 sm:space-y-2">
          {options.map(option => (
            <label key={option.value} className="inline-flex items-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                className="w-5 h-5 text-blue-600 border-gray-300 form-radio focus:ring-blue-500"
              />
              <span className="ml-2.5 text-base sm:text-sm text-gray-700">
                {option.label.startsWith('form.') ? t(option.label) : option.label}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={translatedPlaceholder}
          className="mt-1 block w-full px-3 py-2.5 rounded-md shadow-sm bg-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm border border-gray-300"
          required={required}
        />
      )}

      {error && (
        <p className="mt-1.5 text-sm font-medium text-red-600">
          {error.startsWith && error.startsWith('error.') ? t(error) : error}
        </p>
      )}
    </div>
  );
};

export default FormField;
