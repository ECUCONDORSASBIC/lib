"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;
exports.GET = GET;
exports.runtime = void 0;

var _server = require("next/server");

// Polyfill for debug package issues with process.stdout.fd
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

function POST(request) {
  return regeneratorRuntime.async(function POST$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          return _context2.abrupt("return", asyncLocalStorage.run({}, function _callee() {
            var data;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(request.json());

                  case 2:
                    data = _context.sent;
                    return _context.abrupt("return", _server.NextResponse.json({
                      success: true,
                      message: 'Analysis completed successfully',
                      data: {} // Your analysis results here

                    }));

                  case 4:
                  case "end":
                    return _context.stop();
                }
              }
            });
          }));

        case 4:
          _context2.prev = 4;
          _context2.t0 = _context2["catch"](0);
          console.error('Error in analyze endpoint:', _context2.t0);
          return _context2.abrupt("return", _server.NextResponse.json({
            success: false,
            message: _context2.t0.message || 'Error analyzing data'
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

function GET() {
  return regeneratorRuntime.async(function GET$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          return _context3.abrupt("return", _server.NextResponse.json({
            status: 'Analyze API is running'
          }));

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
}

var runtime = 'nodejs';
exports.runtime = runtime;