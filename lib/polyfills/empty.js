// Empty polyfill for modules that aren't needed in the browser
const emptyModule = {
  // Mock for file descriptor properties
  fd: 0, // Changed from null to 0 to prevent "undefined" errors
  // Common Node.js fs module properties
  read: () => { },
  write: () => { },
  open: () => { },
  close: () => { },
  readFile: () => { },
  writeFile: () => { },
  readFileSync: () => { },
  writeFileSync: () => { },
  existsSync: () => false,
  mkdirSync: () => { },
  createReadStream: () => ({
    on: () => { },
    pipe: () => { },
    destroy: () => { }
  }),
  createWriteStream: () => ({
    on: () => { },
    write: () => { },
    end: () => { }
  }),
  // Stream properties
  Readable: class {
    on() { return this; }
    pipe() { return this; }
    destroy() { }
  },
  Writable: class {
    on() { return this; }
    write() { return true; }
    end() { }
  },
  // Add empty implementations for any other Node.js methods that might be accessed
  on: () => { },
  once: () => { },
  emit: () => { },
  // Handler for property access on undefined
  get: (target, prop) => emptyModule[prop] || null
};

// Use a Proxy to handle any property access that isn't explicitly defined
module.exports = new Proxy(emptyModule, {
  get: (target, prop) => {
    if (prop in target) {
      return target[prop];
    }
    // For any undefined property, return a safe non-undefined value
    if (typeof prop === 'string') {
      return emptyModule.get(target, prop);
    }
    return null;
  }
});
