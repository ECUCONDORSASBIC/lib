"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.POST = POST;

var _videoCallAndDocumentService = require("@/app/services/videoCallAndDocumentService");

var _server = require("next/server");

// GET: Devuelve los documentos médicos del paciente autenticado
function GET(request) {
  var authHeader, _ref, searchParams, patientId, docs;

  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

          if (!(!authHeader || !authHeader.startsWith('Bearer '))) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'No autorizado: falta el token Bearer.'
          }, {
            status: 401
          }));

        case 4:
          // Aquí deberías verificar el token y extraer el patientId real
          // const token = authHeader.split(' ')[1];
          // const patientId = await verifyAndExtractPatientId(token);
          // Simulación:
          _ref = new URL(request.url), searchParams = _ref.searchParams;
          patientId = searchParams.get('patientId');

          if (patientId) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'Falta patientId.'
          }, {
            status: 400
          }));

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap((0, _videoCallAndDocumentService.getDocuments)(patientId));

        case 10:
          docs = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json({
            success: true,
            data: docs
          }));

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'Error al obtener documentos médicos.',
            error: _context.t0.message
          }, {
            status: 500
          }));

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
} // POST: Guarda un documento médico en el historial del paciente


function POST(request) {
  var authHeader, _ref2, searchParams, patientId, documentData;

  return regeneratorRuntime.async(function POST$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

          if (!(!authHeader || !authHeader.startsWith('Bearer '))) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'No autorizado: falta el token Bearer.'
          }, {
            status: 401
          }));

        case 4:
          // Aquí deberías verificar el token y extraer el patientId real
          // const token = authHeader.split(' ')[1];
          // const patientId = await verifyAndExtractPatientId(token);
          // Simulación:
          _ref2 = new URL(request.url), searchParams = _ref2.searchParams;
          patientId = searchParams.get('patientId');

          if (patientId) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'Falta patientId.'
          }, {
            status: 400
          }));

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(request.json());

        case 10:
          documentData = _context2.sent;
          _context2.next = 13;
          return regeneratorRuntime.awrap((0, _videoCallAndDocumentService.saveDocument)(patientId, documentData));

        case 13:
          return _context2.abrupt("return", _server.NextResponse.json({
            success: true,
            message: 'Documento guardado.'
          }));

        case 16:
          _context2.prev = 16;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", _server.NextResponse.json({
            success: false,
            message: 'Error al guardar documento.',
            error: _context2.t0.message
          }, {
            status: 500
          }));

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 16]]);
}