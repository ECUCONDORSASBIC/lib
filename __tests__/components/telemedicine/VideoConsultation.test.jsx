import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock de componentes y hooks necesarios
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/telemedicina/consulta/apt-123',
}));

// Mock para el servicio de video
jest.mock('@/app/services/videoService', () => ({
  initializeVideoCall: jest.fn().mockResolvedValue({ sessionId: 'mock-session-id', token: 'mock-token' }),
  endVideoCall: jest.fn().mockResolvedValue(true),
  publishStream: jest.fn(),
  subscribeToStream: jest.fn(),
  toggleAudio: jest.fn().mockImplementation((muted) => !muted),
  toggleVideo: jest.fn().mockImplementation((disabled) => !disabled),
  shareScreen: jest.fn().mockResolvedValue(true),
  stopScreenShare: jest.fn().mockResolvedValue(true)
}));

// Mock para el hook que obtiene los datos de la cita
const mockAppointment = {
  id: 'apt-123',
  date: '2025-05-20T15:30:00Z',
  duration: 30, // minutos
  status: 'in-progress',
  type: 'telemedicina',
  reason: 'Seguimiento de tratamiento',
  notes: 'Paciente con hipertensión controlada',
  patient: {
    id: 'patient-1',
    name: 'Juan Pérez',
    age: 45,
    gender: 'male',
    photo: '/avatars/patient-1.jpg'
  },
  doctor: {
    id: 'doc-1',
    name: 'Dra. Ana Martínez',
    specialty: 'Cardiología',
    photo: '/avatars/doctor-1.jpg'
  }
};

jest.mock('@/app/hooks/useAppointmentDetails', () => ({
  useAppointmentDetails: jest.fn().mockReturnValue({
    appointment: mockAppointment,
    loading: false,
    error: null
  })
}));

