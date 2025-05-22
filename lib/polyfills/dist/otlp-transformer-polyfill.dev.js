"use strict";

/**
 * Polyfill for @opentelemetry/otlp-transformer in browser environments
 * This replaces the module with a minimal implementation to prevent build errors
 */
// Empty implementation of the transformer
module.exports = {
  createExportTraceServiceRequest: function createExportTraceServiceRequest() {
    return {};
  },
  createExportMetricsServiceRequest: function createExportMetricsServiceRequest() {
    return {};
  },
  createExportLogsServiceRequest: function createExportLogsServiceRequest() {
    return {};
  },
  getEncodedSpan: function getEncodedSpan() {
    return Buffer.from([]);
  },
  getEncodedMetric: function getEncodedMetric() {
    return Buffer.from([]);
  },
  getEncodedLog: function getEncodedLog() {
    return Buffer.from([]);
  },
  DefaultResourceAttributes: {},
  ResourceAttributes: {},
  TraceAttributes: {}
};