/// <reference types="cypress" />

describe('Flujo de Doctor', () => {
  beforeEach(() => {
    // Limpiar cookies y almacenamiento local antes de cada prueba
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Interceptamos la llamada a la API de sesión para simular un médico autenticado
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          uid: 'doc-1',
          email: 'ana.martinez@altamedica.com',
          role: 'medico',
          name: 'Dra. Ana Martínez',
          specialty: 'Cardiología'
        }
      }
    }).as('sessionRequest');
  });

  it('debería permitir ver y gestionar la agenda de citas', () => {
    // Interceptamos la llamada a la API de citas del médico
    cy.intercept('GET', '/api/appointments/doctor*', {
      statusCode: 200,
      body: {
        appointments: [
          {
            id: 'apt-1',
            date: '2025-05-25T09:00:00Z',
            duration: 30,
            type: 'presencial',
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
            id: 'apt-2',
            date: '2025-05-25T10:00:00Z',
            duration: 30,
            type: 'telemedicina',
            status: 'confirmed',
            reason: 'Consulta de seguimiento',
            patient: {
              id: 'patient-2',
              name: 'María López',
              age: 62,
              gender: 'female'
            }
          },
          {
            id: 'apt-3',
            date: '2025-05-25T11:00:00Z',
            duration: 30,
            type: 'presencial',
            status: 'pending',
            reason: 'Primera consulta',
            patient: {
              id: 'patient-3',
              name: 'Carlos Rodríguez',
              age: 35,
              gender: 'male'
            }
          }
        ]
      }
    }).as('doctorAppointmentsRequest');
    
    // Interceptamos la llamada a la API para confirmar una cita
    cy.intercept('PUT', '/api/appointments/apt-3/confirm', {
      statusCode: 200,
      body: {
        success: true,
        appointment: {
          id: 'apt-3',
          status: 'confirmed'
        }
      }
    }).as('confirmAppointmentRequest');
    
    // Visitamos el dashboard del médico
    cy.visit('/dashboard/medico');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de citas del médico
    cy.wait('@doctorAppointmentsRequest');
    
    // Verificamos que se muestran las citas programadas
    cy.findByText('Agenda de Citas').should('be.visible');
    cy.findByText('Juan Pérez').should('be.visible');
    cy.findByText('María López').should('be.visible');
    cy.findByText('Carlos Rodríguez').should('be.visible');
    
    // Filtramos por tipo de cita presencial
    cy.findByLabelText(/filtrar por tipo/i).select('presencial');
    
    // Verificamos que solo se muestran las citas presenciales
    cy.findByText('Juan Pérez').should('be.visible');
    cy.findByText('Carlos Rodríguez').should('be.visible');
    cy.findByText('María López').should('not.exist');
    
    // Filtramos por estado pendiente
    cy.findByLabelText(/filtrar por estado/i).select('pending');
    
    // Verificamos que solo se muestran las citas pendientes
    cy.findByText('Carlos Rodríguez').should('be.visible');
    cy.findByText('Juan Pérez').should('not.exist');
    
    // Hacemos clic en el botón para confirmar la cita
    cy.findByTestId('confirm-appointment-button-apt-3').click();
    
    // Esperamos a que se complete la solicitud de confirmación
    cy.wait('@confirmAppointmentRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/cita confirmada con éxito/i).should('be.visible');
  });

  it('debería permitir ver y actualizar el perfil del médico', () => {
    // Interceptamos la llamada a la API del perfil del médico
    cy.intercept('GET', '/api/doctors/profile*', {
      statusCode: 200,
      body: {
        profile: {
          id: 'doc-1',
          name: 'Dra. Ana Martínez',
          email: 'ana.martinez@altamedica.com',
          specialty: 'Cardiología',
          licenseNumber: 'MED-12345',
          bio: 'Cardióloga con 15 años de experiencia en el diagnóstico y tratamiento de enfermedades cardiovasculares.',
          education: [
            {
              institution: 'Universidad Nacional de Medicina',
              degree: 'Doctorado en Medicina',
              year: '2005'
            },
            {
              institution: 'Hospital Central',
              degree: 'Especialidad en Cardiología',
              year: '2010'
            }
          ],
          languages: ['Español', 'Inglés'],
          availableHours: {
            monday: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'],
            tuesday: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'],
            wednesday: ['09:00', '10:00', '11:00', '12:00'],
            thursday: ['16:00', '17:00', '18:00'],
            friday: ['09:00', '10:00', '11:00', '12:00']
          }
        }
      }
    }).as('doctorProfileRequest');
    
    // Interceptamos la llamada a la API para actualizar el perfil
    cy.intercept('PUT', '/api/doctors/profile', {
      statusCode: 200,
      body: {
        success: true,
        profile: {
          id: 'doc-1',
          bio: 'Cardióloga con más de 15 años de experiencia en el diagnóstico y tratamiento de enfermedades cardiovasculares. Especialista en cardiología preventiva.',
          languages: ['Español', 'Inglés', 'Francés']
        }
      }
    }).as('updateProfileRequest');
    
    // Visitamos el dashboard del médico
    cy.visit('/dashboard/medico');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Hacemos clic en el enlace de perfil
    cy.findByRole('link', { name: /mi perfil/i }).click();
    
    // Esperamos a que se complete la solicitud del perfil
    cy.wait('@doctorProfileRequest');
    
    // Verificamos que se muestra la información del perfil
    cy.findByText('Dra. Ana Martínez').should('be.visible');
    cy.findByText('Cardiología').should('be.visible');
    cy.findByText('MED-12345').should('be.visible');
    
    // Hacemos clic en el botón de editar perfil
    cy.findByRole('button', { name: /editar perfil/i }).click();
    
    // Modificamos la biografía
    cy.findByLabelText(/biografía/i).clear().type('Cardióloga con más de 15 años de experiencia en el diagnóstico y tratamiento de enfermedades cardiovasculares. Especialista en cardiología preventiva.');
    
    // Agregamos un idioma
    cy.findByRole('button', { name: /agregar idioma/i }).click();
    cy.findByTestId('language-input-2').type('Francés');
    
    // Guardamos los cambios
    cy.findByRole('button', { name: /guardar cambios/i }).click();
    
    // Esperamos a que se complete la solicitud de actualización
    cy.wait('@updateProfileRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/perfil actualizado con éxito/i).should('be.visible');
    
    // Verificamos que se muestra la información actualizada
    cy.findByText('Especialista en cardiología preventiva').should('be.visible');
    cy.findByText('Francés').should('be.visible');
  });

  it('debería permitir gestionar la disponibilidad de horarios', () => {
    // Interceptamos la llamada a la API de disponibilidad
    cy.intercept('GET', '/api/doctors/availability*', {
      statusCode: 200,
      body: {
        availability: {
          monday: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'],
          tuesday: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'],
          wednesday: ['09:00', '10:00', '11:00', '12:00'],
          thursday: ['16:00', '17:00', '18:00'],
          friday: ['09:00', '10:00', '11:00', '12:00']
        }
      }
    }).as('availabilityRequest');
    
    // Interceptamos la llamada a la API para actualizar la disponibilidad
    cy.intercept('PUT', '/api/doctors/availability', {
      statusCode: 200,
      body: {
        success: true,
        availability: {
          monday: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'],
          tuesday: ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'],
          wednesday: ['09:00', '10:00', '11:00', '12:00'],
          thursday: ['14:00', '15:00', '16:00', '17:00', '18:00'],
          friday: ['09:00', '10:00', '11:00', '12:00']
        }
      }
    }).as('updateAvailabilityRequest');
    
    // Visitamos el dashboard del médico
    cy.visit('/dashboard/medico');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Hacemos clic en el enlace de disponibilidad
    cy.findByRole('link', { name: /mi disponibilidad/i }).click();
    
    // Esperamos a que se complete la solicitud de disponibilidad
    cy.wait('@availabilityRequest');
    
    // Verificamos que se muestra la disponibilidad actual
    cy.findByText('Horarios Disponibles').should('be.visible');
    cy.findByTestId('availability-thursday').should('contain', '16:00');
    cy.findByTestId('availability-thursday').should('contain', '17:00');
    cy.findByTestId('availability-thursday').should('contain', '18:00');
    
    // Hacemos clic en el botón de editar disponibilidad
    cy.findByRole('button', { name: /editar disponibilidad/i }).click();
    
    // Agregamos horarios para el jueves
    cy.findByTestId('add-slot-thursday').click();
    cy.findByTestId('time-select-thursday-new').select('14:00');
    cy.findByTestId('confirm-add-slot-thursday').click();
    
    cy.findByTestId('add-slot-thursday').click();
    cy.findByTestId('time-select-thursday-new').select('15:00');
    cy.findByTestId('confirm-add-slot-thursday').click();
    
    // Guardamos los cambios
    cy.findByRole('button', { name: /guardar cambios/i }).click();
    
    // Esperamos a que se complete la solicitud de actualización
    cy.wait('@updateAvailabilityRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/disponibilidad actualizada con éxito/i).should('be.visible');
    
    // Verificamos que se muestra la disponibilidad actualizada
    cy.findByTestId('availability-thursday').should('contain', '14:00');
    cy.findByTestId('availability-thursday').should('contain', '15:00');
  });

  it('debería permitir ver y gestionar el historial médico de pacientes', () => {
    // Interceptamos la llamada a la API de pacientes del médico
    cy.intercept('GET', '/api/doctors/patients*', {
      statusCode: 200,
      body: {
        patients: [
          {
            id: 'patient-1',
            name: 'Juan Pérez',
            age: 45,
            gender: 'male',
            lastVisit: '2025-05-10T09:00:00Z'
          },
          {
            id: 'patient-2',
            name: 'María López',
            age: 62,
            gender: 'female',
            lastVisit: '2025-05-15T10:00:00Z'
          },
          {
            id: 'patient-3',
            name: 'Carlos Rodríguez',
            age: 35,
            gender: 'male',
            lastVisit: null
          }
        ]
      }
    }).as('patientsRequest');
    
    // Interceptamos la llamada a la API de historial médico
    cy.intercept('GET', '/api/patients/patient-1/medical-history', {
      statusCode: 200,
      body: {
        medicalHistory: {
          patientInfo: {
            id: 'patient-1',
            name: 'Juan Pérez',
            age: 45,
            gender: 'male',
            bloodType: 'O+',
            allergies: ['Penicilina'],
            chronicConditions: ['Hipertensión']
          },
          visits: [
            {
              id: 'visit-1',
              date: '2025-05-10T09:00:00Z',
              type: 'presencial',
              diagnosis: 'Hipertensión arterial',
              treatment: 'Losartán 50mg, una vez al día',
              notes: 'Paciente con presión arterial elevada. Se recomienda dieta baja en sodio y ejercicio regular.'
            },
            {
              id: 'visit-2',
              date: '2025-04-15T10:00:00Z',
              type: 'presencial',
              diagnosis: 'Dolor torácico',
              treatment: 'Exámenes complementarios',
              notes: 'Se solicita electrocardiograma y prueba de esfuerzo.'
            }
          ],
          vitals: [
            {
              date: '2025-05-10T09:00:00Z',
              bloodPressure: '140/90',
              heartRate: 75,
              temperature: 36.5,
              oxygenSaturation: 98
            },
            {
              date: '2025-04-15T10:00:00Z',
              bloodPressure: '150/95',
              heartRate: 80,
              temperature: 36.7,
              oxygenSaturation: 97
            }
          ]
        }
      }
    }).as('medicalHistoryRequest');
    
    // Interceptamos la llamada a la API para agregar una nota
    cy.intercept('POST', '/api/patients/patient-1/notes', {
      statusCode: 200,
      body: {
        success: true,
        note: {
          id: 'note-new',
          date: '2025-05-20T14:30:00Z',
          content: 'Paciente muestra mejoría en los valores de presión arterial.',
          author: 'Dra. Ana Martínez'
        }
      }
    }).as('addNoteRequest');
    
    // Visitamos el dashboard del médico
    cy.visit('/dashboard/medico');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Hacemos clic en el enlace de pacientes
    cy.findByRole('link', { name: /mis pacientes/i }).click();
    
    // Esperamos a que se complete la solicitud de pacientes
    cy.wait('@patientsRequest');
    
    // Verificamos que se muestran los pacientes
    cy.findByText('Juan Pérez').should('be.visible');
    cy.findByText('María López').should('be.visible');
    cy.findByText('Carlos Rodríguez').should('be.visible');
    
    // Hacemos clic en el botón para ver el historial médico
    cy.findByTestId('view-history-button-patient-1').click();
    
    // Esperamos a que se complete la solicitud de historial médico
    cy.wait('@medicalHistoryRequest');
    
    // Verificamos que se muestra el historial médico
    cy.findByText('Historial Médico - Juan Pérez').should('be.visible');
    cy.findByText('Hipertensión arterial').should('be.visible');
    cy.findByText('Losartán 50mg, una vez al día').should('be.visible');
    
    // Agregamos una nota
    cy.findByRole('button', { name: /agregar nota/i }).click();
    cy.findByLabelText(/contenido de la nota/i).type('Paciente muestra mejoría en los valores de presión arterial.');
    cy.findByRole('button', { name: /guardar nota/i }).click();
    
    // Esperamos a que se complete la solicitud de agregar nota
    cy.wait('@addNoteRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/nota agregada con éxito/i).should('be.visible');
    
    // Verificamos que se muestra la nota agregada
    cy.findByText('Paciente muestra mejoría en los valores de presión arterial.').should('be.visible');
  });

  it('debería permitir generar y gestionar recetas médicas', () => {
    // Interceptamos la llamada a la API de pacientes del médico
    cy.intercept('GET', '/api/doctors/patients*', {
      statusCode: 200,
      body: {
        patients: [
          {
            id: 'patient-1',
            name: 'Juan Pérez',
            age: 45,
            gender: 'male',
            lastVisit: '2025-05-10T09:00:00Z'
          }
        ]
      }
    }).as('patientsRequest');
    
    // Interceptamos la llamada a la API para crear una receta
    cy.intercept('POST', '/api/prescriptions', {
      statusCode: 200,
      body: {
        success: true,
        prescription: {
          id: 'rx-new',
          date: '2025-05-20T14:30:00Z',
          patientId: 'patient-1',
          patientName: 'Juan Pérez',
          doctorId: 'doc-1',
          doctorName: 'Dra. Ana Martínez',
          medications: [
            {
              name: 'Losartán',
              dosage: '50mg',
              frequency: 'Una vez al día',
              duration: '30 días'
            },
            {
              name: 'Aspirina',
              dosage: '100mg',
              frequency: 'Una vez al día',
              duration: '30 días'
            }
          ],
          instructions: 'Tomar con alimentos. Evitar bebidas alcohólicas.',
          diagnosis: 'Hipertensión arterial'
        }
      }
    }).as('createPrescriptionRequest');
    
    // Visitamos el dashboard del médico
    cy.visit('/dashboard/medico');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Hacemos clic en el enlace de recetas
    cy.findByRole('link', { name: /recetas/i }).click();
    
    // Esperamos a que se complete la solicitud de pacientes
    cy.wait('@patientsRequest');
    
    // Hacemos clic en el botón para crear una nueva receta
    cy.findByRole('button', { name: /nueva receta/i }).click();
    
    // Seleccionamos un paciente
    cy.findByLabelText(/paciente/i).select('patient-1');
    
    // Ingresamos el diagnóstico
    cy.findByLabelText(/diagnóstico/i).type('Hipertensión arterial');
    
    // Agregamos un medicamento
    cy.findByRole('button', { name: /agregar medicamento/i }).click();
    cy.findByTestId('medication-name-0').type('Losartán');
    cy.findByTestId('medication-dosage-0').type('50mg');
    cy.findByTestId('medication-frequency-0').type('Una vez al día');
    cy.findByTestId('medication-duration-0').type('30 días');
    
    // Agregamos otro medicamento
    cy.findByRole('button', { name: /agregar medicamento/i }).click();
    cy.findByTestId('medication-name-1').type('Aspirina');
    cy.findByTestId('medication-dosage-1').type('100mg');
    cy.findByTestId('medication-frequency-1').type('Una vez al día');
    cy.findByTestId('medication-duration-1').type('30 días');
    
    // Ingresamos las instrucciones
    cy.findByLabelText(/instrucciones/i).type('Tomar con alimentos. Evitar bebidas alcohólicas.');
    
    // Guardamos la receta
    cy.findByRole('button', { name: /guardar receta/i }).click();
    
    // Esperamos a que se complete la solicitud de crear receta
    cy.wait('@createPrescriptionRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/receta creada con éxito/i).should('be.visible');
    
    // Verificamos que se muestra la opción para imprimir o enviar la receta
    cy.findByRole('button', { name: /imprimir receta/i }).should('be.visible');
    cy.findByRole('button', { name: /enviar por correo/i }).should('be.visible');
  });
});
