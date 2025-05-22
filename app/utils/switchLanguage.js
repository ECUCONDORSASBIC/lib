'use client';

import Cookies from 'js-cookie';
import { fallbackLng, languages } from '../i18n-options';

/**
 * Helper utility to switch language from anywhere in the application
 * @param {string} newLanguage - The language code to switch to
 * @param {boolean} reloadPage - Whether to reload the page after switching (default: true)
 * @returns {boolean} - Whether the language was successfully changed
 */
export function switchLanguage(newLanguage, reloadPage = true) {
  if (!languages.includes(newLanguage)) {
    console.warn(`Attempted to change to unsupported language: ${newLanguage}`);
    newLanguage = fallbackLng;
  }

  try {
    // Set the cookie
    Cookies.set('i18next', newLanguage, {
      expires: 365,
      sameSite: 'lax',
      path: '/'
    });

    // Update HTML lang attribute
    document.documentElement.lang = newLanguage;

    // Log success
    console.log(`Language successfully changed to: ${newLanguage}`);

    // Optionally reload page to ensure all content is properly translated
    if (reloadPage) {
      window.location.reload();
    }

    return true;
  } catch (error) {
    console.error(`Error changing language to ${newLanguage}:`, error);
    return false;
  }
}

/**
 * Get the current language from cookies or browser settings
 * @returns {string} - The current language code
 */
export function getCurrentLanguage() {
  const cookieLang = Cookies.get('i18next');
  if (cookieLang && languages.includes(cookieLang)) {
    return cookieLang;
  }

  // Try to detect from browser
  const browserLang = navigator.language.split('-')[0];
  if (languages.includes(browserLang)) {
    return browserLang;
  }

  return fallbackLng;
}
