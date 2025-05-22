"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.middleware = middleware;
exports.config = void 0;

var _server = require("next/server");

// Ya no importamos getAuth o initializeAdminApp directamente aquí para evitar problemas en Edge.
function validateTokenViaAPI(request) {
  var authorizationHeader, idToken, verifyTokenUrl, response, errorData, data;
  return regeneratorRuntime.async(function validateTokenViaAPI$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          authorizationHeader = request.headers.get('Authorization');

          if (!(!authorizationHeader || !authorizationHeader.startsWith('Bearer '))) {
            _context.next = 4;
            break;
          }

          console.log('Middleware: Authorization header missing or invalid format');
          return _context.abrupt("return", null);

        case 4:
          idToken = authorizationHeader.split('Bearer ')[1];

          if (idToken) {
            _context.next = 8;
            break;
          }

          console.log('Middleware: Token not found after Bearer prefix');
          return _context.abrupt("return", null);

        case 8:
          _context.prev = 8;
          verifyTokenUrl = new URL('/api/auth/verify-token', request.nextUrl.origin);
          _context.next = 12;
          return regeneratorRuntime.awrap(fetch(verifyTokenUrl.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              token: idToken
            })
          }));

        case 12:
          response = _context.sent;

          if (response.ok) {
            _context.next = 19;
            break;
          }

          _context.next = 16;
          return regeneratorRuntime.awrap(response.json());

        case 16:
          errorData = _context.sent;
          console.error('Middleware: Token verification API call failed:', response.status, errorData.error);
          return _context.abrupt("return", null);

        case 19:
          _context.next = 21;
          return regeneratorRuntime.awrap(response.json());

        case 21:
          data = _context.sent;
          return _context.abrupt("return", data.valid ? data.decodedToken : null);

        case 25:
          _context.prev = 25;
          _context.t0 = _context["catch"](8);
          console.error('Middleware: Error calling token verification API:', _context.t0);
          return _context.abrupt("return", null);

        case 29:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[8, 25]]);
}

function middleware(request) {
  var pathname, origin, allowedOrigins, isAllowedOrigin, response, _response, decodedToken, requestHeaders, _response2;

  return regeneratorRuntime.async(function middleware$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          pathname = request.nextUrl.pathname; // Obtener el origen de la solicitud para CORS

          origin = request.headers.get('origin') || ''; // Lista de orígenes permitidos para CORS

          allowedOrigins = ['http://localhost:3000', 'https://localhost:3000', 'http://127.0.0.1:3000', 'https://127.0.0.1:3000', 'https://pr-quality.web.app', 'https://pr-quality.firebaseapp.com', 'https://altamedica.com'];
          isAllowedOrigin = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'); // Bypass middleware logic for Genkit API routes

          if (!pathname.startsWith('/api/genkit/')) {
            _context2.next = 12;
            break;
          }

          console.log('Middleware: Bypassing custom token validation for Genkit API route:', pathname); // Pero seguimos aplicando CORS si es una ruta API

          response = _server.NextResponse.next(); // Aplicar cabeceras CORS si el origen es permitido

          if (isAllowedOrigin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
          } else {
            // Para solicitudes en el mismo origen o en desarrollo
            response.headers.set('Access-Control-Allow-Origin', '*');
          } // Configuración CORS estándar


          response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          response.headers.set('Access-Control-Max-Age', '3600');
          return _context2.abrupt("return", response);

        case 12:
          if (!(pathname.startsWith('/api/') && request.method === 'OPTIONS')) {
            _context2.next = 19;
            break;
          }

          _response = new _server.NextResponse(null, {
            status: 204
          }); // Aplicar cabeceras CORS si el origen es permitido

          if (isAllowedOrigin) {
            _response.headers.set('Access-Control-Allow-Origin', origin);
          } else {
            _response.headers.set('Access-Control-Allow-Origin', '*');
          } // Configuración CORS estándar


          _response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

          _response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          _response.headers.set('Access-Control-Max-Age', '3600');

          return _context2.abrupt("return", _response);

        case 19:
          if (!(pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/verify-token') && !pathname.startsWith('/api/auth/login') && !pathname.startsWith('/api/auth/signup') && !pathname.startsWith('/api/admin/set-role') // Excluir la ruta de set-role de la protección de token estándar si se protege internamente
          )) {
            _context2.next = 35;
            break;
          }

          _context2.next = 22;
          return regeneratorRuntime.awrap(validateTokenViaAPI(request));

        case 22:
          decodedToken = _context2.sent;

          if (decodedToken) {
            _context2.next = 25;
            break;
          }

          return _context2.abrupt("return", new _server.NextResponse(JSON.stringify({
            error: 'Authentication required: Invalid or missing token'
          }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }));

        case 25:
          requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-user-id', decodedToken.uid);
          requestHeaders.set('x-user-email', decodedToken.email || ''); // Leer el rol directamente del custom claim en el decodedToken

          if (decodedToken.role) {
            requestHeaders.set('x-user-role', decodedToken.role);
          } // Continuar con la solicitud, pasando el UID y el rol en cabeceras


          _response2 = _server.NextResponse.next({
            request: {
              headers: requestHeaders
            }
          }); // Añadir encabezados CORS a la respuesta de API autenticada

          if (isAllowedOrigin) {
            _response2.headers.set('Access-Control-Allow-Origin', origin);
          } else {
            _response2.headers.set('Access-Control-Allow-Origin', '*');
          } // Configuración CORS estándar


          _response2.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

          _response2.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          _response2.headers.set('Access-Control-Max-Age', '3600');

          return _context2.abrupt("return", _response2);

        case 35:
          return _context2.abrupt("return", _server.NextResponse.next());

        case 36:
        case "end":
          return _context2.stop();
      }
    }
  });
}

var config = {
  matcher: [
  /*
   * Match all request paths except for the ones starting with:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - login, signup (páginas de cliente)
   * Esto es para evitar que el middleware se ejecute innecesariamente en estos paths.
   * El filtrado de rutas API específicas se hace dentro de la función middleware.
   */
  '/((?!_next/static|_next/image|favicon.ico|login|signup).*)' // Si quieres ser más específico y solo apuntar a /api/ rutas (excluyendo las de auth):
  // '/api/((?!auth/).*)', // Esto protegería /api/patients, /api/jobs, etc. pero no /api/auth/*
  ]
};
exports.config = config;