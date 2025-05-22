// app/services/serverWrappers.js
'use server';

// Import actions, not direct Firebase modules
import { fetchPatientStats } from './clientActions';

export async function getPatientStatsServer(patientId) {
  // Server-side logic here if needed
  return { patientId, isServer: true };
}