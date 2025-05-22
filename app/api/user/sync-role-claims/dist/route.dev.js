"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _admin = require("@firebase/admin");

var _server = require("next/server");

function POST(request) {
  var _ref, uid, userDoc, userData, role;

  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(request.json());

        case 3:
          _ref = _context.sent;
          uid = _ref.uid;

          if (uid) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Se requiere el ID de usuario'
          }, {
            status: 400
          }));

        case 7:
          _context.prev = 7;
          _context.next = 10;
          return regeneratorRuntime.awrap(_admin.authAdmin.getUser(uid));

        case 10:
          _context.next = 15;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](7);
          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Usuario no encontrado en Firebase Auth'
          }, {
            status: 404
          }));

        case 15:
          _context.next = 17;
          return regeneratorRuntime.awrap(_admin.db.collection('users').doc(uid).get());

        case 17:
          userDoc = _context.sent;

          if (userDoc.exists) {
            _context.next = 20;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Usuario no encontrado en Firestore'
          }, {
            status: 404
          }));

        case 20:
          userData = userDoc.data();
          role = userData.role;

          if (role) {
            _context.next = 24;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: 'El usuario no tiene un rol asignado en Firestore'
          }, {
            status: 400
          }));

        case 24:
          _context.next = 26;
          return regeneratorRuntime.awrap(_admin.authAdmin.setCustomUserClaims(uid, {
            role: role
          }));

        case 26:
          return _context.abrupt("return", _server.NextResponse.json({
            success: true,
            message: "El rol '".concat(role, "' se ha sincronizado correctamente con los custom claims del usuario"),
            role: role
          }));

        case 29:
          _context.prev = 29;
          _context.t1 = _context["catch"](0);
          console.error('Error al sincronizar el rol del usuario:', _context.t1);
          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Error al sincronizar el rol',
            details: process.env.NODE_ENV === 'development' ? _context.t1.message : undefined
          }, {
            status: 500
          }));

        case 33:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 29], [7, 12]]);
}