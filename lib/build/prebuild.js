/**
 * Prebuild script to ensure all necessary directories exist and are writable
 */
const fs = require('fs');
const path = require('path');

console.log('📂 Starting prebuild process...');

// Run the cleanup script first to free up disk space
console.log('🧹 Running disk cleanup...');
try {
  // Run Windows-specific cleanup if on Windows
  if (process.platform === 'win32') {
    console.log('🪟 Detected Windows environment, running Windows-specific cleanup...');
    require('./windows-cleanup');
  }

  // Run the standard cleanup module
  require('./cleanup');
} catch (e) {
  console.warn('⚠️ Could not run disk cleanup:', e.message);
}

// Clean previous build artifacts if needed
try {
  const rimraf = require('rimraf');

  const buildTracePath = path.join(process.cwd(), 'build', 'trace');
  const nextTracePath = path.join(process.cwd(), '.next', 'trace');

  // Try to delete problematic trace directories first if they exist
  if (fs.existsSync(buildTracePath)) {
    console.log('🗑️ Removing existing build trace directory...');
    rimraf.sync(buildTracePath);
  }

  if (fs.existsSync(nextTracePath)) {
    console.log('🗑️ Removing existing .next trace directory...');
    rimraf.sync(nextTracePath);
  }
} catch (e) {
  console.warn('⚠️ Could not clean previous trace directories:', e.message);
}

// Ensure all directories exist with proper permissions
try {
  require('./ensure-directories');
} catch (e) {
  console.error('❌ Error ensuring directories:', e);
  process.exit(1);
}

// Fix Firebase authentication issues
try {
  console.log('🔐 Checking Firebase credentials...');
  // Remove cached credential files that might be causing authentication errors
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const firebaseConfigPath = path.join(homeDir, '.config', 'firebase');

  if (fs.existsSync(firebaseConfigPath)) {
    console.log('ℹ️ Firebase config directory exists, checking for stale credentials');

    // Check if credentials need to be reset
    const credentialFiles = [
      'analytics-uuid',
      'emulators',
      'session',
      'session.json',
      'application_default_credentials.json'
    ];

    credentialFiles.forEach(file => {
      const filePath = path.join(firebaseConfigPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          const fileAgeDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

          if (fileAgeDays > 7) {
            console.log(`🗑️ Removing stale Firebase credential: ${file} (${fileAgeDays.toFixed(1)} days old)`);
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.warn(`⚠️ Could not process Firebase file ${file}:`, err.message);
        }
      }
    });
  }
} catch (e) {
  console.warn('⚠️ Could not clean Firebase credentials:', e.message);
}

console.log('✅ Prebuild process complete!');