// Componente simplificado para pruebas
const VideoConsultation = ({ appointmentId }) => {
  // En un componente real, usaríamos los hooks para obtener los datos
  const { appointment, loading, error } = require('@/app/hooks/useAppointmentDetails').useAppointmentDetails(appointmentId);
  const videoService = require('@/app/services/videoService');
  
  // Estados simulados para la prueba
  const [isConnected, setIsConnected] = React.useState(false);
  const [isAudioMuted, setIsAudioMuted] = React.useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = React.useState(false);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState([
    { id: 'msg-1', sender: 'doctor', text: 'Hola, ¿cómo se ha sentido?', timestamp: '2025-05-20T15:31:00Z' },
    { id: 'msg-2', sender: 'patient', text: 'Bien, la medicación ha funcionado', timestamp: '2025-05-20T15:31:30Z' }
  ]);
  const [newMessage, setNewMessage] = React.useState('');

  if (loading) return <div data-testid="loading">Cargando datos de la consulta...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  if (!appointment) return <div data-testid="no-data">No hay datos disponibles</div>;

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para iniciar la videollamada
  const handleStartCall = async () => {
    try {
      await videoService.initializeVideoCall(appointmentId);
      setIsConnected(true);
      console.log('Videollamada iniciada');
    } catch (error) {
      console.error('Error al iniciar la videollamada:', error);
    }
  };

  // Función para finalizar la videollamada
  const handleEndCall = async () => {
    try {
      await videoService.endVideoCall(appointmentId);
      setIsConnected(false);
      console.log('Videollamada finalizada');
    } catch (error) {
      console.error('Error al finalizar la videollamada:', error);
    }
  };

  // Función para alternar el audio
  const handleToggleAudio = () => {
    const newMutedState = videoService.toggleAudio(isAudioMuted);
    setIsAudioMuted(newMutedState);
    console.log(`Audio ${newMutedState ? 'silenciado' : 'activado'}`);
  };

  // Función para alternar el video
  const handleToggleVideo = () => {
    const newDisabledState = videoService.toggleVideo(isVideoDisabled);
    setIsVideoDisabled(newDisabledState);
    console.log(`Video ${newDisabledState ? 'desactivado' : 'activado'}`);
  };

  // Función para compartir pantalla
  const handleShareScreen = async () => {
    if (isScreenSharing) {
      await videoService.stopScreenShare();
      setIsScreenSharing(false);
      console.log('Compartir pantalla detenido');
    } else {
      await videoService.shareScreen();
      setIsScreenSharing(true);
      console.log('Pantalla compartida');
    }
  };

  // Función para enviar un mensaje de chat
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const message = {
      id: `msg-${Date.now()}`,
      sender: 'doctor', // Asumimos que es el médico quien envía
      text: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages([...chatMessages, message]);
    setNewMessage('');
    console.log('Mensaje enviado:', message.text);
  };

  return (
    <div data-testid="video-consultation">
      <div data-testid="consultation-header" className="header">
        <h1>Consulta de Telemedicina</h1>
        <div data-testid="appointment-info">
          <p>Paciente: {appointment.patient.name}</p>
          <p>Fecha: {formatDate(appointment.date)}</p>
          <p>Motivo: {appointment.reason}</p>
        </div>
      </div>

      <div data-testid="video-container" className="video-container">
        {!isConnected ? (
          <div data-testid="start-call-prompt" className="start-call-prompt">
            <p>Haga clic en "Iniciar Consulta" para comenzar la videollamada</p>
            <button
              data-testid="start-call-button"
              onClick={handleStartCall}
            >
              Iniciar Consulta
            </button>
          </div>
        ) : (
          <>
            <div data-testid="remote-video" className="remote-video">
              {/* Aquí iría el video del otro participante */}
              <div className="placeholder">
                <img
                  src={appointment.patient.photo}
                  alt={appointment.patient.name}
                  data-testid="patient-video-placeholder"
                />
              </div>
            </div>
            <div data-testid="local-video" className="local-video">
              {/* Aquí iría el video local */}
              <div className="placeholder">
                <img
                  src={appointment.doctor.photo}
                  alt={appointment.doctor.name}
                  data-testid="doctor-video-placeholder"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {isConnected && (
        <div data-testid="video-controls" className="video-controls">
          <button
            data-testid="toggle-audio-button"
            onClick={handleToggleAudio}
            className={isAudioMuted ? 'muted' : ''}
          >
            {isAudioMuted ? 'Activar Audio' : 'Silenciar Audio'}
          </button>
          <button
            data-testid="toggle-video-button"
            onClick={handleToggleVideo}
            className={isVideoDisabled ? 'disabled' : ''}
          >
            {isVideoDisabled ? 'Activar Video' : 'Desactivar Video'}
          </button>
          <button
            data-testid="share-screen-button"
            onClick={handleShareScreen}
            className={isScreenSharing ? 'active' : ''}
          >
            {isScreenSharing ? 'Dejar de Compartir' : 'Compartir Pantalla'}
          </button>
          <button
            data-testid="toggle-chat-button"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={isChatOpen ? 'active' : ''}
          >
            {isChatOpen ? 'Cerrar Chat' : 'Abrir Chat'}
          </button>
          <button
            data-testid="end-call-button"
            onClick={handleEndCall}
            className="end-call"
          >
            Finalizar Consulta
          </button>
        </div>
      )}

      {isConnected && isChatOpen && (
        <div data-testid="chat-panel" className="chat-panel">
          <div data-testid="chat-messages" className="chat-messages">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                data-testid={`chat-message-${message.id}`}
                className={`message ${message.sender}`}
              >
                <span className="sender">{message.sender === 'doctor' ? 'Médico' : 'Paciente'}</span>
                <span className="text">{message.text}</span>
                <span className="timestamp">
                  {new Date(message.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
          <form data-testid="chat-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              data-testid="chat-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escriba un mensaje..."
            />
            <button type="submit" data-testid="send-message-button">Enviar</button>
          </form>
        </div>
      )}

      <div data-testid="consultation-notes" className="consultation-notes">
        <h2>Notas de la Consulta</h2>
        <textarea
          data-testid="notes-textarea"
          defaultValue={appointment.notes}
          placeholder="Escriba notas sobre la consulta aquí..."
        />
        <button data-testid="save-notes-button">Guardar Notas</button>
      </div>
    </div>
  );
};

// Definimos React para el componente
const React = {
  useState: (initialValue) => [initialValue, jest.fn()]
};

describe('VideoConsultation', () => {
  beforeEach(() => {
    // Restablecer los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Mock para React.useState
    React.useState = jest.fn()
      .mockImplementationOnce((init) => [init, setIsConnected]) // isConnected
      .mockImplementationOnce((init) => [init, setIsAudioMuted]) // isAudioMuted
      .mockImplementationOnce((init) => [init, setIsVideoDisabled]) // isVideoDisabled
      .mockImplementationOnce((init) => [init, setIsScreenSharing]) // isScreenSharing
      .mockImplementationOnce((init) => [init, setIsChatOpen]) // isChatOpen
      .mockImplementationOnce((init) => [init, setChatMessages]) // chatMessages
      .mockImplementationOnce((init) => [init, setNewMessage]); // newMessage
    
    // Funciones de actualización de estado
    function setIsConnected(value) {
      mockStates.isConnected = typeof value === 'function' ? value(mockStates.isConnected) : value;
    }
    
    function setIsAudioMuted(value) {
      mockStates.isAudioMuted = typeof value === 'function' ? value(mockStates.isAudioMuted) : value;
    }
    
    function setIsVideoDisabled(value) {
      mockStates.isVideoDisabled = typeof value === 'function' ? value(mockStates.isVideoDisabled) : value;
    }
    
    function setIsScreenSharing(value) {
      mockStates.isScreenSharing = typeof value === 'function' ? value(mockStates.isScreenSharing) : value;
    }
    
    function setIsChatOpen(value) {
      mockStates.isChatOpen = typeof value === 'function' ? value(mockStates.isChatOpen) : value;
    }
    
    function setChatMessages(value) {
      mockStates.chatMessages = typeof value === 'function' ? value(mockStates.chatMessages) : value;
    }
    
    function setNewMessage(value) {
      mockStates.newMessage = typeof value === 'function' ? value(mockStates.newMessage) : value;
    }
  });
  
  // Estados simulados para las pruebas
  const mockStates = {
    isConnected: false,
    isAudioMuted: false,
    isVideoDisabled: false,
    isScreenSharing: false,
    isChatOpen: false,
    chatMessages: [
      { id: 'msg-1', sender: 'doctor', text: 'Hola, ¿cómo se ha sentido?', timestamp: '2025-05-20T15:31:00Z' },
      { id: 'msg-2', sender: 'patient', text: 'Bien, la medicación ha funcionado', timestamp: '2025-05-20T15:31:30Z' }
    ],
    newMessage: ''
  };

  it('debe renderizar correctamente la interfaz de videoconsulta', () => {
    render(<VideoConsultation appointmentId="apt-123" />);
    
    // Verificar que el componente se renderiza correctamente
    expect(screen.getByTestId('video-consultation')).toBeInTheDocument();
    expect(screen.getByTestId('consultation-header')).toBeInTheDocument();
    expect(screen.getByTestId('appointment-info')).toBeInTheDocument();
    expect(screen.getByTestId('video-container')).toBeInTheDocument();
    
    // Verificar que se muestra la información de la cita
    expect(screen.getByText('Paciente: Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Motivo: Seguimiento de tratamiento')).toBeInTheDocument();
    
    // Verificar que se muestra el botón para iniciar la consulta
    expect(screen.getByTestId('start-call-button')).toBeInTheDocument();
    
    // Verificar que se muestran las notas de la consulta
    expect(screen.getByTestId('consultation-notes')).toBeInTheDocument();
    expect(screen.getByTestId('notes-textarea')).toHaveValue('Paciente con hipertensión controlada');
  });

  it('debe iniciar la videollamada cuando se hace clic en el botón de iniciar', async () => {
    // Espiar console.log para verificar que se llama
    console.log = jest.fn();
    
    render(<VideoConsultation appointmentId="apt-123" />);
    
    // Hacer clic en el botón de iniciar consulta
    fireEvent.click(screen.getByTestId('start-call-button'));
    
    // Verificar que se llama a la función de inicialización
    expect(require('@/app/services/videoService').initializeVideoCall).toHaveBeenCalledWith('apt-123');
    
    // Verificar que se actualiza el estado
    await waitFor(() => {
      expect(mockStates.isConnected).toBe(true);
    });
    
    // Verificar que se registra en la consola
    expect(console.log).toHaveBeenCalledWith('Videollamada iniciada');
  });

  it('debe mostrar los controles de video cuando la llamada está conectada', async () => {
    // Configuramos el estado inicial como conectado
    mockStates.isConnected = true;
    
    render(<VideoConsultation appointmentId="apt-123" />);
    
    // Verificar que se muestran los controles de video
    expect(screen.getByTestId('video-controls')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-audio-button')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-video-button')).toBeInTheDocument();
    expect(screen.getByTestId('share-screen-button')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-chat-button')).toBeInTheDocument();
    expect(screen.getByTestId('end-call-button')).toBeInTheDocument();
    
    // Verificar que se muestran los videos
    expect(screen.getByTestId('remote-video')).toBeInTheDocument();
    expect(screen.getByTestId('local-video')).toBeInTheDocument();
    expect(screen.getByTestId('patient-video-placeholder')).toBeInTheDocument();
    expect(screen.getByTestId('doctor-video-placeholder')).toBeInTheDocument();
  });

  it('debe alternar el audio cuando se hace clic en el botón de silenciar', async () => {
    // Configuramos el estado inicial como conectado
    mockStates.isConnected = true;
    
    // Espiar console.log para verificar que se llama
    console.log = jest.fn();
    
    render(<VideoConsultation appointmentId="apt-123" />);
    
    // Hacer clic en el botón de silenciar audio
    fireEvent.click(screen.getByTestId('toggle-audio-button'));
    
    // Verificar que se llama a la función de alternar audio
    expect(require('@/app/services/videoService').toggleAudio).toHaveBeenCalledWith(false);
    
    // Verificar que se actualiza el estado
    await waitFor(() => {
      expect(mockStates.isAudioMuted).toBe(true);
    });
    
    // Verificar que se registra en la consola
    expect(console.log).toHaveBeenCalledWith('Audio silenciado');
  });

  it('debe alternar el video cuando se hace clic en el botón de desactivar video', async () => {
    // Configuramos el estado inicial como conectado
    mockStates.isConnected = true;
    
    // Espiar console.log para verificar que se llama
    console.log = jest.fn();
    
    render(<VideoConsultation appointmentId="apt-123" />);
    
    // Hacer clic en el botón de desactivar video
    fireEvent.click(screen.getByTestId('toggle-video-button'));
    
    // Verificar que se llama a la función de alternar video
    expect(require('@/app/services/videoService').toggleVideo).toHaveBeenCalledWith(false);
    
    // Verificar que se actualiza el estado
    await waitFor(() => {
      expect(mockStates.isVideoDisabled).toBe(true);
    });
    
    // Verificar que se registra en la consola
    expect(console.log).toHaveBeenCalledWith('Video desactivado');
  });

  it('debe compartir la pantalla cuando se hace clic en el botón de compartir', async () => {
    // Configuramos el estado inicial como conectado
    mockStates.isConnected = true;
    
    // Espiar console.log para verificar que se llama
    console.log = jest.fn();
    
    render(<VideoConsultation appointmentId="apt-123" />);
    
    // Hacer clic en el botón de compartir pantalla
    fireEvent.click(screen.getByTestId('share-screen-button'));
    
    // Verificar que se llama a la función de compartir pantalla
    expect(require('@/app/services/videoService').shareScreen).toHaveBeenCalled();
    
    // Verificar que se actualiza el estado
    await waitFor(() => {
      expect(mockStates.isScreenSharing).toBe(true);
    });
    
    // Verificar que se registra en la consola
    expect(console.log).toHaveBeenCalledWith('Pantalla compartida');
  });

  it('debe mostrar el panel de chat cuando se hace clic en el botón de chat', async () => {
    // Configuramos el estado inicial como conectado
    mockStates.isConnected = true;
    
    render(<VideoConsultation appointmentId="apt-123" />);
    
    // Hacer clic en el botón de chat
    fireEvent.click(screen.getByTestId('toggle-chat-button'));
    
    // Verificar que se actualiza el estado
    await waitFor(() => {
      expect(mockStates.isChatOpen).toBe(true);
    });
    
    // Verificar que se muestra el panel de chat
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    expect(screen.getByTestId('chat-form')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-message-button')).toBeInTheDocument();
    
    // Verificar que se muestran los mensajes de chat
    expect(screen.getByTestId('chat-message-msg-1')).toBeInTheDocument();
    expect(screen.getByTestId('chat-message-msg-2')).toBeInTheDocument();
  });

  it('debe finalizar la videollamada cuando se hace clic en el botón de finalizar', async () => {
    // Configuramos el estado inicial como conectado
    mockStates.isConnected = true;
    
    // Espiar console.log para verificar que se llama
    console.log = jest.fn();
    
    render(<VideoConsultation appointmentId="apt-123" />);
    
    // Hacer clic en el botón de finalizar consulta
    fireEvent.click(screen.getByTestId('end-call-button'));
    
    // Verificar que se llama a la función de finalizar videollamada
    expect(require('@/app/services/videoService').endVideoCall).toHaveBeenCalledWith('apt-123');
    
    // Verificar que se actualiza el estado
    await waitFor(() => {
      expect(mockStates.isConnected).toBe(false);
    });
    
    // Verificar que se registra en la consola
    expect(console.log).toHaveBeenCalledWith('Videollamada finalizada');
  });
});
