import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoConsultation from '@/app/components/telemedicine/VideoConsultation';
import { 
  mockAppointment, 
  mockDoctor, 
  mockFirestoreData, 
  mockRealtimeService,
  renderWithProviders
} from '../utils/testUtils';

// Mocking services
jest.mock('@/app/services/videoService', () => ({
  initializeVideoCall: jest.fn().mockResolvedValue({ sessionId: 'mock-session-id', token: 'mock-token' }),
  endVideoCall: jest.fn().mockResolvedValue(true),
  publishStream: jest.fn(),
  subscribeToStream: jest.fn(),
  toggleAudio: jest.fn().mockImplementation((muted) => !muted),
  toggleVideo: jest.fn().mockImplementation((disabled) => !disabled),
  shareScreen: jest.fn().mockResolvedValue(true),
  stopScreenShare: jest.fn().mockResolvedValue(true),
  getConnectionStats: jest.fn().mockResolvedValue({
    bytesReceived: 2048000,
    bytesSent: 1024000,
    packetsLost: 2,
    jitter: 0.15,
    roundTripTime: 220,
    connectionQuality: 'good'
  })
}));

jest.mock('@/app/hooks/useAppointmentDetails', () => ({
  useAppointmentDetails: jest.fn()
}));

jest.mock('@/app/services/chatService', () => {
  const mockChatService = mockRealtimeService();
  return {
    ...mockChatService,
    getMessageHistory: jest.fn().mockResolvedValue([
      { id: 'msg1', sender: 'doctor', text: 'Hola, ¿cómo se ha sentido?', timestamp: new Date().toISOString() },
      { id: 'msg2', sender: 'patient', text: 'He mejorado con la medicación', timestamp: new Date().toISOString() }
    ])
  };
});

describe('Telemedicine Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    require('@/app/hooks/useAppointmentDetails').useAppointmentDetails.mockReturnValue({
      appointment: { ...mockAppointment, doctor: mockDoctor },
      loading: false,
      error: null
    });
  });
  
  test('VideoConsultation correctly initializes video call and establishes connection', async () => {
    // Arrange - render component 
    renderWithProviders(<VideoConsultation appointmentId="test-appointment-id" />);
    
    // Act - start video call
    fireEvent.click(screen.getByRole('button', { name: /iniciar/i }));
    
    // Assert - video call services were called and UI updates correctly
    await waitFor(() => {
      expect(require('@/app/services/videoService').initializeVideoCall).toHaveBeenCalledWith('test-appointment-id');
    });
    
    // Verify connection indicators appear
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
  });
  
  test('VideoConsultation displays network quality indicators during call', async () => {
    // Arrange
    renderWithProviders(<VideoConsultation appointmentId="test-appointment-id" />);
    
    // Act - mock connection established and stats checking
    await act(async () => {
      // Simulate connection established
      fireEvent.click(screen.getByRole('button', { name: /iniciar/i }));
      await waitFor(() => screen.getByTestId('connection-status'));
      
      // Simulate stats checking interval
      await require('@/app/services/videoService').getConnectionStats();
    });
    
    // Assert quality indicators
    expect(screen.getByTestId('connection-quality')).toHaveTextContent(/good/i);
  });
  
  test('VideoConsultation handles disconnections and reconnection attempts', async () => {
    // Arrange 
    const videoService = require('@/app/services/videoService');
    videoService.initializeVideoCall.mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValueOnce({ sessionId: 'mock-session-id', token: 'mock-token' });
    
    renderWithProviders(<VideoConsultation appointmentId="test-appointment-id" />);
    
    // Act - simulate failed connection then retry
    fireEvent.click(screen.getByRole('button', { name: /iniciar/i }));
    
    // Assert - error state and retry button
    await waitFor(() => {
      expect(screen.getByTestId('connection-error')).toBeInTheDocument();
    });
    
    // Retry connection
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    
    // Assert - successful connection after retry
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toBeInTheDocument();
      expect(videoService.initializeVideoCall).toHaveBeenCalledTimes(2);
    });
  });
  
  test('Chat service integrates with video consultation component', async () => {
    // Arrange
    const chatService = require('@/app/services/chatService');
    renderWithProviders(<VideoConsultation appointmentId="test-appointment-id" />);
    
    // Act - open chat panel
    fireEvent.click(screen.getByTestId('toggle-chat-button'));
    
    // Assert - chat history loaded
    await waitFor(() => {
      expect(chatService.getMessageHistory).toHaveBeenCalledWith('test-appointment-id');
      expect(screen.getByText('Hola, ¿cómo se ha sentido?')).toBeInTheDocument();
      expect(screen.getByText('He mejorado con la medicación')).toBeInTheDocument();
    });
    
    // Act - send new message
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Nueva consulta sobre mi medicación' } });
    fireEvent.click(screen.getByTestId('send-message-button'));
    
    // Assert - message sent via service
    await waitFor(() => {
      expect(chatService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ 
          text: 'Nueva consulta sobre mi medicación',
          appointmentId: 'test-appointment-id' 
        })
      );
    });
  });
});
