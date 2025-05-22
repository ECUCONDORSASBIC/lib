/**
 * Specific polyfills for Firebase in browser environments
 * This file helps with Firestore-specific issues, particularly with protobuf handling
 */

// Override specific modules that Firebase depends on with empty implementations
// This is done globally so Firebase can find these implementations when needed
if (typeof window !== 'undefined') {
  // These modules are used by @firebase/firestore but cause issues in browser environments
  global['@firebase/firestore/dist/index.node.mjs'] = {};
  global['@grpc/proto-loader'] = {
    loadSync: () => ({}),
    load: () => Promise.resolve({}),
  };
  global['protobufjs'] = {
    load: () => Promise.resolve({ root: {} }),
    loadSync: () => ({ root: {} }),
  };
}

// No-op export - this module is used for its side effects
export default {};
