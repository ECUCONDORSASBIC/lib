"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStructuredAnamnesisData = exports.saveStructuredAnamnesisData = exports.getAnamnesisVersionHistory = exports.createAnamnesisVersionRecord = void 0;

// app/services/structuredAnamnesisService.js

/**
 * Creates a new anamnesis version record for tracking changes
 * @param {string} patientId - The ID of the patient
 * @param {string} authorId - The ID of the user who created this version
 * @param {Object} metadata - Optional metadata about the version
 * @returns {Promise<Object>} - A promise that resolves to the created version record
 */
var createAnamnesisVersionRecord = function createAnamnesisVersionRecord(patientId, authorId) {
  var metadata,
      _args = arguments;
  return regeneratorRuntime.async(function createAnamnesisVersionRecord$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          metadata = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
          // This is a placeholder implementation - replace with actual API call
          console.log('Creating anamnesis version record for patient:', patientId, 'by author:', authorId); // Simulate API request with a promise

          return _context.abrupt("return", new Promise(function (resolve) {
            setTimeout(function () {
              var versionRecord = {
                id: 'version-' + Date.now(),
                patientId: patientId,
                authorId: authorId,
                timestamp: new Date().toISOString(),
                changes: metadata.changes || [],
                notes: metadata.notes || '',
                versionNumber: metadata.versionNumber || 1
              };
              resolve(versionRecord);
            }, 500);
          }));

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
};
/**
 * Gets all version records for a patient's anamnesis
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Array>} - A promise that resolves to an array of version records
 */


exports.createAnamnesisVersionRecord = createAnamnesisVersionRecord;

var getAnamnesisVersionHistory = function getAnamnesisVersionHistory(patientId) {
  return regeneratorRuntime.async(function getAnamnesisVersionHistory$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // This is a placeholder implementation - replace with actual API call
          console.log('Getting anamnesis version history for patient:', patientId); // Simulate API request with a promise

          return _context2.abrupt("return", new Promise(function (resolve) {
            setTimeout(function () {
              // Sample version history
              var versionHistory = [{
                id: 'version-1',
                patientId: patientId,
                authorId: 'doctor-123',
                authorName: 'Dr. García',
                timestamp: new Date(Date.now() - 604800000).toISOString(),
                // 1 week ago
                changes: ['Initial anamnesis creation'],
                versionNumber: 1
              }, {
                id: 'version-2',
                patientId: patientId,
                authorId: 'doctor-456',
                authorName: 'Dr. Rodríguez',
                timestamp: new Date(Date.now() - 259200000).toISOString(),
                // 3 days ago
                changes: ['Updated family history', 'Added allergy information'],
                versionNumber: 2
              }];
              resolve(versionHistory);
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
 * Saves structured anamnesis data for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Object} structuredData - The structured anamnesis data
 * @param {string} authorId - The ID of the user saving this data
 * @returns {Promise<Object>} - A promise that resolves to the saved anamnesis data
 */


exports.getAnamnesisVersionHistory = getAnamnesisVersionHistory;

var saveStructuredAnamnesisData = function saveStructuredAnamnesisData(patientId, structuredData, authorId) {
  var versionRecord;
  return regeneratorRuntime.async(function saveStructuredAnamnesisData$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // This is a placeholder implementation - replace with actual API call
          console.log('Saving structured anamnesis data for patient:', patientId); // Create version record as part of saving

          _context3.next = 3;
          return regeneratorRuntime.awrap(createAnamnesisVersionRecord(patientId, authorId, {
            notes: 'Updated structured anamnesis data',
            changes: Object.keys(structuredData).map(function (section) {
              return "Updated ".concat(section);
            })
          }));

        case 3:
          versionRecord = _context3.sent;
          return _context3.abrupt("return", new Promise(function (resolve) {
            setTimeout(function () {
              resolve({
                id: 'anamnesis-' + patientId,
                patientId: patientId,
                data: structuredData,
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: authorId,
                versionId: versionRecord.id,
                versionNumber: versionRecord.versionNumber
              });
            }, 700);
          }));

        case 5:
        case "end":
          return _context3.stop();
      }
    }
  });
};
/**
 * Gets structured anamnesis data for a patient
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object|null>} - A promise that resolves to the anamnesis data or null if not found
 */


exports.saveStructuredAnamnesisData = saveStructuredAnamnesisData;

var getStructuredAnamnesisData = function getStructuredAnamnesisData(patientId) {
  return regeneratorRuntime.async(function getStructuredAnamnesisData$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          // This is a placeholder implementation - replace with actual API call
          console.log('Getting structured anamnesis data for patient:', patientId); // Simulate API request with a promise

          return _context4.abrupt("return", new Promise(function (resolve) {
            setTimeout(function () {
              // Sample data or null if not created yet
              var hasData = Math.random() > 0.3; // 70% chance to have data for demo

              if (hasData) {
                resolve({
                  id: 'anamnesis-' + patientId,
                  patientId: patientId,
                  data: {
                    personalHistory: {
                      // Sample personal history data
                      birthPlace: 'Ciudad de México',
                      occupation: 'Ingeniero',
                      lifestyle: 'Sedentario, trabaja 8 horas diarias'
                    },
                    familyHistory: {
                      // Sample family history data
                      father: 'Hipertensión, 68 años',
                      mother: 'Diabetes tipo 2, 65 años',
                      siblings: 'Hermana, 40 años, sana'
                    },
                    medicalHistory: {
                      // Sample medical history
                      pastConditions: 'Apendicitis (2010)',
                      surgeries: 'Apendicectomía (2010)',
                      allergies: 'Penicilina'
                    } // Other structured sections...

                  },
                  lastUpdated: new Date(Date.now() - 604800000).toISOString(),
                  lastUpdatedBy: 'doctor-123',
                  versionId: 'version-1',
                  versionNumber: 1
                });
              } else {
                resolve(null);
              }
            }, 600);
          }));

        case 2:
        case "end":
          return _context4.stop();
      }
    }
  });
};

exports.getStructuredAnamnesisData = getStructuredAnamnesisData;