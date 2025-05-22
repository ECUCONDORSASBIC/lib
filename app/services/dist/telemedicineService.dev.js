"use strict";
// app/services/telemedicineService.js
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subscribeToSessionChanges = exports.listenToSignalingMessages = exports.sendSignalingMessage = exports.leaveTelemedicineSession = exports.joinTelemedicineSession = exports.updateTelemedicineSession = exports.getTelemedicineSession = exports.createTelemedicineSession = void 0;

var _firebaseClient = require("@/lib/firebase/firebaseClient");

var _firestore = require("firebase/firestore");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Crea una nueva sesión de telemedicina
 * @param {Object} sessionData - Datos de la sesión
 * @returns {Promise<Object>} - Referencia del documento creado
 */
var createTelemedicineSession = function createTelemedicineSession(sessionData) {
  var sessionRef;
  return regeneratorRuntime.async(function createTelemedicineSession$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _firestore.addDoc)((0, _firestore.collection)(_firebaseClient.db, 'telemedicineSessions'), _objectSpread({}, sessionData, {
            createdAt: (0, _firestore.serverTimestamp)(),
            status: 'waiting',
            participants: [],
            messages: []
          })));

        case 3:
          sessionRef = _context.sent;
          return _context.abrupt("return", _objectSpread({
            id: sessionRef.id
          }, sessionData));

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.error('Error creating telemedicine session:', _context.t0);
          throw _context.t0;

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
};
/**
 * Obtiene los datos de una sesión de telemedicina
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Object>} - Datos de la sesión
 */


exports.createTelemedicineSession = createTelemedicineSession;

var getTelemedicineSession = function getTelemedicineSession(sessionId) {
  var sessionRef, sessionSnapshot;
  return regeneratorRuntime.async(function getTelemedicineSession$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          sessionRef = (0, _firestore.doc)(_firebaseClient.db, 'telemedicineSessions', sessionId);
          _context2.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.getDoc)(sessionRef));

        case 4:
          sessionSnapshot = _context2.sent;

          if (sessionSnapshot.exists()) {
            _context2.next = 7;
            break;
          }

          throw new Error('Session not found');

        case 7:
          return _context2.abrupt("return", _objectSpread({
            id: sessionSnapshot.id
          }, sessionSnapshot.data()));

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          console.error('Error fetching telemedicine session:', _context2.t0);
          throw _context2.t0;

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 10]]);
};
/**
 * Actualiza el estado de una sesión de telemedicina
 * @param {string} sessionId - ID de la sesión
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<void>}
 */


exports.getTelemedicineSession = getTelemedicineSession;

var updateTelemedicineSession = function updateTelemedicineSession(sessionId, updates) {
  var sessionRef;
  return regeneratorRuntime.async(function updateTelemedicineSession$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          sessionRef = (0, _firestore.doc)(_firebaseClient.db, 'telemedicineSessions', sessionId);
          _context3.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.updateDoc)(sessionRef, _objectSpread({}, updates, {
            updatedAt: (0, _firestore.serverTimestamp)()
          })));

        case 4:
          _context3.next = 10;
          break;

        case 6:
          _context3.prev = 6;
          _context3.t0 = _context3["catch"](0);
          console.error('Error updating telemedicine session:', _context3.t0);
          throw _context3.t0;

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 6]]);
};
/**
 * Añade un participante a una sesión de telemedicina
 * @param {string} sessionId - ID de la sesión
 * @param {Object} participant - Datos del participante
 * @returns {Promise<void>}
 */


exports.updateTelemedicineSession = updateTelemedicineSession;

var joinTelemedicineSession = function joinTelemedicineSession(sessionId, participant) {
  var session, existingParticipants, isAlreadyJoined, updatedParticipants;
  return regeneratorRuntime.async(function joinTelemedicineSession$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(getTelemedicineSession(sessionId));

        case 3:
          session = _context4.sent;
          // Verificar si el participante ya está en la sesión
          existingParticipants = session.participants || [];
          isAlreadyJoined = existingParticipants.some(function (p) {
            return p.id === participant.id;
          });

          if (isAlreadyJoined) {
            _context4.next = 10;
            break;
          }

          updatedParticipants = [].concat(_toConsumableArray(existingParticipants), [_objectSpread({}, participant, {
            joinedAt: new Date().toISOString(),
            isActive: true
          })]);
          _context4.next = 10;
          return regeneratorRuntime.awrap(updateTelemedicineSession(sessionId, {
            participants: updatedParticipants,
            status: updatedParticipants.length > 1 ? 'active' : 'waiting'
          }));

        case 10:
          return _context4.abrupt("return", {
            joined: true,
            sessionId: sessionId
          });

        case 13:
          _context4.prev = 13;
          _context4.t0 = _context4["catch"](0);
          console.error('Error joining telemedicine session:', _context4.t0);
          throw _context4.t0;

        case 17:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 13]]);
};
/**
 * Elimina un participante de una sesión de telemedicina
 * @param {string} sessionId - ID de la sesión
 * @param {string} participantId - ID del participante
 * @returns {Promise<void>}
 */


