// Deshabilitar completamente el tracing de OpenTelemetry para evitar errores en desarrollo
// Esto debe estar antes de cualquier importación que use OpenTelemetry
process.env.OTEL_SDK_DISABLED = 'true';
process.env.OTEL_TRACES_EXPORTER = 'none';
process.env.OTEL_METRICS_EXPORTER = 'none';
process.env.OTEL_LOGS_EXPORTER = 'none';

// Polyfill for process.stdout and process.stderr to fix isTTY errors
if (typeof process !== 'undefined' && process) {
  const mockStdout = { fd: 1, write: () => true, isTTY: false };
  const mockStderr = { fd: 2, write: () => true, isTTY: false };

  // Ensure process.stdout and process.stderr are available
  process.stdout = process.stdout || mockStdout;
  process.stderr = process.stderr || mockStderr;

  // Fix missing properties
  if (!process.stdout.fd) process.stdout.fd = 1;
  if (!process.stderr.fd) process.stderr.fd = 2;
  if (process.stdout.isTTY === undefined) process.stdout.isTTY = false;
  if (process.stderr.isTTY === undefined) process.stderr.isTTY = false;
}

import { NextResponse } from 'next/server';
const AsyncLocalStorageClass = require('../../../../lib/polyfills/async-local-storage-polyfill');

// Create an instance of AsyncLocalStorage
const asyncLocalStorage = new AsyncLocalStorageClass();

export async function GET() {
  try {
    // Use asyncLocalStorage properly
    return asyncLocalStorage.run({}, async () => {
      return NextResponse.json({
        success: true,
        status: 'GenKit API is running',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Error in status endpoint:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error checking status' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
