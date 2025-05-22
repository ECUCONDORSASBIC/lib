import { render, screen } from '@testing-library/react';
import LandingPage from '../../app/page';

// Mock de los componentes que puedan causar problemas en las pruebas
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} data-testid="next-image" />;
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useParams: () => ({}),
}));

// Mock de los contextos y hooks
jest.mock('../../app/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    userData: null,
  }),
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

jest.mock('../../app/i18n', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock de componentes UI que pueden causar problemas
jest.mock('../../app/components/ui/Toast', () => ({
  __esModule: true,
  useToast: () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn(),
    },
  }),
  default: ({ children }) => <div data-testid="toast-provider">{children}</div>,
}));

describe('Página de inicio', () => {
  // Test simplificado que solo verifica que el componente se renderice sin errores
  it('se renderiza sin errores', () => {
    // Envolvemos el render en un try-catch para manejar posibles errores
    try {
      render(<LandingPage />);
      // Si llegamos aquí, el componente se renderizó sin errores
      expect(true).toBe(true);
    } catch (error) {
      console.error('Error al renderizar LandingPage:', error);
      // Falla el test si hay un error
      expect(error).toBeUndefined();
    }
  });

  // Test condicional que busca elementos comunes que deberían estar en la página
  it('contiene elementos básicos esperados', () => {
    render(<LandingPage />);
    
    // Buscamos imágenes (incluyendo el logo)
    const images = screen.getAllByTestId('next-image');
    expect(images.length).toBeGreaterThan(0);
    
    // Buscamos enlaces (debería haber varios en la página de inicio)
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});

