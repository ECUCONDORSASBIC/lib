"use strict";
// app/services/serverWrappers.js
'use server'; // Import actions, not direct Firebase modules

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPatientStatsServer = getPatientStatsServer;

var _clientActions = require("./clientActions");

function getPatientStatsServer(patientId) {
  return regeneratorRuntime.async(function getPatientStatsServer$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", {
            patientId: patientId,
            isServer: true
          });

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
}