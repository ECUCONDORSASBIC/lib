"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAuthFetch = void 0;

var _AuthContext = require("@/app/contexts/AuthContext");

var _react = require("react");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var useAuthFetch = function useAuthFetch() {
  var _useAuth = (0, _AuthContext.useAuth)(),
      user = _useAuth.user;

  var _useState = (0, _react.useState)(false),
      _useState2 = _slicedToArray(_useState, 2),
      isLoading = _useState2[0],
      setIsLoading = _useState2[1];

  var _useState3 = (0, _react.useState)(null),
      _useState4 = _slicedToArray(_useState3, 2),
      error = _useState4[0],
      setError = _useState4[1];

  var authFetch = (0, _react.useCallback)(function _callee(url) {
    var options,
        token,
        response,
        errorData,
        _args = arguments;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};

            if (user) {
              _context.next = 3;
              break;
            }

            throw new Error('Usuario no autenticado');

          case 3:
            setIsLoading(true);
            setError(null);
            _context.prev = 5;
            _context.next = 8;
            return regeneratorRuntime.awrap(user.getIdToken(true));

          case 8:
            token = _context.sent;
            _context.next = 11;
            return regeneratorRuntime.awrap(fetch(url, _objectSpread({}, options, {
              headers: _objectSpread({
                'Authorization': "Bearer ".concat(token),
                'Content-Type': 'application/json'
              }, options.headers)
            })));

          case 11:
            response = _context.sent;

            if (response.ok) {
              _context.next = 17;
              break;
            }

            _context.next = 15;
            return regeneratorRuntime.awrap(response.json()["catch"](function () {
              return {};
            }));

          case 15:
            errorData = _context.sent;
            throw new Error(errorData.error || "Error ".concat(response.status, ": ").concat(response.statusText));

          case 17:
            _context.next = 19;
            return regeneratorRuntime.awrap(response.json());

          case 19:
            return _context.abrupt("return", _context.sent);

          case 22:
            _context.prev = 22;
            _context.t0 = _context["catch"](5);
            setError(_context.t0.message || 'Error en la petición');
            throw _context.t0;

          case 26:
            _context.prev = 26;
            setIsLoading(false);
            return _context.finish(26);

          case 29:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[5, 22, 26, 29]]);
  }, [user]);
  return {
    authFetch: authFetch,
    isLoading: isLoading,
    error: error
  };
};

exports.useAuthFetch = useAuthFetch;