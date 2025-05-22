import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Mocks necesarios
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(() => ({})),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: '/',
  }),
}));

// Componente de prueba simplificado para el formulario de registro
const RegisterForm = ({ onSubmit }) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (password !== confirmPassword) {
          return;
        }

        onSubmit({ name, email, password });
      }}
      data-testid="register-form"
    >
      <input
        type="text"
        name="name"
        placeholder="Nombre completo"
        data-testid="name-input"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        data-testid="email-input"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        data-testid="password-input"
        required
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirmar contraseña"
        data-testid="confirm-password-input"
        required
      />
      <button type="submit" data-testid="register-button">
        Registrarse
      </button>
    </form>
  );
};

describe('Formulario de registro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizarse correctamente', () => {
    render(<RegisterForm onSubmit={() => { }} />);

    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-button')).toBeInTheDocument();
  });

  it('debe llamar a onSubmit con los datos del formulario cuando se envía', async () => {
    const mockOnSubmit = jest.fn();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');

    await userEvent.type(nameInput, 'Juan Pérez');
    await userEvent.type(emailInput, 'juan@example.com');
    await userEvent.type(passwordInput, 'contraseña123');
    await userEvent.type(confirmPasswordInput, 'contraseña123');

    fireEvent.submit(screen.getByTestId('register-form'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'contraseña123',
    });
  });

  it('no debe llamar a onSubmit si las contraseñas no coinciden', async () => {
    const mockOnSubmit = jest.fn();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');

    await userEvent.type(nameInput, 'Juan Pérez');
    await userEvent.type(emailInput, 'juan@example.com');
    await userEvent.type(passwordInput, 'contraseña123');
    await userEvent.type(confirmPasswordInput, 'contraseñaDiferente');

    fireEvent.submit(screen.getByTestId('register-form'));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('debe validar que todos los campos sean requeridos', async () => {
    const mockOnSubmit = jest.fn();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    fireEvent.submit(screen.getByTestId('register-form'));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('debe integrarse correctamente con Firebase Auth', async () => {
    // Configuramos el mock para simular un registro exitoso
    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'new-uid', email: 'juan@example.com' }
    });

    const handleRegister = async ({ email, password }) => {
      const auth = {};
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        return true;
      } catch (error) {
        return false;
      }
    };

    render(<RegisterForm onSubmit={handleRegister} />);

    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');

    await userEvent.type(nameInput, 'Juan Pérez');
    await userEvent.type(emailInput, 'juan@example.com');
    await userEvent.type(passwordInput, 'contraseña123');
    await userEvent.type(confirmPasswordInput, 'contraseña123');

    fireEvent.submit(screen.getByTestId('register-form'));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'juan@example.com',
        'contraseña123'
      );
    });
  });
});
