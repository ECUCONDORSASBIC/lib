"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * Simple querystring polyfill to replace the Node.js built-in module
 */
// Parse a query string into an object
function parse(qs) {
  if (typeof qs !== 'string') {
    return {};
  }

  qs = qs.trim().replace(/^[?#&]/, '');

  if (!qs) {
    return {};
  }

  return qs.split('&').reduce(function (query, param) {
    var _param$split = param.split('='),
        _param$split2 = _slicedToArray(_param$split, 2),
        key = _param$split2[0],
        value = _param$split2[1];

    if (key) {
      var decodedKey = decodeURIComponent(key);
      var decodedValue = value ? decodeURIComponent(value) : '';

      if (query[decodedKey] !== undefined) {
        if (!Array.isArray(query[decodedKey])) {
          query[decodedKey] = [query[decodedKey]];
        }

        query[decodedKey].push(decodedValue);
      } else {
        query[decodedKey] = decodedValue;
      }
    }

    return query;
  }, {});
} // Stringify an object into a query string


function stringify(obj) {
  var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '&';
  var eq = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '=';

  if (!obj || _typeof(obj) !== 'object') {
    return '';
  }

  return Object.keys(obj).filter(function (key) {
    return obj[key] !== undefined && obj[key] !== null;
  }).map(function (key) {
    var value = obj[key];

    if (Array.isArray(value)) {
      return value.map(function (val) {
        return "".concat(encodeURIComponent(key)).concat(eq).concat(encodeURIComponent(val));
      }).join(sep);
    }

    return "".concat(encodeURIComponent(key)).concat(eq).concat(encodeURIComponent(value));
  }).join(sep);
}

module.exports = {
  parse: parse,
  stringify: stringify,
  decode: parse,
  encode: stringify
};