/**
 * Simple patch for OpenTelemetry issues in Next.js
 * This provides stub implementations of OpenTelemetry APIs that are compatible with webpack
 */

// Create no-op implementations of core functionality
const noopTracer = {
  startSpan: () => ({
    end: () => { },
    setAttribute: () => { },
    setAttributes: () => { },
    recordException: () => { },
    updateName: () => { },
    isRecording: () => false,
  }),
  startActiveSpan: (name, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
    }
    return callback({
      end: () => { },
      setAttribute: () => { },
      setAttributes: () => { },
      recordException: () => { },
      updateName: () => { },
      isRecording: () => false,
    });
  },
  getActiveSpan: () => null,
};

const noopMeter = {
  createHistogram: () => ({
    record: () => { },
  }),
  createCounter: () => ({
    add: () => { },
  }),
  createObservableGauge: () => ({}),
  createObservableCounter: () => ({}),
};

// Export a simplified SDK that doesn't actually do anything
module.exports = {
  NodeSDK: class NodeSDK {
    constructor() { }
    start() { return this; }
    shutdown() { return Promise.resolve(); }
  },
  trace: {
    getTracer: () => noopTracer,
  },
  metrics: {
    getMeter: () => noopMeter,
  },
  diag: {
    setLogger: () => { },
    DiagLogLevel: { NONE: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4, ALL: 5 },
  }
};
