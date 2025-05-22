"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Custom AsyncLocalStorage polyfill for environments
 * where Node.js AsyncLocalStorage is not available
 */
var MockAsyncLocalStorage =
/*#__PURE__*/
function () {
  function MockAsyncLocalStorage() {
    _classCallCheck(this, MockAsyncLocalStorage);

    this.store = new Map();
    this._id = 0;
  } // Simple run method that creates a context and calls the callback


  _createClass(MockAsyncLocalStorage, [{
    key: "run",
    value: function run(store, callback) {
      var id = this._id++;
      this.store.set(id, store);

      try {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        return callback.apply(void 0, args);
      } finally {
        this.store["delete"](id);
      }
    } // Get the current store value

  }, {
    key: "getStore",
    value: function getStore() {
      // In this simplified version, we'll just return the last stored value if any
      if (this.store.size === 0) {
        return undefined;
      } // Return the last added store


      var lastKey = Math.max.apply(Math, _toConsumableArray(Array.from(this.store.keys())));
      return this.store.get(lastKey);
    }
  }]);

  return MockAsyncLocalStorage;
}(); // Export the polyfill constructor properly


var AsyncLocalStorageClass;

if (typeof global !== 'undefined' && global.AsyncLocalStorage) {
  // Use native AsyncLocalStorage if available
  AsyncLocalStorageClass = global.AsyncLocalStorage;
} else {
  // Otherwise use our mock
  AsyncLocalStorageClass = MockAsyncLocalStorage;
} // Export as a constructor


module.exports = AsyncLocalStorageClass;