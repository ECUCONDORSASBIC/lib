"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Debug module polyfill for environments where process.stdout and process.stderr
 * may not have all required properties or might be undefined.
 *
 * This is especially important for the 'debug' package which is heavily used by
 * OpenTelemetry and many other Node.js libraries.
 */
// Save the original process if it exists
var originalProcess = typeof process !== 'undefined' ? process : {};
var originalStdout = originalProcess.stdout || {};
var originalStderr = originalProcess.stderr || {}; // Mock function that does nothing (used for write operations)

var noop = function noop() {}; // Create proper stdout and stderr objects with all required properties


var mockStdout = _objectSpread({
  fd: 1,
  // Standard output file descriptor is always 1
  isTTY: false,
  write: originalStdout.write || noop,
  end: originalStdout.end || noop,
  flush: originalStdout.flush || noop,
  flushSync: originalStdout.flushSync || noop,
  on: originalStdout.on || noop,
  once: originalStdout.once || noop,
  off: originalStdout.off || noop,
  removeListener: originalStdout.removeListener || noop
}, originalStdout);

var mockStderr = _objectSpread({
  fd: 2,
  // Standard error file descriptor is always 2
  isTTY: false,
  write: originalStderr.write || noop,
  end: originalStderr.end || noop,
  flush: originalStderr.flush || noop,
  flushSync: originalStderr.flushSync || noop,
  on: originalStderr.on || noop,
  once: originalStderr.once || noop,
  off: originalStderr.off || noop,
  removeListener: originalStderr.removeListener || noop
}, originalStderr); // Create a complete process object with all the necessary properties


var polyfillProcess = _objectSpread({}, originalProcess, {
  stdout: mockStdout,
  stderr: mockStderr,
  env: _objectSpread({}, originalProcess && originalProcess.env || {}, {
    NODE_DEBUG: false,
    DEBUG: '' // Disabling debug by default

  })
}); // Conditionally apply the polyfill only in environments where process is not properly defined


if (typeof process === 'undefined' || !process.stdout || !process.stderr || typeof process.stdout.fd === 'undefined' || typeof process.stderr.fd === 'undefined') {
  global.process = polyfillProcess;
}
/**
 * Polyfill for debug package to handle issues with process.stdout and process.stderr
 * This is needed because some environments don't have all expected properties
 */


if (typeof process !== 'undefined') {
  // Create mock objects for stdout and stderr if they don't exist
  if (!process.stdout) {
    process.stdout = {
      fd: 1,
      write: function write() {
        return true;
      },
      isTTY: false
    };
  }

  if (!process.stderr) {
    process.stderr = {
      fd: 2,
      write: function write() {
        return true;
      },
      isTTY: false
    };
  } // Ensure required properties exist on stdout


  if (!process.stdout.fd) process.stdout.fd = 1;
  if (typeof process.stdout.write !== 'function') process.stdout.write = function () {
    return true;
  };
  if (process.stdout.isTTY === undefined) process.stdout.isTTY = false; // Ensure required properties exist on stderr

  if (!process.stderr.fd) process.stderr.fd = 2;
  if (typeof process.stderr.write !== 'function') process.stderr.write = function () {
    return true;
  };
  if (process.stderr.isTTY === undefined) process.stderr.isTTY = false;
} // Debug message override for safer operation


try {
  // Attempt to safely require debug if it's installed
  var debug = require('debug');

  if (debug && typeof debug === 'function') {
    // Add extra error handling to debug
    var originalDebug = debug;

    module.exports = function safeDebug(namespace) {
      var debugInstance = originalDebug(namespace);

      var safeFn = function safeFn() {
        try {
          return debugInstance.apply(this, arguments);
        } catch (e) {
          console.warn("Debug error in namespace ".concat(namespace, ":"), e.message);
          return function () {};
        }
      }; // Copy properties from the original debug instance


      Object.keys(debugInstance).forEach(function (key) {
        safeFn[key] = debugInstance[key];
      });
      return safeFn;
    };
  }
} catch (e) {
  // If debug is not installed or there's an error, provide a no-op function
  module.exports = function () {
    return function () {};
  };
} // Disable debug output in production or serverless environments


if (process.env.NODE_ENV === 'production') {
  process.env.DEBUG = '';
}

module.exports = polyfillProcess;