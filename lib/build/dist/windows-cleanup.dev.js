"use strict";

/**
 * Windows-specific disk cleanup utility
 * This script helps free up disk space on Windows by cleaning:
 * - Windows temp files
 * - User temp files
 * - npm/pnpm cache files
 */
var fs = require('fs');

var path = require('path');

var _require = require('child_process'),
    execSync = _require.execSync;

var rimraf = require('rimraf');

var os = require('os'); // Only proceed on Windows


if (process.platform !== 'win32') {
  console.log('This script is Windows-specific. Exiting...');
  process.exit(0);
} // Log header


console.log("\n===========================================\n   \uD83E\uDDF9 Windows Disk Cleanup Utility \uD83E\uDDF9\n===========================================\n"); // Utility to get human-readable size

function formatBytes(bytes) {
  var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  if (bytes === 0) return '0 Bytes';
  var k = 1024;
  var dm = decimals < 0 ? 0 : decimals;
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
} // Report disk space


function reportDiskSpace() {
  try {
    console.log('\n📊 Disk Space Report:');
    var diskInfo = execSync('wmic logicaldisk get deviceid,freespace,size /format:list', {
      encoding: 'utf8'
    }); // Parse the output

    var lines = diskInfo.split('\n');
    var currentDrive = {};
    var drives = [];
    lines.forEach(function (line) {
      line = line.trim();
      if (!line) return;

      if (line.startsWith('DeviceID')) {
        if (currentDrive.DeviceID) drives.push(currentDrive);
        currentDrive = {
          DeviceID: line.split('=')[1]
        };
      } else if (line.startsWith('FreeSpace')) {
        currentDrive.FreeSpace = parseInt(line.split('=')[1], 10);
      } else if (line.startsWith('Size')) {
        currentDrive.Size = parseInt(line.split('=')[1], 10);
        drives.push(currentDrive);
        currentDrive = {};
      }
    }); // Display formatted report

    drives.forEach(function (drive) {
      if (!drive.DeviceID || !drive.Size) return;
      var used = drive.Size - (drive.FreeSpace || 0);
      var usedPercent = (used / drive.Size * 100).toFixed(1);
      console.log("Drive ".concat(drive.DeviceID, ":"));
      console.log("  Total: ".concat(formatBytes(drive.Size)));
      console.log("  Free:  ".concat(formatBytes(drive.FreeSpace || 0), " (").concat(100 - usedPercent, "%)"));
      console.log("  Used:  ".concat(formatBytes(used), " (").concat(usedPercent, "%)"));
    });
  } catch (error) {
    console.log('Could not report disk space:', error.message);
  }
} // Run Windows disk cleanup utility


function runWindowsDiskCleanup() {
  return regeneratorRuntime.async(function runWindowsDiskCleanup$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('\n🧹 Running Windows built-in disk cleanup...');

          try {
            // Use the built-in Windows cleanmgr utility in silent mode
            // /sagerun:1 uses predefined settings (system files, temporary files, etc.)
            execSync('cleanmgr /sagerun:1', {
              stdio: 'ignore'
            });
            console.log('✅ Windows disk cleanup completed');
          } catch (error) {
            console.log('⚠️ Could not run Windows disk cleanup:', error.message);
          }

        case 2:
        case "end":
          return _context.stop();
      }
    }
  });
} // Clean specific temp directories


function cleanTempDirs() {
  var tempDirs, _i, _tempDirs, dir, entries, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, entry, entryPath, stats;

  return regeneratorRuntime.async(function cleanTempDirs$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log('\n🧹 Cleaning temporary directories...');
          tempDirs = [// Windows temp
          process.env.TEMP, process.env.TMP, 'C:\\Windows\\Temp', // User temp
          path.join(os.homedir(), 'AppData\\Local\\Temp'), // npm cache
          path.join(os.homedir(), 'AppData\\Roaming\\npm-cache'), path.join(os.homedir(), 'AppData\\Local\\npm-cache'), // pnpm store
          path.join(os.homedir(), '.pnpm-store')];
          _i = 0, _tempDirs = tempDirs;

        case 3:
          if (!(_i < _tempDirs.length)) {
            _context2.next = 53;
            break;
          }

          dir = _tempDirs[_i];

          if (!(!dir || !fs.existsSync(dir))) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("continue", 50);

        case 7:
          console.log("Cleaning ".concat(dir, "..."));
          _context2.prev = 8;
          // Get the list of files/dirs in the temp directory
          entries = fs.readdirSync(dir); // Try to delete each entry

          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context2.prev = 13;
          _iterator = entries[Symbol.iterator]();

        case 15:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context2.next = 30;
            break;
          }

          entry = _step.value;
          entryPath = path.join(dir, entry);
          _context2.prev = 18;
          stats = fs.statSync(entryPath); // Skip files in use by excluding some patterns

          if (!(entry.includes('.lock') || entry.includes('.tmp') || entry.endsWith('.exe') || entry.endsWith('.dll'))) {
            _context2.next = 22;
            break;
          }

          return _context2.abrupt("continue", 27);

        case 22:
          rimraf.sync(entryPath, {
            maxRetries: 3,
            glob: false
          });
          _context2.next = 27;
          break;

        case 25:
          _context2.prev = 25;
          _context2.t0 = _context2["catch"](18);

        case 27:
          _iteratorNormalCompletion = true;
          _context2.next = 15;
          break;

        case 30:
          _context2.next = 36;
          break;

        case 32:
          _context2.prev = 32;
          _context2.t1 = _context2["catch"](13);
          _didIteratorError = true;
          _iteratorError = _context2.t1;

        case 36:
          _context2.prev = 36;
          _context2.prev = 37;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 39:
          _context2.prev = 39;

          if (!_didIteratorError) {
            _context2.next = 42;
            break;
          }

          throw _iteratorError;

        case 42:
          return _context2.finish(39);

        case 43:
          return _context2.finish(36);

        case 44:
          console.log("\u2705 Cleaned ".concat(dir));
          _context2.next = 50;
          break;

        case 47:
          _context2.prev = 47;
          _context2.t2 = _context2["catch"](8);
          console.log("\u26A0\uFE0F Could not clean ".concat(dir, ": ").concat(_context2.t2.message));

        case 50:
          _i++;
          _context2.next = 3;
          break;

        case 53:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[8, 47], [13, 32, 36, 44], [18, 25], [37,, 39, 43]]);
} // Clean old npm packages


function cleanNodeModules() {
  return regeneratorRuntime.async(function cleanNodeModules$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log('\n🧹 Cleaning project node_modules...');

          try {
            rimraf.sync('node_modules/.cache', {
              glob: false
            });
            console.log('✅ Cleaned node_modules/.cache'); // Keep essential modules but remove dev dependencies

            console.log('✅ Node modules cleanup completed');
          } catch (err) {
            console.log("\u26A0\uFE0F Could not clean node_modules: ".concat(err.message));
          }

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  });
} // Main function


function main() {
  return regeneratorRuntime.async(function main$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          // Report initial disk space
          reportDiskSpace(); // Clean temp directories

          _context4.next = 3;
          return regeneratorRuntime.awrap(cleanTempDirs());

        case 3:
          _context4.next = 5;
          return regeneratorRuntime.awrap(cleanNodeModules());

        case 5:
          _context4.next = 7;
          return regeneratorRuntime.awrap(runWindowsDiskCleanup());

        case 7:
          // Report final disk space
          console.log('\n📊 Disk space after cleanup:');
          reportDiskSpace();
          console.log('\n✅ Windows disk cleanup completed!');

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  });
} // Run the cleanup


main()["catch"](console.error);