'use client';

import { useId } from 'react';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helpText,
  children, // Destructurar children aquí
  ...rest // Usar ...rest para el resto de las props
}) {
  // Mover todas las llamadas a useId al inicio del componente, incondicionalmente
  const inputId = useId();
  const helpTextId = useId(); // Ya no es condicional
  const errorId = useId(); // Ya no es condicional

  // Construir la cadena para aria-describedby
  const describedBy = [helpText ? helpTextId : undefined, error ? errorId : undefined].filter(Boolean).join(' ');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default action (e.g., form submission)
    }
    if (rest.onKeyDown) { // Call original onKeyDown if it exists
      rest.onKeyDown(event);
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block mb-1 text-sm font-medium text-neutral-dark">
        {label}
      </label>
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown} // Add the new handler
        aria-describedby={describedBy || undefined}
        aria-invalid={!!error}
        className={`w-full px-3 py-2 border rounded-md shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-primary
                    ${error ? 'border-destructive focus:ring-destructive' : 'border-neutral-light focus:border-neutral-DEFAULT'}`}
        {...rest} // Pasar ...rest al input
      />
      {helpText && (
        <p id={helpTextId} className="mt-1 text-xs text-neutral-DEFAULT">
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-destructive-dark" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
