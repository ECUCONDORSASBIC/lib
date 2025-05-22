/// <reference types="cypress" />

describe('Dashboard del Paciente', () => {
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
    
    // Interceptamos la llamada a la API de datos del paciente
    cy.intercept('GET', '/api/patients/test-patient-id', {
      statusCode: 200,
      body: {
        patient: {
          id: 'test-patient-id',
          name: 'Juan Pérez',
          email: 'paciente@example.com',
          birthDate: '1980-05-15',
          gender: 'male',
          phone: '+593987654321',
          address: 'Av. Principal 123, Quito',
          bloodType: 'O+',
          allergies: ['penicilina', 'maní'],
          chronicConditions: ['hipertensión'],
          lastVisit: '2025-04-10',
          hasAnamnesis: true,
          isAnamnesisComplete: true,
          vitals: {
            bloodPressure: '120/80',
            heartRate: 72,
            temperature: 36.5,
            oxygenSaturation: 98,
            respiratoryRate: 16,
            weight: 75,
            height: 175,
            bmi: 24.5
          },
          lastUpdated: '2025-05-15T10:30:00Z'
        }
      }
    }).as('patientDataRequest');
    
    // Interceptamos la llamada a la API de citas
    cy.intercept('GET', '/api/appointments*', {
      statusCode: 200,
      body: {
        appointments: [
          {
            id: 'apt-1',
            date: '2025-05-25T10:00:00Z',
            doctor: {
              id: 'doc-1',
              name: 'Dra. María González',
              specialty: 'Cardiología'
            },
            location: 'Consulta 3, Piso 2',
            status: 'confirmed',
            type: 'presencial'
          },
          {
            id: 'apt-2',
            date: '2025-06-05T15:30:00Z',
            doctor: {
              id: 'doc-2',
              name: 'Dr. Carlos Ramírez',
              specialty: 'Neurología'
            },
            location: 'Consulta virtual',
            status: 'pending',
            type: 'telemedicina'
          }
        ]
      }
    }).as('appointmentsRequest');
  });

  it('debería mostrar el perfil del paciente', () => {
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se completen las solicitudes
    cy.wait('@sessionRequest');
    cy.wait('@patientDataRequest');
    
    // Verificamos que se muestra el nombre del paciente
    cy.findByRole('heading', { name: /perfil de juan pérez/i }).should('be.visible');
    
    // Verificamos que se muestra la información básica del paciente
    cy.findByText(/id: test-patient-id/i).should('be.visible');
  });

  it('debería mostrar los signos vitales del paciente', () => {
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se completen las solicitudes
    cy.wait('@sessionRequest');
    cy.wait('@patientDataRequest');
    
    // Hacemos clic en la pestaña de Resumen de Salud
    cy.findByRole('tab', { name: /resumen de salud/i }).click();
    
    // Verificamos que se muestran los signos vitales
    cy.findByText(/presión arterial/i).should('be.visible');
    cy.findByText(/120\/80 mmhg/i).should('be.visible');
    cy.findByText(/frecuencia cardíaca/i).should('be.visible');
    cy.findByText(/72 lpm/i).should('be.visible');
    cy.findByText(/temperatura/i).should('be.visible');
    cy.findByText(/36.5 °c/i).should('be.visible');
  });

  it('debería mostrar las citas programadas del paciente', () => {
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se completen las solicitudes
    cy.wait('@sessionRequest');
    cy.wait('@patientDataRequest');
    cy.wait('@appointmentsRequest');
    
    // Hacemos clic en la pestaña de Citas Programadas
    cy.findByRole('tab', { name: /citas programadas/i }).click();
    
    // Verificamos que se muestran las citas
    cy.findByText(/dra. maría gonzález/i).should('be.visible');
    cy.findByText(/cardiología/i).should('be.visible');
    cy.findByText(/consulta 3, piso 2/i).should('be.visible');
    
    cy.findByText(/dr. carlos ramírez/i).should('be.visible');
    cy.findByText(/neurología/i).should('be.visible');
    cy.findByText(/consulta virtual/i).should('be.visible');
  });

  it('debería permitir navegar a la anamnesis del paciente', () => {
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se completen las solicitudes
    cy.wait('@sessionRequest');
    cy.wait('@patientDataRequest');
    
    // Hacemos clic en la pestaña de Historial de Anamnesis
    cy.findByRole('tab', { name: /historial de anamnesis/i }).click();
    
    // Verificamos que se muestra el enlace a la anamnesis
    cy.findByText(/anamnesis completa/i).should('be.visible');
    
    // Interceptamos la navegación a la página de anamnesis
    cy.intercept('GET', '/dashboard/paciente/test-patient-id/anamnesis*', {
      statusCode: 200
    }).as('anamnesisRequest');
    
    // Hacemos clic en el enlace a la anamnesis
    cy.findByText(/anamnesis/i).click();
    
    // Verificamos que se navega a la página de anamnesis
    cy.url().should('include', '/dashboard/paciente/test-patient-id/anamnesis');
  });

  it('debería permitir cambiar entre las diferentes pestañas del dashboard', () => {
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se completen las solicitudes
    cy.wait('@sessionRequest');
    cy.wait('@patientDataRequest');
    
    // Verificamos que podemos navegar entre las pestañas
    cy.findByRole('tab', { name: /resumen de salud/i }).click();
    cy.findByText(/presión arterial/i).should('be.visible');
    
    cy.findByRole('tab', { name: /métricas detalladas/i }).click();
    // Verificamos contenido de la pestaña de métricas
    
    cy.findByRole('tab', { name: /evaluación de riesgo/i }).click();
    // Verificamos contenido de la pestaña de evaluación de riesgo
    
    cy.findByRole('tab', { name: /historial de anamnesis/i }).click();
    cy.findByText(/anamnesis/i).should('be.visible');
    
    cy.findByRole('tab', { name: /documentos/i }).click();
    // Verificamos contenido de la pestaña de documentos
    
    cy.findByRole('tab', { name: /citas programadas/i }).click();
    cy.wait('@appointmentsRequest');
    cy.findByText(/dra. maría gonzález/i).should('be.visible');
  });
});
