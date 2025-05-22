/**
 * Custom webpack plugin to resolve 'node:' protocol imports to polyfills
 */
class NodeProtocolResolver {
  constructor(polyfills) {
    this.polyfills = polyfills || {};
  }

  apply(resolver) {
    const target = resolver.ensureHook('resolve');
    resolver.getHook('described-resolve').tapAsync('NodeProtocolResolver', (request, resolveContext, callback) => {
      // Check if this is a node: protocol import
      if (request.request && request.request.startsWith('node:')) {
        const moduleName = request.request.substring(5); // Remove 'node:' prefix

        // If we have a specific polyfill for this module, use it
        if (this.polyfills[`node:${moduleName}`] || this.polyfills[moduleName]) {
          const polyfillPath = this.polyfills[`node:${moduleName}`] || this.polyfills[moduleName];

          // Create a new request pointing to our polyfill
          const newRequest = {
            ...request,
            request: polyfillPath
          };

          // Continue resolution with our polyfill path
          return resolver.doResolve(target, newRequest, null, resolveContext, callback);
        }
      }

      // For any other request, continue normal resolution
      callback();
    });
  }
}

module.exports = NodeProtocolResolver;
