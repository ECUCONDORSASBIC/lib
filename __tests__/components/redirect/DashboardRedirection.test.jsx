import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ROLES, getDashboardBaseUrl } from '@/app/utils/roleUtils';
import DashboardRedirect from '@/app/components/DashboardRedirect';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('@/app/contexts/AuthContext', () => ({
    useAuth: jest.fn()
}));

// Componente para pruebas de redirección
const mockPush = jest.fn();

describe('Dashboard Redirection Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue({ push: mockPush });
    });

    it('debería redirigir a un médico al dashboard médico', async () => {
        // Configurar un usuario médico
        useAuth.mockReturnValue({
            user: { uid: 'doctor-123', role: ROLES.DOCTOR },
            loading: false
        });

        render(<DashboardRedirect />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(getDashboardBaseUrl(ROLES.DOCTOR));
        });
    });

    it('debería redirigir a un paciente al dashboard de pacientes', async () => {
        // Configurar un usuario paciente
        useAuth.mockReturnValue({
            user: { uid: 'patient-123', role: ROLES.PATIENT },
            loading: false
        });

        render(<DashboardRedirect />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(getDashboardBaseUrl(ROLES.PATIENT));
        });
    });

    it('debería redirigir a una empresa al dashboard empresarial', async () => {
        // Configurar un usuario empresa
        useAuth.mockReturnValue({
            user: { uid: 'company-123', role: ROLES.COMPANY },
            loading: false
        });

        render(<DashboardRedirect />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(getDashboardBaseUrl(ROLES.COMPANY));
        });
    });

    it('debería manejar roles desconocidos enviándolos al dashboard general', async () => {
        // Configurar un usuario con rol desconocido
        useAuth.mockReturnValue({
            user: { uid: 'unknown-123', role: 'unknown' },
            loading: false
        });

        render(<DashboardRedirect />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/dashboard');
        });
    });
});
