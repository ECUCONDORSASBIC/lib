"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAlerts = exports.subscribeToAlerts = exports.markAlertAsRead = void 0;

// app/services/alertService.js

/**
 * Marks an alert as read
 * @param {string} alertId - The ID of the alert to mark as read
 * @returns {Promise<Object>} - A promise that resolves to the updated alert
 */
var markAlertAsRead = function markAlertAsRead(alertId) {
  return regeneratorRuntime.async(function markAlertAsRead$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // This is a placeholder implementation - replace with actual API call
          console.log('Marking alert as read:', alertId); // Simulate API request with a promise

          return _context.abrupt("return", new Promise(function (resolve) {
            setTimeout(function () {
              resolve({
                id: alertId,
                read: true,
                readAt: new Date().toISOString()
              });
            }, 300);
          }));

        case 2:
        case "end":
          return _context.stop();
      }
    }
  });
};
/**
 * Subscribe to alerts and notifications for a patient
 * @param {string} patientId - The ID of the patient
 * @param {Function} onAlert - Callback function that gets called when a new alert arrives
 * @returns {Function} - An unsubscribe function to stop receiving alerts
 */


exports.markAlertAsRead = markAlertAsRead;

var subscribeToAlerts = function subscribeToAlerts(patientId, onAlert) {
  console.log('Subscribing to alerts for patient:', patientId); // This is a mock implementation - in a real app, you'd use WebSockets or SSE
  // For now, we'll just simulate occasional alerts

  var intervalId = setInterval(function () {
    // 10% chance of receiving an alert every 30 seconds (for demo purposes)
    if (Math.random() < 0.1) {
      var alertTypes = ['appointment', 'medication', 'test_result', 'message'];
      var randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      var newAlert = {
        id: 'alert-' + Date.now(),
        patientId: patientId,
        type: randomType,
        title: getAlertTitle(randomType),
        message: getAlertMessage(randomType),
        timestamp: new Date().toISOString(),
        read: false,
        priority: Math.random() < 0.3 ? 'high' : 'normal'
      };
      onAlert(newAlert);
    }
  }, 30000); // Check every 30 seconds
  // Return unsubscribe function

  return function () {
    console.log('Unsubscribing from alerts for patient:', patientId);
    clearInterval(intervalId);
  };
};
/**
 * Get alerts for a patient
 * @param {string} patientId - The ID of the patient
 * @returns {Promise<Array>} - A promise that resolves to an array of alerts
 */


exports.subscribeToAlerts = subscribeToAlerts;

var getAlerts = function getAlerts(patientId) {
  return regeneratorRuntime.async(function getAlerts$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // This is a placeholder implementation - replace with actual API call
          console.log('Getting alerts for patient:', patientId); // Simulate API request with a promise

          return _context2.abrupt("return", new Promise(function (resolve) {
            setTimeout(function () {
              // Generate some sample alerts
              var sampleAlerts = [{
                id: 'alert-1',
                patientId: patientId,
                type: 'appointment',
                title: 'Recordatorio de cita',
                message: 'Tiene una cita programada para mañana a las 10:00 AM',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                // 1 hour ago
                read: false,
                priority: 'normal'
              }, {
                id: 'alert-2',
                patientId: patientId,
                type: 'medication',
                title: 'Recordatorio de medicamento',
                message: 'Es hora de tomar su medicamento para la presión arterial',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                // 2 hours ago
                read: true,
                priority: 'high'
              }, {
                id: 'alert-3',
                patientId: patientId,
                type: 'message',
                title: 'Nuevo mensaje',
                message: 'Su médico le ha enviado un nuevo mensaje',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                // 1 day ago
                read: false,
                priority: 'normal'
              }];
              resolve(sampleAlerts);
            }, 500);
          }));

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // Helper functions for alert generation


exports.getAlerts = getAlerts;

var getAlertTitle = function getAlertTitle(type) {
  switch (type) {
    case 'appointment':
      return 'Recordatorio de cita';

    case 'medication':
      return 'Recordatorio de medicamento';

    case 'test_result':
      return 'Resultados disponibles';

    case 'message':
      return 'Nuevo mensaje';

    default:
      return 'Notificación';
  }
};

var getAlertMessage = function getAlertMessage(type) {
  switch (type) {
    case 'appointment':
      return 'Tiene una próxima cita programada. Por favor confirme su asistencia.';

    case 'medication':
      return 'Es hora de tomar su medicamento según lo prescrito.';

    case 'test_result':
      return 'Sus resultados de laboratorio están disponibles para revisión.';

    case 'message':
      return 'Ha recibido un nuevo mensaje de su equipo médico.';

    default:
      return 'Tiene una nueva notificación en su perfil de salud.';
  }
};