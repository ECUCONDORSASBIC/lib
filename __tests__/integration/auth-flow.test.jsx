import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/app/contexts/AuthContext';
import { mockFirebase } from '@/__mocks__/firebase';
import LoginForm from '@/app/components/auth/LoginForm';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn()
}));

// Mock para firebase/auth
jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    onAuthStateChanged: jest.fn(),
    getAuth: jest.fn()
}));

// Mock para firebase/firestore
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    serverTimestamp: jest.fn()
}));

// Mock completo para el contexto de autenticación
const AuthContextWrapper = ({ children, mockAuthValue }) => (
    <AuthProvider>
        {children}
    </AuthProvider>
);

describe('Flujo de Autenticación', () => {
    const mockRouter = { push: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue(mockRouter);
    });

    it('debería redirigir a un usuario médico a su dashboard correspondiente después de iniciar sesión', async () => {
        // Configurar mocks para un inicio de sesión exitoso
        const mockUser = { uid: 'doctor123' };
        const mockUserData = { role: 'medico', uid: 'doctor123', name: 'Dr. Smith' };

        // Mock de signInWithEmailAndPassword para devolver el usuario mock
        const { signInWithEmailAndPassword } = require('firebase/auth');
        signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

        // Mock de getDoc para devolver los datos del usuario
        const { getDoc } = require('firebase/firestore');
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => mockUserData
        });

        // Renderizar el componente LoginForm dentro del contexto AuthProvider
        render(
            <AuthContextWrapper>
                <LoginForm />
            </AuthContextWrapper>
        );

        // Simular entrada de credenciales
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'doctor@example.com' }
        });

        fireEvent.change(screen.getByLabelText(/contraseña/i), {
            target: { value: 'password123' }
        });

        // Simular clic en el botón de inicio de sesión
        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        // Verificar que se llamó a la función de inicio de sesión
        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'doctor@example.com',
                'password123'
            );
        });

        // Verificar que se mostró un toast de éxito
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Inicio de sesión exitoso.');
        });

        // Verificar la redirección al dashboard médico
        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/medico');
        });
    });

    it('debería mostrar un error cuando las credenciales son inválidas', async () => {
        // Configurar mock para un error de autenticación
        const { signInWithEmailAndPassword } = require('firebase/auth');
        signInWithEmailAndPassword.mockRejectedValue(new Error('Credenciales inválidas'));

        // Renderizar el componente LoginForm
        render(
            <AuthContextWrapper>
                <LoginForm />
            </AuthContextWrapper>
        );

        // Simular entrada de credenciales
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'wrong@example.com' }
        });

        fireEvent.change(screen.getByLabelText(/contraseña/i), {
            target: { value: 'wrongpassword' }
        });

        // Simular clic en el botón de inicio de sesión
        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        // Verificar que se mostró un toast de error
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Credenciales inválidas'));
        });

        // Verificar que no hubo redirección
        expect(mockRouter.push).not.toHaveBeenCalled();
    });
});
