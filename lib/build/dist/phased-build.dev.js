"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Phased Build Script
 * Runs the Next.js build in multiple phases to reduce memory usage
 */
var _require = require('child_process'),
    execSync = _require.execSync;

var fs = require('fs');

var path = require('path'); // Configuration


var config = {
  // Time to wait between phases in ms
  pauseBetweenPhases: 5000,
  // Memory cleanup commands
  memoryCleanup: {
    windows: ['wmic process where name="node.exe" get workingsetsize,processid,commandline', 'powershell -Command "Get-Process node | Select-Object Id, ProcessName, WorkingSet | Sort-Object -Descending WorkingSet | Format-Table -AutoSize"']
  },
  // Build phases
  phases: [{
    name: 'Cleanup',
    command: 'node lib/build/cleanup.js'
  }, {
    name: 'Directory preparation',
    command: 'node lib/build/prebuild.js'
  }, {
    name: 'Main build',
    command: 'next build --no-lint',
    env: {
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  }]
};
/**
 * Execute a command with the specified environment variables
 * @param {string} command - The command to execute
 * @param {object} env - Environment variables to set
 */

function executeCommand(command) {
  var env = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  console.log("\n\uD83D\uDE80 Executing: ".concat(command));

  try {
    // Create an environment with the current process env plus any additional variables
    var combinedEnv = _objectSpread({}, process.env, {}, env); // Execute the command


    execSync(command, {
      stdio: 'inherit',
      env: combinedEnv
    });
    console.log("\u2705 Command completed successfully: ".concat(command));
    return true;
  } catch (error) {
    console.error("\u274C Command failed: ".concat(command));
    console.error("Error: ".concat(error.message));
    return false;
  }
}
/**
 * Show memory usage statistics
 */


function showMemoryUsage() {
  console.log('\n📊 Memory Usage:'); // Show Node.js process memory

  var memoryUsage = process.memoryUsage();
  console.log('Current Process:');
  console.log("- RSS:        ".concat(formatBytes(memoryUsage.rss)));
  console.log("- Heap Total: ".concat(formatBytes(memoryUsage.heapTotal)));
  console.log("- Heap Used:  ".concat(formatBytes(memoryUsage.heapUsed)));
  console.log("- External:   ".concat(formatBytes(memoryUsage.external))); // Platform-specific memory info

  if (process.platform === 'win32') {
    try {
      config.memoryCleanup.windows.forEach(function (cmd) {
        console.log("\nRunning: ".concat(cmd));
        execSync(cmd, {
          stdio: 'inherit'
        });
      });
    } catch (error) {
      console.log('Error getting detailed process info:', error.message);
    }
  }
}
/**
 * Format bytes to a human-readable string
 * @param {number} bytes - The bytes to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */


function formatBytes(bytes) {
  var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  if (bytes === 0) return '0 Bytes';
  var k = 1024;
  var dm = decimals < 0 ? 0 : decimals;
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
/**
 * Pause execution for specified milliseconds
 * @param {number} ms - Milliseconds to pause
 * @returns {Promise} Resolves after the pause
 */


function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}
/**
 * Run a garbage collection if possible
 */


function tryGarbageCollection() {
  if (global.gc) {
    console.log('🧹 Running manual garbage collection...');
    global.gc();
    console.log('✅ Garbage collection completed');
  }
}
/**
 * Main function to run the phased build
 */


function main() {
  var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, index, phase, success;

  return regeneratorRuntime.async(function main$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("\n=====================================\n   \uD83D\uDE80 Starting Phased Build Process\n=====================================\n"); // Check available disk space

          if (process.platform === 'win32') {
            try {
              console.log('💾 Available disk space:');
              execSync('wmic logicaldisk get deviceid,freespace,size /format:list', {
                stdio: 'inherit'
              });
            } catch (error) {
              console.log('Could not check disk space:', error.message);
            }
          } // Run each phase


          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 5;
          _iterator = config.phases.entries()[Symbol.iterator]();

        case 7:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 22;
            break;
          }

          _step$value = _slicedToArray(_step.value, 2), index = _step$value[0], phase = _step$value[1];
          console.log("\n\uD83D\uDCD1 PHASE ".concat(index + 1, "/").concat(config.phases.length, ": ").concat(phase.name)); // Show memory before phase

          showMemoryUsage(); // Execute the phase command

          success = executeCommand(phase.command, phase.env || {});

          if (!success) {
            console.error("\n\u274C Phase ".concat(index + 1, " (").concat(phase.name, ") failed. Stopping build process."));
            process.exit(1);
          } // Try to free memory


          tryGarbageCollection(); // Show memory after phase

          showMemoryUsage(); // Pause between phases

          if (!(index < config.phases.length - 1)) {
            _context.next = 19;
            break;
          }

          console.log("\n\u23F1\uFE0F Pausing for ".concat(config.pauseBetweenPhases / 1000, " seconds before next phase..."));
          _context.next = 19;
          return regeneratorRuntime.awrap(sleep(config.pauseBetweenPhases));

        case 19:
          _iteratorNormalCompletion = true;
          _context.next = 7;
          break;

        case 22:
          _context.next = 28;
          break;

        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](5);
          _didIteratorError = true;
          _iteratorError = _context.t0;

        case 28:
          _context.prev = 28;
          _context.prev = 29;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 31:
          _context.prev = 31;

          if (!_didIteratorError) {
            _context.next = 34;
            break;
          }

          throw _iteratorError;

        case 34:
          return _context.finish(31);

        case 35:
          return _context.finish(28);

        case 36:
          console.log("\n=====================================\n   \u2705 Phased Build Process Complete\n=====================================\n");

        case 37:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[5, 24, 28, 36], [29,, 31, 35]]);
} // Start the build process


main()["catch"](function (error) {
  console.error('Build process failed:', error);
  process.exit(1);
});