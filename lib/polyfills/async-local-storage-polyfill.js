/**
 * Custom AsyncLocalStorage polyfill for environments
 * where Node.js AsyncLocalStorage is not available
 */
class MockAsyncLocalStorage {
  constructor() {
    this.store = new Map();
    this._id = 0;
  }

  // Simple run method that creates a context and calls the callback
  run(store, callback, ...args) {
    const id = this._id++;
    this.store.set(id, store);
    try {
      return callback(...args);
    } finally {
      this.store.delete(id);
    }
  }

  // Get the current store value
  getStore() {
    // In this simplified version, we'll just return the last stored value if any
    if (this.store.size === 0) {
      return undefined;
    }
    // Return the last added store
    const lastKey = Math.max(...Array.from(this.store.keys()));
    return this.store.get(lastKey);
  }
}

// Export the polyfill constructor properly
let AsyncLocalStorageClass;

if (typeof global !== 'undefined' && global.AsyncLocalStorage) {
  // Use native AsyncLocalStorage if available
  AsyncLocalStorageClass = global.AsyncLocalStorage;
} else {
  // Otherwise use our mock
  AsyncLocalStorageClass = MockAsyncLocalStorage;
}

// Export as a constructor
module.exports = AsyncLocalStorageClass;
