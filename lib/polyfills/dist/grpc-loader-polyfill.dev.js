"use strict";

/**
 * Polyfill for @grpc/proto-loader in browser environments
 * This replaces the module with an empty implementation to prevent build errors
 */
// Empty implementation of proto-loader for browser environments
module.exports = {
  load: function load() {
    return Promise.resolve({});
  },
  loadSync: function loadSync() {
    return {};
  },
  loadPackageDefinition: function loadPackageDefinition() {
    return {};
  },
  loadFileDescriptorSetFromBuffer: function loadFileDescriptorSetFromBuffer() {
    return {};
  },
  loadPackageDefinitionFromBuffer: function loadPackageDefinitionFromBuffer() {
    return {};
  },
  forceFloat64: function forceFloat64() {}
};