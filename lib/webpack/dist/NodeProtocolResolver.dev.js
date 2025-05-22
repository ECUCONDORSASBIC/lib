"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Custom webpack plugin to resolve 'node:' protocol imports to polyfills
 */
var NodeProtocolResolver =
/*#__PURE__*/
function () {
  function NodeProtocolResolver(polyfills) {
    _classCallCheck(this, NodeProtocolResolver);

    this.polyfills = polyfills || {};
  }

  _createClass(NodeProtocolResolver, [{
    key: "apply",
    value: function apply(resolver) {
      var _this = this;

      var target = resolver.ensureHook('resolve');
      resolver.getHook('described-resolve').tapAsync('NodeProtocolResolver', function (request, resolveContext, callback) {
        // Check if this is a node: protocol import
        if (request.request && request.request.startsWith('node:')) {
          var moduleName = request.request.substring(5); // Remove 'node:' prefix
          // If we have a specific polyfill for this module, use it

          if (_this.polyfills["node:".concat(moduleName)] || _this.polyfills[moduleName]) {
            var polyfillPath = _this.polyfills["node:".concat(moduleName)] || _this.polyfills[moduleName]; // Create a new request pointing to our polyfill


            var newRequest = _objectSpread({}, request, {
              request: polyfillPath
            }); // Continue resolution with our polyfill path


            return resolver.doResolve(target, newRequest, null, resolveContext, callback);
          }
        } // For any other request, continue normal resolution


        callback();
      });
    }
  }]);

  return NodeProtocolResolver;
}();

module.exports = NodeProtocolResolver;