"use strict";
'use client';
/**
 * Servicio para gestionar la información de médicos
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDoctorsBySpecialty = exports.getDoctorPatients = exports.updateDoctor = exports.createDoctor = exports.getDoctorById = exports.getAllDoctors = void 0;

var _firebaseClient = require("@/lib/firebase/firebaseClient");

var _firestore = require("firebase/firestore");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var COLLECTION_NAME = 'doctors';
/**
 * Obtiene todos los médicos
 * @returns {Promise<Array>} Lista de médicos
 */

var getAllDoctors = function getAllDoctors() {
  var doctorsCollection, snapshot;
  return regeneratorRuntime.async(function getAllDoctors$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          doctorsCollection = (0, _firestore.collection)(_firebaseClient.db, COLLECTION_NAME);
          _context.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.getDocs)(doctorsCollection));

        case 4:
          snapshot = _context.sent;
          return _context.abrupt("return", snapshot.docs.map(function (doc) {
            return _objectSpread({
              id: doc.id
            }, doc.data());
          }));

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          console.error("Error al obtener médicos:", _context.t0);
          throw _context.t0;

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 8]]);
};
/**
 * Obtiene un médico por su ID
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Object|null>} Datos del médico o null si no existe
 */


exports.getAllDoctors = getAllDoctors;

var getDoctorById = function getDoctorById(doctorId) {
  var doctorRef, docSnap;
  return regeneratorRuntime.async(function getDoctorById$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          doctorRef = (0, _firestore.doc)(_firebaseClient.db, COLLECTION_NAME, doctorId);
          _context2.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.getDoc)(doctorRef));

        case 4:
          docSnap = _context2.sent;

          if (!docSnap.exists()) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", _objectSpread({
            id: docSnap.id
          }, docSnap.data()));

        case 9:
          return _context2.abrupt("return", null);

        case 10:
          _context2.next = 16;
          break;

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          console.error("Error al obtener médico:", _context2.t0);
          throw _context2.t0;

        case 16:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 12]]);
};
/**
 * Crea un nuevo médico
 * @param {Object} doctorData - Datos del médico
 * @returns {Promise<string>} ID del médico creado
 */


exports.getDoctorById = getDoctorById;

var createDoctor = function createDoctor(doctorData) {
  var doctorsCollection, docRef;
  return regeneratorRuntime.async(function createDoctor$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          doctorsCollection = (0, _firestore.collection)(_firebaseClient.db, COLLECTION_NAME);
          _context3.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.addDoc)(doctorsCollection, _objectSpread({}, doctorData, {
            createdAt: new Date()
          })));

        case 4:
          docRef = _context3.sent;
          return _context3.abrupt("return", docRef.id);

        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](0);
          console.error("Error al crear médico:", _context3.t0);
          throw _context3.t0;

        case 12:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 8]]);
};
/**
 * Actualiza un médico existente
 * @param {string} doctorId - ID del médico
 * @param {Object} doctorData - Nuevos datos del médico
 * @returns {Promise<void>}
 */


exports.createDoctor = createDoctor;

var updateDoctor = function updateDoctor(doctorId, doctorData) {
  var doctorRef;
  return regeneratorRuntime.async(function updateDoctor$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          doctorRef = (0, _firestore.doc)(_firebaseClient.db, COLLECTION_NAME, doctorId);
          _context4.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.updateDoc)(doctorRef, _objectSpread({}, doctorData, {
            updatedAt: new Date()
          })));

        case 4:
          _context4.next = 10;
          break;

        case 6:
          _context4.prev = 6;
          _context4.t0 = _context4["catch"](0);
          console.error("Error al actualizar médico:", _context4.t0);
          throw _context4.t0;

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 6]]);
};
/**
 * Obtiene médicos por especialidad
 * @param {string} specialty - Especialidad médica
 * @returns {Promise<Array>} Lista de médicos con la especialidad especificada
 */

/**
 * Obtiene los pacientes asignados a un médico específico
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Array>} Lista de pacientes del médico
 */


exports.updateDoctor = updateDoctor;

var getDoctorPatients = function getDoctorPatients(doctorId) {
  var patientsCollection, q, snapshot;
  return regeneratorRuntime.async(function getDoctorPatients$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          patientsCollection = (0, _firestore.collection)(_firebaseClient.db, 'patients');
          q = (0, _firestore.query)(patientsCollection, (0, _firestore.where)("doctorId", "==", doctorId));
          _context5.next = 5;
          return regeneratorRuntime.awrap((0, _firestore.getDocs)(q));

        case 5:
          snapshot = _context5.sent;
          return _context5.abrupt("return", snapshot.docs.map(function (doc) {
            return _objectSpread({
              id: doc.id
            }, doc.data());
          }));

        case 9:
          _context5.prev = 9;
          _context5.t0 = _context5["catch"](0);
          console.error("Error al obtener pacientes del médico:", _context5.t0);
          throw _context5.t0;

        case 13:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 9]]);
};
/**
 * Obtiene médicos por especialidad
 * @param {string} specialty - Especialidad médica
 * @returns {Promise<Array>} Lista de médicos con la especialidad especificada
 */


exports.getDoctorPatients = getDoctorPatients;

var getDoctorsBySpecialty = function getDoctorsBySpecialty(specialty) {
  var doctorsCollection, q, snapshot;
  return regeneratorRuntime.async(function getDoctorsBySpecialty$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          doctorsCollection = (0, _firestore.collection)(_firebaseClient.db, COLLECTION_NAME);
          q = (0, _firestore.query)(doctorsCollection, (0, _firestore.where)("specialty", "==", specialty));
          _context6.next = 5;
          return regeneratorRuntime.awrap((0, _firestore.getDocs)(q));

        case 5:
          snapshot = _context6.sent;
          return _context6.abrupt("return", snapshot.docs.map(function (doc) {
            return _objectSpread({
              id: doc.id
            }, doc.data());
          }));

        case 9:
          _context6.prev = 9;
          _context6.t0 = _context6["catch"](0);
          console.error("Error al obtener médicos por especialidad:", _context6.t0);
          throw _context6.t0;

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 9]]);
};

exports.getDoctorsBySpecialty = getDoctorsBySpecialty;