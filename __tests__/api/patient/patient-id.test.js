import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { GET, PUT, DELETE } from '../../../app/api/patient/[id]/route';
import { db, authAdmin } from '@/lib/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';

// Mock de las dependencias
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data, options) => ({ data, options }))
    }
}));

jest.mock('@/lib/firebase/firebaseAdmin', () => ({
    db: {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        get: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({})
    },
    authAdmin: {
        verifyIdToken: jest.fn()
    }
}));

describe('API de Pacientes - Endpoint [id]', () => {
    let mockRequest;
    let mockParams;

    beforeEach(() => {
        // Resetear mocks
        jest.clearAllMocks();

        // Configurar request mock básico
        mockRequest = {
            headers: {
                get: jest.fn((header) => {
                    if (header === 'Authorization') return 'Bearer fake-token';
                    if (header === 'x-user-id') return 'user-123';
                    if (header === 'x-user-role') return 'admin';
                    return null;
                })
            },
            json: jest.fn().mockResolvedValue({})
        };

        mockParams = { id: 'patient-123' };
    });

    describe('GET - Obtener paciente', () => {
        it('debería devolver datos del paciente cuando el token es válido y el usuario es admin', async () => {
            // Configurar mocks
            authAdmin.verifyIdToken.mockResolvedValue({
                uid: 'admin-123',
                role: 'admin'
            });

            const mockPatientData = {
                exists: true,
                data: () => ({
                    name: 'Juan Pérez',
                    email: 'juan@example.com',
                    phone: '123456789',
                    birthDate: '1980-01-01',
                    bloodType: 'O+',
                    allergies: ['Penicilina'],
                    medicalHistory: ['Historia clínica']
                })
            };

            db.get.mockResolvedValue(mockPatientData);

            // Ejecutar función
            await GET(mockRequest, { params: mockParams });

            // Verificar que se llamó a verifyIdToken
            expect(authAdmin.verifyIdToken).toHaveBeenCalledWith('fake-token');

            // Verificar que se obtuvieron los datos del paciente
            expect(db.doc).toHaveBeenCalledWith('patient-123');
            expect(db.get).toHaveBeenCalled();

            // Verificar respuesta
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'patient-123',
                    name: 'Juan Pérez'
                })
            );
        });

        it('debería devolver error 401 cuando no hay token de autorización', async () => {
            // Configurar request sin token
            mockRequest.headers.get.mockImplementation((header) => {
                if (header === 'Authorization') return null;
                return null;
            });

            // Ejecutar función
            await GET(mockRequest, { params: mockParams });

            // Verificar respuesta de error
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.stringContaining('Token') }),
                { status: 401 }
            );
        });

        it('debería devolver error 403 cuando un médico intenta acceder a un paciente sin relación', async () => {
            // Configurar mocks para médico sin relación
            authAdmin.verifyIdToken.mockResolvedValue({
                uid: 'doctor-123',
                role: 'medico'
            });

            // Mockear respuesta vacía de relación médico-paciente
            db.get.mockResolvedValue({ empty: true });

            // Ejecutar función
            await GET(mockRequest, { params: mockParams });

            // Verificar que se intentó buscar la relación
            expect(db.where).toHaveBeenCalledWith('doctorId', '==', 'doctor-123');
            expect(db.where).toHaveBeenCalledWith('patientId', '==', 'patient-123');
            expect(db.where).toHaveBeenCalledWith('status', '==', 'active');

            // Verificar respuesta de error
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.stringContaining('autorización') }),
                { status: 403 }
            );
        });

        // Más pruebas para GET...
    });

    describe('PUT - Actualizar paciente', () => {
        it('debería actualizar datos cuando el usuario es admin', async () => {
            // Configurar mocks
            const updateData = { name: 'Nuevo Nombre' };
            mockRequest.json.mockResolvedValue(updateData);

            db.get.mockResolvedValue({ exists: true });

            // Ejecutar función
            await PUT(mockRequest, { params: mockParams });

            // Verificar que se actualizó el documento
            expect(db.doc).toHaveBeenCalledWith('patient-123');
            expect(db.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Nuevo Nombre',
                    updatedAt: expect.any(String)
                })
            );

            // Verificar respuesta
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('successfully') }),
                { status: 200 }
            );
        });

        it('debería devolver error 403 cuando un paciente intenta actualizar otro paciente', async () => {
            // Configurar request como paciente intentando actualizar otro
            mockRequest.headers.get.mockImplementation((header) => {
                if (header === 'x-user-id') return 'patient-456';
                if (header === 'x-user-role') return 'paciente';
                return null;
            });

            // Ejecutar función
            await PUT(mockRequest, { params: mockParams });

            // Verificar respuesta de error
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.stringContaining('Forbidden') }),
                { status: 403 }
            );
        });

        it('debería filtrar campos cuando un médico intenta actualizar datos de un paciente', async () => {
            // Configurar request como médico
            mockRequest.headers.get.mockImplementation((header) => {
                if (header === 'x-user-id') return 'doctor-123';
                if (header === 'x-user-role') return 'medico';
                return null;
            });

            // Datos de actualización con campos permitidos y no permitidos
            const updateData = {
                medicalNotes: 'Nuevas notas',
                email: 'nuevo@example.com',  // No debería permitirse
                role: 'admin'                // No debería permitirse
            };
            mockRequest.json.mockResolvedValue(updateData);

            // Mockear relación médico-paciente
            const mockRelationship = {
                empty: false,
                docs: [{ id: 'rel-1' }]
            };
            db.get.mockImplementationOnce(() => Promise.resolve(mockRelationship))
                .mockImplementationOnce(() => Promise.resolve({ exists: true }));

            // Ejecutar función
            await PUT(mockRequest, { params: mockParams });

            // Verificar que se actualizó con los campos correctos
            expect(db.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    medicalNotes: 'Nuevas notas',
                    lastUpdatedBy: expect.objectContaining({
                        role: 'medico'
                    })
                })
            );

            // Verificar que NO se incluyeron campos prohibidos
            expect(db.update).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'nuevo@example.com',
                    role: 'admin'
                })
            );
        });

        // Más pruebas para PUT...
    });

    describe('DELETE - Eliminar paciente', () => {
        it('debería eliminar el paciente cuando el usuario es admin', async () => {
            // Configurar mocks
            db.get.mockResolvedValue({ exists: true });

            // Ejecutar función
            await DELETE(mockRequest, { params: mockParams });

            // Verificar que se eliminó el documento
            expect(db.doc).toHaveBeenCalledWith('patient-123');
            expect(db.delete).toHaveBeenCalled();

            // Verificar respuesta
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('deleted successfully') }),
                { status: 200 }
            );
        });

        it('debería devolver error 403 cuando un usuario no admin intenta eliminar', async () => {
            // Configurar request como médico
            mockRequest.headers.get.mockImplementation((header) => {
                if (header === 'x-user-id') return 'doctor-123';
                if (header === 'x-user-role') return 'medico';
                return null;
            });

            // Ejecutar función
            await DELETE(mockRequest, { params: mockParams });

            // Verificar respuesta de error
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.stringContaining('Forbidden') }),
                { status: 403 }
            );
        });

        it('debería devolver error 404 cuando el paciente no existe', async () => {
            // Configurar mock para paciente que no existe
            db.get.mockResolvedValue({ exists: false });

            // Ejecutar función
            await DELETE(mockRequest, { params: mockParams });

            // Verificar respuesta de error
            expect(NextResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.stringContaining('not found') }),
                { status: 404 }
            );
        });

        // Más pruebas para DELETE...
    });
});
