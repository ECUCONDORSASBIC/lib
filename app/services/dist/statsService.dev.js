"use strict";
'use client';
/**
 * Servicio para gestionar estadísticas
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAppointmentStats = exports.getPatientStats = exports.getDoctorStats = void 0;

var _firebaseClient = require("@/lib/firebase/firebaseClient");

var _firestore = require("firebase/firestore");

/**
 * Obtiene estadísticas generales para el dashboard del médico
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Object>} Estadísticas del médico
 */
var getDoctorStats = function getDoctorStats(doctorId) {
  var patientsQuery, patientsSnapshot, patientCount, appointmentsQuery, appointmentsSnapshot, appointmentCount, pendingAppointmentsQuery, pendingAppointmentsSnapshot, pendingAppointmentCount, videoCallsQuery, videoCallsSnapshot, videoCallCount;
  return regeneratorRuntime.async(function getDoctorStats$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          // Obtener conteo de pacientes
          patientsQuery = (0, _firestore.query)((0, _firestore.collection)(_firebaseClient.db, 'patients'), (0, _firestore.where)('doctorId', '==', doctorId));
          _context.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.getDocs)(patientsQuery));

        case 4:
          patientsSnapshot = _context.sent;
          patientCount = patientsSnapshot.size; // Obtener conteo de citas

          appointmentsQuery = (0, _firestore.query)((0, _firestore.collection)(_firebaseClient.db, 'appointments'), (0, _firestore.where)('doctorId', '==', doctorId));
          _context.next = 9;
          return regeneratorRuntime.awrap((0, _firestore.getDocs)(appointmentsQuery));

        case 9:
          appointmentsSnapshot = _context.sent;
          appointmentCount = appointmentsSnapshot.size; // Obtener citas pendientes

          pendingAppointmentsQuery = (0, _firestore.query)((0, _firestore.collection)(_firebaseClient.db, 'appointments'), (0, _firestore.where)('doctorId', '==', doctorId), (0, _firestore.where)('status', '==', 'pending'));
          _context.next = 14;
          return regeneratorRuntime.awrap((0, _firestore.getDocs)(pendingAppointmentsQuery));

        case 14:
          pendingAppointmentsSnapshot = _context.sent;
          pendingAppointmentCount = pendingAppointmentsSnapshot.size; // Obtener conteo de videollamadas

          videoCallsQuery = (0, _firestore.query)((0, _firestore.collection)(_firebaseClient.db, 'videoCalls'), (0, _firestore.where)('doctorId', '==', doctorId));
          _context.next = 19;
          return regeneratorRuntime.awrap((0, _firestore.getDocs)(videoCallsQuery));

        case 19:
          videoCallsSnapshot = _context.sent;
          videoCallCount = videoCallsSnapshot.size;
          return _context.abrupt("return", {
            patientCount: patientCount,
            appointmentCount: appointmentCount,
            pendingAppointmentCount: pendingAppointmentCount,
            videoCallCount: videoCallCount,
            recentActivity: {// Añadir datos de actividad reciente aquí
            }
          });

        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](0);
          console.error("Error al obtener estadísticas del médico:", _context.t0);
          throw _context.t0;

        case 28:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 24]]);
};
/**
 * Obtiene estadísticas de pacientes para un médico
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Object>} Estadísticas de pacientes
 */


exports.getDoctorStats = getDoctorStats;

var getPatientStats = function getPatientStats(doctorId) {
  var patientsQuery, patientsSnapshot, ageGroups, genderDistribution;
  return regeneratorRuntime.async(function getPatientStats$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          patientsQuery = (0, _firestore.query)((0, _firestore.collection)(_firebaseClient.db, 'patients'), (0, _firestore.where)('doctorId', '==', doctorId));
          _context2.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.getDocs)(patientsQuery));

        case 4:
          patientsSnapshot = _context2.sent;
          // Agrupar pacientes por edad
          ageGroups = {
            '0-18': 0,
            '19-35': 0,
            '36-50': 0,
            '51-65': 0,
            '66+': 0
          }; // Agrupar pacientes por género

          genderDistribution = {
            male: 0,
            female: 0,
            other: 0
          };
          patientsSnapshot.forEach(function (doc) {
            var patient = doc.data(); // Calcular edad

            if (patient.birthDate) {
              var birthDate = new Date(patient.birthDate);
              var age = new Date().getFullYear() - birthDate.getFullYear();
              if (age <= 18) ageGroups['0-18']++;else if (age <= 35) ageGroups['19-35']++;else if (age <= 50) ageGroups['36-50']++;else if (age <= 65) ageGroups['51-65']++;else ageGroups['66+']++;
            } // Contar por género


            if (patient.gender) {
              if (patient.gender.toLowerCase() === 'male') genderDistribution.male++;else if (patient.gender.toLowerCase() === 'female') genderDistribution.female++;else genderDistribution.other++;
            }
          });
          return _context2.abrupt("return", {
            totalPatients: patientsSnapshot.size,
            ageDistribution: ageGroups,
            genderDistribution: genderDistribution
          });

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          console.error("Error al obtener estadísticas de pacientes:", _context2.t0);
          throw _context2.t0;

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 11]]);
};
/**
 * Obtiene estadísticas de citas para un médico
 * @param {string} doctorId - ID del médico
 * @returns {Promise<Object>} Estadísticas de citas
 */


exports.getPatientStats = getPatientStats;

var getAppointmentStats = function getAppointmentStats(doctorId) {
  var appointmentsQuery, appointmentsSnapshot, statusDistribution;
  return regeneratorRuntime.async(function getAppointmentStats$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          appointmentsQuery = (0, _firestore.query)((0, _firestore.collection)(_firebaseClient.db, 'appointments'), (0, _firestore.where)('doctorId', '==', doctorId));
          _context3.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.getDocs)(appointmentsQuery));

        case 4:
          appointmentsSnapshot = _context3.sent;
          // Agrupar citas por estado
          statusDistribution = {
            completed: 0,
            pending: 0,
            canceled: 0
          };
          appointmentsSnapshot.forEach(function (doc) {
            var appointment = doc.data();

            if (appointment.status) {
              statusDistribution[appointment.status] = (statusDistribution[appointment.status] || 0) + 1;
            }
          });
          return _context3.abrupt("return", {
            totalAppointments: appointmentsSnapshot.size,
            statusDistribution: statusDistribution
          });

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          console.error("Error al obtener estadísticas de citas:", _context3.t0);
          throw _context3.t0;

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

exports.getAppointmentStats = getAppointmentStats;