/**
 * Mock implementation of Node.js perf_hooks module for browser environments
 * Provides enough of the API to prevent errors when imported in browser contexts
 */

// Create dummy performance measurement functions
const performance = {
  now: () => typeof window !== 'undefined' && window.performance ? window.performance.now() : Date.now(),
  mark: () => { },
  measure: () => { },
  getEntriesByName: () => [],
  getEntriesByType: () => [],
  getEntries: () => [],
  clearMarks: () => { },
  clearMeasures: () => { },
  nodeTiming: {},
  timeOrigin: typeof window !== 'undefined' && window.performance ? window.performance.timeOrigin : Date.now()
};

module.exports = {
  performance,
  PerformanceObserver: class PerformanceObserver {
    constructor() { }
    observe() { }
    disconnect() { }
  },
  constants: {
    NODE_PERFORMANCE_MILESTONE_BOOTSTRAP_COMPLETE: 0,
    NODE_PERFORMANCE_MILESTONE_V8_START: 1,
    NODE_PERFORMANCE_MILESTONE_V8_STOP: 2,
    NODE_PERFORMANCE_MILESTONE_LOOP_START: 3,
    NODE_PERFORMANCE_MILESTONE_LOOP_STOP: 4
  },
  monitorEventLoopDelay: () => ({
    enable: () => { },
    disable: () => { },
    reset: () => { }
  }),
  createHistogram: () => ({
    percentile: () => 0,
    max: 0,
    min: 0,
    exceeds: 0,
    mean: 0,
    stddev: 0
  })
};
