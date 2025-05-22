'use client';

import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const ProfileUpdateNotification = ({ message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration === Infinity) return; // Do not auto-close if duration is Infinity

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="bg-green-500 text-white font-semibold py-3 px-5 rounded-lg shadow-lg flex items-center space-x-3">
        <CheckCircleIcon className="h-6 w-6" />
        <span>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) {
              onClose();
            }
          }}
          className="text-white hover:text-green-100"
          aria-label="Cerrar notificación"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ProfileUpdateNotification;
