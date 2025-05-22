"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Simple no-op polyfill for Node.js async_hooks in browser environments
// Create a minimal implementation that does nothing but doesn't error out
var AsyncHooksMock = {
  // Core API methods
  createHook: function createHook() {
    return {
      enable: function enable() {
        return {};
      },
      disable: function disable() {
        return {};
      }
    };
  },
  // ID tracking methods
  executionAsyncId: function executionAsyncId() {
    return 1;
  },
  triggerAsyncId: function triggerAsyncId() {
    return 1;
  },
  executionAsyncResource: function executionAsyncResource() {
    return {};
  },
  // AsyncResource class (minimal)
  AsyncResource:
  /*#__PURE__*/
  function () {
    function AsyncResource(type) {
      _classCallCheck(this, AsyncResource);

      this.type = type;
    }

    _createClass(AsyncResource, [{
      key: "runInAsyncScope",
      value: function runInAsyncScope(fn, thisArg) {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        return fn.apply(thisArg, args);
      }
    }, {
      key: "emitDestroy",
      value: function emitDestroy() {
        return this;
      }
    }]);

    return AsyncResource;
  }()
}; // Use straightforward CommonJS exports to avoid any issues

module.exports = AsyncHooksMock; // Make individual properties available

Object.keys(AsyncHooksMock).forEach(function (key) {
  module.exports[key] = AsyncHooksMock[key];
}); // Also export as default for ESM imports

module.exports["default"] = AsyncHooksMock; // Direct global assignment as a last resort

if (typeof window !== 'undefined') {
  window.AsyncHooks = AsyncHooksMock;
} // Support direct import via require('node:async_hooks')


if (typeof module !== 'undefined') {
  module.exports = AsyncHooksMock; // Also support named imports

  Object.keys(AsyncHooksMock).forEach(function (key) {
    module.exports[key] = AsyncHooksMock[key];
  });
}