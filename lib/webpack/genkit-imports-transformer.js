/**
 * Special loader to transform imports in @genkit-ai modules
 * This will replace any node: protocol imports with our polyfills
 */
module.exports = function (source) {
  let transformedSource = source;

  // Replace async_hooks imports
  transformedSource = transformedSource.replace(
    /require\(['"]node:async_hooks['"]\)/g,
    "require('@/lib/polyfills/async-hooks-polyfill.js')"
  ).replace(
    /from\s+['"]node:async_hooks['"]/g,
    "from '@/lib/polyfills/async-hooks-polyfill.js'"
  ).replace(
    /import\s+.*\s+from\s+['"]node:async_hooks['"]/g,
    "import * as asyncHooks from '@/lib/polyfills/async-hooks-polyfill.js'"
  );

  // Replace perf_hooks imports
  transformedSource = transformedSource.replace(
    /require\(['"]node:perf_hooks['"]\)/g,
    "require('@/lib/polyfills/perf-hooks-polyfill.js')"
  ).replace(
    /from\s+['"]node:perf_hooks['"]/g,
    "from '@/lib/polyfills/perf-hooks-polyfill.js'"
  ).replace(
    /import\s+.*\s+from\s+['"]node:perf_hooks['"]/g,
    "import * as perfHooks from '@/lib/polyfills/perf-hooks-polyfill.js'"
  );

  // Replace other node: imports to avoid potential issues
  const nodeModules = ['fs', 'path', 'http', 'https', 'crypto', 'stream', 'util', 'url', 'zlib', 'buffer', 'process'];

  nodeModules.forEach(module => {
    const pattern = new RegExp(`require\\(['"]node:${module}['"]\\)`, 'g');
    transformedSource = transformedSource.replace(pattern, "{}");

    const esPattern = new RegExp(`from\\s+['"]node:${module}['"]`, 'g');
    transformedSource = transformedSource.replace(esPattern, "from '@/lib/polyfills/empty.js'");
  });

  // This will be helpful for debugging
  if (source !== transformedSource) {
    console.log("Transformed node: imports in genkit module");
  }

  return transformedSource;
};
