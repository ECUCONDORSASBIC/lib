/**
 * Custom webpack loader to handle the require-in-the-middle module
 * This module causes issues in webpack because it uses Node.js specific features
 */
module.exports = function (source) {
  // Create a mock implementation that doesn't break in webpack
  const mockedSource = `
    // Mock implementation of require-in-the-middle for webpack compatibility
    module.exports = function hook(modules, options, onrequire) {
      // This is a simplified version that just returns a no-op function
      if (typeof options === 'function') {
        onrequire = options;
        options = {};
      }

      // Return unhook function that does nothing
      return function unhook() {};
    };

    // Add the core method to preserve API compatibility
    module.exports.core = function hookCore() {
      return function unhookCore() {};
    };
  `;

  return mockedSource;
};
