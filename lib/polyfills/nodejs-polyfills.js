/**
 * General polyfills for Node.js APIs in browser environments
 * This file consolidates all necessary browser polyfills for Node.js APIs
 */

// Only apply in browser environments
if (typeof window !== 'undefined') {
  // Core polyfills
  global.Buffer = global.Buffer || require('buffer/').Buffer;
  global.process = global.process || require('process/browser');

  // File system polyfills
  global.fs = {
    readFileSync: () => Buffer.from([]),
    existsSync: () => false,
    readFile: (_, cb) => cb ? cb(null, Buffer.from([])) : Promise.resolve(Buffer.from([])),
    writeFile: (_, __, cb) => cb ? cb(null) : Promise.resolve(),
    promises: {
      readFile: () => Promise.resolve(Buffer.from([])),
      writeFile: () => Promise.resolve(),
      access: () => Promise.resolve(),
    },
    createReadStream: () => ({
      on: () => ({}),
      pipe: () => ({}),
    }),
    createWriteStream: () => ({
      on: () => ({}),
      write: () => true,
      end: () => ({}),
    }),
  };

  // Path polyfills
  global.path = global.path || require('path-browserify');

  // OS polyfills
  global.os = {
    platform: () => 'browser',
    tmpdir: () => '/tmp',
    homedir: () => '/home',
    hostname: () => 'browser',
    userInfo: () => ({}),
  };

  // Other common Node.js modules
  global.child_process = {
    spawn: () => ({
      on: () => ({}),
      stdout: { on: () => ({}) },
      stderr: { on: () => ({}) },
    }),
    exec: (_, cb) => cb ? cb(null, '', '') : Promise.resolve({ stdout: '', stderr: '' }),
  };

  // Network-related polyfills
  global.net = {
    createServer: () => ({ listen: () => ({}) }),
    connect: () => ({ on: () => ({}) }),
  };

  global.dns = {
    lookup: (_, cb) => cb(null, '127.0.0.1', 4),
    resolve: (_, cb) => cb(null, ['127.0.0.1']),
  };
}

// Export empty module - this is just for side effects
export default {};
