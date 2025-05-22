/**
 * Global polyfills for browser compatibility
 * This file should be imported at the application root level
 */

// Only apply polyfills in browser environment
if (typeof window !== 'undefined') {
  try {
    // Import all polyfills with proper error handling
    require('../lib/polyfills/firebase-polyfill'); // Firebase-specific polyfills
    require('../lib/polyfills/nodejs-polyfills');
    require('../lib/polyfills/protobuf-polyfill');
    require('./polyfills.css'); // CSS overrides
  } catch (err) {
    console.error('Error loading polyfills:', err);
  }
}

// No-op export, this file is primarily for its side effects
export default {};
