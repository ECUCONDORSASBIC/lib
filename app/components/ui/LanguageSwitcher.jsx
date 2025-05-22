'use client';

import { useTranslation } from '@app/i18n';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function LanguageSwitcher() {
  const { t, language, changeLanguage } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage = language || 'en';
  const dropdownRef = useRef(null);

  const switchLanguage = async (newLanguage) => {
    if (newLanguage !== currentLanguage) {
      try {
        await changeLanguage(newLanguage);
        // Forzar recarga de la página para asegurar que los cambios se apliquen
        window.location.reload();
      } catch (error) {
        console.error('Error al cambiar el idioma:', error);
      }
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languageOptions = [
    { code: 'en', name: t('languageSwitcher.english'), flag: '🇺🇸' },
    { code: 'es', name: t('languageSwitcher.spanish'), flag: '🇪🇸' }
  ];

  const currentLanguageOption = languageOptions.find(option => option.code === currentLanguage) || languageOptions[0];
  return (
    <div className="relative language-switcher" ref={dropdownRef}>
      <button
        className="flex items-center px-3 py-2 space-x-2 transition-all duration-200 rounded-full bg-white shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={t('languageSwitcher.switchLanguage')}
        title={t('languageSwitcher.switchLanguage')}
      >
        <GlobeAltIcon className="w-5 h-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {currentLanguageOption.code.toUpperCase()}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          aria-hidden="true"
        />
        <span className="sr-only">{t('languageSwitcher.switchLanguage')}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 z-50 w-48 mt-2 overflow-hidden bg-white rounded-lg shadow-xl top-full ring-1 ring-black ring-opacity-5"
          >
            <div className="py-1">
              {languageOptions.map((option) => (
                <motion.button
                  key={option.code}
                  whileHover={{ x: 2 }}
                  onClick={() => switchLanguage(option.code)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
                    currentLanguage === option.code
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-current={currentLanguage === option.code ? 'true' : 'false'}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg" aria-hidden="true">{option.flag}</span>
                    <span>{option.name}</span>
                  </div>
                  {currentLanguage === option.code && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
