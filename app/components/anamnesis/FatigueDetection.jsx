'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * FatigueDetection - A component that monitors user activity patterns to detect possible cognitive fatigue
 * and suggests taking breaks to avoid form abandonment
 *
 * @param {Object} props
 * @param {number} props.sessionDuration - Current duration of the session in seconds
 * @param {number} props.timeBetweenInputs - Time since last user input in milliseconds
 * @param {number|Array<string>} props.completedSections - Number or list of completed sections
 * @param {number} props.totalSections - Total number of sections
 * @param {Function} props.onPauseSuggested - Callback when a pause is suggested
 * @param {Function} props.onFatigueDetected - Callback when fatigue is detected
 * @param {Function} props.onDismiss - Callback when notification is dismissed
 * @param {string} props.dismissedId - ID of a dismissed notification to prevent showing it again
 */
export default function FatigueDetection({
  sessionDuration = 0,
  timeBetweenInputs = 0,
  completedSections = 0,
  totalSections = 1,
  onPauseSuggested = () => { },
  onFatigueDetected = () => { },
  onDismiss = () => { },
  dismissedId = ''
}) {
  const [shouldShowNotification, setShouldShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(null);
  const [lastNotificationTimestamp, setLastNotificationTimestamp] = useState(0);

  // Determine the number of completed sections if provided as an array
  const completedCount = Array.isArray(completedSections) ? completedSections.length : completedSections;

  // Calculate progress percentage
  const progressPercentage = Math.round((completedCount / totalSections) * 100);

  // Check for signs of cognitive fatigue
  useEffect(() => {
    // Don't show notifications too frequently
    const notificationCooldown = 120000; // 2 minutes
    const now = Date.now();
    if (now - lastNotificationTimestamp < notificationCooldown) {
      return;
    }

    // If this specific notification has been dismissed already, don't show it again
    if (dismissedId === 'fatigue-banner') {
      return;
    }

    // Long session (over 15 minutes) with less than 50% progress
    if (sessionDuration > 900 && progressPercentage < 50) {
      setNotificationType('long-session');
      setShouldShowNotification(true);
      setLastNotificationTimestamp(now);
      onFatigueDetected('long-session');
      return;
    }

    // Long time without interaction (over 3 minutes)
    if (timeBetweenInputs > 180000) {
      setNotificationType('inactivity');
      setShouldShowNotification(true);
      setLastNotificationTimestamp(now);
      onFatigueDetected('inactivity');
      return;
    }

    // Rapidly clicking through sections without completing
    if (sessionDuration < 120 && completedCount < 1 &&
      sessionDuration > 0 && sessionDuration % 30 === 0) {
      setNotificationType('rapid-clicking');
      setShouldShowNotification(true);
      setLastNotificationTimestamp(now);
      onFatigueDetected('rapid-clicking');
      return;
    }

    // Good progress, encourage taking a break after 20 minutes
    if (sessionDuration > 1200 && sessionDuration % 1200 < 10 && progressPercentage >= 40) {
      setNotificationType('break-reminder');
      setShouldShowNotification(true);
      setLastNotificationTimestamp(now);
      return;
    }
  }, [sessionDuration, timeBetweenInputs, completedCount, progressPercentage,
    lastNotificationTimestamp, dismissedId, onFatigueDetected]);

  // Handle dismissing notification
  const handleDismiss = () => {
    setShouldShowNotification(false);
    onDismiss('fatigue-banner');
  };

  // Handle pause button
  const handlePause = () => {
    setShouldShowNotification(false);
    onPauseSuggested();
  };

  if (!shouldShowNotification) return null;

  // Notification content based on type
  const notificationContent = (() => {
    switch (notificationType) {
      case 'long-session':
        return {
          title: 'Sesión prolongada detectada',
          message: 'Has estado completando el formulario durante un tiempo considerable. ¿Te gustaría hacer una pausa y continuar más tarde?',
          icon: 'clock'
        };
      case 'inactivity':
        return {
          title: 'Parece que tomaste un descanso',
          message: 'No hemos detectado actividad por un tiempo. ¿Deseas guardar tu progreso y continuar más tarde?',
          icon: 'pause'
        };
      case 'rapid-clicking':
        return {
          title: 'Navegación rápida detectada',
          message: 'Hemos detectado que estás navegando rápidamente por las secciones. ¿Necesitas ayuda o prefieres tomar un descanso?',
          icon: 'question'
        };
      case 'break-reminder':
        return {
          title: '¡Buen progreso! ¿Qué tal un descanso?',
          message: 'Has avanzado bastante. Un breve descanso podría ayudarte a mantener la concentración.',
          icon: 'check'
        };
      default:
        return {
          title: 'Notificación',
          message: 'Tenemos una nueva notificación para ti.',
          icon: 'info'
        };
    }
  })();

  const iconMap = {
    'clock': (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    'pause': (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    'question': (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    'check': (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    'info': (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2h.01a1 1 0 100 2H10z" clipRule="evenodd" />
      </svg>
    )
  };

  const getBannerColor = () => {
    switch (notificationType) {
      case 'long-session':
        return 'bg-amber-50 border-amber-200';
      case 'inactivity':
        return 'bg-blue-50 border-blue-200';
      case 'rapid-clicking':
        return 'bg-purple-50 border-purple-200';
      case 'break-reminder':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <AnimatePresence>
      {shouldShowNotification && (
        <motion.div
          data-testid="fatigue-notification"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-auto rounded-lg shadow-lg border ${getBannerColor()} p-4`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {iconMap[notificationContent.icon]}
            </div>
            <div className="flex-1 ml-3">
              <h3 data-testid="fatigue-notification-title" className="text-sm font-medium">{notificationContent.title}</h3>
              <p data-testid="fatigue-notification-message" className="mt-1 text-xs text-gray-600">{notificationContent.message}</p>
              <div className="flex mt-3 space-x-3">
                {(notificationType === 'long-session' || notificationType === 'inactivity') && (
                  <button
                    data-testid="fatigue-notification-pause-button"
                    onClick={handlePause}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-blue-800"
                  >
                    Guardar y pausar
                  </button>
                )}
                <button
                  data-testid="fatigue-notification-dismiss-button"
                  onClick={handleDismiss}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-gray-700"
                >
                  {notificationType === 'break-reminder' ? 'Continuar trabajando' : 'Continuar'}
                </button>
              </div>
            </div>
            <div className="flex flex-shrink-0 ml-4">
              <button
                data-testid="fatigue-notification-close-button"
                onClick={handleDismiss}
                className="inline-flex text-gray-400 bg-transparent rounded-md hover:text-gray-500"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
