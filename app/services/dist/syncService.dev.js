"use strict";
'use client';
/**
 * Servicio para sincronización de datos
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSyncStatus = exports.syncData = void 0;

var _firebaseClient = require("@/lib/firebase/firebaseClient");

var _firestore = require("firebase/firestore");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Sincroniza datos locales con la base de datos remota
 * @param {string} collectionName - Nombre de la colección
 * @param {string} documentId - ID del documento
 * @param {Object} data - Datos a sincronizar
 * @returns {Promise<void>}
 */
var syncData = function syncData(collectionName, documentId, data) {
  var docRef, docSnap;
  return regeneratorRuntime.async(function syncData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          docRef = (0, _firestore.doc)(_firebaseClient.db, collectionName, documentId);
          _context.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.getDoc)(docRef));

        case 4:
          docSnap = _context.sent;

          if (!docSnap.exists()) {
            _context.next = 10;
            break;
          }

          _context.next = 8;
          return regeneratorRuntime.awrap((0, _firestore.updateDoc)(docRef, _objectSpread({}, data, {
            lastSynced: new Date()
          })));

        case 8:
          _context.next = 12;
          break;

        case 10:
          _context.next = 12;
          return regeneratorRuntime.awrap((0, _firestore.setDoc)(docRef, _objectSpread({}, data, {
            createdAt: new Date(),
            lastSynced: new Date()
          })));

        case 12:
          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error("Error al sincronizar datos en ".concat(collectionName, ":"), _context.t0);
          throw _context.t0;

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
};
/**
 * Obtiene el estado de sincronización de un documento
 * @param {string} collectionName - Nombre de la colección
 * @param {string} documentId - ID del documento
 * @returns {Promise<Object>} Estado de sincronización
 */


exports.syncData = syncData;

var getSyncStatus = function getSyncStatus(collectionName, documentId) {
  var docRef, docSnap, data;
  return regeneratorRuntime.async(function getSyncStatus$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          docRef = (0, _firestore.doc)(_firebaseClient.db, collectionName, documentId);
          _context2.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.getDoc)(docRef));

        case 4:
          docSnap = _context2.sent;

          if (!docSnap.exists()) {
            _context2.next = 10;
            break;
          }

          data = docSnap.data();
          return _context2.abrupt("return", {
            isSynced: true,
            lastSynced: data.lastSynced || null
          });

        case 10:
          return _context2.abrupt("return", {
            isSynced: false,
            lastSynced: null
          });

        case 11:
          _context2.next = 17;
          break;

        case 13:
          _context2.prev = 13;
          _context2.t0 = _context2["catch"](0);
          console.error("Error al verificar estado de sincronizaci\xF3n en ".concat(collectionName, ":"), _context2.t0);
          return _context2.abrupt("return", {
            isSynced: false,
            lastSynced: null,
            error: _context2.t0.message
          });

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 13]]);
};

exports.getSyncStatus = getSyncStatus;