/**
 * Custom loader for webpack that returns an empty module
 * Used to ignore problematic modules that are causing build issues
 */
module.exports = function () {
  return 'module.exports = {};';
};

module.exports.pitch = function () {
  return 'module.exports = {};';
};
