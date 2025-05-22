"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _headers = require("next/headers");

var _server = require("next/server");

function POST(request) {
  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          console.log('[API session-logout] Attempting to clear authToken cookie.'); // Clear the authToken cookie

          (0, _headers.cookies)().set('authToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: -1,
            // Expire the cookie immediately
            path: '/',
            sameSite: 'lax'
          });
          console.log('[API session-logout] authToken cookie cleared.');
          return _context.abrupt("return", _server.NextResponse.json({
            success: true,
            message: 'Session cookie cleared.'
          }));

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.error('[API session-logout] Error:', _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Failed to clear session cookie.',
            details: _context.t0.message
          }, {
            status: 500
          }));

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}