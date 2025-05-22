"use strict";
'use client';
/**
 * Servicio para gestionar chat médico con Firebase Realtime Database
 * Esta implementación proporciona una solución robusta y escalable para
 * la comunicación en tiempo real entre médicos y pacientes.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateConversationStatus = exports.markMessagesAsRead = exports.getUserConversations = exports.subscribeToMessages = exports.getMessages = exports.sendMessage = exports.initializeConversation = void 0;

var _database = require("firebase/database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Referencia a la base de datos de Firebase Realtime Database
var rtDatabase;

try {
  rtDatabase = (0, _database.getDatabase)();
} catch (error) {
  console.error("Error al inicializar Firebase Realtime Database:", error);
}
/**
 * Inicializa una conversación entre un doctor y un paciente
 * @param {string} doctorId - ID del doctor
 * @param {string} patientId - ID del paciente
 * @returns {Promise<string>} ID de la conversación
 */


var initializeConversation = function initializeConversation(doctorId, patientId) {
  var conversationRef, newConversationRef, timestamp, doctorIndex, patientIndex;
  return regeneratorRuntime.async(function initializeConversation$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          conversationRef = (0, _database.ref)(rtDatabase, "conversations");
          newConversationRef = (0, _database.push)(conversationRef);
          timestamp = new Date().toISOString();
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _database.set)(newConversationRef, {
            participants: {
              doctorId: doctorId,
              patientId: patientId
            },
            createdAt: timestamp,
            updatedAt: timestamp,
            lastMessage: null,
            status: 'active'
          }));

        case 6:
          // También actualizamos los índices para búsqueda rápida
          doctorIndex = (0, _database.ref)(rtDatabase, "userConversations/".concat(doctorId, "/").concat(newConversationRef.key));
          patientIndex = (0, _database.ref)(rtDatabase, "userConversations/".concat(patientId, "/").concat(newConversationRef.key));
          _context.next = 10;
          return regeneratorRuntime.awrap((0, _database.set)(doctorIndex, {
            role: 'doctor',
            withUser: patientId,
            timestamp: timestamp
          }));

        case 10:
          _context.next = 12;
          return regeneratorRuntime.awrap((0, _database.set)(patientIndex, {
            role: 'patient',
            withUser: doctorId,
            timestamp: timestamp
          }));

        case 12:
          return _context.abrupt("return", newConversationRef.key);

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](0);
          console.error("Error al inicializar conversación:", _context.t0);
          throw _context.t0;

        case 19:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 15]]);
};
/**
 * Envía un mensaje a una conversación
 * @param {string} conversationId - ID de la conversación
 * @param {string} senderId - ID del remitente
 * @param {string} content - Contenido del mensaje
 * @param {string} messageType - Tipo de mensaje (text, image, file)
 * @returns {Promise<string>} ID del mensaje enviado
 */


exports.initializeConversation = initializeConversation;

var sendMessage = function sendMessage(conversationId, senderId, content) {
  var messageType,
      messagesRef,
      newMessageRef,
      timestamp,
      message,
      conversationRef,
      _args2 = arguments;
  return regeneratorRuntime.async(function sendMessage$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          messageType = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : 'text';
          _context2.prev = 1;
          messagesRef = (0, _database.ref)(rtDatabase, "messages/".concat(conversationId));
          newMessageRef = (0, _database.push)(messagesRef);
          timestamp = new Date().toISOString();
          message = {
            senderId: senderId,
            content: content,
            type: messageType,
            timestamp: timestamp,
            status: 'sent'
          };
          _context2.next = 8;
          return regeneratorRuntime.awrap((0, _database.set)(newMessageRef, message));

        case 8:
          // Actualizar la última actividad en la conversación
          conversationRef = (0, _database.ref)(rtDatabase, "conversations/".concat(conversationId));
          _context2.next = 11;
          return regeneratorRuntime.awrap((0, _database.update)(conversationRef, {
            lastMessage: {
              content: messageType === 'text' ? content : "[".concat(messageType, "]"),
              timestamp: timestamp,
              senderId: senderId
            },
            updatedAt: timestamp
          }));

        case 11:
          return _context2.abrupt("return", newMessageRef.key);

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](1);
          console.error("Error al enviar mensaje:", _context2.t0);
          throw _context2.t0;

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 14]]);
};
/**
 * Obtiene los mensajes de una conversación
 * @param {string} conversationId - ID de la conversación
 * @param {number} limit - Número máximo de mensajes a devolver
 * @returns {Promise<Array>} Lista de mensajes
 */


exports.sendMessage = sendMessage;

var getMessages = function getMessages(conversationId) {
  var limit,
      messagesRef,
      snapshot,
      messages,
      _args3 = arguments;
  return regeneratorRuntime.async(function getMessages$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          limit = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : 50;
          _context3.prev = 1;
          messagesRef = (0, _database.query)((0, _database.ref)(rtDatabase, "messages/".concat(conversationId)), (0, _database.orderByChild)('timestamp'), (0, _database.limitToLast)(limit));
          _context3.next = 5;
          return regeneratorRuntime.awrap((0, _database.get)(messagesRef));

        case 5:
          snapshot = _context3.sent;
          messages = [];

          if (snapshot.exists()) {
            snapshot.forEach(function (childSnapshot) {
              messages.push(_objectSpread({
                id: childSnapshot.key
              }, childSnapshot.val()));
            });
          }

          return _context3.abrupt("return", messages);

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](1);
          console.error("Error al obtener mensajes:", _context3.t0);
          throw _context3.t0;

        case 15:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 11]]);
};
/**
 * Escucha nuevos mensajes en una conversación
 * @param {string} conversationId - ID de la conversación
 * @param {Function} callback - Función a llamar cuando llega un nuevo mensaje
 * @returns {Function} Función para cancelar la escucha
 */


