/**
 * Custom webpack loader to handle the debug module issues
 * Patches potentially problematic parts of the debug package for webpack
 */
module.exports = function (source) {
  // If the source is from the node.js implementation of debug
  if (source.includes('useColors') && source.includes('process.stdout.fd')) {
    // Replace the problematic parts with safe alternatives
    let modifiedSource = source;

    // Fix the useColors function that tries to access process.stdout.fd
    modifiedSource = modifiedSource.replace(
      /function useColors\(\) {[\s\S]*?return false;[\s\S]*?}/,
      'function useColors() { return false; }'
    );

    // Fix any direct access to process.stdout.fd
    modifiedSource = modifiedSource.replace(
      /process\.stdout\.fd/g,
      '1'
    );

    // Fix any direct access to process.stderr.fd
    modifiedSource = modifiedSource.replace(
      /process\.stderr\.fd/g,
      '2'
    );

    return modifiedSource;
  }

  // Return the original source if it doesn't need modification
  return source;
};
