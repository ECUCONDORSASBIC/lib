"use strict";
'use client';
/**
 * Adds a blood pressure reading to a patient's record
 * @param {string} patientId - The ID of the patient
 * @param {Object} readingData - The blood pressure reading data
 * @returns {Promise<Object>} - A promise that resolves to the created reading
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLipidProfiles = exports.getGlucoseReadings = exports.getBloodPressureReadings = exports.addLipidProfile = exports.addGlucoseReading = exports.addBloodPressureReading = void 0;

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
/**
 * Gets blood pressure readings for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Object} options - Query options (limit, etc.)
 * @returns {Promise<Array>} - A promise that resolves to an array of readings
 */


exports.addLipidProfile = addLipidProfile;

var getBloodPressureReadings = function getBloodPressureReadings(patientId) {
  var options,
      mockData,
      _args4 = arguments;
  return regeneratorRuntime.async(function getBloodPressureReadings$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          options = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : {};
          _context4.prev = 1;
          // For development, return mock data
          mockData = [{
            id: 'bp-1',
            date: new Date(),
            systolic: 120,
            diastolic: 80,
            pulse: 72
          }, {
            id: 'bp-2',
            date: new Date(Date.now() - 86400000),
            // Yesterday
            systolic: 118,
            diastolic: 78,
            pulse: 70
          }, {
            id: 'bp-3',
            date: new Date(Date.now() - 172800000),
            // 2 days ago
            systolic: 122,
            diastolic: 82,
            pulse: 74
          }];
          return _context4.abrupt("return", mockData);

        case 6:
          _context4.prev = 6;
          _context4.t0 = _context4["catch"](1);
          console.error('Error fetching blood pressure readings:', _context4.t0);
          throw _context4.t0;

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 6]]);
};
/**
 * Gets glucose readings for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Object} options - Query options (limit, etc.)
 * @returns {Promise<Array>} - A promise that resolves to an array of readings
 */


exports.getBloodPressureReadings = getBloodPressureReadings;

var getGlucoseReadings = function getGlucoseReadings(patientId) {
  var options,
      mockData,
      _args5 = arguments;
  return regeneratorRuntime.async(function getGlucoseReadings$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          options = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {};
          _context5.prev = 1;
          // For development, return mock data
          mockData = [{
            id: 'glucose-1',
            date: new Date(),
            value: 95,
            isFasting: true
          }, {
            id: 'glucose-2',
            date: new Date(Date.now() - 86400000),
            // Yesterday
            value: 100,
            isFasting: true
          }, {
            id: 'glucose-3',
            date: new Date(Date.now() - 172800000),
            // 2 days ago
            value: 110,
            isFasting: false
          }];
          return _context5.abrupt("return", mockData);

        case 6:
          _context5.prev = 6;
          _context5.t0 = _context5["catch"](1);
          console.error('Error fetching glucose readings:', _context5.t0);
          throw _context5.t0;

        case 10:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 6]]);
};
/**
 * Gets lipid profiles for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Object} options - Query options (limit, etc.)
 * @returns {Promise<Array>} - A promise that resolves to an array of profiles
 */


exports.getGlucoseReadings = getGlucoseReadings;

var getLipidProfiles = function getLipidProfiles(patientId) {
  var options,
      mockData,
      _args6 = arguments;
  return regeneratorRuntime.async(function getLipidProfiles$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          options = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : {};
          _context6.prev = 1;
          // For development, return mock data
          mockData = [{
            id: 'lipid-1',
            date: new Date(),
            totalCholesterol: 180,
            ldl: 100,
            hdl: 55,
            triglycerides: 125
          }, {
            id: 'lipid-2',
            date: new Date(Date.now() - 2592000000),
            // 30 days ago
            totalCholesterol: 190,
            ldl: 110,
            hdl: 50,
            triglycerides: 130
          }];
          return _context6.abrupt("return", mockData);

        case 6:
          _context6.prev = 6;
          _context6.t0 = _context6["catch"](1);
          console.error('Error fetching lipid profiles:', _context6.t0);
          throw _context6.t0;

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[1, 6]]);
};

exports.getLipidProfiles = getLipidProfiles;