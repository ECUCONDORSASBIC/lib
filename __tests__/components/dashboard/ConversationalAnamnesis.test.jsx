import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GeminiTrainer from './GeminiTrainer';
import ConversationalAnamnesis from '@/app/components/anamnesis/ConversationalAnamnesis.simplified';

// Mocks simples para evitar inicializar servicios externos
jest.mock('firebase/vertexai', () => ({
  getVertexAI: jest.fn(() => ({})),
  getGenerativeModel: jest.fn(() => ({
    generateContent: jest.fn(() => Promise.resolve({ response: { text: () => 'Respuesta generada' } }))
  }))
}));
jest.mock('@/lib/firebase', () => ({
  app: {},
  db: {}
}));

// Mock necessary dependencies
jest.mock('@/app/components/ui/Toast', () => ({
  useToast: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('GeminiTrainer Component', () => {
  test('Renderiza el formulario y permite entrenar un modelo', async () => {
    render(<GeminiTrainer />);

    // Verifica que se muestre el botón "Enviar para entrenamiento"
    const submitButton = screen.getByText(/Enviar para entrenamiento/i);
    expect(submitButton).toBeDisabled(); // Sin texto en el prompt, debe estar deshabilitado

    // Escribimos en el textarea y se habilita el botón
    const promptTextarea = screen.getByPlaceholderText(/Escribe una instrucción o pregunta/i);
    fireEvent.change(promptTextarea, { target: { value: 'Hola, necesito entrenar un modelo' } });
    expect(submitButton).not.toBeDisabled();

    // Click en "Enviar para entrenamiento"
    fireEvent.click(submitButton);

    // Esperamos la respuesta generada
    await waitFor(() => {
      expect(screen.getByText('Respuesta generada')).toBeInTheDocument();
    });
  });

  test('Muestra el historial de conversación y activa modo Feedback', async () => {
    render(<GeminiTrainer />);

    // Ingresamos un prompt y enviamos
    const promptTextarea = screen.getByPlaceholderText(/Escribe una instrucción o pregunta/i);
    fireEvent.change(promptTextarea, { target: { value: 'Prueba de conversación' } });
    const submitButton = screen.getByText(/Enviar para entrenamiento/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Se muestra la respuesta y el modo feedback
      expect(screen.getByText('Respuesta generada')).toBeInTheDocument();
      expect(screen.getByText(/Evaluar respuesta del asistente/i)).toBeInTheDocument();
    });
  });

  test('Permite guardar el ejemplo como respuesta positiva o negativa', async () => {
    render(<GeminiTrainer />);

    // Forzamos el componente a modo feedback rápidamente
    // ...existing code...
    // Nota: en un escenario real, llamaríamos al submit previo
    // y esperaríamos la respuesta generada
    // ...existing code...

    // Simulamos historial de conversación con feedback
    // Aquí, solo nos aseguramos de que los botones estén en el DOM
    const goodButton = screen.getByText(/Buena respuesta/i);
    const badButton = screen.getByText(/Necesita mejora/i);
    expect(goodButton).toBeInTheDocument();
    expect(badButton).toBeInTheDocument();

    // Damos click en "Buena respuesta" (lógica subyacente mockeada)
    fireEvent.click(goodButton);
    // Se podría esperar un mensaje de confirmación
  });
});

describe('ConversationalAnamnesis Component', () => {
  const mockPatientId = 'test-patient-id';
  const mockExistingData = {
    'datos-personales': {
      nombre_completo: 'Test Patient',
      fecha_nacimiento: '1990-01-01',
    },
  };
  
  const mockOnInsightsGenerated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders the chat interface', () => {
    render(
      <ConversationalAnamnesis 
        patientId={mockPatientId}
        existingData={mockExistingData}
        onInsightsGenerated={mockOnInsightsGenerated}
      />
    );
    
    // Check that the chat UI elements are rendered
    expect(screen.getByText(/Asistente de Historia Clínica/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escriba su respuesta aquí/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });
  
  test('allows user to send messages', async () => {
    render(
      <ConversationalAnamnesis 
        patientId={mockPatientId}
        existingData={mockExistingData}
        onInsightsGenerated={mockOnInsightsGenerated}
      />
    );
    
    // Type a message and send it
    const inputField = screen.getByPlaceholderText(/Escriba su respuesta aquí/i);
    fireEvent.change(inputField, { target: { value: 'Me duele la cabeza' } });
    
    const sendButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(sendButton);
    
    // Check that the message appears in the chat
    await waitFor(() => {
      expect(screen.getByText('Me duele la cabeza')).toBeInTheDocument();
    });
  });
  
  test('extracts insights from conversation', async () => {
    render(
      <ConversationalAnamnesis 
        patientId={mockPatientId}
        existingData={mockExistingData}
        onInsightsGenerated={mockOnInsightsGenerated}
      />
    );
    
    // Simulate a conversation that generates insights
    const inputField = screen.getByPlaceholderText(/Escriba su respuesta aquí/i);
    
    // First message about the chief complaint
    fireEvent.change(inputField, { target: { value: 'Tengo dolor de cabeza desde hace 3 días' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    // Wait for the assistant's response and then send another message
    await waitFor(() => {
      expect(screen.getByText('Tengo dolor de cabeza desde hace 3 días')).toBeInTheDocument();
    });
    
    // Check that insights were generated
    await waitFor(() => {
      expect(mockOnInsightsGenerated).toHaveBeenCalled();
      const insights = mockOnInsightsGenerated.mock.calls[0][0];
      expect(insights).toHaveProperty('motivo-consulta');
    });
  });
});