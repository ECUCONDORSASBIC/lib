import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import DashboardRedirect from '@/app/components/DashboardRedirect';
import { getDashboardBaseUrl } from '@/app/utils/roleUtils';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('@/app/contexts/AuthContext', () => ({
    useAuth: jest.fn()
}));

describe('Flujo de Redirección del Dashboard', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue({ push: mockPush });
    });

    it('debería redirigir a usuarios autenticados a su dashboard basado en rol', async () => {
        // Configurar 3 roles diferentes para probar las redirecciones
        const testCases = [
            { role: 'medico', expectedUrl: '/dashboard/medico' },
            { role: 'paciente', expectedUrl: '/dashboard/paciente' },
            { role: 'empresa', expectedUrl: '/dashboard/empresa' },
        ];

        for (const testCase of testCases) {
            // Configurar mock para el usuario
            useAuth.mockReturnValue({
                user: { uid: 'user123', role: testCase.role },
                loading: false
            });

            // Renderizar el componente
            const { unmount } = render(<DashboardRedirect />);

            // Verificar la redirección correcta según el rol
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(testCase.expectedUrl);
            });

            unmount();
            jest.clearAllMocks();
        }
    });

    it('debería redirigir a usuarios no autenticados a la página de login', async () => {
        // Configurar mock para usuario no autenticado
        useAuth.mockReturnValue({
            user: null,
            loading: false
        });

        // Renderizar el componente
        render(<DashboardRedirect />);

        // Verificar la redirección a login
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('debería mostrar indicador de carga mientras auth está cargando', async () => {
        // Configurar estado de carga
        useAuth.mockReturnValue({
            user: null,
            loading: true
        });

        // Renderizar el componente
        render(<DashboardRedirect />);

        // Verificar que se muestra el indicador de carga
        expect(screen.getByText('Redireccionando...')).toBeInTheDocument();
        expect(screen.getByText(/Por favor espere mientras lo dirigimos/)).toBeInTheDocument();

        // Verificar que no se realizó ninguna redirección durante la carga
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('debería manejar permisos y rutas específicas por rol', async () => {
        // Prueba para redirección a ruta específica para médico
        useAuth.mockReturnValue({
            user: {
                uid: 'doctor123',
                role: 'medico',
                permissions: ['view_patients', 'schedule_appointments']
            },
            loading: false
        });

        const { unmount } = render(<DashboardRedirect />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/dashboard/medico');
        });

        unmount();
    });
});
