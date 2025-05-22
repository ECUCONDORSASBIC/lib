"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.switchLanguage = switchLanguage;
exports.getCurrentLanguage = getCurrentLanguage;

var _jsCookie = _interopRequireDefault(require("js-cookie"));

var _i18nOptions = require("../i18n-options");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Helper utility to switch language from anywhere in the application
 * @param {string} newLanguage - The language code to switch to
 * @param {boolean} reloadPage - Whether to reload the page after switching (default: true)
 * @returns {boolean} - Whether the language was successfully changed
 */
function switchLanguage(newLanguage) {
  var reloadPage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  if (!_i18nOptions.languages.includes(newLanguage)) {
    console.warn("Attempted to change to unsupported language: ".concat(newLanguage));
    newLanguage = _i18nOptions.fallbackLng;
  }

  try {
    // Set the cookie
    _jsCookie["default"].set('i18next', newLanguage, {
      expires: 365,
      sameSite: 'lax',
      path: '/'
    }); // Update HTML lang attribute


    document.documentElement.lang = newLanguage; // Log success

    console.log("Language successfully changed to: ".concat(newLanguage)); // Optionally reload page to ensure all content is properly translated

    if (reloadPage) {
      window.location.reload();
    }

    return true;
  } catch (error) {
    console.error("Error changing language to ".concat(newLanguage, ":"), error);
    return false;
  }
}
/**
 * Get the current language from cookies or browser settings
 * @returns {string} - The current language code
 */


function getCurrentLanguage() {
  var cookieLang = _jsCookie["default"].get('i18next');

  if (cookieLang && _i18nOptions.languages.includes(cookieLang)) {
    return cookieLang;
  } // Try to detect from browser


  var browserLang = navigator.language.split('-')[0];

  if (_i18nOptions.languages.includes(browserLang)) {
    return browserLang;
  }

  return _i18nOptions.fallbackLng;
}