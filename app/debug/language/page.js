'use client';

import { useTranslation } from '@/app/i18n';
import { fallbackLng, languages } from '@/app/i18n-options';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

export default function LanguageDebug() {
  const { t, i18n, language, changeLanguage } = useTranslation();
  const [browserLanguage, setBrowserLanguage] = useState('');
  const [cookieLanguage, setCookieLanguage] = useState('');
  const [htmlLanguage, setHtmlLanguage] = useState('');
  const [availableNamespaces, setAvailableNamespaces] = useState([]);

  useEffect(() => {
    // Get browser language
    setBrowserLanguage(navigator.language || navigator.userLanguage || 'unknown');

    // Get language from cookie
    setCookieLanguage(Cookies.get('i18next') || 'not set');

    // Get HTML lang attribute
    setHtmlLanguage(document.documentElement.lang || 'not set');

    // Get available namespaces
    setAvailableNamespaces(i18n.options.ns || []);
  }, [i18n]);

  const setLanguage = (lang) => {
    changeLanguage(lang);
    location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Language Debugging Panel</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current Language Settings</h2>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-medium">Active Language:</td>
              <td className="py-2">{language}</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-medium">Browser Language:</td>
              <td className="py-2">{browserLanguage}</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-medium">Cookie Language:</td>
              <td className="py-2">{cookieLanguage}</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-medium">HTML Lang Attribute:</td>
              <td className="py-2">{htmlLanguage}</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-medium">Fallback Language:</td>
              <td className="py-2">{fallbackLng}</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-medium">Available Namespaces:</td>
              <td className="py-2">{availableNamespaces.join(', ')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Switch Language</h2>
        <div className="flex space-x-2">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${language === lang
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Translation Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
            <h3 className="font-medium mb-2">Header Keys</h3>
            <ul className="space-y-1">
              <li>home: {t('header.home')}</li>
              <li>dashboard: {t('header.dashboard')}</li>
              <li>patients: {t('header.patients')}</li>
              <li>logout: {t('header.logout')}</li>
            </ul>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
            <h3 className="font-medium mb-2">Auth Keys</h3>
            <ul className="space-y-1">
              <li>signIn: {t('auth.signIn')}</li>
              <li>signUp: {t('auth.signUp')}</li>
              <li>email: {t('auth.email')}</li>
              <li>password: {t('auth.password')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
        <p className="text-sm">
          This page is designed to help diagnose language issues in the application.
          You can use it to verify that translations are loading correctly and to manually
          switch between languages.
        </p>
      </div>
    </div>
  );
}
