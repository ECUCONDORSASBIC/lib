'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Manejo de tecla Escape
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  // Manejo de clic fuera del modal
  const handleBackdropClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // Guardar el elemento activo actual para restaurar el foco después
      previousActiveElement.current = document.activeElement;

      // Añadir listeners
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleBackdropClick);

      // Prevenir scroll en el body
      document.body.style.overflow = 'hidden';

      // Enfocar el modal (para lectores de pantalla)
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }

    return () => {
      // Limpiar listeners
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleBackdropClick);

      // Restaurar scroll
      document.body.style.overflow = '';

      // Devolver foco al elemento anterior
      if (isOpen && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleEscapeKey, handleBackdropClick]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto focus:outline-none animate-scaleIn`}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
