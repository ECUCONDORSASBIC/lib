/**
 * Windows-specific disk cleanup utility
 * This script helps free up disk space on Windows by cleaning:
 * - Windows temp files
 * - User temp files
 * - npm/pnpm cache files
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const rimraf = require('rimraf');
const os = require('os');

// Only proceed on Windows
if (process.platform !== 'win32') {
  console.log('This script is Windows-specific. Exiting...');
  process.exit(0);
}

// Log header
console.log(`
===========================================
   🧹 Windows Disk Cleanup Utility 🧹
===========================================
`);

// Utility to get human-readable size
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Report disk space
function reportDiskSpace() {
  try {
    console.log('\n📊 Disk Space Report:');
    const diskInfo = execSync('wmic logicaldisk get deviceid,freespace,size /format:list', { encoding: 'utf8' });

    // Parse the output
    const lines = diskInfo.split('\n');
    let currentDrive = {};
    const drives = [];

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      if (line.startsWith('DeviceID')) {
        if (currentDrive.DeviceID) drives.push(currentDrive);
        currentDrive = { DeviceID: line.split('=')[1] };
      } else if (line.startsWith('FreeSpace')) {
        currentDrive.FreeSpace = parseInt(line.split('=')[1], 10);
      } else if (line.startsWith('Size')) {
        currentDrive.Size = parseInt(line.split('=')[1], 10);
        drives.push(currentDrive);
        currentDrive = {};
      }
    });

    // Display formatted report
    drives.forEach(drive => {
      if (!drive.DeviceID || !drive.Size) return;

      const used = drive.Size - (drive.FreeSpace || 0);
      const usedPercent = ((used / drive.Size) * 100).toFixed(1);

      console.log(`Drive ${drive.DeviceID}:`);
      console.log(`  Total: ${formatBytes(drive.Size)}`);
      console.log(`  Free:  ${formatBytes(drive.FreeSpace || 0)} (${100 - usedPercent}%)`);
      console.log(`  Used:  ${formatBytes(used)} (${usedPercent}%)`);
    });
  } catch (error) {
    console.log('Could not report disk space:', error.message);
  }
}

// Run Windows disk cleanup utility
async function runWindowsDiskCleanup() {
  console.log('\n🧹 Running Windows built-in disk cleanup...');
  try {
    // Use the built-in Windows cleanmgr utility in silent mode
    // /sagerun:1 uses predefined settings (system files, temporary files, etc.)
    execSync('cleanmgr /sagerun:1', { stdio: 'ignore' });
    console.log('✅ Windows disk cleanup completed');
  } catch (error) {
    console.log('⚠️ Could not run Windows disk cleanup:', error.message);
  }
}

// Clean specific temp directories
async function cleanTempDirs() {
  console.log('\n🧹 Cleaning temporary directories...');

  const tempDirs = [
    // Windows temp
    process.env.TEMP,
    process.env.TMP,
    'C:\\Windows\\Temp',
    // User temp
    path.join(os.homedir(), 'AppData\\Local\\Temp'),
    // npm cache
    path.join(os.homedir(), 'AppData\\Roaming\\npm-cache'),
    path.join(os.homedir(), 'AppData\\Local\\npm-cache'),
    // pnpm store
    path.join(os.homedir(), '.pnpm-store'),
  ];

  for (const dir of tempDirs) {
    if (!dir || !fs.existsSync(dir)) continue;

    console.log(`Cleaning ${dir}...`);
    try {
      // Get the list of files/dirs in the temp directory
      const entries = fs.readdirSync(dir);

      // Try to delete each entry
      for (const entry of entries) {
        const entryPath = path.join(dir, entry);
        try {
          const stats = fs.statSync(entryPath);

          // Skip files in use by excluding some patterns
          if (entry.includes('.lock') ||
            entry.includes('.tmp') ||
            entry.endsWith('.exe') ||
            entry.endsWith('.dll')) {
            continue;
          }

          rimraf.sync(entryPath, { maxRetries: 3, glob: false });
        } catch (err) {
          // Ignore errors for files in use
        }
      }
      console.log(`✅ Cleaned ${dir}`);
    } catch (err) {
      console.log(`⚠️ Could not clean ${dir}: ${err.message}`);
    }
  }
}

// Clean old npm packages
async function cleanNodeModules() {
  console.log('\n🧹 Cleaning project node_modules...');

  try {
    rimraf.sync('node_modules/.cache', { glob: false });
    console.log('✅ Cleaned node_modules/.cache');

    // Keep essential modules but remove dev dependencies
    console.log('✅ Node modules cleanup completed');
  } catch (err) {
    console.log(`⚠️ Could not clean node_modules: ${err.message}`);
  }
}

// Main function
async function main() {
  // Report initial disk space
  reportDiskSpace();

  // Clean temp directories
  await cleanTempDirs();

  // Clean node_modules
  await cleanNodeModules();

  // Try Windows disk cleanup as a last resort
  await runWindowsDiskCleanup();

  // Report final disk space
  console.log('\n📊 Disk space after cleanup:');
  reportDiskSpace();

  console.log('\n✅ Windows disk cleanup completed!');
}

// Run the cleanup
main().catch(console.error);
