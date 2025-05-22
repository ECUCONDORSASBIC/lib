/// <reference types="cypress" />

describe('Flujo de Administrador', () => {
  beforeEach(() => {
    // Limpiar cookies y almacenamiento local antes de cada prueba
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Interceptamos la llamada a la API de sesión para simular un administrador autenticado
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          uid: 'admin-1',
          email: 'admin@altamedica.com',
          role: 'admin'
        }
      }
    }).as('sessionRequest');
  });

  it('debería permitir ver y gestionar usuarios del sistema', () => {
    // Interceptamos la llamada a la API de usuarios del sistema
    cy.intercept('GET', '/api/admin/users*', {
      statusCode: 200,
      body: {
        users: [
          {
            id: 'user-1',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            role: 'paciente',
            status: 'active',
            createdAt: '2025-01-15T10:00:00Z',
            lastLogin: '2025-05-18T14:30:00Z'
          },
          {
            id: 'user-2',
            name: 'Dra. Ana Martínez',
            email: 'ana.martinez@altamedica.com',
            role: 'medico',
            specialty: 'Cardiología',
            status: 'active',
            createdAt: '2024-11-10T09:00:00Z',
            lastLogin: '2025-05-19T08:45:00Z'
          },
          {
            id: 'user-3',
            name: 'Carlos Rodríguez',
            email: 'carlos@example.com',
            role: 'paciente',
            status: 'inactive',
            createdAt: '2025-02-20T11:30:00Z',
            lastLogin: '2025-03-15T16:20:00Z'
          }
        ],
        total: 3,
        page: 1,
        totalPages: 1
      }
    }).as('usersRequest');
    
    // Interceptamos la llamada a la API para desactivar un usuario
    cy.intercept('PUT', '/api/admin/users/user-1/status', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: 'user-1',
          status: 'inactive'
        }
      }
    }).as('updateUserStatusRequest');
    
    // Visitamos el panel de administración
    cy.visit('/dashboard/admin');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Hacemos clic en la sección de gestión de usuarios
    cy.findByRole('link', { name: /gestión de usuarios/i }).click();
    
    // Esperamos a que se complete la solicitud de usuarios
    cy.wait('@usersRequest');
    
    // Verificamos que se muestran los usuarios
    cy.findByText('Juan Pérez').should('be.visible');
    cy.findByText('Dra. Ana Martínez').should('be.visible');
    cy.findByText('Carlos Rodríguez').should('be.visible');
    
    // Filtramos por rol de paciente
    cy.findByLabelText(/filtrar por rol/i).select('paciente');
    
    // Verificamos que solo se muestran los pacientes
    cy.findByText('Juan Pérez').should('be.visible');
    cy.findByText('Carlos Rodríguez').should('be.visible');
    cy.findByText('Dra. Ana Martínez').should('not.exist');
    
    // Filtramos por estado activo
    cy.findByLabelText(/filtrar por estado/i).select('active');
    
    // Verificamos que solo se muestran los pacientes activos
    cy.findByText('Juan Pérez').should('be.visible');
    cy.findByText('Carlos Rodríguez').should('not.exist');
    
    // Hacemos clic en el botón de desactivar usuario
    cy.findByTestId('toggle-status-button-user-1').click();
    
    // Confirmamos la acción en el diálogo de confirmación
    cy.findByRole('button', { name: /confirmar/i }).click();
    
    // Esperamos a que se complete la solicitud de actualización de estado
    cy.wait('@updateUserStatusRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/usuario desactivado con éxito/i).should('be.visible');
  });

  it('debería permitir ver y gestionar médicos del sistema', () => {
    // Interceptamos la llamada a la API de médicos
    cy.intercept('GET', '/api/admin/doctors*', {
      statusCode: 200,
      body: {
        doctors: [
          {
            id: 'doc-1',
            name: 'Dra. Ana Martínez',
            email: 'ana.martinez@altamedica.com',
            specialty: 'Cardiología',
            licenseNumber: 'MED-12345',
            status: 'active',
            appointmentsCount: 42,
            rating: 4.8
          },
          {
            id: 'doc-2',
            name: 'Dr. Carlos Ramírez',
            email: 'carlos.ramirez@altamedica.com',
            specialty: 'Neurología',
            licenseNumber: 'MED-67890',
            status: 'active',
            appointmentsCount: 35,
            rating: 4.6
          },
          {
            id: 'doc-3',
            name: 'Dra. María López',
            email: 'maria.lopez@altamedica.com',
            specialty: 'Pediatría',
            licenseNumber: 'MED-54321',
            status: 'pending',
            appointmentsCount: 0,
            rating: 0
          }
        ]
      }
    }).as('doctorsRequest');
    
    // Interceptamos la llamada a la API para aprobar un médico
    cy.intercept('PUT', '/api/admin/doctors/doc-3/approve', {
      statusCode: 200,
      body: {
        success: true,
        doctor: {
          id: 'doc-3',
          status: 'active'
        }
      }
    }).as('approveDoctorRequest');
    
    // Visitamos el panel de administración
    cy.visit('/dashboard/admin');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Hacemos clic en la sección de gestión de médicos
    cy.findByRole('link', { name: /gestión de médicos/i }).click();
    
    // Esperamos a que se complete la solicitud de médicos
    cy.wait('@doctorsRequest');
    
    // Verificamos que se muestran los médicos
    cy.findByText('Dra. Ana Martínez').should('be.visible');
    cy.findByText('Dr. Carlos Ramírez').should('be.visible');
    cy.findByText('Dra. María López').should('be.visible');
    
    // Filtramos por especialidad
    cy.findByLabelText(/filtrar por especialidad/i).select('Cardiología');
    
    // Verificamos que solo se muestra el médico de esa especialidad
    cy.findByText('Dra. Ana Martínez').should('be.visible');
    cy.findByText('Dr. Carlos Ramírez').should('not.exist');
    cy.findByText('Dra. María López').should('not.exist');
    
    // Quitamos el filtro de especialidad
    cy.findByLabelText(/filtrar por especialidad/i).select('Todas');
    
    // Filtramos por estado pendiente
    cy.findByLabelText(/filtrar por estado/i).select('pending');
    
    // Verificamos que solo se muestran los médicos pendientes
    cy.findByText('Dra. María López').should('be.visible');
    cy.findByText('Dra. Ana Martínez').should('not.exist');
    cy.findByText('Dr. Carlos Ramírez').should('not.exist');
    
    // Hacemos clic en el botón de aprobar médico
    cy.findByTestId('approve-doctor-button-doc-3').click();
    
    // Confirmamos la acción en el diálogo de confirmación
    cy.findByRole('button', { name: /confirmar/i }).click();
    
    // Esperamos a que se complete la solicitud de aprobación
    cy.wait('@approveDoctorRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/médico aprobado con éxito/i).should('be.visible');
  });

  it('debería permitir ver estadísticas del sistema', () => {
    // Interceptamos la llamada a la API de estadísticas
    cy.intercept('GET', '/api/admin/stats', {
      statusCode: 200,
      body: {
        stats: {
          totalPatients: 1250,
          totalDoctors: 45,
          activeAppointments: 78,
          pendingAppointments: 23,
          completedAppointments: 3450,
          telemedicineAppointments: 42,
          newUsersThisMonth: 87,
          averageAppointmentDuration: 25, // minutos
          systemUptime: 99.8, // porcentaje
          activeUsers: 156
        }
      }
    }).as('statsRequest');
    
    // Interceptamos la llamada a la API de estadísticas por período
    cy.intercept('GET', '/api/admin/stats/period*', {
      statusCode: 200,
      body: {
        stats: [
          { date: '2025-05-01', newUsers: 3, appointments: 12, telemedicineAppointments: 5 },
          { date: '2025-05-02', newUsers: 2, appointments: 15, telemedicineAppointments: 6 },
          { date: '2025-05-03', newUsers: 4, appointments: 10, telemedicineAppointments: 4 },
          { date: '2025-05-04', newUsers: 1, appointments: 8, telemedicineAppointments: 3 },
          { date: '2025-05-05', newUsers: 5, appointments: 14, telemedicineAppointments: 7 }
        ]
      }
    }).as('periodStatsRequest');
    
    // Visitamos el panel de administración
    cy.visit('/dashboard/admin');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de estadísticas
    cy.wait('@statsRequest');
    
    // Verificamos que se muestran las estadísticas generales
    cy.findByText('Pacientes Totales: 1,250').should('be.visible');
    cy.findByText('Médicos: 45').should('be.visible');
    cy.findByText('Citas Activas: 78').should('be.visible');
    cy.findByText('Citas de Telemedicina: 42').should('be.visible');
    
    // Hacemos clic en la pestaña de estadísticas detalladas
    cy.findByRole('tab', { name: /estadísticas detalladas/i }).click();
    
    // Esperamos a que se complete la solicitud de estadísticas por período
    cy.wait('@periodStatsRequest');
    
    // Verificamos que se muestra el gráfico de estadísticas
    cy.findByTestId('stats-chart').should('be.visible');
    
    // Cambiamos el período a semanal
    cy.findByLabelText(/período/i).select('week');
    
    // Esperamos a que se complete la nueva solicitud de estadísticas por período
    cy.wait('@periodStatsRequest');
    
    // Verificamos que se actualiza el gráfico
    cy.findByTestId('stats-chart').should('be.visible');
    
    // Verificamos que se muestran los totales del período
    cy.findByText('Nuevos Usuarios: 15').should('be.visible');
    cy.findByText('Citas Totales: 59').should('be.visible');
    cy.findByText('Citas de Telemedicina: 25').should('be.visible');
  });

  it('debería permitir gestionar configuraciones del sistema', () => {
    // Interceptamos la llamada a la API de configuraciones
    cy.intercept('GET', '/api/admin/settings', {
      statusCode: 200,
      body: {
        settings: {
          appointmentDuration: 30,
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          workingDays: [1, 2, 3, 4, 5], // Lunes a viernes
          maxAppointmentsPerDay: 10,
          allowTelemedicine: true,
          requireApprovalForDoctors: true,
          maintenanceMode: false,
          notificationSettings: {
            emailNotifications: true,
            smsNotifications: true,
            reminderHoursBeforeAppointment: 24
          }
        }
      }
    }).as('settingsRequest');
    
    // Interceptamos la llamada a la API para actualizar configuraciones
    cy.intercept('PUT', '/api/admin/settings', {
      statusCode: 200,
      body: {
        success: true,
        settings: {
          appointmentDuration: 45,
          workingHoursStart: '08:00',
          workingHoursEnd: '18:00',
          workingDays: [1, 2, 3, 4, 5],
          maxAppointmentsPerDay: 8,
          allowTelemedicine: true,
          requireApprovalForDoctors: true,
          maintenanceMode: false,
          notificationSettings: {
            emailNotifications: true,
            smsNotifications: true,
            reminderHoursBeforeAppointment: 48
          }
        }
      }
    }).as('updateSettingsRequest');
    
    // Visitamos el panel de administración
    cy.visit('/dashboard/admin');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Hacemos clic en la sección de configuraciones
    cy.findByRole('link', { name: /configuraciones/i }).click();
    
    // Esperamos a que se complete la solicitud de configuraciones
    cy.wait('@settingsRequest');
    
    // Verificamos que se muestran las configuraciones actuales
    cy.findByLabelText(/duración de citas/i).should('have.value', '30');
    cy.findByLabelText(/hora de inicio/i).should('have.value', '09:00');
    cy.findByLabelText(/hora de fin/i).should('have.value', '18:00');
    cy.findByLabelText(/citas máximas por día/i).should('have.value', '10');
    cy.findByLabelText(/horas de anticipación/i).should('have.value', '24');
    
    // Modificamos algunas configuraciones
    cy.findByLabelText(/duración de citas/i).clear().type('45');
    cy.findByLabelText(/hora de inicio/i).clear().type('08:00');
    cy.findByLabelText(/citas máximas por día/i).clear().type('8');
    cy.findByLabelText(/horas de anticipación/i).clear().type('48');
    
    // Guardamos los cambios
    cy.findByRole('button', { name: /guardar cambios/i }).click();
    
    // Esperamos a que se complete la solicitud de actualización
    cy.wait('@updateSettingsRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/configuraciones actualizadas con éxito/i).should('be.visible');
  });

  it('debería permitir ver y gestionar los registros del sistema', () => {
    // Interceptamos la llamada a la API de registros
    cy.intercept('GET', '/api/admin/logs*', {
      statusCode: 200,
      body: {
        logs: [
          {
            id: 'log-1',
            timestamp: '2025-05-19T15:30:00Z',
            level: 'info',
            message: 'Usuario juan@example.com inició sesión',
            source: 'auth-service'
          },
          {
            id: 'log-2',
            timestamp: '2025-05-19T14:45:00Z',
            level: 'warning',
            message: 'Intento de acceso fallido para usuario desconocido',
            source: 'auth-service'
          },
          {
            id: 'log-3',
            timestamp: '2025-05-19T14:00:00Z',
            level: 'error',
            message: 'Error en la conexión con el servicio de telemedicina',
            source: 'telemedicine-service'
          },
          {
            id: 'log-4',
            timestamp: '2025-05-19T13:30:00Z',
            level: 'info',
            message: 'Cita ID apt-123 completada exitosamente',
            source: 'appointment-service'
          }
        ],
        total: 4,
        page: 1,
        totalPages: 1
      }
    }).as('logsRequest');
    
    // Visitamos el panel de administración
    cy.visit('/dashboard/admin');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Hacemos clic en la sección de registros del sistema
    cy.findByRole('link', { name: /registros del sistema/i }).click();
    
    // Esperamos a que se complete la solicitud de registros
    cy.wait('@logsRequest');
    
    // Verificamos que se muestran los registros
    cy.findByText('Usuario juan@example.com inició sesión').should('be.visible');
    cy.findByText('Intento de acceso fallido para usuario desconocido').should('be.visible');
    cy.findByText('Error en la conexión con el servicio de telemedicina').should('be.visible');
    
    // Filtramos por nivel de error
    cy.findByLabelText(/filtrar por nivel/i).select('error');
    
    // Verificamos que solo se muestran los registros de error
    cy.findByText('Error en la conexión con el servicio de telemedicina').should('be.visible');
    cy.findByText('Usuario juan@example.com inició sesión').should('not.exist');
    
    // Filtramos por servicio de autenticación
    cy.findByLabelText(/filtrar por servicio/i).select('auth-service');
    
    // Verificamos que no hay registros que cumplan ambos filtros
    cy.findByText('No se encontraron registros que coincidan con los filtros aplicados').should('be.visible');
    
    // Quitamos el filtro de nivel
    cy.findByLabelText(/filtrar por nivel/i).select('all');
    
    // Verificamos que se muestran los registros del servicio de autenticación
    cy.findByText('Usuario juan@example.com inició sesión').should('be.visible');
    cy.findByText('Intento de acceso fallido para usuario desconocido').should('be.visible');
    
    // Descargamos los registros
    cy.findByRole('button', { name: /descargar registros/i }).click();
    
    // Verificamos que se inicia la descarga
    cy.findByText(/descarga iniciada/i).should('be.visible');
  });
});
