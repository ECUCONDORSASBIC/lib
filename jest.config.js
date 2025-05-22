/**
 * Jest configuration file
 * @type {import('jest').Config}
 */
module.exports = {
  // Use watchAll instead of watch since git/hg isn't available
  watchAll: true,
  // Disable watch mode
  watch: false,
  // The test environment that will be used for testing
  testEnvironment: 'node',
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  // Ignore these directories
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/build/'
  ],
  // Module file extensions for importing
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json'
  ],
  // Collect coverage from these directories
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  // Mock these file types with empty modules
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
  }
};