exports.joinTelemedicineSession = joinTelemedicineSession;

var leaveTelemedicineSession = function leaveTelemedicineSession(sessionId, participantId) {
  var session, existingParticipants, updatedParticipants, activeParticipants, newStatus;
  return regeneratorRuntime.async(function leaveTelemedicineSession$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(getTelemedicineSession(sessionId));

        case 3:
          session = _context5.sent;
          existingParticipants = session.participants || [];
          updatedParticipants = existingParticipants.map(function (p) {
            return p.id === participantId ? _objectSpread({}, p, {
              isActive: false,
              leftAt: new Date().toISOString()
            }) : p;
          }); // Si todos los participantes se han ido, finalizar la sesión

          activeParticipants = updatedParticipants.filter(function (p) {
            return p.isActive;
          });
          newStatus = activeParticipants.length === 0 ? 'ended' : activeParticipants.length === 1 ? 'waiting' : 'active';
          _context5.next = 10;
          return regeneratorRuntime.awrap(updateTelemedicineSession(sessionId, _objectSpread({
            participants: updatedParticipants,
            status: newStatus
          }, newStatus === 'ended' ? {
            endedAt: (0, _firestore.serverTimestamp)()
          } : {})));

        case 10:
          return _context5.abrupt("return", {
            left: true,
            sessionId: sessionId
          });

        case 13:
          _context5.prev = 13;
          _context5.t0 = _context5["catch"](0);
          console.error('Error leaving telemedicine session:', _context5.t0);
          throw _context5.t0;

        case 17:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 13]]);
};
/**
 * Envía un mensaje de señalización para la videollamada
 * @param {string} sessionId - ID de la sesión
 * @param {Object} signalData - Datos de señalización
 * @returns {Promise<void>}
 */


exports.leaveTelemedicineSession = leaveTelemedicineSession;

var sendSignalingMessage = function sendSignalingMessage(sessionId, signalData) {
  var sessionRef, messagesCollectionRef;
  return regeneratorRuntime.async(function sendSignalingMessage$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          sessionRef = (0, _firestore.doc)(_firebaseClient.db, 'telemedicineSessions', sessionId);
          messagesCollectionRef = (0, _firestore.collection)(sessionRef, 'signaling');
          _context6.next = 5;
          return regeneratorRuntime.awrap((0, _firestore.addDoc)(messagesCollectionRef, _objectSpread({}, signalData, {
            timestamp: (0, _firestore.serverTimestamp)()
          })));

        case 5:
          _context6.next = 11;
          break;

        case 7:
          _context6.prev = 7;
          _context6.t0 = _context6["catch"](0);
          console.error('Error sending signaling message:', _context6.t0);
          throw _context6.t0;

        case 11:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 7]]);
};
/**
 * Escucha los mensajes de señalización de una sesión
 * @param {string} sessionId - ID de la sesión
 * @param {Function} callback - Función a llamar cuando se recibe un mensaje
 * @returns {Function} - Función para dejar de escuchar
 */


exports.sendSignalingMessage = sendSignalingMessage;

var listenToSignalingMessages = function listenToSignalingMessages(sessionId, callback) {
  try {
    var sessionRef = (0, _firestore.doc)(_firebaseClient.db, 'telemedicineSessions', sessionId);
    var messagesCollectionRef = (0, _firestore.collection)(sessionRef, 'signaling');
    var q = (0, _firestore.query)(messagesCollectionRef, (0, _firestore.orderBy)('timestamp', 'asc'));
    return (0, _firestore.onSnapshot)(q, function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        if (change.type === 'added') {
          callback(_objectSpread({
            id: change.doc.id
          }, change.doc.data()));
        }
      });
    });
  } catch (error) {
    console.error('Error listening to signaling messages:', error);
    throw error;
  }
};
/**
 * Suscribe a los cambios de una sesión de telemedicina
 * @param {string} sessionId - ID de la sesión
 * @param {Function} callback - Función a llamar cuando cambia la sesión
 * @returns {Function} - Función para cancelar la suscripción
 */


exports.listenToSignalingMessages = listenToSignalingMessages;

var subscribeToSessionChanges = function subscribeToSessionChanges(sessionId, callback) {
  try {
    var sessionRef = (0, _firestore.doc)(_firebaseClient.db, 'telemedicineSessions', sessionId);
    return (0, _firestore.onSnapshot)(sessionRef, function (snapshot) {
      if (snapshot.exists()) {
        callback(_objectSpread({
          id: snapshot.id
        }, snapshot.data()));
      }
    });
  } catch (error) {
    console.error('Error subscribing to session changes:', error);
    throw error;
  }
};

exports.subscribeToSessionChanges = subscribeToSessionChanges;