"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exportLipidProfiles = exports.exportGlucoseReadings = exports.exportBloodPressureReadings = exports.exportToCsv = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Utility functions for exporting health metrics data
 */

/**
 * Format array data for CSV export and download it
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 * @param {Array} headers - Array of column headers in format {key, label}
 */
var exportToCsv = function exportToCsv(data, filename, headers) {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  } // Create header row


  var headerRow = headers.map(function (h) {
    return "\"".concat(h.label, "\"");
  }).join(','); // Create data rows

  var rows = data.map(function (item) {
    return headers.map(function (header) {
      // Ensure values are properly formatted for CSV
      var value = item[header.key]; // If value contains commas or quotes, wrap it in quotes

      if (value === null || value === undefined) {
        return '""';
      }

      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return "\"".concat(value.replace(/"/g, '""'), "\"");
      }

      if (typeof value === 'string') {
        return "\"".concat(value, "\"");
      }

      return value;
    }).join(',');
  }).join('\n'); // Combine headers and rows

  var csvContent = "".concat(headerRow, "\n").concat(rows); // Create a blob and download link

  var blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a'); // Setup and trigger download

  link.setAttribute('href', url);
  link.setAttribute('download', "".concat(filename, ".csv"));
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
/**
 * Format blood pressure readings for CSV export
 * @param {Array} readings - Array of blood pressure reading objects
 */


exports.exportToCsv = exportToCsv;

var exportBloodPressureReadings = function exportBloodPressureReadings(readings) {
  if (!readings || !readings.length) return; // Define headers for blood pressure CSV

  var headers = [{
    key: 'date',
    label: 'Fecha'
  }, {
    key: 'systolic',
    label: 'Sistólica (mmHg)'
  }, {
    key: 'diastolic',
    label: 'Diastólica (mmHg)'
  }, {
    key: 'heartRate',
    label: 'Pulso (lpm)'
  }];
  exportToCsv(readings, 'presion-arterial', headers);
};
/**
 * Format glucose readings for CSV export
 * @param {Array} readings - Array of glucose reading objects
 */


exports.exportBloodPressureReadings = exportBloodPressureReadings;

var exportGlucoseReadings = function exportGlucoseReadings(readings) {
  if (!readings || !readings.length) return; // Define headers for glucose CSV

  var headers = [{
    key: 'date',
    label: 'Fecha'
  }, {
    key: 'value',
    label: 'Valor (mg/dL)'
  }, {
    key: 'state',
    label: 'Estado'
  }]; // Transform state values to be more readable

  var formattedReadings = readings.map(function (reading) {
    return _objectSpread({}, reading, {
      state: reading.state === 'fasting' ? 'En ayunas' : reading.state === 'postMeal' ? 'Después de comer' : reading.state === 'beforeMeal' ? 'Antes de comer' : reading.state === 'bedtime' ? 'Antes de dormir' : 'Normal'
    });
  });
  exportToCsv(formattedReadings, 'glucosa', headers);
};
/**
 * Format lipid profile readings for CSV export
 * @param {Array} readings - Array of lipid profile objects
 */


exports.exportGlucoseReadings = exportGlucoseReadings;

var exportLipidProfiles = function exportLipidProfiles(readings) {
  if (!readings || !readings.length) return; // Define headers for lipid profile CSV

  var headers = [{
    key: 'date',
    label: 'Fecha'
  }, {
    key: 'total',
    label: 'Colesterol Total (mg/dL)'
  }, {
    key: 'hdl',
    label: 'HDL (mg/dL)'
  }, {
    key: 'ldl',
    label: 'LDL (mg/dL)'
  }, {
    key: 'triglycerides',
    label: 'Triglicéridos (mg/dL)'
  }];
  exportToCsv(readings, 'perfil-lipidico', headers);
};

exports.exportLipidProfiles = exportLipidProfiles;