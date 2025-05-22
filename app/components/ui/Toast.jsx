'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Toast context
const ToastContext = createContext();

// Toast types with corresponding styles
const TOAST_TYPES = {
  success: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
  },
  error: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
};

// Toast item component
const ToastItem = ({ id, message, type = 'info', onClose, autoClose = true }) => {
  const toastStyle = TOAST_TYPES[type] || TOAST_TYPES.info;

  // Auto close after 5 seconds
  if (autoClose) {
    setTimeout(() => {
      onClose(id);
    }, 5000);
  }

  return (
    <div className={`flex items-center p-4 mb-3 rounded-md shadow-md ${toastStyle.bgColor}`}>
      <div className={`mr-3 ${toastStyle.iconColor}`}>{toastStyle.icon}</div>
      <div className={`flex-1 ${toastStyle.textColor}`}>{message}</div>
      <button
        onClick={() => onClose(id)}
        className="ml-3 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// Toast container
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  // Add a new toast
  const addToast = useCallback(
    (message, type = 'info', autoClose = true) => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prevToasts) => [...prevToasts, { id, message, type, autoClose }]);
      return id;
    },
    []
  );

  // Remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Helper methods for different toast types
  const success = useCallback(
    (message, autoClose = true) => addToast(message, 'success', autoClose),
    [addToast]
  );

  const error = useCallback(
    (message, autoClose = true) => addToast(message, 'error', autoClose),
    [addToast]
  );

  const warning = useCallback(
    (message, autoClose = true) => addToast(message, 'warning', autoClose),
    [addToast]
  );

  const info = useCallback(
    (message, autoClose = true) => addToast(message, 'info', autoClose),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-50 w-80 max-w-full">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
            autoClose={toast.autoClose}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook for using toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Standalone Toast component for direct use in components
export const Toast = ({ message, type = 'info', onClose }) => {
  const toastStyle = TOAST_TYPES[type] || TOAST_TYPES.info;

  // Auto close after 5 seconds if no onClose handler is provided
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-full">
      <div className={`flex items-center p-4 mb-3 rounded-md shadow-md ${toastStyle.bgColor}`}>
        <div className={`mr-3 ${toastStyle.iconColor}`}>{toastStyle.icon}</div>
        <div className={`flex-1 ${toastStyle.textColor}`}>{message}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
