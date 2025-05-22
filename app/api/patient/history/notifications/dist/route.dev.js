"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;

var _historyService = require("@/app/services/historyService");

function GET(req) {
  var _ref, searchParams, patientId, notifications;

  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // JWT check placeholder (implementar verificación real)
          _ref = new URL(req.url), searchParams = _ref.searchParams;
          patientId = searchParams.get('patientId');

          if (patientId) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", new Response(JSON.stringify({
            error: 'Falta patientId'
          }), {
            status: 400
          }));

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _historyService.getNotifications)(patientId));

        case 6:
          notifications = _context.sent;
          return _context.abrupt("return", new Response(JSON.stringify({
            notifications: notifications
          }), {
            status: 200
          }));

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
}