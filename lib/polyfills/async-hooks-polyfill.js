// Simple no-op polyfill for Node.js async_hooks in browser environments

// Create a minimal implementation that does nothing but doesn't error out
const AsyncHooksMock = {
  // Core API methods
  createHook: () => ({
    enable: () => ({}),
    disable: () => ({})
  }),

  // ID tracking methods
  executionAsyncId: () => 1,
  triggerAsyncId: () => 1,
  executionAsyncResource: () => ({}),

  // AsyncResource class (minimal)
  AsyncResource: class AsyncResource {
    constructor(type) {
      this.type = type;
    }

    runInAsyncScope(fn, thisArg, ...args) {
      return fn.apply(thisArg, args);
    }

    emitDestroy() {
      return this;
    }
  }
};

// Use straightforward CommonJS exports to avoid any issues
module.exports = AsyncHooksMock;

// Make individual properties available
Object.keys(AsyncHooksMock).forEach(key => {
  module.exports[key] = AsyncHooksMock[key];
});

// Also export as default for ESM imports
module.exports.default = AsyncHooksMock;

// Direct global assignment as a last resort
if (typeof window !== 'undefined') {
  window.AsyncHooks = AsyncHooksMock;
}

// Support direct import via require('node:async_hooks')
if (typeof module !== 'undefined') {
  module.exports = AsyncHooksMock;

  // Also support named imports
  Object.keys(AsyncHooksMock).forEach(key => {
    module.exports[key] = AsyncHooksMock[key];
  });
}
