"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _firebaseAdmin = require("@/lib/firebase/firebaseAdmin");

var _server = require("next/server");

// Usamos authAdmin del Admin SDK
// Función para verificar si el llamante es un administrador
// Esto es un ejemplo, necesitarás tu propia lógica para determinar si el usuario que llama a ESTA API es un admin
function verifyCallerIsAdmin(request) {
  var authorizationHeader, idToken, decodedToken;
  return regeneratorRuntime.async(function verifyCallerIsAdmin$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          authorizationHeader = request.headers.get('Authorization');

          if (!(!authorizationHeader || !authorizationHeader.startsWith('Bearer '))) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", false);

        case 3:
          idToken = authorizationHeader.split('Bearer ')[1];

          if (idToken) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", false);

        case 6:
          _context.prev = 6;
          _context.next = 9;
          return regeneratorRuntime.awrap(_firebaseAdmin.authAdmin.verifyIdToken(idToken));

        case 9:
          decodedToken = _context.sent;
          return _context.abrupt("return", decodedToken.role === 'admin' || decodedToken.role === 'superuser');

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](6);
          console.error('Error verifying admin token:', _context.t0);
          return _context.abrupt("return", false);

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[6, 13]]);
}

function POST(request) {
  var isAdmin, uidToSet, newRole, body, allowedRoles, userDocRef, errorMessage;
  return regeneratorRuntime.async(function POST$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(verifyCallerIsAdmin(request));

        case 2:
          isAdmin = _context2.sent;

          if (isAdmin) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            error: 'Unauthorized: Caller is not an admin.'
          }, {
            status: 403
          }));

        case 5:
          _context2.prev = 5;
          _context2.next = 8;
          return regeneratorRuntime.awrap(request.json());

        case 8:
          body = _context2.sent;
          uidToSet = body.uid;
          newRole = body.role;
          _context2.next = 16;
          break;

        case 13:
          _context2.prev = 13;
          _context2.t0 = _context2["catch"](5);
          return _context2.abrupt("return", _server.NextResponse.json({
            error: 'Invalid JSON body'
          }, {
            status: 400
          }));

        case 16:
          if (!(!uidToSet || !newRole)) {
            _context2.next = 18;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            error: 'UID and role are required in the request body'
          }, {
            status: 400
          }));

        case 18:
          // Roles permitidos (puedes expandir esto)
          allowedRoles = ['paciente', 'medico', 'empresa', 'admin', 'superuser'];

          if (allowedRoles.includes(newRole)) {
            _context2.next = 21;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            error: "Invalid role. Allowed roles are: ".concat(allowedRoles.join(', '))
          }, {
            status: 400
          }));

        case 21:
          _context2.prev = 21;
          _context2.next = 24;
          return regeneratorRuntime.awrap(_firebaseAdmin.authAdmin.setCustomUserClaims(uidToSet, {
            role: newRole
          }));

        case 24:
          // 3. (Opcional pero recomendado) Actualizar también el rol en el documento del usuario en Firestore
          //    para consistencia y para que otras partes de la app puedan leerlo fácilmente sin decodificar tokens.
          userDocRef = _firebaseAdmin.db.collection('users').doc(uidToSet);
          _context2.next = 27;
          return regeneratorRuntime.awrap(userDocRef.update({
            role: newRole,
            updatedAt: new Date().toISOString() // O FieldValue.serverTimestamp()

          }));

        case 27:
          return _context2.abrupt("return", _server.NextResponse.json({
            message: "Successfully set role '".concat(newRole, "' for user ").concat(uidToSet, ". Custom claims will propagate on next token refresh.")
          }, {
            status: 200
          }));

        case 30:
          _context2.prev = 30;
          _context2.t1 = _context2["catch"](21);
          console.error("Error setting custom claims or updating Firestore for user ".concat(uidToSet, ":"), _context2.t1);
          errorMessage = 'Failed to set role.';

          if (!(_context2.t1.code === 'auth/user-not-found')) {
            _context2.next = 37;
            break;
          }

          errorMessage = 'User not found in Firebase Authentication.';
          return _context2.abrupt("return", _server.NextResponse.json({
            error: errorMessage
          }, {
            status: 404
          }));

        case 37:
          return _context2.abrupt("return", _server.NextResponse.json({
            error: errorMessage,
            details: _context2.t1.message
          }, {
            status: 500
          }));

        case 38:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[5, 13], [21, 30]]);
}