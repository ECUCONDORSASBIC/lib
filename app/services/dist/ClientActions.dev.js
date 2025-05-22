"use strict";
// app/services/clientActions.js
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchDoctorStats = fetchDoctorStats;

var _statsService = require("./statsService");

// Client actions that can be imported by server components
function fetchDoctorStats(doctorId) {
  return regeneratorRuntime.async(function fetchDoctorStats$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", (0, _statsService.getDoctorStats)(doctorId));

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
}