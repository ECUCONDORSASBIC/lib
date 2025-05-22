// app/services/clientActions.js
'use client';

import { getDoctorStats } from './statsService';

// Client actions that can be imported by server components
export async function fetchDoctorStats(doctorId) {
  return getDoctorStats(doctorId);
}