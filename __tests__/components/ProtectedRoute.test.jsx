import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../../app/components/auth/ProtectedRoute';
import { useAuth } from '../../app/contexts/AuthContext';

// Mock del hook useAuth
jest.mock('../../app/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock del router de Next.js
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el componente de carga cuando loading es true', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('redirige al login cuando el usuario no está autenticado', async () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
    });
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('muestra el contenido cuando el usuario está autenticado', () => {
    useAuth.mockReturnValue({
      user: { uid: 'test-user-id' },
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
