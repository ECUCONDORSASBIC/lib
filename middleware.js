import { NextResponse } from 'next/server';

// Ya no importamos getAuth o initializeAdminApp directamente aquí para evitar problemas en Edge.

async function validateTokenViaAPI(request) {
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    console.log('Middleware: Authorization header missing or invalid format');
    return null;
  }
  const idToken = authorizationHeader.split('Bearer ')[1];
  if (!idToken) {
    console.log('Middleware: Token not found after Bearer prefix');
    return null;
  }

  try {
    const verifyTokenUrl = new URL('/api/auth/verify-token', request.nextUrl.origin);
    const response = await fetch(verifyTokenUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Middleware: Token verification API call failed:', response.status, errorData.error);
      return null;
    }

    const data = await response.json();
    // data.decodedToken ahora debería incluir el custom claim 'role' si está establecido
    return data.valid ? data.decodedToken : null;
  } catch (error) {
    console.error('Middleware: Error calling token verification API:', error);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  // Obtener el origen de la solicitud para CORS
  const origin = request.headers.get('origin') || '';
  // Lista de orígenes permitidos para CORS
  const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
    'https://pr-quality.web.app',
    'https://pr-quality.firebaseapp.com',
    'https://altamedica.com'
  ];
  const isAllowedOrigin = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');

  // Bypass middleware logic for Genkit API routes
  if (pathname.startsWith('/api/genkit/')) {
    console.log('Middleware: Bypassing custom token validation for Genkit API route:', pathname);

    // Pero seguimos aplicando CORS si es una ruta API
    const response = NextResponse.next();

    // Aplicar cabeceras CORS si el origen es permitido
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      // Para solicitudes en el mismo origen o en desarrollo
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    // Configuración CORS estándar
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '3600');

    return response;
  }

  // Para solicitudes pre-flight OPTIONS en rutas API
  if (pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });

    // Aplicar cabeceras CORS si el origen es permitido
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    // Configuración CORS estándar
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '3600');

    return response;
  }

  if (pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/auth/verify-token') &&
    !pathname.startsWith('/api/auth/login') &&
    !pathname.startsWith('/api/auth/signup') &&
    !pathname.startsWith('/api/admin/set-role') // Excluir la ruta de set-role de la protección de token estándar si se protege internamente
  ) {

    const decodedToken = await validateTokenViaAPI(request);

    if (!decodedToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required: Invalid or missing token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decodedToken.uid);
    requestHeaders.set('x-user-email', decodedToken.email || '');

    // Leer el rol directamente del custom claim en el decodedToken
    if (decodedToken.role) {
      requestHeaders.set('x-user-role', decodedToken.role);
    }

    // Continuar con la solicitud, pasando el UID y el rol en cabeceras
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Añadir encabezados CORS a la respuesta de API autenticada
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    // Configuración CORS estándar
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '3600');

    return response;
  }

  return NextResponse.next();
}

export const config = {
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
    '/((?!_next/static|_next/image|favicon.ico|login|signup).*)',
    // Si quieres ser más específico y solo apuntar a /api/ rutas (excluyendo las de auth):
    // '/api/((?!auth/).*)', // Esto protegería /api/patients, /api/jobs, etc. pero no /api/auth/*
  ],
};
