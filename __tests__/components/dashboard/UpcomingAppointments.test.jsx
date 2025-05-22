import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnamnesisPage from '@/app/dashboard/paciente/[id]/anamnesis/page';
import { useAuth } from '@/app/onboarding/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { ToastProvider, useToast } from '@/app/components/ui/Toast';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(),
}));

// Mock the database
jest.mock('@/lib/firebase/firebaseClient', () => ({
  db: {},
}));

// Mock authentication
jest.mock('@/app/onboarding/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock Toast
jest.mock('@/app/components/ui/Toast', () => ({
  useToast: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
  ToastProvider: ({ children }) => <div data-testid="toast-provider">{children}</div>,
}));

// Mock dynamic components
jest.mock('next/dynamic', () => (func) => {
  const Component = func();
  Component.displayName = 'DynamicComponent';
  return Component;
});

// Mock anamnesis formatter
jest.mock('@/utils/anamnesisFormatter', () => ({
  prepareAnamnesisForFirestore: jest.fn().mockReturnValue({
    sections: {},
    searchableData: { searchTerms: [] },
  }),
}));

// Mock components
jest.mock('@/app/components/anamnesis/ConversationalAnamnesis.simplified', () => ({
  __esModule: true,
  default: () => <div data-testid="conversational-anamnesis">Conversational Mode</div>,
}));

jest.mock('@/app/components/anamnesis/AIConversationalAnamnesis', () => ({
  __esModule: true,
  default: () => <div data-testid="ai-conversational-anamnesis">AI Conversational Mode</div>,
}));

jest.mock('@/app/components/anamnesis/NavegacionAnamnesis', () => ({
  __esModule: true,
  default: ({ currentSection, sections, onSectionChange }) => (
    <div data-testid="navegacion-anamnesis">
      {sections.map((section, index) => (
        <button 
          key={section.key}
          data-testid={`nav-section-${section.key}`}
          data-active={currentSection === index ? 'true' : 'false'}
          onClick={() => onSectionChange(index)}
        >
          {section.title} ({section.completed ? 'Completed' : 'Incomplete'})
        </button>
      ))}
    </div>
  ),
}));

jest.mock('@/app/components/anamnesis/DatosPersonalesForm', () => ({
  __esModule: true,
  default: ({ formData, updateFormData, nextStep }) => (
    <div data-testid="datos-personales-form">
      <input 
        data-testid="nombre-input"
        value={formData.nombre_completo || ''}
        onChange={(e) => updateFormData({ nombre_completo: e.target.value })} 
      />
      <input 
        data-testid="fecha-nacimiento-input"
        value={formData.fecha_nacimiento || ''}
        onChange={(e) => updateFormData({ fecha_nacimiento: e.target.value })} 
      />
      <select 
        data-testid="sexo-select"
        value={formData.sexo || ''}
        onChange={(e) => updateFormData({ sexo: e.target.value })}
      >
        <option value="">Seleccionar</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
      </select>
      <button data-testid="next-button" onClick={nextStep}>Siguiente</button>
    </div>
  ),
}));

jest.mock('@/app/components/anamnesis/MotivoConsultaForm', () => ({
  __esModule: true,
  default: ({ formData, updateFormData, nextStep, prevStep }) => (
    <div data-testid="motivo-consulta-form">
      <textarea 
        data-testid="motivo-principal-input"
        value={formData.motivo_principal || ''}
        onChange={(e) => updateFormData({ motivo_principal: e.target.value })}
      ></textarea>
      <button data-testid="prev-button" onClick={prevStep}>Anterior</button>
      <button data-testid="next-button" onClick={nextStep}>Siguiente</button>
    </div>
  ),
}));

jest.mock('@/app/components/debug/FirebaseDebug', () => ({
  __esModule: true,
  default: () => <div data-testid="firebase-debug">Firebase Debug</div>,
}));

jest.mock('@/app/components/ui/LoadingIndicator', () => ({
  __esModule: true,
  default: ({ message }) => <div data-testid="loading-indicator">{message}</div>,
}));

// Mock AnamnesisFormSummary
const mockAnamnesisFormSummary = jest.fn().mockImplementation(({ formData, onConfirm, onBack }) => (
  <div data-testid="anamnesis-form-summary">
    <div data-testid="summary-content">Summary content</div>
    <button data-testid="back-button" onClick={onBack}>Back</button>
    <button data-testid="confirm-button" onClick={onConfirm}>Confirm</button>
  </div>
));

jest.mock('@/app/components/anamnesis/AnamnesisFormSummary', () => ({
  __esModule: true,
  default: (props) => mockAnamnesisFormSummary(props),
}));

describe('AnamnesisPage Component', () => {
  // Setup common mocks and variables
  const mockPatientId = 'test-patient-id';
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
  };
  
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockToast = {
    success: jest.fn(),
    error: jest.fn(),
  };
  
  const mockPatientData = {
    nombre: 'Test Patient',
    fechaNacimiento: '1990-01-01',
    sexo: 'masculino',
  };
  
  const mockAnamnesisData = {
    formulario: {
      'datos-personales': {
        nombre_completo: 'Test Patient',
        fecha_nacimiento: '1990-01-01',
        sexo: 'masculino',
      },
    },
    completedSteps: ['datos-personales'],
  };
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    useParams.mockReturnValue({ id: mockPatientId });
    useRouter.mockReturnValue(mockRouter);
    useAuth.mockReturnValue({ user: mockUser, loading: false });
    useToast.mockReturnValue(mockToast);
    
    // Mock document fetching
    const mockPatientDocSnap = {
      exists: () => true,
      data: () => mockPatientData,
    };
    
    const mockAnamnesisDocSnap = {
      exists: () => false,
    };
    
    getDoc.mockImplementation((docRef) => {
      if (docRef.path && docRef.path.includes('anamnesis')) {
        return Promise.resolve(mockAnamnesisDocSnap);
      }
      return Promise.resolve(mockPatientDocSnap);
    });
    
    doc.mockImplementation((_, collection, id) => ({ 
      path: `${collection}/${id}` 
    }));
    
    serverTimestamp.mockReturnValue('mocked-timestamp');
    setDoc.mockResolvedValue(undefined);
  });
  
  test('renders loading indicator while loading', async () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    
    render(<AnamnesisPage />);
    
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.getByText('Cargando información...')).toBeInTheDocument();
  });

  test('redirects to login if no user is authenticated', async () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    
    render(<AnamnesisPage />);
    
    expect(mockRouter.push).toHaveBeenCalledWith(`/login?redirect=/dashboard/paciente/${mockPatientId}/anamnesis`);
  });

  test('loads patient data and renders the form', async () => {
    render(<AnamnesisPage />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check basic component structure
    expect(screen.getByText('Historia Clínica Digital')).toBeInTheDocument();
    expect(screen.getByTestId('navegacion-anamnesis')).toBeInTheDocument();
    expect(screen.getByTestId('datos-personales-form')).toBeInTheDocument();
  });

  test('navigates between form steps and validates input', async () => {
    render(<AnamnesisPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Try to proceed without filling required fields
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    
    // Check validation error
    expect(mockToast.error).toHaveBeenCalledWith('Por favor complete todos los campos requeridos');
    
    // Fill required fields and proceed
    fireEvent.change(screen.getByTestId('nombre-input'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId('fecha-nacimiento-input'), { target: { value: '1990-01-01' } });
    fireEvent.change(screen.getByTestId('sexo-select'), { target: { value: 'masculino' } });
    
    fireEvent.click(nextButton);
    
    // Check form saves and advances to next step
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
      expect(screen.getByTestId('motivo-consulta-form')).toBeInTheDocument();
    });
  });

  test('toggles between form and conversational modes', async () => {
    render(<AnamnesisPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Initial state should be form mode
    expect(screen.getByTestId('datos-personales-form')).toBeInTheDocument();
    
    // Switch to conversational mode
    fireEvent.click(screen.getByText('Modo Conversacional'));
    
    // Should now show conversational interface
    expect(screen.getByTestId('conversational-anamnesis')).toBeInTheDocument();
    
    // Switch back to form mode
    fireEvent.click(screen.getByText('Modo Formulario'));
    
    // Should show form again
    expect(screen.getByTestId('datos-personales-form')).toBeInTheDocument();
  });

  test('toggles between AI and non-AI conversational modes', async () => {
    render(<AnamnesisPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Switch to conversational mode
    fireEvent.click(screen.getByText('Modo Conversacional'));
    
    // By default AI should be active
    expect(screen.getByTestId('ai-conversational-anamnesis')).toBeInTheDocument();
    
    // Toggle AI off
    fireEvent.click(screen.getByText('IA Activada'));
    
    // Should now show regular conversational interface
    expect(screen.getByTestId('conversational-anamnesis')).toBeInTheDocument();
  });

  test('shows summary view when requested', async () => {
    render(<AnamnesisPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Click on summary button
    fireEvent.click(screen.getByText('Ver Resumen'));
    
    // Should show the summary
    expect(screen.getByTestId('anamnesis-form-summary')).toBeInTheDocument();
    
    // Close summary
    fireEvent.click(screen.getByTestId('back-button'));
    
    // Should go back to form
    expect(screen.getByTestId('datos-personales-form')).toBeInTheDocument();
  });

  test('submits the form from summary view', async () => {
    // Mock existing anamnesis data
    const mockCompletedAnamnesisData = {
      exists: () => true,
      data: () => ({
        ...mockAnamnesisData,
        isCompleted: true,
      }),
    };
    
    getDoc.mockImplementation((docRef) => {
      if (docRef.path && docRef.path.includes('anamnesis')) {
        return Promise.resolve(mockCompletedAnamnesisData);
      }
      return Promise.resolve({
        exists: () => true,
        data: () => mockPatientData
      });
    });
    
    render(<AnamnesisPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Click on summary button
    fireEvent.click(screen.getByText('Ver Resumen'));
    
    // Submit the form
    fireEvent.click(screen.getByTestId('confirm-button'));
    
    // Check if form was submitted
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isCompleted: true,
          completedAt: 'mocked-timestamp',
        }),
        expect.anything()
      );
      expect(mockToast.success).toHaveBeenCalledWith('Historia clínica completada');
      expect(mockRouter.push).toHaveBeenCalledWith(`/dashboard/paciente/${mockPatientId}`);
    });
  });

  test('loads existing anamnesis data', async () => {
    // Mock existing anamnesis data
    const mockExistingAnamnesisDocSnap = {
      exists: () => true,
      data: () => ({
        structuredData: {
          sections: {
            'datos-personales': {
              data: {
                nombre_completo: 'Existing Patient',
                fecha_nacimiento: '1985-05-15',
                sexo: 'femenino',
              }
            },
            'motivo-consulta': {
              data: {
                motivo_principal: 'Dolor de cabeza',
              }
            }
          },
          metadata: {
            completedSections: ['datos-personales']
          }
        }
      }),
    };
    
    getDoc.mockImplementation((docRef) => {
      if (docRef.path && docRef.path.includes('anamnesis')) {
        return Promise.resolve(mockExistingAnamnesisDocSnap);
      }
      return Promise.resolve({
        exists: () => true,
        data: () => mockPatientData
      });
    });
    
    render(<AnamnesisPage />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Navigate to second step to see if data was loaded
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('motivo-consulta-form')).toBeInTheDocument();
      // Verify existing data is loaded
      expect(screen.getByTestId('motivo-principal-input')).toHaveValue('Dolor de cabeza');
    });
  });
});
