"use strict";
'use client'; // services/healthMetricsService.js

/**
 * Adds a blood pressure reading to a patient's record
 * @param {string} patientId - The ID of the patient
 * @param {Object} readingData - The blood pressure reading data
 * @returns {Promise<Object>} - A promise that resolves to the created reading
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addLipidProfile = exports.addGlucoseReading = exports.addBloodPressureReading = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var addBloodPressureReading = function addBloodPressureReading(patientId, readingData) {
  return regeneratorRuntime.async(function addBloodPressureReading$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // This is a placeholder implementation - replace with actual API calls
          console.log('Adding blood pressure reading for patient:', patientId, readingData); // Simulating an API request

          return _context.abrupt("return", new Promise(function (resolve) {
            setTimeout(function () {
              resolve(_objectSpread({
                id: 'bp-' + Date.now()
              }, readingData));
            }, 500);
          }));

        case 2:
        case "end":
          return _context.stop();
      }
    }
  });
};
/**
 * Adds a glucose reading to a patient's record
 * @param {string} patientId - The ID of the patient
 * @param {Object} readingData - The glucose reading data
 * @returns {Promise<Object>} - A promise that resolves to the created reading
 */


exports.addBloodPressureReading = addBloodPressureReading;

var addGlucoseReading = function addGlucoseReading(patientId, readingData) {
  return regeneratorRuntime.async(function addGlucoseReading$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // This is a placeholder implementation - replace with actual API calls
          console.log('Adding glucose reading for patient:', patientId, readingData); // Simulating an API request

          return _context2.abrupt("return", new Promise(function (resolve) {
            setTimeout(function () {
              resolve(_objectSpread({
                id: 'glucose-' + Date.now()
              }, readingData));
            }, 500);
          }));

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  });
};
/**
 * Adds a lipid profile to a patient's record
 * @param {string} patientId - The ID of the patient
 * @param {Object} profileData - The lipid profile data
 * @returns {Promise<Object>} - A promise that resolves to the created profile
 */


exports.addGlucoseReading = addGlucoseReading;

var addLipidProfile = function addLipidProfile(patientId, profileData) {
  return regeneratorRuntime.async(function addLipidProfile$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // This is a placeholder implementation - replace with actual API calls
          console.log('Adding lipid profile for patient:', patientId, profileData); // Simulating an API request

          return _context3.abrupt("return", new Promise(function (resolve) {
            setTimeout(function () {
              resolve(_objectSpread({
                id: 'lipid-' + Date.now()
              }, profileData));
            }, 500);
          }));

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.addLipidProfile = addLipidProfile;