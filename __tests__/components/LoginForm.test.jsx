import { AuthContext } from '@/app/contexts/AuthContext'; // Import AuthContext to provide it
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../app/components/auth/LoginForm'; // Import the actual component

// Mocks
jest.mock('firebase/auth', () => ({
  // Keep existing mocks if they are still relevant for other parts or direct firebase calls
  signInWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(() => ({})),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    replace: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock for useAuth context
const mockSignIn = jest.fn();
const mockUseAuth = {
  user: null,
  loading: false,
  signIn: mockSignIn,
  signUp: jest.fn(),
  signOut: jest.fn(),
  sendPasswordReset: jest.fn(),
  updateUserProfile: jest.fn(),
  verifyEmail: jest.fn(),
  onboardUser: jest.fn(),
  setLoading: jest.fn(),
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue({ user: { uid: 'test-uid', email: 'test@example.com' } }); // Default success for signIn
  });

  const renderWithAuthContext = (component) => {
    return render(
      <AuthContext.Provider value={mockUseAuth}>
        {component}
      </AuthContext.Provider>
    );
  };

  it('debe renderizarse correctamente', () => {
    renderWithAuthContext(<LoginForm />);

    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it('debe llamar a signIn de useAuth con los datos del formulario cuando se envía', async () => {
    renderWithAuthContext(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });

    await userEvent.type(emailInput, 'usuario@example.com');
    await userEvent.type(passwordInput, 'contraseña123');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('usuario@example.com', 'contraseña123');
    });
  });

  it('debe mostrar un error si el email está vacío', async () => {
    renderWithAuthContext(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });

    await userEvent.type(passwordInput, 'contraseña123');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, completa todos los campos')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('debe mostrar un error si la contraseña está vacía', async () => {
    renderWithAuthContext(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });

    await userEvent.type(emailInput, 'usuario@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, completa todos los campos')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('debe mostrar un error de credenciales incorrectas si signIn falla con auth/user-not-found', async () => {
    mockSignIn.mockRejectedValueOnce({ code: 'auth/user-not-found' });
    renderWithAuthContext(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
    });
  });

  it('debe redirigir a /dashboard en un inicio de sesión exitoso', async () => {
    const mockRouterPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
      push: mockRouterPush,
      back: jest.fn(),
      pathname: '/',
      replace: jest.fn(),
      prefetch: jest.fn(),
      refresh: jest.fn(),
    }));

    renderWithAuthContext(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /Iniciar sesión/i });

    await userEvent.type(emailInput, 'usuario@example.com');
    await userEvent.type(passwordInput, 'contraseña123');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('usuario@example.com', 'contraseña123');
    });
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
