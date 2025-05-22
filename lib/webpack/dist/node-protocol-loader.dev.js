"use strict";

/**
 * Custom webpack loader to replace Node.js protocol imports
 *
 * This loader transforms imports that use 'node:' protocol syntax to reference our polyfills
 */
module.exports = function (source) {
  // Cache the loader result since this can be expensive
  this.cacheable && this.cacheable(); // Use a hardcoded relative path to the polyfill instead of require.resolve

  var polyfillPath = '../polyfills/async-hooks-polyfill.js'; // Replace all node:async_hooks imports with our polyfill using relative paths

  var modifiedSource = source.replace(/require\(['"]node:async_hooks['"]\)/g, "require('" + polyfillPath + "')").replace(/import\s+.*\s+from\s+['"]node:async_hooks['"]/g, "import AsyncHooks from '" + polyfillPath + "'").replace(/import\s+{(.*)}\s+from\s+['"]node:async_hooks['"]/g, "import {$1} from '" + polyfillPath + "'").replace(/import\s+['"]node:async_hooks['"]/g, "import '" + polyfillPath + "'");
  return modifiedSource;
};