/**
 * Pruebas para las API routes relacionadas con autenticación
 * 
 * Este archivo contiene pruebas para las rutas de API que manejan
 * operaciones de autenticación como login, registro y verificación de sesión.
 */

// Simulamos la respuesta de Next.js
const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
const mockSetCookie = jest.fn();
const mockRes = {
  status: mockStatus,
  setHeader: jest.fn(),
  setCookie: mockSetCookie
};

// Mock de Firebase Auth
const mockCreateSessionCookie = jest.fn();
const mockVerifyIdToken = jest.fn();
const mockAuth = {
  createSessionCookie: mockCreateSessionCookie,
  verifyIdToken: mockVerifyIdToken
};

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn().mockReturnValue(mockAuth)
}));

// Importamos los manejadores de las rutas (simulados para pruebas)
// En un proyecto real, importaríamos los archivos reales
const loginHandler = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Se requiere token de ID' });
    }
    
    // Verificamos el token
    const decodedToken = await mockAuth.verifyIdToken(idToken);
    
    // Creamos una cookie de sesión
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días
    const sessionCookie = await mockAuth.createSessionCookie(idToken, { expiresIn });
    
    // Configuramos la cookie en la respuesta
    res.setHeader('Set-Cookie', `session=${sessionCookie}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${expiresIn}`);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(401).json({ error: 'No autorizado' });
  }
};

const logoutHandler = async (req, res) => {
  // Eliminamos la cookie de sesión
  res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
  return res.status(200).json({ success: true });
};

const sessionHandler = async (req, res) => {
  try {
    const sessionCookie = req.cookies?.session || '';
    
    if (!sessionCookie) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    // Verificamos la cookie de sesión
    const decodedClaims = await mockAuth.verifyIdToken(sessionCookie);
    
    // Devolvemos los datos del usuario
    return res.status(200).json({
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: decodedClaims.role || 'paciente'
      }
    });
  } catch (error) {
    console.error('Error en verificación de sesión:', error);
    return res.status(401).json({ error: 'No autorizado' });
  }
};

describe('API Routes - Autenticación', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/auth/login', () => {
    it('debe crear una cookie de sesión cuando se proporciona un token válido', async () => {
      // Configuramos los mocks para simular un token válido
      mockVerifyIdToken.mockResolvedValueOnce({
        uid: 'user-123',
        email: 'usuario@example.com'
      });
      mockCreateSessionCookie.mockResolvedValueOnce('session-cookie-value');
      
      // Creamos una solicitud con un token
      const req = {
        body: { idToken: 'valid-id-token' }
      };
      
      // Llamamos al manejador de la ruta
      await loginHandler(req, mockRes);
      
      // Verificamos que se verificó el token
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-id-token');
      
      // Verificamos que se creó la cookie de sesión
      expect(mockCreateSessionCookie).toHaveBeenCalledWith('valid-id-token', expect.any(Object));
      
      // Verificamos que se configuró la cookie en la respuesta
      expect(mockRes.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining('session=session-cookie-value'));
      
      // Verificamos que la respuesta es correcta
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
    
    it('debe devolver un error 400 cuando no se proporciona un token', async () => {
      // Creamos una solicitud sin token
      const req = {
        body: {}
      };
      
      // Llamamos al manejador de la ruta
      await loginHandler(req, mockRes);
      
      // Verificamos que la respuesta es un error 400
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Se requiere token de ID' });
    });
    
    it('debe devolver un error 401 cuando el token es inválido', async () => {
      // Configuramos el mock para simular un token inválido
      mockVerifyIdToken.mockRejectedValueOnce(new Error('Token inválido'));
      
      // Creamos una solicitud con un token inválido
      const req = {
        body: { idToken: 'invalid-id-token' }
      };
      
      // Espiamos console.error para verificar que se registra el error
      console.error = jest.fn();
      
      // Llamamos al manejador de la ruta
      await loginHandler(req, mockRes);
      
      // Verificamos que se registró el error
      expect(console.error).toHaveBeenCalled();
      
      // Verificamos que la respuesta es un error 401
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'No autorizado' });
    });
  });
  
  describe('POST /api/auth/logout', () => {
    it('debe eliminar la cookie de sesión', async () => {
      // Creamos una solicitud
      const req = {};
      
      // Llamamos al manejador de la ruta
      await logoutHandler(req, mockRes);
      
      // Verificamos que se eliminó la cookie de sesión
      expect(mockRes.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining('session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'));
      
      // Verificamos que la respuesta es correcta
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
  });
  
  describe('GET /api/auth/session', () => {
    it('debe devolver los datos del usuario cuando la cookie de sesión es válida', async () => {
      // Configuramos el mock para simular una cookie de sesión válida
      mockVerifyIdToken.mockResolvedValueOnce({
        uid: 'user-123',
        email: 'usuario@example.com',
        role: 'paciente'
      });
      
      // Creamos una solicitud con una cookie de sesión
      const req = {
        cookies: { session: 'valid-session-cookie' }
      };
      
      // Llamamos al manejador de la ruta
      await sessionHandler(req, mockRes);
      
      // Verificamos que se verificó la cookie de sesión
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-session-cookie');
      
      // Verificamos que la respuesta es correcta
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        user: {
          uid: 'user-123',
          email: 'usuario@example.com',
          role: 'paciente'
        }
      });
    });
    
    it('debe devolver un error 401 cuando no hay cookie de sesión', async () => {
      // Creamos una solicitud sin cookie de sesión
      const req = {
        cookies: {}
      };
      
      // Llamamos al manejador de la ruta
      await sessionHandler(req, mockRes);
      
      // Verificamos que la respuesta es un error 401
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'No autorizado' });
    });
    
    it('debe devolver un error 401 cuando la cookie de sesión es inválida', async () => {
      // Configuramos el mock para simular una cookie de sesión inválida
      mockVerifyIdToken.mockRejectedValueOnce(new Error('Cookie inválida'));
      
      // Creamos una solicitud con una cookie de sesión inválida
      const req = {
        cookies: { session: 'invalid-session-cookie' }
      };
      
      // Espiamos console.error para verificar que se registra el error
      console.error = jest.fn();
      
      // Llamamos al manejador de la ruta
      await sessionHandler(req, mockRes);
      
      // Verificamos que se registró el error
      expect(console.error).toHaveBeenCalled();
      
      // Verificamos que la respuesta es un error 401
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'No autorizado' });
    });
  });
});
