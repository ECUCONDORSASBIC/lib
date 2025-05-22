"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Empty polyfill for modules that aren't needed in the browser
var emptyModule = {
  // Mock for file descriptor properties
  fd: 0,
  // Changed from null to 0 to prevent "undefined" errors
  // Common Node.js fs module properties
  read: function read() {},
  write: function write() {},
  open: function open() {},
  close: function close() {},
  readFile: function readFile() {},
  writeFile: function writeFile() {},
  readFileSync: function readFileSync() {},
  writeFileSync: function writeFileSync() {},
  existsSync: function existsSync() {
    return false;
  },
  mkdirSync: function mkdirSync() {},
  createReadStream: function createReadStream() {
    return {
      on: function on() {},
      pipe: function pipe() {},
      destroy: function destroy() {}
    };
  },
  createWriteStream: function createWriteStream() {
    return {
      on: function on() {},
      write: function write() {},
      end: function end() {}
    };
  },
  // Stream properties
  Readable:
  /*#__PURE__*/
  function () {
    function Readable() {
      _classCallCheck(this, Readable);
    }

    _createClass(Readable, [{
      key: "on",
      value: function on() {
        return this;
      }
    }, {
      key: "pipe",
      value: function pipe() {
        return this;
      }
    }, {
      key: "destroy",
      value: function destroy() {}
    }]);

    return Readable;
  }(),
  Writable:
  /*#__PURE__*/
  function () {
    function Writable() {
      _classCallCheck(this, Writable);
    }

    _createClass(Writable, [{
      key: "on",
      value: function on() {
        return this;
      }
    }, {
      key: "write",
      value: function write() {
        return true;
      }
    }, {
      key: "end",
      value: function end() {}
    }]);

    return Writable;
  }(),
  // Add empty implementations for any other Node.js methods that might be accessed
  on: function on() {},
  once: function once() {},
  emit: function emit() {},
  // Handler for property access on undefined
  get: function get(target, prop) {
    return emptyModule[prop] || null;
  }
}; // Use a Proxy to handle any property access that isn't explicitly defined

module.exports = new Proxy(emptyModule, {
  get: function get(target, prop) {
    if (prop in target) {
      return target[prop];
    } // For any undefined property, return a safe non-undefined value


    if (typeof prop === 'string') {
      return emptyModule.get(target, prop);
    }

    return null;
  }
});