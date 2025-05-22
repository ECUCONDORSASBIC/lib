/// <reference types="cypress" />

/**
 * E2E tests for telemedicine flow
 * 
 * IMPORTANT: These tests validate critical functionality for the telemedicine features
 * According to project requirements, special attention should be paid to:
 * - TURN server connectivity for NAT traversal
 * - Browser compatibility testing
 * - Network resilience under different conditions
 * - UI controls for camera/microphone
 */

describe('Flujo de Telemedicina', () => {
  beforeEach(() => {
    // Limpiar cookies y almacenamiento local antes de cada prueba
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Interceptamos la llamada a la API de sesión para simular un usuario autenticado
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          uid: 'test-patient-id',
          email: 'paciente@example.com',
          role: 'paciente'
        }
      }
    }).as('sessionRequest');
  });

  it('debería permitir programar una cita de telemedicina', () => {
    // Interceptamos la llamada a la API de médicos disponibles
    cy.intercept('GET', '/api/doctors/available*', {
      statusCode: 200,
      body: {
        doctors: [
          {
            id: 'doc-1',
            name: 'Dra. Ana Martínez',
            specialty: 'Cardiología',
            photo: '/avatars/doctor-1.jpg',
            availableSlots: [
              { date: '2025-06-01T09:00:00Z', duration: 30 },
              { date: '2025-06-01T10:00:00Z', duration: 30 },
              { date: '2025-06-01T11:00:00Z', duration: 30 }
            ]
          },
          {
            id: 'doc-2',
            name: 'Dr. Carlos Ramírez',
            specialty: 'Neurología',
            photo: '/avatars/doctor-2.jpg',
            availableSlots: [
              { date: '2025-06-02T14:00:00Z', duration: 30 },
              { date: '2025-06-02T15:00:00Z', duration: 30 },
              { date: '2025-06-02T16:00:00Z', duration: 30 }
            ]
          }
        ]
      }
    }).as('availableDoctorsRequest');
    
    // Interceptamos la llamada a la API para programar la cita
    cy.intercept('POST', '/api/appointments', {
      statusCode: 200,
      body: {
        appointment: {
          id: 'apt-new',
          date: '2025-06-01T10:00:00Z',
          duration: 30,
          type: 'telemedicina',
          status: 'confirmed',
          doctor: {
            id: 'doc-1',
            name: 'Dra. Ana Martínez',
            specialty: 'Cardiología'
          }
        }
      }
    }).as('createAppointmentRequest');
    
    // Visitamos la página de programación de citas
    cy.visit('/dashboard/citas/programar');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Seleccionamos el tipo de cita como telemedicina
    cy.findByLabelText(/tipo de cita/i).select('telemedicina');
    
    // Seleccionamos la especialidad
    cy.findByLabelText(/especialidad/i).select('Cardiología');
    
    // Hacemos clic en el botón de buscar médicos disponibles
    cy.findByRole('button', { name: /buscar médicos disponibles/i }).click();
    
    // Esperamos a que se complete la solicitud de médicos disponibles
    cy.wait('@availableDoctorsRequest');
    
    // Verificamos que se muestran los médicos disponibles
    cy.findByText('Dra. Ana Martínez').should('be.visible');
    cy.findByText('Dr. Carlos Ramírez').should('be.visible');
    
    // Seleccionamos un médico
    cy.findByText('Dra. Ana Martínez').click();
    
    // Verificamos que se muestran los horarios disponibles
    cy.findByText('10:00 AM').should('be.visible');
    
    // Seleccionamos un horario
    cy.findByText('10:00 AM').click();
    
    // Ingresamos el motivo de la consulta
    cy.findByLabelText(/motivo de la consulta/i).type('Control de presión arterial');
    
    // Hacemos clic en el botón de confirmar cita
    cy.findByRole('button', { name: /confirmar cita/i }).click();
    
    // Esperamos a que se complete la solicitud de creación de cita
    cy.wait('@createAppointmentRequest');
    
    // Verificamos que se muestra la confirmación de la cita
    cy.findByText(/cita programada con éxito/i).should('be.visible');
    cy.findByText('Dra. Ana Martínez').should('be.visible');
    cy.findByText(/10:00 am/i).should('be.visible');
    cy.findByText(/telemedicina/i).should('be.visible');
    
    // Verificamos que se muestra el botón para volver al dashboard
    cy.findByRole('button', { name: /volver al dashboard/i }).should('be.visible');
  });

  it('debería permitir unirse a una consulta de telemedicina programada y validar controles de audio/video', () => {
          {
            id: 'apt-123',
            date: '2025-05-20T15:30:00Z',
            duration: 30,
            type: 'telemedicina',
            status: 'confirmed',
            reason: 'Control de presión arterial',
            doctor: {
              id: 'doc-1',
              name: 'Dra. Ana Martínez',
              specialty: 'Cardiología',
              photo: '/avatars/doctor-1.jpg'
            }
          }
        ]
      }
    }).as('patientAppointmentsRequest');
    
    // Interceptamos la llamada a la API de detalles de la cita
    cy.intercept('GET', '/api/appointments/apt-123', {
      statusCode: 200,
      body: {
        appointment: {
          id: 'apt-123',
          date: '2025-05-20T15:30:00Z',
          duration: 30,
          type: 'telemedicina',
          status: 'confirmed',
          reason: 'Control de presión arterial',
          doctor: {
            id: 'doc-1',
            name: 'Dra. Ana Martínez',
            specialty: 'Cardiología',
            photo: '/avatars/doctor-1.jpg'
          }
        }
      }
    }).as('appointmentDetailsRequest');
    
    // Interceptamos la llamada a la API para iniciar la videollamada
    cy.intercept('POST', '/api/telemedicine/session', {
      statusCode: 200,
      body: {
        sessionId: 'session-123',
        token: 'token-123'
      }
    }).as('createSessionRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de citas del paciente
    cy.wait('@patientAppointmentsRequest');
    
    // Verificamos que se muestra la cita de telemedicina
    cy.findByText('Dra. Ana Martínez').should('be.visible');
    cy.findByText(/telemedicina/i).should('be.visible');
    
    // Hacemos clic en el botón de unirse a la consulta
    cy.findByRole('button', { name: /unirse a la consulta/i }).click();
    
    // Esperamos a que se complete la solicitud de detalles de la cita
    cy.wait('@appointmentDetailsRequest');
    
    // Verificamos que estamos en la página de la consulta
    cy.url().should('include', '/telemedicina/consulta/apt-123');
    
    // Verificamos que se muestra la información de la consulta
    cy.findByText('Consulta de Telemedicina').should('be.visible');
    cy.findByText('Dra. Ana Martínez').should('be.visible');
    cy.findByText('Control de presión arterial').should('be.visible');
    
    // Hacemos clic en el botón de iniciar consulta
      statusCode: 200,
      body: {
        consultations: [
          {
            id: 'apt-past-1',
            date: '2025-04-15T10:00:00Z',
            duration: 30,
            type: 'telemedicina',
            status: 'completed',
            reason: 'Control de presión arterial',
            notes: 'Paciente con presión arterial controlada. Continuar con el mismo tratamiento.',
            doctor: {
              id: 'doc-1',
              name: 'Dra. Ana Martínez',
              specialty: 'Cardiología'
            },
            hasRecording: true
          },
          {
            id: 'apt-past-2',
            date: '2025-03-20T14:30:00Z',
            duration: 30,
            type: 'telemedicina',
            status: 'completed',
            reason: 'Dolor de cabeza recurrente',
            notes: 'Se recomienda realizar estudios adicionales.',
            doctor: {
              id: 'doc-2',
              name: 'Dr. Carlos Ramírez',
              specialty: 'Neurología'
            },
            hasRecording: false
          }
        ]
      }
    }).as('consultationHistoryRequest');
    
    // Visitamos la página de historial de consultas
    cy.visit('/dashboard/telemedicina/historial');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de historial de consultas
    cy.wait('@consultationHistoryRequest');
    
    // Verificamos que se muestra el historial de consultas
    cy.findByText('Historial de Consultas de Telemedicina').should('be.visible');
    
    // Verificamos que se muestran las consultas pasadas
    cy.findByText('Dra. Ana Martínez').should('be.visible');
    cy.findByText('Dr. Carlos Ramírez').should('be.visible');
    cy.findByText('Control de presión arterial').should('be.visible');
    cy.findByText('Dolor de cabeza recurrente').should('be.visible');
    
    // Verificamos que se muestra el botón para ver la grabación solo para la consulta que tiene grabación
    cy.findByTestId('recording-button-apt-past-1').should('be.visible');
    cy.findByTestId('recording-button-apt-past-2').should('not.exist');
    
    // Hacemos clic en el botón para ver los detalles de una consulta
    cy.findByTestId('details-button-apt-past-1').click();
    
    // Verificamos que se muestran los detalles de la consulta
    cy.findByText('Detalles de la Consulta').should('be.visible');
    cy.findByText('Dra. Ana Martínez').should('be.visible');
    cy.findByText('Cardiología').should('be.visible');
    cy.findByText('Control de presión arterial').should('be.visible');
    cy.findByText('Paciente con presión arterial controlada. Continuar con el mismo tratamiento.').should('be.visible');
  });

  it('debería permitir a un médico gestionar sus consultas de telemedicina', () => {
    // Interceptamos la llamada a la API de sesión para simular un médico autenticado
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          uid: 'doc-1',
          email: 'ana.martinez@altamedica.com',
          role: 'medico'
        }
      }
    }).as('sessionRequest');
    
    // Interceptamos la llamada a la API de consultas del médico
    cy.intercept('GET', '/api/telemedicine/doctor*', {
      statusCode: 200,
      body: {
        consultations: [
          {
            id: 'apt-upcoming-1',
            date: '2025-05-25T10:00:00Z',
            duration: 30,
            type: 'telemedicina',
            status: 'confirmed',
            reason: 'Control de presión arterial',
            patient: {
              id: 'patient-1',
              name: 'Juan Pérez',
              age: 45,
              gender: 'male'
            }
          },
          {
            id: 'apt-upcoming-2',
            date: '2025-05-25T11:00:00Z',
            duration: 30,
            type: 'telemedicina',
            status: 'confirmed',
            reason: 'Primera consulta',
            patient: {
              id: 'patient-2',
              name: 'María López',
              age: 62,
              gender: 'female'
            }
          }
        ]
      }
    }).as('doctorConsultationsRequest');
    
    // Visitamos el dashboard del médico
    cy.visit('/dashboard/medico');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de consultas del médico
    cy.wait('@doctorConsultationsRequest');
    
    // Verificamos que se muestran las consultas programadas
    cy.findByText('Consultas de Telemedicina Programadas').should('be.visible');
    cy.findByText('Juan Pérez').should('be.visible');
    cy.findByText('María López').should('be.visible');
    
    // Hacemos clic en el botón para ver los detalles del paciente
    cy.findByTestId('patient-details-button-patient-1').click();
    
    // Verificamos que estamos en la página de detalles del paciente
    cy.url().should('include', '/dashboard/medico/paciente/patient-1');
    
    // Volvemos al dashboard del médico
    cy.go('back');
    
    // Hacemos clic en el botón para iniciar una consulta
    cy.findByTestId('start-consultation-button-apt-upcoming-1').click();
    
    // Verificamos que estamos en la página de la consulta
    cy.url().should('include', '/telemedicina/consulta/apt-upcoming-1');
    
    // Verificamos que se muestra la información de la consulta
    cy.findByText('Consulta de Telemedicina').should('be.visible');
    cy.findByText('Juan Pérez').should('be.visible');
    cy.findByText('Control de presión arterial').should('be.visible');
  });
  
  it('debería validar la funcionalidad del chat durante una consulta de telemedicina', () => {
    // Configurar mocks para sesión de usuario y detalles de cita
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          uid: 'test-patient-id',
          email: 'paciente@example.com',
          role: 'paciente'
        }
      }
    }).as('sessionRequest');
    
    cy.intercept('GET', '/api/appointments/details*', {
      statusCode: 200,
      body: {
        appointment: {
          id: 'apt-123',
          date: '2025-05-21T08:00:00Z',
          duration: 30,
          type: 'telemedicina',
          status: 'in-progress',
          reason: 'Control de presión arterial',
          doctor: {
            id: 'doc-1',
            name: 'Dra. Ana Martínez',
            specialty: 'Cardiología'
          }
        }
      }
    }).as('appointmentDetailsRequest');
    
    // Mock para iniciar sesión de telemedicina
    cy.intercept('POST', '/api/telemedicine/session', {
      statusCode: 200,
      body: {
        sessionId: 'session-123',
        token: 'token-123'
      }
    }).as('createSessionRequest');
    
    // Mock para historial de mensajes de chat
    cy.intercept('GET', '/api/telemedicine/chat/history*', {
      statusCode: 200,
      body: {
        messages: [
          { id: 'msg1', senderId: 'doc-1', text: '¿Cómo se ha sentido en estos días?', timestamp: '2025-05-21T08:01:30Z' }
        ]
      }
    }).as('chatHistoryRequest');
    
    // Mock para enviar un mensaje de chat
    cy.intercept('POST', '/api/telemedicine/chat/message', {
      statusCode: 200,
      body: {
        message: {
          id: 'msg2',
          senderId: 'test-patient-id',
          text: 'Me he sentido mejor con la medicación nueva',
          timestamp: '2025-05-21T08:02:45Z'
        }
      }
    }).as('sendMessageRequest');
    
    // Visitamos la página de la consulta
    cy.visit('/telemedicina/consulta/apt-123');
    
    // Esperamos las peticiones necesarias
    cy.wait('@sessionRequest');
    cy.wait('@appointmentDetailsRequest');
    cy.wait('@createSessionRequest');
    
    // Abrimos el panel de chat
    cy.findByRole('button', { name: /abrir chat/i }).click();
    cy.wait('@chatHistoryRequest');
    
    // Verificamos que se muestra el historial de chat
    cy.findByTestId('chat-panel').should('be.visible');
    cy.findByText('¿Cómo se ha sentido en estos días?').should('be.visible');
    
    // Enviamos un mensaje nuevo
    cy.findByTestId('chat-input').type('Me he sentido mejor con la medicación nueva');
    cy.findByTestId('send-message-button').click();
    cy.wait('@sendMessageRequest');
    
    // Verificamos que aparece el mensaje enviado
    cy.findByText('Me he sentido mejor con la medicación nueva').should('be.visible');
  });
  
  it('debería manejar reconexiones cuando hay problemas de red', () => {
    // Configurar mocks básicos para la sesión
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          uid: 'test-patient-id',
          email: 'paciente@example.com',
          role: 'paciente'
        }
      }
    }).as('sessionRequest');
    
    cy.intercept('GET', '/api/appointments/details*', {
      statusCode: 200,
      body: {
        appointment: {
          id: 'apt-123',
          date: '2025-05-21T08:00:00Z',
          duration: 30,
          type: 'telemedicina',
          status: 'in-progress',
          reason: 'Control de presión arterial',
          doctor: {
            id: 'doc-1',
            name: 'Dra. Ana Martínez',
            specialty: 'Cardiología'
          }
        }
      }
    }).as('appointmentDetailsRequest');
    
    // Simulamos un error de conexión inicial seguido de una reconexión exitosa
    cy.intercept('POST', '/api/telemedicine/session', req => {
      // Primera llamada: error de conexión
      if (!req.headers['x-retry-attempt']) {
        req.headers['x-retry-attempt'] = '1';
        req.reply({
          statusCode: 503,
          body: {
            error: 'Service unavailable'
          }
        });
      } else {
        // Segunda llamada: conexión exitosa 
        req.reply({
          statusCode: 200,
          body: {
            sessionId: 'session-123',
            token: 'token-123'
          }
        });
      }
    }).as('createSessionRequest');
    
    // Visitamos la página de la consulta
    cy.visit('/telemedicina/consulta/apt-123');
    cy.wait('@sessionRequest');
    cy.wait('@appointmentDetailsRequest');
    
    // Iniciar videollamada
    cy.findByRole('button', { name: /iniciar consulta/i }).click();
    
    // Verificamos que se muestra el error de conexión
    cy.findByTestId('connection-error').should('be.visible');
    cy.findByRole('button', { name: /reintentar/i }).should('be.visible');
    
    // Reintentamos la conexión
    cy.findByRole('button', { name: /reintentar/i }).click();
    
    // Verificamos que la reconexión es exitosa
    cy.findByTestId('connection-status').should('be.visible');
    cy.findByRole('button', { name: /finalizar consulta/i }).should('be.visible');
  });
  
  it('debería mostrar estadísticas de conexión y calidad de red', () => {
    // Interceptamos llamadas necesarias
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: { user: { uid: 'test-patient-id', role: 'paciente' } }
    }).as('sessionRequest');
    
    cy.intercept('GET', '/api/appointments/details*', {
      statusCode: 200,
      body: {
        appointment: {
          id: 'apt-123',
          date: '2025-05-21T08:00:00Z',
          type: 'telemedicina',
          status: 'in-progress',
          doctor: { id: 'doc-1', name: 'Dra. Ana Martínez' }
        }
      }
    }).as('appointmentDetailsRequest');
    
    cy.intercept('POST', '/api/telemedicine/session', {
      statusCode: 200,
      body: { sessionId: 'session-123', token: 'token-123' }
    }).as('createSessionRequest');
    
    // Mock para estadísticas de conexión
    cy.intercept('GET', '/api/telemedicine/connection-stats*', req => {
      // Simula diferentes calidades de conexión
      const qualities = ['excelente', 'buena', 'regular', 'deficiente'];
      const quality = qualities[Math.floor(Math.random() * qualities.length)];
      
      req.reply({
        statusCode: 200,
        body: {
          stats: {
            bytesReceived: Math.floor(Math.random() * 5000000),
            bytesSent: Math.floor(Math.random() * 3000000),
            packetsLost: Math.floor(Math.random() * 50),
            jitter: Math.random() * 0.5,
            roundTripTime: 100 + Math.floor(Math.random() * 300),
            connectionQuality: quality
          }
        }
      });
    }).as('connectionStatsRequest');
    
    // Iniciamos la consulta
    cy.visit('/telemedicina/consulta/apt-123');
    cy.wait(['@sessionRequest', '@appointmentDetailsRequest']);
    cy.findByRole('button', { name: /iniciar consulta/i }).click();
    cy.wait('@createSessionRequest');
    
    // Verificamos que aparecen las estadísticas de conexión
    cy.findByTestId('connection-stats-button').click();
    cy.findByTestId('connection-stats-panel').should('be.visible');
    cy.wait('@connectionStatsRequest');
    
    // Verificamos los indicadores de calidad
    cy.findByTestId('connection-quality').should('exist');
    cy.findByTestId('packet-loss').should('exist');
    cy.findByTestId('round-trip-time').should('exist');
    
    // Cerramos el panel de estadísticas
    cy.findByTestId('close-stats-button').click();
    cy.findByTestId('connection-stats-panel').should('not.be.visible');
  });
});
