/**
 * Phased Build Script
 * Runs the Next.js build in multiple phases to reduce memory usage
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Time to wait between phases in ms
  pauseBetweenPhases: 5000,

  // Memory cleanup commands
  memoryCleanup: {
    windows: [
      'wmic process where name="node.exe" get workingsetsize,processid,commandline',
      'powershell -Command "Get-Process node | Select-Object Id, ProcessName, WorkingSet | Sort-Object -Descending WorkingSet | Format-Table -AutoSize"',
    ],
  },

  // Build phases
  phases: [
    {
      name: 'Cleanup',
      command: 'node lib/build/cleanup.js',
    },
    {
      name: 'Directory preparation',
      command: 'node lib/build/prebuild.js',
    },
    {
      name: 'Main build',
      command: 'next build --no-lint',
      env: {
        NODE_OPTIONS: '--max-old-space-size=4096',
      },
    },
  ],
};

/**
 * Execute a command with the specified environment variables
 * @param {string} command - The command to execute
 * @param {object} env - Environment variables to set
 */
function executeCommand(command, env = {}) {
  console.log(`\n🚀 Executing: ${command}`);

  try {
    // Create an environment with the current process env plus any additional variables
    const combinedEnv = { ...process.env, ...env };

    // Execute the command
    execSync(command, {
      stdio: 'inherit',
      env: combinedEnv,
    });

    console.log(`✅ Command completed successfully: ${command}`);
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

/**
 * Show memory usage statistics
 */
function showMemoryUsage() {
  console.log('\n📊 Memory Usage:');

  // Show Node.js process memory
  const memoryUsage = process.memoryUsage();
  console.log('Current Process:');
  console.log(`- RSS:        ${formatBytes(memoryUsage.rss)}`);
  console.log(`- Heap Total: ${formatBytes(memoryUsage.heapTotal)}`);
  console.log(`- Heap Used:  ${formatBytes(memoryUsage.heapUsed)}`);
  console.log(`- External:   ${formatBytes(memoryUsage.external)}`);

  // Platform-specific memory info
  if (process.platform === 'win32') {
    try {
      config.memoryCleanup.windows.forEach(cmd => {
        console.log(`\nRunning: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });
      });
    } catch (error) {
      console.log('Error getting detailed process info:', error.message);
    }
  }
}

/**
 * Format bytes to a human-readable string
 * @param {number} bytes - The bytes to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Pause execution for specified milliseconds
 * @param {number} ms - Milliseconds to pause
 * @returns {Promise} Resolves after the pause
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run a garbage collection if possible
 */
function tryGarbageCollection() {
  if (global.gc) {
    console.log('🧹 Running manual garbage collection...');
    global.gc();
    console.log('✅ Garbage collection completed');
  }
}

/**
 * Main function to run the phased build
 */
async function main() {
  console.log(`
=====================================
   🚀 Starting Phased Build Process
=====================================
`);

  // Check available disk space
  if (process.platform === 'win32') {
    try {
      console.log('💾 Available disk space:');
      execSync('wmic logicaldisk get deviceid,freespace,size /format:list', { stdio: 'inherit' });
    } catch (error) {
      console.log('Could not check disk space:', error.message);
    }
  }

  // Run each phase
  for (const [index, phase] of config.phases.entries()) {
    console.log(`\n📑 PHASE ${index + 1}/${config.phases.length}: ${phase.name}`);

    // Show memory before phase
    showMemoryUsage();

    // Execute the phase command
    const success = executeCommand(phase.command, phase.env || {});
    if (!success) {
      console.error(`\n❌ Phase ${index + 1} (${phase.name}) failed. Stopping build process.`);
      process.exit(1);
    }

    // Try to free memory
    tryGarbageCollection();

    // Show memory after phase
    showMemoryUsage();

    // Pause between phases
    if (index < config.phases.length - 1) {
      console.log(`\n⏱️ Pausing for ${config.pauseBetweenPhases / 1000} seconds before next phase...`);
      await sleep(config.pauseBetweenPhases);
    }
  }

  console.log(`
=====================================
   ✅ Phased Build Process Complete
=====================================
`);
}

// Start the build process
main().catch(error => {
  console.error('Build process failed:', error);
  process.exit(1);
});
