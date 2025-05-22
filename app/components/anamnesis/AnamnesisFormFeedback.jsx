'use client';

import React from 'react';
import { useTranslation } from '@/app/i18n';
import { 
  MdInfo, 
  MdError, 
  MdCheckCircle, 
  MdWarning, 
  MdRefresh,
  MdSyncProblem, 
  MdLockClock 
} from 'react-icons/md';

/**
 * Componente para mostrar feedback visual durante el proceso de captura de anamnesis
 * Proporciona mensajes claros según estados de guardado, error, sincronización y validación
 */
const AnamnesisFormFeedback = ({ 
  loading, 
  saving, 
  error, 
  syncError, 
  syncInProgress, 
  lastSaved,
  validationErrors,
  retrySave,
  retryLoad,
  showSavedConfirmation = true
}) => {
  const { t } = useTranslation('common');

  // No mostrar si no hay estado a mostrar
  if (!loading && !saving && !error && !syncError && !validationErrors && !syncInProgress && (!lastSaved || !showSavedConfirmation)) {
    return null;
  }

  return (
    <div className="anamnesis-feedback">
      {/* Loading state */}
      {loading && (
        <div className="flex items-center p-2 mb-3 bg-blue-50 text-blue-700 rounded">
          <div className="mr-2 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span>{t('feedback.loading')}</span>
        </div>
      )}

      {/* Saving state */}
      {saving && (
        <div className="flex items-center p-2 mb-3 bg-blue-50 text-blue-700 rounded">
          <div className="mr-2 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span>{t('feedback.saving')}</span>
        </div>
      )}

      {/* Sync in progress */}
      {syncInProgress && (
        <div className="flex items-center p-2 mb-3 bg-blue-50 text-blue-700 rounded">
          <div className="mr-2 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span>{t('feedback.synchronizing')}</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between p-2 mb-3 bg-red-50 text-red-700 rounded">
          <div className="flex items-center">
            <MdError className="mr-2 text-red-600" />
            <span>{error}</span>
          </div>
          {retryLoad && (
            <button 
              onClick={retryLoad} 
              className="ml-auto px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded"
              aria-label={t('feedback.tryAgain')}
            >
              <MdRefresh />
            </button>
          )}
        </div>
      )}

      {/* Sync error state */}
      {syncError && (
        <div className="flex items-center justify-between p-2 mb-3 bg-orange-50 text-orange-700 rounded">
          <div className="flex items-center">
            <MdSyncProblem className="mr-2 text-orange-600" />
            <span>{syncError}</span>
          </div>
          {retrySave && (
            <button 
              onClick={retrySave}
              className="ml-auto px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 rounded"
              aria-label={t('feedback.tryAgain')}
            >
              <MdRefresh />
            </button>
          )}
        </div>
      )}

      {/* Validation errors */}
      {validationErrors && (
        <div className="p-2 mb-3 bg-yellow-50 text-yellow-700 rounded">
          <div className="flex items-center mb-1">
            <MdWarning className="mr-2 text-yellow-600" />
            <span>{t('form.validationError')}</span>
          </div>
          <ul className="ml-6 text-sm list-disc">
            {Array.isArray(validationErrors) ? (
              validationErrors.map((err, i) => <li key={i}>{err}</li>)
            ) : (
              <li>{validationErrors}</li>
            )}
          </ul>
        </div>
      )}

      {/* Last saved confirmation */}
      {lastSaved && showSavedConfirmation && !error && !syncError && !saving && !loading && (
        <div className="flex items-center p-2 mb-3 bg-green-50 text-green-700 rounded">
          <MdCheckCircle className="mr-2 text-green-600" />
          <span>
            <span className="font-medium">{t('feedback.successful')}: </span>
            <span className="text-sm">
              {typeof lastSaved === 'string' ? (
                lastSaved
              ) : (
                <span className="flex items-center">
                  <MdLockClock className="mr-1" />
                  {new Date().toLocaleTimeString()}
                </span>
              )}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

export default AnamnesisFormFeedback;
