"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _admin = require("@firebase/admin");

var _server = require("next/server");

function POST(request) {
  var _ref, userId, role;

  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(request.json());

        case 3:
          _ref = _context.sent;
          userId = _ref.userId;
          role = _ref.role;

          if (userId) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Se requiere el ID del usuario'
          }, {
            status: 400
          }));

        case 8:
          if (['admin', 'medico', 'paciente'].includes(role)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Rol no válido'
          }, {
            status: 400
          }));

        case 10:
          _context.next = 12;
          return regeneratorRuntime.awrap(_admin.authAdmin.setCustomUserClaims(userId, {
            role: role
          }));

        case 12:
          return _context.abrupt("return", _server.NextResponse.json({
            success: true,
            message: "Rol '".concat(role, "' asignado correctamente al usuario ").concat(userId)
          }));

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](0);
          console.error('Error al actualizar el rol del usuario:', _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Error al actualizar el rol',
            details: process.env.NODE_ENV === 'development' ? _context.t0.message : undefined
          }, {
            status: 500
          }));

        case 19:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 15]]);
}