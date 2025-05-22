/**
 * Helper to ensure trace directories exist and are writable
 * This is used during the build process to prevent EPERM errors
 */
const fs = require('fs');
const path = require('path');

/**
 * Ensure a directory exists and is writable
 * @param {string} dir - Directory path to check/create
 */
function ensureDirectoryExists(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } else {
      console.log(`✅ Directory already exists: ${dir}`);
    }

    // Test write permissions only if needed
    try {
      const testFile = path.join(dir, '.permission-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`✅ Directory ${dir} is writable`);
    } catch (permError) {
      console.warn(`⚠️ WARNING: Directory ${dir} exists but is not writable:`, permError.message);
      console.log(`   Attempting to fix permissions...`);

      // Attempt to fix permissions by recreating the directory
      try {
        fs.rmdirSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
        console.log(`✅ Recreated directory with proper permissions: ${dir}`);

        // Verify the fix worked
        const testFile = path.join(dir, '.permission-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log(`✅ Directory ${dir} is now writable`);
      } catch (fixError) {
        console.error(`❌ ERROR: Could not fix permissions for ${dir}:`, fixError.message);
      }
    }
  } catch (error) {
    console.warn(`⚠️ WARNING: Could not ensure directory ${dir} exists and is writable:`, error.message);
    // Don't throw, just warn - we'll let the build continue
  }
}

// Directories to ensure exist
const nextDir = path.join(process.cwd(), '.next');
const buildDir = path.join(process.cwd(), 'build');
const traceDir = path.join(process.cwd(), 'build', 'trace');
const nextTraceDir = path.join(process.cwd(), '.next', 'trace');

// Cache directories
const cacheDirs = [
  path.join(process.cwd(), '.next', 'cache'),
  path.join(process.cwd(), '.next', 'server'),
  path.join(process.cwd(), '.next', 'static'),
];

// Create main directories
console.log('🔧 Ensuring build directories exist and are writable...');
ensureDirectoryExists(nextDir);
ensureDirectoryExists(buildDir);
ensureDirectoryExists(traceDir);
ensureDirectoryExists(nextTraceDir);

// Create cache directories
console.log('🔧 Ensuring cache directories exist and are writable...');
cacheDirs.forEach(ensureDirectoryExists);

console.log('✅ Directory preparation complete!');

module.exports = {
  ensureDirectoryExists
};
