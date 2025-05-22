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

  return qs.split('&').reduce((query, param) => {
    const [key, value] = param.split('=');
    if (key) {
      const decodedKey = decodeURIComponent(key);
      const decodedValue = value ? decodeURIComponent(value) : '';

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
}

// Stringify an object into a query string
function stringify(obj, sep = '&', eq = '=') {
  if (!obj || typeof obj !== 'object') {
    return '';
  }

  return Object.keys(obj)
    .filter(key => obj[key] !== undefined && obj[key] !== null)
    .map(key => {
      const value = obj[key];
      if (Array.isArray(value)) {
        return value
          .map(val => `${encodeURIComponent(key)}${eq}${encodeURIComponent(val)}`)
          .join(sep);
      }
      return `${encodeURIComponent(key)}${eq}${encodeURIComponent(value)}`;
    })
    .join(sep);
}

module.exports = {
  parse,
  stringify,
  decode: parse,
  encode: stringify,
};
