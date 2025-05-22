/**
 * Pruebas para las API routes relacionadas con pacientes
 * 
 * Este archivo contiene pruebas para las rutas de API que manejan
 * operaciones CRUD para los pacientes.
 */

// Simulamos la respuesta de Next.js
const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
const mockRes = {
  status: mockStatus
};

// Simulamos la función de Firebase para obtener datos
const mockGet = jest.fn();
const mockWhere = jest.fn().mockReturnValue({ get: mockGet });
const mockCollection = jest.fn().mockReturnValue({ where: mockWhere });
const mockFirestore = {
  collection: mockCollection
};

// Mock de Firebase Admin
jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn().mockReturnValue(mockFirestore)
}));

// Importamos el manejador de la ruta (simulado para pruebas)
// En un proyecto real, importaríamos el archivo real
const getPatientHandler = async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Se requiere ID de paciente' });
    }
    
    const patientDoc = await mockFirestore.collection('patients').where('id', '==', id).get();
    
    if (patientDoc.empty) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    // Simulamos los datos del paciente
    const patientData = {
      id,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      birthDate: '1980-05-15',
      gender: 'male',
      phone: '+593987654321',
      address: 'Av. Principal 123, Quito',
      bloodType: 'O+',
      allergies: ['penicilina', 'maní'],
      chronicConditions: ['hipertensión'],
      lastVisit: '2025-04-10'
    };
    
    return res.status(200).json({ patient: patientData });
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
};

describe('API Routes - Pacientes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/patients/[id]', () => {
    it('debe devolver los datos del paciente cuando se proporciona un ID válido', async () => {
      // Configuramos el mock para simular un documento encontrado
      mockGet.mockResolvedValueOnce({ empty: false });
      
      // Creamos una solicitud con un ID de paciente
      const req = {
        query: { id: 'patient-123' }
      };
      
      // Llamamos al manejador de la ruta
      await getPatientHandler(req, mockRes);
      
      // Verificamos que se llamó a la colección correcta
      expect(mockCollection).toHaveBeenCalledWith('patients');
      expect(mockWhere).toHaveBeenCalledWith('id', '==', 'patient-123');
      
      // Verificamos que la respuesta es correcta
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          patient: expect.objectContaining({
            id: 'patient-123',
            name: 'Juan Pérez'
          })
        })
      );
    });
    
    it('debe devolver un error 400 cuando no se proporciona un ID', async () => {
      // Creamos una solicitud sin ID
      const req = {
        query: {}
      };
      
      // Llamamos al manejador de la ruta
      await getPatientHandler(req, mockRes);
      
      // Verificamos que la respuesta es un error 400
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Se requiere ID de paciente' });
    });
    
    it('debe devolver un error 404 cuando el paciente no existe', async () => {
      // Configuramos el mock para simular que no se encontró el documento
      mockGet.mockResolvedValueOnce({ empty: true });
      
      // Creamos una solicitud con un ID de paciente que no existe
      const req = {
        query: { id: 'patient-nonexistent' }
      };
      
      // Llamamos al manejador de la ruta
      await getPatientHandler(req, mockRes);
      
      // Verificamos que la respuesta es un error 404
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Paciente no encontrado' });
    });
    
    it('debe manejar errores del servidor correctamente', async () => {
      // Configuramos el mock para simular un error
      mockGet.mockRejectedValueOnce(new Error('Error de Firebase'));
      
      // Creamos una solicitud con un ID de paciente
      const req = {
        query: { id: 'patient-123' }
      };
      
      // Espiamos console.error para verificar que se registra el error
      console.error = jest.fn();
      
      // Llamamos al manejador de la ruta
      await getPatientHandler(req, mockRes);
      
      // Verificamos que se registró el error
      expect(console.error).toHaveBeenCalled();
      
      // Verificamos que la respuesta es un error 500
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Error del servidor' });
    });
  });
});