exports.getMessages = getMessages;

var subscribeToMessages = function subscribeToMessages(conversationId, callback) {
  try {
    var messagesRef = (0, _database.ref)(rtDatabase, "messages/".concat(conversationId));
    var unsubscribe = (0, _database.onChildAdded)(messagesRef, function (snapshot) {
      var message = _objectSpread({
        id: snapshot.key
      }, snapshot.val());

      callback(message);
    });
    return unsubscribe;
  } catch (error) {
    console.error("Error al suscribirse a mensajes:", error);
    throw error;
  }
};
/**
 * Obtiene todas las conversaciones de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de conversaciones
 */


exports.subscribeToMessages = subscribeToMessages;

var getUserConversations = function getUserConversations(userId) {
  var userConversationsRef, snapshot, conversations, conversationPromises, conversationSnapshots;
  return regeneratorRuntime.async(function getUserConversations$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          userConversationsRef = (0, _database.ref)(rtDatabase, "userConversations/".concat(userId));
          _context4.next = 4;
          return regeneratorRuntime.awrap((0, _database.get)(userConversationsRef));

        case 4:
          snapshot = _context4.sent;
          conversations = [];

          if (!snapshot.exists()) {
            _context4.next = 13;
            break;
          }

          conversationPromises = [];
          snapshot.forEach(function (childSnapshot) {
            var conversationId = childSnapshot.key;
            var conversationRef = (0, _database.ref)(rtDatabase, "conversations/".concat(conversationId));
            conversationPromises.push((0, _database.get)(conversationRef));
          });
          _context4.next = 11;
          return regeneratorRuntime.awrap(Promise.all(conversationPromises));

        case 11:
          conversationSnapshots = _context4.sent;
          conversationSnapshots.forEach(function (convSnapshot, index) {
            if (convSnapshot.exists()) {
              var conversationId = Object.keys(snapshot.val())[index];
              conversations.push(_objectSpread({
                id: conversationId
              }, convSnapshot.val()));
            }
          });

        case 13:
          return _context4.abrupt("return", conversations.sort(function (a, b) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          }));

        case 16:
          _context4.prev = 16;
          _context4.t0 = _context4["catch"](0);
          console.error("Error al obtener conversaciones del usuario:", _context4.t0);
          throw _context4.t0;

        case 20:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 16]]);
};
/**
 * Marca los mensajes como leídos
 * @param {string} conversationId - ID de la conversación
 * @param {string} userId - ID del usuario que lee los mensajes
 * @returns {Promise<void>}
 */


exports.getUserConversations = getUserConversations;

var markMessagesAsRead = function markMessagesAsRead(conversationId, userId) {
  var messagesRef, snapshot, updates;
  return regeneratorRuntime.async(function markMessagesAsRead$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          messagesRef = (0, _database.ref)(rtDatabase, "messages/".concat(conversationId));
          _context5.next = 4;
          return regeneratorRuntime.awrap((0, _database.get)(messagesRef));

        case 4:
          snapshot = _context5.sent;

          if (!snapshot.exists()) {
            _context5.next = 11;
            break;
          }

          updates = {};
          snapshot.forEach(function (childSnapshot) {
            var message = childSnapshot.val();

            if (message.senderId !== userId && message.status !== 'read') {
              updates["messages/".concat(conversationId, "/").concat(childSnapshot.key, "/status")] = 'read';
            }
          });

          if (!(Object.keys(updates).length > 0)) {
            _context5.next = 11;
            break;
          }

          _context5.next = 11;
          return regeneratorRuntime.awrap((0, _database.update)((0, _database.ref)(rtDatabase), updates));

        case 11:
          _context5.next = 17;
          break;

        case 13:
          _context5.prev = 13;
          _context5.t0 = _context5["catch"](0);
          console.error("Error al marcar mensajes como leídos:", _context5.t0);
          throw _context5.t0;

        case 17:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 13]]);
};
/**
 * Actualiza el estado de una conversación
 * @param {string} conversationId - ID de la conversación
 * @param {string} status - Nuevo estado ('active', 'archived', 'closed')
 * @returns {Promise<void>}
 */


exports.markMessagesAsRead = markMessagesAsRead;

var updateConversationStatus = function updateConversationStatus(conversationId, status) {
  var conversationRef;
  return regeneratorRuntime.async(function updateConversationStatus$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          conversationRef = (0, _database.ref)(rtDatabase, "conversations/".concat(conversationId));
          _context6.next = 4;
          return regeneratorRuntime.awrap((0, _database.update)(conversationRef, {
            status: status,
            updatedAt: new Date().toISOString()
          }));

        case 4:
          _context6.next = 10;
          break;

        case 6:
          _context6.prev = 6;
          _context6.t0 = _context6["catch"](0);
          console.error("Error al actualizar estado de la conversación:", _context6.t0);
          throw _context6.t0;

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 6]]);
};

exports.updateConversationStatus = updateConversationStatus;