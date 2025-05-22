"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Mock implementation of Node.js perf_hooks module for browser environments
 * Provides enough of the API to prevent errors when imported in browser contexts
 */
// Create dummy performance measurement functions
var performance = {
  now: function now() {
    return typeof window !== 'undefined' && window.performance ? window.performance.now() : Date.now();
  },
  mark: function mark() {},
  measure: function measure() {},
  getEntriesByName: function getEntriesByName() {
    return [];
  },
  getEntriesByType: function getEntriesByType() {
    return [];
  },
  getEntries: function getEntries() {
    return [];
  },
  clearMarks: function clearMarks() {},
  clearMeasures: function clearMeasures() {},
  nodeTiming: {},
  timeOrigin: typeof window !== 'undefined' && window.performance ? window.performance.timeOrigin : Date.now()
};
module.exports = {
  performance: performance,
  PerformanceObserver:
  /*#__PURE__*/
  function () {
    function PerformanceObserver() {
      _classCallCheck(this, PerformanceObserver);
    }

    _createClass(PerformanceObserver, [{
      key: "observe",
      value: function observe() {}
    }, {
      key: "disconnect",
      value: function disconnect() {}
    }]);

    return PerformanceObserver;
  }(),
  constants: {
    NODE_PERFORMANCE_MILESTONE_BOOTSTRAP_COMPLETE: 0,
    NODE_PERFORMANCE_MILESTONE_V8_START: 1,
    NODE_PERFORMANCE_MILESTONE_V8_STOP: 2,
    NODE_PERFORMANCE_MILESTONE_LOOP_START: 3,
    NODE_PERFORMANCE_MILESTONE_LOOP_STOP: 4
  },
  monitorEventLoopDelay: function monitorEventLoopDelay() {
    return {
      enable: function enable() {},
      disable: function disable() {},
      reset: function reset() {}
    };
  },
  createHistogram: function createHistogram() {
    return {
      percentile: function percentile() {
        return 0;
      },
      max: 0,
      min: 0,
      exceeds: 0,
      mean: 0,
      stddev: 0
    };
  }
};