import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIConversationalAnamnesis from '@/app/components/anamnesis/AIConversationalAnamnesis';

// Mock necessary dependencies
jest.mock('@/lib/firebase/firebaseClient', () => ({
  db: {},
}));

jest.mock('@/app/contexts/ToastContext', () => ({
  useToast: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock('@/app/services/aiAnamnesisService', () => ({
  generateSmartQuestion: jest.fn().mockResolvedValue({
    question: "¿Desde cuándo tiene el dolor de cabeza?",
    suggestedFollowUps: ["¿Es constante o intermitente?", "¿Qué intensidad tiene?"],
  }),
  analyzePatientResponse: jest.fn().mockResolvedValue({
    extractedData: {
      'motivo-consulta': {
        motivo_principal: 'dolor de cabeza'
      }
    },
  }),
}));

jest.mock('@/app/contexts/GenkitContext', () => ({
  useGenkit: jest.fn(() => ({
    analyzeConversation: jest.fn().mockResolvedValue({
      messages: [{ content: "¿Desde cuándo tiene el dolor de cabeza?" }],
      extractedData: {
        'motivo-consulta': {
          motivo_principal: 'dolor de cabeza'
        }
      }
    }),
    isProcessing: false,
  })),
}));

describe('AIConversationalAnamnesis Component', () => {
  const mockPatientId = 'test-patient-id';
  const mockFormData = {
    'datos-personales': {
      nombre_completo: 'Test Patient',
      fecha_nacimiento: '1990-01-01',
    }
  };
  const mockUpdateFormData = jest.fn();
  const mockVisibleSteps = [
    { id: 'datos-personales', title: 'Datos Personales' },
    { id: 'motivo-consulta', title: 'Motivo de Consulta' }
  ];
  const mockOnSaveProgress = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders the AI chat interface', () => {
    render(
      <AIConversationalAnamnesis 
        patientId={mockPatientId}
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        visibleSteps={mockVisibleSteps}
        currentStepIndex={0}
        onSaveProgress={mockOnSaveProgress}
        isSubmitting={false}
        patientContext={{ age: '32', gender: 'masculino' }}
      />
    );
    
    // Check that the AI chat UI elements are rendered
    expect(screen.getByText(/Conversación Médica/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escriba su respuesta/i)).toBeInTheDocument();
  });
  
  test('automatically extracts data from user responses', async () => {
    render(
      <AIConversationalAnamnesis 
        patientId={mockPatientId}
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        visibleSteps={mockVisibleSteps}
        currentStepIndex={1}
        onSaveProgress={mockOnSaveProgress}
        isSubmitting={false}
        patientContext={{ age: '32', gender: 'masculino' }}
      />
    );
    
    // Send a message about having a headache
    const inputField = screen.getByPlaceholderText(/Escriba su respuesta/i);
    fireEvent.change(inputField, { target: { value: 'Tengo un fuerte dolor de cabeza' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    // Check that the message appears
    await waitFor(() => {
      expect(screen.getByText('Tengo un fuerte dolor de cabeza')).toBeInTheDocument();
    });
    
    // Check that the AI extracts data and updates the form
    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith({
        'motivo-consulta': expect.objectContaining({
          motivo_principal: 'dolor de cabeza'
        })
      });
    });
    
    // Check that the AI response appears
    await waitFor(() => {
      expect(screen.getByText('¿Desde cuándo tiene el dolor de cabeza?')).toBeInTheDocument();
    });
  });
  
  test('saves progress periodically', async () => {
    render(
      <AIConversationalAnamnesis 
        patientId={mockPatientId}
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        visibleSteps={mockVisibleSteps}
        currentStepIndex={1}
        onSaveProgress={mockOnSaveProgress}
        isSubmitting={false}
        patientContext={{ age: '32', gender: 'masculino' }}
      />
    );
    
    // Simulate multiple interactions
    const inputField = screen.getByPlaceholderText(/Escriba su respuesta/i);
    
    // First message
    fireEvent.change(inputField, { target: { value: 'Me duele la cabeza' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Me duele la cabeza')).toBeInTheDocument();
    });
    
    // Second message - after multiple messages, progress should be saved
    fireEvent.change(inputField, { target: { value: 'Desde ayer' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    await waitFor(() => {
      expect(mockOnSaveProgress).toHaveBeenCalled();
    });
  });
});
