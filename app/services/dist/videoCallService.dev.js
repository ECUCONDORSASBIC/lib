"use strict";
'use client';
/**
 * Servicio para gestionar videollamadas
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.answerCall = exports.setCallEventHandlers = exports.initLocalStream = exports.endVideoCall = exports.updateVideoCallStatus = exports.createVideoCallRecord = exports.getUserVideoCallHistory = void 0;

var _firebaseClient = require("@/lib/firebase/firebaseClient");

var _firestore = require("firebase/firestore");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var COLLECTION_NAME = 'videoCalls';
/**
 * Obtiene el historial de videollamadas de un usuario
 * @param {string} userId - ID del usuario (paciente o médico)
 * @param {string} role - Rol del usuario ('patient' o 'doctor')
 * @returns {Promise<Array>} Lista de videollamadas
 */

var getUserVideoCallHistory = function getUserVideoCallHistory(userId, role) {
  var fieldName, videoCallsCollection, q, snapshot;
  return regeneratorRuntime.async(function getUserVideoCallHistory$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          fieldName = role === 'doctor' ? 'doctorId' : 'patientId';
          videoCallsCollection = (0, _firestore.collection)(_firebaseClient.db, COLLECTION_NAME);
          q = (0, _firestore.query)(videoCallsCollection, (0, _firestore.where)(fieldName, "==", userId), (0, _firestore.orderBy)("startTime", "desc"));
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _firestore.getDocs)(q));

        case 6:
          snapshot = _context.sent;
          return _context.abrupt("return", snapshot.docs.map(function (doc) {
            return _objectSpread({
              id: doc.id
            }, doc.data());
          }));

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          console.error("Error al obtener historial de videollamadas:", _context.t0);
          throw _context.t0;

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
};
/**
 * Crea un registro de videollamada
 * @param {Object} callData - Datos de la videollamada
 * @returns {Promise<string>} ID de la videollamada creada
 */


exports.getUserVideoCallHistory = getUserVideoCallHistory;

var createVideoCallRecord = function createVideoCallRecord(callData) {
  var videoCallsCollection, docRef;
  return regeneratorRuntime.async(function createVideoCallRecord$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          videoCallsCollection = (0, _firestore.collection)(_firebaseClient.db, COLLECTION_NAME);
          _context2.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.addDoc)(videoCallsCollection, _objectSpread({}, callData, {
            startTime: callData.startTime || new Date(),
            status: callData.status || 'initiated',
            createdAt: new Date()
          })));

        case 4:
          docRef = _context2.sent;
          return _context2.abrupt("return", docRef.id);

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](0);
          console.error("Error al crear registro de videollamada:", _context2.t0);
          throw _context2.t0;

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 8]]);
};
/**
 * Actualiza el estado de una videollamada
 * @param {string} callId - ID de la videollamada
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */


exports.createVideoCallRecord = createVideoCallRecord;

var updateVideoCallStatus = function updateVideoCallStatus(callId, updateData) {
  var callRef;
  return regeneratorRuntime.async(function updateVideoCallStatus$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          callRef = (0, _firestore.doc)(_firebaseClient.db, COLLECTION_NAME, callId);
          _context3.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.updateDoc)(callRef, _objectSpread({}, updateData, {
            updatedAt: new Date()
          })));

        case 4:
          _context3.next = 10;
          break;

        case 6:
          _context3.prev = 6;
          _context3.t0 = _context3["catch"](0);
          console.error("Error al actualizar estado de videollamada:", _context3.t0);
          throw _context3.t0;

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 6]]);
};
/**
 * Finaliza una videollamada
 * @param {string} callId - ID de la videollamada
 * @param {Object} endCallData - Datos de finalización
 * @returns {Promise<void>}
 */


exports.updateVideoCallStatus = updateVideoCallStatus;

var endVideoCall = function endVideoCall(callId) {
  var endCallData,
      callRef,
      _args4 = arguments;
  return regeneratorRuntime.async(function endVideoCall$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          endCallData = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : {};
          _context4.prev = 1;
          callRef = (0, _firestore.doc)(_firebaseClient.db, COLLECTION_NAME, callId);
          _context4.next = 5;
          return regeneratorRuntime.awrap((0, _firestore.updateDoc)(callRef, {
            endTime: new Date(),
            status: 'completed',
            duration: endCallData.duration,
            notes: endCallData.notes,
            updatedAt: new Date()
          }));

        case 5:
          _context4.next = 11;
          break;

        case 7:
          _context4.prev = 7;
          _context4.t0 = _context4["catch"](1);
          console.error("Error al finalizar videollamada:", _context4.t0);
          throw _context4.t0;

        case 11:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 7]]);
};
/**
 * Inicializa una conexión WebRTC y devuelve las streams
 * @returns {Promise<Object>} Objeto con streams local y remota
 */


exports.endVideoCall = endVideoCall;

var initLocalStream = function initLocalStream() {
  var localStream, remoteStream;
  return regeneratorRuntime.async(function initLocalStream$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
          }));

        case 3:
          localStream = _context5.sent;
          // Crear una stream remota vacía que se llenará cuando el otro usuario se conecte
          remoteStream = new MediaStream();
          return _context5.abrupt("return", {
            localStream: localStream,
            remoteStream: remoteStream
          });

        case 8:
          _context5.prev = 8;
          _context5.t0 = _context5["catch"](0);
          console.error("Error al inicializar stream local:", _context5.t0);
          throw _context5.t0;

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 8]]);
};
/**
 * Establece los manejadores de eventos para la videollamada
 * @param {Object} handlers - Funciones manejadoras de eventos
 */


exports.initLocalStream = initLocalStream;

var setCallEventHandlers = function setCallEventHandlers(handlers) {
  // En una implementación completa, aquí se configurarían todos los listeners
  // para los eventos de la videollamada (conexión, desconexión, etc.)
  console.log("Handlers configurados:", handlers); // Esta es una implementación simplificada para el MVP
};
/**
 * Responde a una llamada entrante
 * @param {string} callId - ID de la llamada a responder
 * @returns {Promise<Object>} Objeto con streams local y remota
 */


exports.setCallEventHandlers = setCallEventHandlers;

var answerCall = function answerCall(callId) {
  var _ref, localStream, remoteStream;

  return regeneratorRuntime.async(function answerCall$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(updateVideoCallStatus(callId, {
            status: 'connected'
          }));

        case 3:
          _context6.next = 5;
          return regeneratorRuntime.awrap(initLocalStream());

        case 5:
          _ref = _context6.sent;
          localStream = _ref.localStream;
          remoteStream = _ref.remoteStream;
          return _context6.abrupt("return", {
            localStream: localStream,
            remoteStream: remoteStream
          });

        case 11:
          _context6.prev = 11;
          _context6.t0 = _context6["catch"](0);
          console.error("Error al responder llamada:", _context6.t0);
          throw _context6.t0;

        case 15:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

exports.answerCall = answerCall;