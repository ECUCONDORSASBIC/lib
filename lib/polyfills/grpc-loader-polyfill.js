/**
 * Polyfill for @grpc/proto-loader in browser environments
 * This replaces the module with an empty implementation to prevent build errors
 */

// Empty implementation of proto-loader for browser environments
module.exports = {
  load: () => Promise.resolve({}),
  loadSync: () => ({}),
  loadPackageDefinition: () => ({}),
  loadFileDescriptorSetFromBuffer: () => ({}),
  loadPackageDefinitionFromBuffer: () => ({}),
  forceFloat64: () => { }
};
