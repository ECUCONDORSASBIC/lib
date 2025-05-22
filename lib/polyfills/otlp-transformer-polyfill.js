/**
 * Polyfill for @opentelemetry/otlp-transformer in browser environments
 * This replaces the module with a minimal implementation to prevent build errors
 */

// Empty implementation of the transformer
module.exports = {
  createExportTraceServiceRequest: () => ({}),
  createExportMetricsServiceRequest: () => ({}),
  createExportLogsServiceRequest: () => ({}),
  getEncodedSpan: () => Buffer.from([]),
  getEncodedMetric: () => Buffer.from([]),
  getEncodedLog: () => Buffer.from([]),
  DefaultResourceAttributes: {},
  ResourceAttributes: {},
  TraceAttributes: {}
};
