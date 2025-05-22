"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAnamnesisDataSummary = exports.updateAnamnesisData = exports.getAnamnesisData = exports.saveAnamnesisData = void 0;

var _firebaseClient = require("@/lib/firebase/firebaseClient");

var _firestore = require("firebase/firestore");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Saves anamnesis data for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Object} anamnesisData - The anamnesis data to save
 * @returns {Promise<Object>} - A promise that resolves to the saved anamnesis data
 */
var saveAnamnesisData = function saveAnamnesisData(patientId, anamnesisData) {
  var docRef, dataToSave;
  return regeneratorRuntime.async(function saveAnamnesisData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          docRef = (0, _firestore.doc)(_firebaseClient.db, 'anamnesis', "".concat(patientId));
          dataToSave = _objectSpread({
            patientId: patientId
          }, anamnesisData, {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          _context.next = 5;
          return regeneratorRuntime.awrap((0, _firestore.setDoc)(docRef, dataToSave));

        case 5:
          return _context.abrupt("return", _objectSpread({
            id: docRef.id
          }, dataToSave));

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          console.error('Error saving anamnesis data:', _context.t0);
          throw new Error('No se pudo guardar la información de anamnesis');

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 8]]);
};
/**
 * Gets anamnesis data for a patient
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} - A promise that resolves to the patient's anamnesis data
 */


exports.saveAnamnesisData = saveAnamnesisData;

var getAnamnesisData = function getAnamnesisData(patientId) {
  var docRef, docSnap;
  return regeneratorRuntime.async(function getAnamnesisData$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          docRef = (0, _firestore.doc)(_firebaseClient.db, 'anamnesis', "".concat(patientId));
          _context2.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.getDoc)(docRef));

        case 4:
          docSnap = _context2.sent;

          if (!docSnap.exists()) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", _objectSpread({
            id: docSnap.id
          }, docSnap.data()));

        case 7:
          return _context2.abrupt("return", null);

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          console.error('Error getting anamnesis data:', _context2.t0);
          throw new Error('No se pudo obtener la información de anamnesis');

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 10]]);
};
/**
 * Updates existing anamnesis data for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Object} updatedData - The updated anamnesis data
 * @returns {Promise<Object>} - A promise that resolves to the updated anamnesis data
 */


exports.getAnamnesisData = getAnamnesisData;

var updateAnamnesisData = function updateAnamnesisData(patientId, updatedData) {
  var docRef, dataToUpdate, updatedDoc;
  return regeneratorRuntime.async(function updateAnamnesisData$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          docRef = (0, _firestore.doc)(_firebaseClient.db, 'anamnesis', "".concat(patientId));
          dataToUpdate = _objectSpread({}, updatedData, {
            updatedAt: new Date().toISOString()
          });
          _context3.next = 5;
          return regeneratorRuntime.awrap((0, _firestore.updateDoc)(docRef, dataToUpdate));

        case 5:
          _context3.next = 7;
          return regeneratorRuntime.awrap((0, _firestore.getDoc)(docRef));

        case 7:
          updatedDoc = _context3.sent;
          return _context3.abrupt("return", _objectSpread({
            id: updatedDoc.id
          }, updatedDoc.data()));

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](0);
          console.error('Error updating anamnesis data:', _context3.t0);
          throw new Error('No se pudo actualizar la información de anamnesis');

        case 15:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 11]]);
};
/**
 * Gets a summary of anamnesis data for dashboard display
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Object>} - A promise that resolves to a summary of patient's anamnesis data
 */


exports.updateAnamnesisData = updateAnamnesisData;

var getAnamnesisDataSummary = function getAnamnesisDataSummary(patientId) {
  var anamnesisData, summary;
  return regeneratorRuntime.async(function getAnamnesisDataSummary$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(getAnamnesisData(patientId));

        case 3:
          anamnesisData = _context4.sent;

          if (anamnesisData) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", null);

        case 6:
          // Extract key information for dashboard display
          summary = {
            personalInfo: {
              nombre: anamnesisData.nombre_completo || anamnesisData.nombre,
              edad: anamnesisData.edad,
              sexo: anamnesisData.sexo,
              estadoCivil: anamnesisData.estado_civil,
              ocupacion: anamnesisData.ocupacion
            },
            medicalHistory: {
              enfermedadesCronicas: anamnesisData.enfermedades,
              cirugias: anamnesisData.cirugias,
              alergias: anamnesisData.alergias,
              medicamentos: anamnesisData.medicamentos
            },
            lifestyle: {
              tabaco: anamnesisData.tabaco,
              alcohol: anamnesisData.alcohol,
              actividadFisica: anamnesisData.actividad_fisica,
              dieta: anamnesisData.dieta,
              sueno: anamnesisData.sueno
            },
            familyHistory: {
              diabetes: anamnesisData.diabetes,
              hipertension: anamnesisData.hipertension,
              cancer: anamnesisData.cancer,
              cardiopatias: anamnesisData.cardiopatias
            }
          };
          return _context4.abrupt("return", summary);

        case 10:
          _context4.prev = 10;
          _context4.t0 = _context4["catch"](0);
          console.error('Error getting anamnesis summary:', _context4.t0);
          throw new Error('No se pudo obtener el resumen de anamnesis');

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

exports.getAnamnesisDataSummary = getAnamnesisDataSummary;