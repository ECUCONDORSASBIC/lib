"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @type {import('next').NextConfig} */
var path = require('path');

var webpack = require('webpack'); // Main webpack, localWebpack is from Next.js options


var fs = require('fs'); // Ensure all polyfill files exist


var polyfillsDir = path.join(__dirname, 'lib', 'polyfills');
var polyfillFiles = {
  async_hooks: path.join(polyfillsDir, 'async-hooks-polyfill.js'),
  perf_hooks: path.join(polyfillsDir, 'perf-hooks-polyfill.js'),
  empty: path.join(polyfillsDir, 'empty.js')
}; // Use path.posix for webpack paths (consistent cross-platform)

var pathToPosix = function pathToPosix(p) {
  return path.join(p).split(path.sep).join(path.posix.sep);
}; // Convert paths to format webpack can use


var asyncHooksPolyfillPath = pathToPosix(polyfillFiles.async_hooks);
var perfHooksPolyfillPath = pathToPosix(polyfillFiles.perf_hooks);
var emptyPolyfillPath = pathToPosix(polyfillFiles.empty);
var nextConfig = {
  // Custom build directory to avoid permission issues
  distDir: '.next',
  // Core Next.js configuration
  reactStrictMode: true,
  swcMinify: true,
  // Increase timeout for chunk loading
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5
  },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['@google-cloud/vertexai'],
    outputFileTracingExcludes: {
      '**': ['**/node_modules/@google-cloud/**', '**/.git/**', '**/node_modules/firebase/**']
    }
  },
  transpilePackages: ['@genkit-ai/core', 'ajv', 'ajv-formats', 'protobufjs', '@opentelemetry/otlp-transformer'],
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com',
      port: '',
      pathname: '/v0/b/**'
    }]
  },
  // Consolidated webpack configuration
  webpack: function webpack(config, _ref) {
    var isServer = _ref.isServer,
        localWebpack = _ref.webpack,
        nextRuntime = _ref.nextRuntime;
    config.resolve.symlinks = false; // Handle Edge runtime and client-side

    if (nextRuntime === 'edge' || !isServer) {
      config.resolve.fallback = _objectSpread({}, config.resolve.fallback, {
        querystring: require.resolve('./lib/polyfills/querystring-polyfill.js'),
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        child_process: false
      });
    } // Add NormalModuleReplacementPlugin for async_hooks


    config.plugins.push(new localWebpack.NormalModuleReplacementPlugin(/^node:async_hooks$/, asyncHooksPolyfillPath));
    config.plugins.push(new localWebpack.NormalModuleReplacementPlugin(/^async_hooks$/, asyncHooksPolyfillPath)); // Add NormalModuleReplacementPlugin for perf_hooks

    config.plugins.push(new localWebpack.NormalModuleReplacementPlugin(/^node:perf_hooks$/, perfHooksPolyfillPath));
    config.plugins.push(new localWebpack.NormalModuleReplacementPlugin(/^perf_hooks$/, perfHooksPolyfillPath)); // Rule for genkit-imports-transformer

    config.module.rules.push({
      test: /[\\/]node_modules[\\/]@genkit-ai[\\/]core[\\/].*\.js$/,
      use: [{
        loader: path.resolve(__dirname, 'lib/webpack/genkit-imports-transformer.js')
      }]
    }); // Add rule for debug package to fix fd errors

    config.module.rules.push({
      test: /[\\/]node_modules[\\/].*debug[\\/].*\.js$/,
      use: [{
        loader: path.resolve(__dirname, 'lib/webpack/debug-loader.js')
      }]
    }); // Add rule for require-in-the-middle to fix OpenTelemetry issues

    config.module.rules.push({
      test: /[\\/]node_modules[\\/].*require-in-the-middle[\\/].*\.js$/,
      use: [{
        loader: path.resolve(__dirname, 'lib/webpack/require-in-the-middle-loader.js')
      }]
    }); // Preserve existing Next.js default aliases before modifying

    var existingAliases = _objectSpread({}, config.resolve.alias); // Set up path aliases (custom paths, specific polyfills)


    var customPathAliases = {
      '@': path.join(__dirname, '/'),
      '@components': path.join(__dirname, 'app/components'),
      '@app': path.join(__dirname, 'app'),
      '@contexts': path.join(__dirname, 'app/contexts'),
      '@services': path.join(__dirname, 'app/services'),
      '@utils': path.join(__dirname, 'utils'),
      '@lib': path.join(__dirname, 'lib'),
      '@config': path.join(__dirname, 'config'),
      'ajv': path.resolve(__dirname, 'node_modules/ajv'),
      'ajv-formats': path.resolve(__dirname, 'node_modules/ajv-formats'),
      'protobufjs': path.resolve(__dirname, 'lib/polyfills/protobuf-polyfill.js'),
      '@grpc/proto-loader': path.resolve(__dirname, 'lib/polyfills/grpc-loader-polyfill.js'),
      '@opentelemetry/otlp-transformer': path.resolve(__dirname, 'lib/polyfills/otlp-transformer-polyfill.js'),
      '@firebase/client': path.join(__dirname, 'lib/firebase/firebaseClient'),
      '@firebase/admin': path.join(__dirname, 'lib/firebase/firebaseAdmin')
    }; // Node.js core module polyfills/aliases

    var nodeCoreAliases = {
      'node:process': 'process/browser',
      'node:stream': 'stream-browserify',
      'node:buffer': 'buffer/',
      'node:util': 'util/',
      'node:url': 'url/',
      'node:http': 'stream-http',
      'node:https': 'https-browserify',
      'node:path': 'path-browserify',
      'node:crypto': 'crypto-browserify',
      'node:zlib': 'browserify-zlib',
      'node:fs': false,
      'node:querystring': 'querystring-es3',
      'node:perf_hooks': perfHooksPolyfillPath,
      'node:async_hooks': asyncHooksPolyfillPath,
      'perf_hooks': perfHooksPolyfillPath,
      'async_hooks': asyncHooksPolyfillPath,
      // Add new OpenTelemetry polyfill
      '@opentelemetry/sdk-node': path.resolve(__dirname, 'lib/polyfills/opentelemetry-sdk-node-polyfill.js')
    }; // Merge all aliases.

    config.resolve.alias = _objectSpread({}, existingAliases, {}, customPathAliases, {}, nodeCoreAliases, {
      'handlebars': 'handlebars/dist/handlebars.min.js'
    }); // Comprehensive fallbacks for Node.js modules

    config.resolve.fallback = _objectSpread({}, config.resolve.fallback || {}, {
      fs: false,
      path: require.resolve('path-browserify'),
      os: false,
      process: require.resolve('process/browser'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      url: require.resolve('url/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      crypto: require.resolve('crypto-browserify'),
      zlib: require.resolve('browserify-zlib'),
      'ajv/dist/compile/codegen': require.resolve('ajv/dist/compile/codegen'),
      'encoding': false,
      'node:perf_hooks': false,
      net: false,
      tls: false,
      child_process: false,
      http2: false,
      dns: false,
      'firebase-admin': false,
      '@google-cloud/functions-framework': false,
      'express': false
    }); // Additional Node.js modules that shouldn't be bundled for the client

    if (!isServer) {
      config.resolve.fallback = _objectSpread({}, config.resolve.fallback, {
        dns: false,
        net: false,
        tls: false,
        http2: false
      });
    } else {
      config.externals = [].concat(_toConsumableArray(config.externals || []), ['require-in-the-middle']);
    } // Add global module providers


    config.plugins.push(new localWebpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })); // Ensure experiments.topLevelAwait is enabled

    config.experiments = _objectSpread({}, config.experiments, {
      topLevelAwait: true
    }); // Disable warnings for critical dependencies

    config.ignoreWarnings = [{
      module: /node_modules\/.*require-in-the-middle/
    }, {
      module: /node_modules\/.*handlebars/
    }, {
      message: /Critical dependency: require function is used/
    }];
    return config;
  }
}; // Modify the webpack configuration to handle problematic modules

var originalWebpack = nextConfig.webpack;

nextConfig.webpack = function (config, options) {
  // First apply our original webpack configurations
  config = originalWebpack(config, options); // Add specific module rules for problematic packages

  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /node_modules[\/\\](@grpc[\/\\]proto-loader|protobufjs|@opentelemetry[\/\\]otlp-transformer)/,
    use: 'null-loader',
    sideEffects: false
  });
  config.module.rules.push({
    test: /\.node\.mjs$/,
    use: 'null-loader',
    sideEffects: false
  });
  config.resolveLoader = config.resolveLoader || {};
  config.resolveLoader.alias = config.resolveLoader.alias || {};
  config.resolveLoader.alias['null-loader'] = path.resolve(__dirname, 'lib/polyfills/ignore-loader.js');

  if (!options.isServer) {
    config.externals = [].concat(_toConsumableArray(config.externals || []), ['protobufjs', '@grpc/proto-loader', '@opentelemetry/otlp-transformer', 'node:fs', 'node:path', 'node:http', 'node:https', 'node:crypto', 'node:stream', 'node:util', 'node:url', 'node:zlib', 'node:buffer', 'node:process']);
  }

  return config;
};

module.exports = nextConfig;