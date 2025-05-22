"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;

var _server = require("next/server");

var _firebase = require("@/lib/firebase"); // Usar rutas relativas en lugar de alias

// GET /api/patients - Get all patients or filtered by query params
function GET(request) {
  var _ref, searchParams, sortBy, sortOrder, filterBy, filterValue, maxResults, id, patient, patients;

  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _ref = new URL(request.url), searchParams = _ref.searchParams;
          sortBy = searchParams.get('sortBy') || 'lastName';
          sortOrder = searchParams.get('sortOrder') || 'asc';
          filterBy = searchParams.get('filterBy');
          filterValue = searchParams.get('filterValue');
          maxResults = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 100;
          id = searchParams.get('id'); // If ID is provided, return a single patient

          if (!id) {
            _context.next = 15;
            break;
          }

          _context.next = 11;
          return regeneratorRuntime.awrap((0, _firebase.getPatientById)(id));

        case 11:
          patient = _context.sent;

          if (patient) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Patient not found'
          }, {
            status: 404
          }));

        case 14:
          return _context.abrupt("return", _server.NextResponse.json(patient));

        case 15:
          _context.next = 17;
          return regeneratorRuntime.awrap((0, _firebase.getPatientsList)({
            sortBy: sortBy,
            sortOrder: sortOrder,
            filterBy: filterBy,
            filterValue: filterValue,
            maxResults: maxResults
          }));

        case 17:
          patients = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json(patients));

        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](0);
          console.error('Error in patients GET route:', _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            error: 'Failed to retrieve patient data'
          }, {
            status: 500
          }));

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 21]]);
} // POST /api/patients - Create a new patient


function POST(request) {
  var data, patientId;
  return regeneratorRuntime.async(function POST$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(request.json());

        case 3:
          data = _context2.sent;

          if (!(!data.firstName || !data.lastName)) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            error: 'First name and last name are required'
          }, {
            status: 400
          }));

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap((0, _firebase.savePatientData)(data));

        case 8:
          patientId = _context2.sent;
          return _context2.abrupt("return", _server.NextResponse.json({
            message: 'Patient created successfully',
            id: patientId
          }, {
            status: 201
          }));

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          console.error('Error in patients POST route:', _context2.t0);
          return _context2.abrupt("return", _server.NextResponse.json({
            error: 'Failed to create patient'
          }, {
            status: 500
          }));

        case 16:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 12]]);
} // PUT /api/patients - Update existing patient


function PUT(request) {
  var data;
  return regeneratorRuntime.async(function PUT$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(request.json());

        case 3:
          data = _context3.sent;

          if (data.id) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", _server.NextResponse.json({
            error: 'Patient ID is required for updates'
          }, {
            status: 400
          }));

        case 6:
          _context3.next = 8;
          return regeneratorRuntime.awrap((0, _firebase.savePatientData)(data));

        case 8:
          return _context3.abrupt("return", _server.NextResponse.json({
            message: 'Patient updated successfully'
          }));

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](0);
          console.error('Error in patients PUT route:', _context3.t0);
          return _context3.abrupt("return", _server.NextResponse.json({
            error: 'Failed to update patient'
          }, {
            status: 500
          }));

        case 15:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 11]]);
}
