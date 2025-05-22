'use client';

/**
 * Servicio para gestionar estadísticas
 */

import { db } from '@/lib/firebase/firebaseClient';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Obtiene estadísticas generales para el dashboard del médico
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Object>} Estadísticas del médico
 */
export const getDoctorStats = async (doctorId) => {
  try {
    // Obtener conteo de pacientes
    const patientsQuery = query(
      collection(db, 'patients'),
      where('doctorId', '==', doctorId)
    );
    const patientsSnapshot = await getDocs(patientsQuery);
    const patientCount = patientsSnapshot.size;

    // Obtener conteo de citas
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointmentCount = appointmentsSnapshot.size;
    
    // Devolver estadísticas básicas
    return {
      patientCount,
      appointmentCount
    };
  } catch (error) {
    console.error("Error al obtener estadísticas del médico:", error);
    throw error;
  }
};
    
/**
 * Obtiene estadísticas detalladas para el dashboard del médico
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Object>} Estadísticas detalladas del médico
 */
export const fetchDoctorStats = async (doctorId) => {
  try {
    // Obtener conteo de pacientes
    const patientsQuery = query(
      collection(db, 'patients'),
      where('doctorId', '==', doctorId)
    );
    const patientsSnapshot = await getDocs(patientsQuery);
    const patientCount = patientsSnapshot.size;
    
    // Obtener citas para hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentsTodayQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      where('date', '>=', today),
      where('date', '<', tomorrow)
    );
    const appointmentsTodaySnapshot = await getDocs(appointmentsTodayQuery);
    const appointmentsToday = appointmentsTodaySnapshot.size;
    
    // Obtener alertas activas
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('doctorId', '==', doctorId),
      where('status', '==', 'active')
    );
    const alertsSnapshot = await getDocs(alertsQuery);
    const activeAlerts = alertsSnapshot.size;
    
    // Calcular tasa de completación de citas
    const completedAppointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      where('status', '==', 'completed')
    );
    const completedAppointmentsSnapshot = await getDocs(completedAppointmentsQuery);
    
    const totalAppointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId)
    );
    const totalAppointmentsSnapshot = await getDocs(totalAppointmentsQuery);
    
    let appointmentCompletionRate = 0;
    if (totalAppointmentsSnapshot.size > 0) {
      appointmentCompletionRate = (completedAppointmentsSnapshot.size / totalAppointmentsSnapshot.size) * 100;
    }
    
    return {
      totalPatients: patientCount,
      appointmentsToday,
      activeAlerts,
      appointmentCompletionRate: Math.round(appointmentCompletionRate)
    };
  } catch (error) {
    console.error("Error al obtener estadísticas del médico:", error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de pacientes para un médico
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Object>} Estadísticas de pacientes
 */
export const getPatientStats = async (doctorId) => {
  try {
    const patientsQuery = query(
      collection(db, 'patients'),
      where('doctorId', '==', doctorId)
    );
    const patientsSnapshot = await getDocs(patientsQuery);

    // Agrupar pacientes por edad
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '66+': 0
    };

    // Agrupar pacientes por género
    const genderDistribution = {
      male: 0,
      female: 0,
      other: 0
    };

    patientsSnapshot.forEach(doc => {
      const patient = doc.data();

      // Calcular edad
      if (patient.birthDate) {
        const birthDate = new Date(patient.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['66+']++;
      }

      // Contar por género
      if (patient.gender) {
        if (patient.gender.toLowerCase() === 'male') genderDistribution.male++;
        else if (patient.gender.toLowerCase() === 'female') genderDistribution.female++;
        else genderDistribution.other++;
      }
    });

    return {
      totalPatients: patientsSnapshot.size,
      ageDistribution: ageGroups,
      genderDistribution
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de pacientes:", error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de citas para un médico
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Object>} Estadísticas de citas
 */
export const getAppointmentStats = async (doctorId) => {
  try {
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);

    // Agrupar citas por estado
    const statusDistribution = {
      completed: 0,
      pending: 0,
      canceled: 0
    };

    appointmentsSnapshot.forEach(doc => {
      const appointment = doc.data();

      if (appointment.status) {
        statusDistribution[appointment.status] = (statusDistribution[appointment.status] || 0) + 1;
      }
    });

    return {
      totalAppointments: appointmentsSnapshot.size,
      statusDistribution
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de citas:", error);
    throw error;
  }
};
