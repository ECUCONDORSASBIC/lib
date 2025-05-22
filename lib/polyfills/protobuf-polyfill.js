/**
 * Polyfill for protobufjs to work in browser environments
 * This helps fix build issues with @genkit-ai/core dependency
 */

// Ensure global objects are available
if (typeof window !== 'undefined') {
  // Browser environment polyfills
  global.Buffer = global.Buffer || require('buffer/').Buffer;
  global.process = global.process || require('process/browser');

  // Define missing Node.js modules with minimal implementations
  global.fs = {
    readFileSync: () => Buffer.from([]),
    existsSync: () => false,
    readFile: (_, cb) => cb(null, Buffer.from([])),
    writeFile: (_, __, cb) => cb(null)
  };
  global.path = require('path-browserify');
  global.util = require('util/');
}

// Export a minimal protobufjs API to prevent runtime errors
const fakeProto = {
  load: () => Promise.resolve(createFakeRoot()),
  loadSync: () => createFakeRoot(),
  parse: () => createFakeRoot(),
  Root: class Root {
    constructor() {
      this.nested = {};
    }
    lookup() { return null; }
    lookupType() { return createFakeType(); }
    create() { return {}; }
    add() { return this; }
  },
  Type: class Type {
    constructor() { }
    encode() { return Buffer.from([]); }
    decode() { return {}; }
    create() { return {}; }
  },
  Field: class Field {
    constructor() { }
  },
  Message: class Message {
    constructor() { }
  },
  Enum: class Enum {
    constructor() { }
  },
  Service: class Service {
    constructor() { }
  }
};

function createFakeRoot() {
  return new fakeProto.Root();
}

function createFakeType() {
  return new fakeProto.Type();
}

module.exports = fakeProto;
