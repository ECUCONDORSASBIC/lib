"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/**
 * General polyfills for Node.js APIs in browser environments
 * This file consolidates all necessary browser polyfills for Node.js APIs
 */
// Only apply in browser environments
if (typeof window !== 'undefined') {
  // Core polyfills
  global.Buffer = global.Buffer || require('buffer/').Buffer;
  global.process = global.process || require('process/browser'); // File system polyfills

  global.fs = {
    readFileSync: function readFileSync() {
      return Buffer.from([]);
    },
    existsSync: function existsSync() {
      return false;
    },
    readFile: function readFile(_, cb) {
      return cb ? cb(null, Buffer.from([])) : Promise.resolve(Buffer.from([]));
    },
    writeFile: function writeFile(_, __, cb) {
      return cb ? cb(null) : Promise.resolve();
    },
    promises: {
      readFile: function readFile() {
        return Promise.resolve(Buffer.from([]));
      },
      writeFile: function writeFile() {
        return Promise.resolve();
      },
      access: function access() {
        return Promise.resolve();
      }
    },
    createReadStream: function createReadStream() {
      return {
        on: function on() {
          return {};
        },
        pipe: function pipe() {
          return {};
        }
      };
    },
    createWriteStream: function createWriteStream() {
      return {
        on: function on() {
          return {};
        },
        write: function write() {
          return true;
        },
        end: function end() {
          return {};
        }
      };
    }
  }; // Path polyfills

  global.path = global.path || require('path-browserify'); // OS polyfills

  global.os = {
    platform: function platform() {
      return 'browser';
    },
    tmpdir: function tmpdir() {
      return '/tmp';
    },
    homedir: function homedir() {
      return '/home';
    },
    hostname: function hostname() {
      return 'browser';
    },
    userInfo: function userInfo() {
      return {};
    }
  }; // Other common Node.js modules

  global.child_process = {
    spawn: function spawn() {
      return {
        on: function on() {
          return {};
        },
        stdout: {
          on: function on() {
            return {};
          }
        },
        stderr: {
          on: function on() {
            return {};
          }
        }
      };
    },
    exec: function exec(_, cb) {
      return cb ? cb(null, '', '') : Promise.resolve({
        stdout: '',
        stderr: ''
      });
    }
  }; // Network-related polyfills

  global.net = {
    createServer: function createServer() {
      return {
        listen: function listen() {
          return {};
        }
      };
    },
    connect: function connect() {
      return {
        on: function on() {
          return {};
        }
      };
    }
  };
  global.dns = {
    lookup: function lookup(_, cb) {
      return cb(null, '127.0.0.1', 4);
    },
    resolve: function resolve(_, cb) {
      return cb(null, ['127.0.0.1']);
    }
  };
} // Export empty module - this is just for side effects


var _default = {};
exports["default"] = _default;