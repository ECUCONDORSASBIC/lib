'use client';

import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { I18nextProvider, initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import { fallbackLng, getOptions, languages } from './i18n-options';

// Initialize i18next for client-side
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language, namespace) => {
    // Use a try-catch to prevent errors from breaking the app loading
    try {
      const validLanguage = languages.includes(language) ? language : fallbackLng;
      return import(`../public/locales/${validLanguage}/${namespace}.json`).catch(() => {
        console.warn(`Could not load ${validLanguage}/${namespace}, falling back to ${fallbackLng}`);
        return import(`../public/locales/${fallbackLng}/${namespace}.json`);
      });
    } catch (err) {
      console.error('Error loading language resource:', err);
      return import(`../public/locales/${fallbackLng}/${namespace}.json`);
    }
  }))
  .init({
    ...getOptions(),
    detection: {
      order: ['cookie', 'navigator', 'path'],
      lookupCookie: 'i18next',
      caches: ['cookie'],
      cookieExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    }
  });

export function useTranslation(namespace = 'common') {
  const { t, i18n } = useTranslationOrg(namespace);
  const [currentLang, setCurrentLang] = useState(i18n.language || fallbackLng);

  // Sync state with i18n language changes
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLang(lng || fallbackLng);
      document.documentElement.lang = lng || fallbackLng;
      console.log(`Language changed to: ${lng}`);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Enhanced changeLanguage function with better error handling
  const changeLanguage = (newLanguage) => {
    if (!languages.includes(newLanguage)) {
      console.warn(`Attempted to change to unsupported language: ${newLanguage}`);
      newLanguage = fallbackLng;
    }

    try {
      i18n.changeLanguage(newLanguage);
      Cookies.set('i18next', newLanguage, {
        expires: 365,
        sameSite: 'lax',
        path: '/'
      });
      console.log(`Language successfully changed to: ${newLanguage}`);
    } catch (error) {
      console.error(`Error changing language to ${newLanguage}:`, error);
    }
  };

  return {
    t,
    i18n,
    language: currentLang,
    changeLanguage
  };
}

// TranslationProvider component
export function TranslationProvider({ children }) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);

    // Check if i18next is initialized
    if (i18next.isInitialized) {
      setIsLoading(false);
    } else {
      // Listen for initialization completion
      const handleInitialized = () => {
        setIsLoading(false);
        console.log('i18next has been initialized');
      };

      i18next.on('initialized', handleInitialized);
      return () => {
        i18next.off('initialized', handleInitialized);
      };
    }
  }, []);

  // Minimalist loading placeholder when translations aren't ready yet
  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 rounded-full border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
}
