"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.runtime = void 0;

var _server = require("next/server");

// Deshabilitar completamente el tracing de OpenTelemetry para evitar errores en desarrollo
// Esto debe estar antes de cualquier importación que use OpenTelemetry
process.env.OTEL_SDK_DISABLED = 'true';
process.env.OTEL_TRACES_EXPORTER = 'none';
process.env.OTEL_METRICS_EXPORTER = 'none';
process.env.OTEL_LOGS_EXPORTER = 'none'; // Polyfill for process.stdout and process.stderr to fix isTTY errors

if (typeof process !== 'undefined' && process) {
  var mockStdout = {
    fd: 1,
    write: function write() {
      return true;
    },
    isTTY: false
  };
  var mockStderr = {
    fd: 2,
    write: function write() {
      return true;
    },
    isTTY: false
  }; // Ensure process.stdout and process.stderr are available

  process.stdout = process.stdout || mockStdout;
  process.stderr = process.stderr || mockStderr; // Fix missing properties

  if (!process.stdout.fd) process.stdout.fd = 1;
  if (!process.stderr.fd) process.stderr.fd = 2;
  if (process.stdout.isTTY === undefined) process.stdout.isTTY = false;
  if (process.stderr.isTTY === undefined) process.stderr.isTTY = false;
}

var AsyncLocalStorageClass = require('../../../../lib/polyfills/async-local-storage-polyfill'); // Create an instance of AsyncLocalStorage


var asyncLocalStorage = new AsyncLocalStorageClass();

function GET() {
  return regeneratorRuntime.async(function GET$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          return _context2.abrupt("return", asyncLocalStorage.run({}, function _callee() {
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    return _context.abrupt("return", _server.NextResponse.json({
                      success: true,
                      status: 'GenKit API is running',
                      timestamp: new Date().toISOString()
                    }));

                  case 1:
                  case "end":
                    return _context.stop();
                }
              }
            });
          }));

        case 4:
          _context2.prev = 4;
          _context2.t0 = _context2["catch"](0);
          console.error('Error in status endpoint:', _context2.t0);
          return _context2.abrupt("return", _server.NextResponse.json({
            success: false,
            message: _context2.t0.message || 'Error checking status'
          }, {
            status: 500
          }));

        case 8:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 4]]);
}

var runtime = 'nodejs';
exports.runtime = runtime;