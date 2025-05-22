"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Polyfill for protobufjs to work in browser environments
 * This helps fix build issues with @genkit-ai/core dependency
 */
// Ensure global objects are available
if (typeof window !== 'undefined') {
  // Browser environment polyfills
  global.Buffer = global.Buffer || require('buffer/').Buffer;
  global.process = global.process || require('process/browser'); // Define missing Node.js modules with minimal implementations

  global.fs = {
    readFileSync: function readFileSync() {
      return Buffer.from([]);
    },
    existsSync: function existsSync() {
      return false;
    },
    readFile: function readFile(_, cb) {
      return cb(null, Buffer.from([]));
    },
    writeFile: function writeFile(_, __, cb) {
      return cb(null);
    }
  };
  global.path = require('path-browserify');
  global.util = require('util/');
} // Export a minimal protobufjs API to prevent runtime errors


var fakeProto = {
  load: function load() {
    return Promise.resolve(createFakeRoot());
  },
  loadSync: function loadSync() {
    return createFakeRoot();
  },
  parse: function parse() {
    return createFakeRoot();
  },
  Root:
  /*#__PURE__*/
  function () {
    function Root() {
      _classCallCheck(this, Root);

      this.nested = {};
    }

    _createClass(Root, [{
      key: "lookup",
      value: function lookup() {
        return null;
      }
    }, {
      key: "lookupType",
      value: function lookupType() {
        return createFakeType();
      }
    }, {
      key: "create",
      value: function create() {
        return {};
      }
    }, {
      key: "add",
      value: function add() {
        return this;
      }
    }]);

    return Root;
  }(),
  Type:
  /*#__PURE__*/
  function () {
    function Type() {
      _classCallCheck(this, Type);
    }

    _createClass(Type, [{
      key: "encode",
      value: function encode() {
        return Buffer.from([]);
      }
    }, {
      key: "decode",
      value: function decode() {
        return {};
      }
    }, {
      key: "create",
      value: function create() {
        return {};
      }
    }]);

    return Type;
  }(),
  Field: function Field() {
    _classCallCheck(this, Field);
  },
  Message: function Message() {
    _classCallCheck(this, Message);
  },
  Enum: function Enum() {
    _classCallCheck(this, Enum);
  },
  Service: function Service() {
    _classCallCheck(this, Service);
  }
};

function createFakeRoot() {
  return new fakeProto.Root();
}

function createFakeType() {
  return new fakeProto.Type();
}

module.exports = fakeProto;