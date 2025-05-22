'use client';

import React from 'react';
import { useTranslation } from '@/app/i18n';
import { MdWarning } from 'react-icons/md';

/**
 * Banner para alertar al usuario cuando una funcionalidad está en fase experimental.
 * 
 * @param {Object} props
 * @param {string} props.featureName - Nombre de la característica experimental (opcional)
 * @param {string} props.customMessage - Mensaje personalizado (opcional)
 * @param {string} props.severity - Nivel de severidad ('warning', 'info', 'danger'), por defecto 'warning'
 * @param {boolean} props.dismissible - Si el banner puede cerrarse
 * @param {Function} props.onDismiss - Función a llamar cuando se cierra el banner
 */
const ExperimentalFeatureBanner = ({ 
  featureName,
  customMessage,
  severity = 'warning',
  dismissible = false,
  onDismiss
}) => {
  const { t } = useTranslation('common');
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  // Configuración de color según severidad
  const colorClasses = {
    warning: 'bg-yellow-50 border-yellow-100 text-yellow-800 border-l-4 border-yellow-500',
    info: 'bg-blue-50 border-blue-100 text-blue-800 border-l-4 border-blue-500',
    danger: 'bg-red-50 border-red-100 text-red-800 border-l-4 border-red-500'
  };

  // Iconos según severidad
  const icons = {
    warning: <MdWarning className="text-yellow-600 mr-2" />,
    info: <MdWarning className="text-blue-600 mr-2" />,
    danger: <MdWarning className="text-red-600 mr-2" />
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const message = customMessage || 
    (featureName 
      ? t('experimentalFeatureWithName', { featureName })
      : t('experimentalFeature'));

  return (
    <div className={`p-3 ${colorClasses[severity] || colorClasses.warning} flex items-center justify-between`}>
      <div className="flex items-center">
        {icons[severity]}
        <span className="text-sm font-medium">
          {message}
        </span>
      </div>
      
      {dismissible && (
        <button 
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700"
          aria-label={t('dismiss')}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ExperimentalFeatureBanner;
