/**
 * Debug module polyfill for environments where process.stdout and process.stderr
 * may not have all required properties or might be undefined.
 *
 * This is especially important for the 'debug' package which is heavily used by
 * OpenTelemetry and many other Node.js libraries.
 */

// Save the original process if it exists
const originalProcess = typeof process !== 'undefined' ? process : {};
const originalStdout = originalProcess.stdout || {};
const originalStderr = originalProcess.stderr || {};

// Mock function that does nothing (used for write operations)
const noop = () => { };

// Create proper stdout and stderr objects with all required properties
const mockStdout = {
  fd: 1, // Standard output file descriptor is always 1
  isTTY: false,
  write: originalStdout.write || noop,
  end: originalStdout.end || noop,
  flush: originalStdout.flush || noop,
  flushSync: originalStdout.flushSync || noop,
  on: originalStdout.on || noop,
  once: originalStdout.once || noop,
  off: originalStdout.off || noop,
  removeListener: originalStdout.removeListener || noop,
  ...originalStdout
};

const mockStderr = {
  fd: 2, // Standard error file descriptor is always 2
  isTTY: false,
  write: originalStderr.write || noop,
  end: originalStderr.end || noop,
  flush: originalStderr.flush || noop,
  flushSync: originalStderr.flushSync || noop,
  on: originalStderr.on || noop,
  once: originalStderr.once || noop,
  off: originalStderr.off || noop,
  removeListener: originalStderr.removeListener || noop,
  ...originalStderr
};

// Create a complete process object with all the necessary properties
const polyfillProcess = {
  ...originalProcess,
  stdout: mockStdout,
  stderr: mockStderr,
  env: {
    ...((originalProcess && originalProcess.env) || {}),
    NODE_DEBUG: false,
    DEBUG: '',  // Disabling debug by default
  }
};

// Conditionally apply the polyfill only in environments where process is not properly defined
if (typeof process === 'undefined' || !process.stdout || !process.stderr ||
  typeof process.stdout.fd === 'undefined' || typeof process.stderr.fd === 'undefined') {
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
      write: () => true,
      isTTY: false
    };
  }

  if (!process.stderr) {
    process.stderr = {
      fd: 2,
      write: () => true,
      isTTY: false
    };
  }

  // Ensure required properties exist on stdout
  if (!process.stdout.fd) process.stdout.fd = 1;
  if (typeof process.stdout.write !== 'function') process.stdout.write = () => true;
  if (process.stdout.isTTY === undefined) process.stdout.isTTY = false;

  // Ensure required properties exist on stderr
  if (!process.stderr.fd) process.stderr.fd = 2;
  if (typeof process.stderr.write !== 'function') process.stderr.write = () => true;
  if (process.stderr.isTTY === undefined) process.stderr.isTTY = false;
}

// Debug message override for safer operation
try {
  // Attempt to safely require debug if it's installed
  const debug = require('debug');
  if (debug && typeof debug === 'function') {
    // Add extra error handling to debug
    const originalDebug = debug;
    module.exports = function safeDebug(namespace) {
      const debugInstance = originalDebug(namespace);
      const safeFn = function () {
        try {
          return debugInstance.apply(this, arguments);
        } catch (e) {
          console.warn(`Debug error in namespace ${namespace}:`, e.message);
          return () => { };
        }
      };

      // Copy properties from the original debug instance
      Object.keys(debugInstance).forEach(key => {
        safeFn[key] = debugInstance[key];
      });

      return safeFn;
    };
  }
} catch (e) {
  // If debug is not installed or there's an error, provide a no-op function
  module.exports = function () {
    return function () { };
  };
}

// Disable debug output in production or serverless environments
if (process.env.NODE_ENV === 'production') {
  process.env.DEBUG = '';
}

module.exports = polyfillProcess;
