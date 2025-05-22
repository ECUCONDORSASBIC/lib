"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/**
 * Specific polyfills for Firebase in browser environments
 * This file helps with Firestore-specific issues, particularly with protobuf handling
 */
// Override specific modules that Firebase depends on with empty implementations
// This is done globally so Firebase can find these implementations when needed
if (typeof window !== 'undefined') {
  // These modules are used by @firebase/firestore but cause issues in browser environments
  global['@firebase/firestore/dist/index.node.mjs'] = {};
  global['@grpc/proto-loader'] = {
    loadSync: function loadSync() {
      return {};
    },
    load: function load() {
      return Promise.resolve({});
    }
  };
  global['protobufjs'] = {
    load: function load() {
      return Promise.resolve({
        root: {}
      });
    },
    loadSync: function loadSync() {
      return {
        root: {}
      };
    }
  };
} // No-op export - this module is used for its side effects


var _default = {};
exports["default"] = _default;