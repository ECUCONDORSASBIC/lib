/// <reference types="cypress" />
// Este archivo requiere la instalación de cypress-axe para las pruebas de accesibilidad
// npm install --save-dev cypress-axe axe-core

describe('Pruebas de Accesibilidad', () => {
  beforeEach(() => {
    // Cargar comandos de cypress-axe
    cy.injectAxe();
    
    // Limpiar cookies y almacenamiento local antes de cada prueba
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('La página de inicio debe cumplir con los estándares de accesibilidad', () => {
    // Visitar la página de inicio
    cy.visit('/');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /altamedica/i }).should('be.visible');
    
    // Ejecutar análisis de accesibilidad
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });

  it('La página de login debe cumplir con los estándares de accesibilidad', () => {
    // Visitar la página de login
    cy.visit('/login');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /iniciar sesión/i }).should('be.visible');
    
    // Ejecutar análisis de accesibilidad
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
    
    // Verificar que los campos de formulario tienen etiquetas adecuadas
    cy.findByLabelText(/correo electrónico/i).should('be.visible');
    cy.findByLabelText(/contraseña/i).should('be.visible');
    
    // Verificar que el formulario se puede navegar con teclado
    cy.findByLabelText(/correo electrónico/i).focus().type('test@example.com');
    cy.realPress('Tab');
    cy.focused().should('have.attr', 'type', 'password');
    cy.realPress('Tab');
    cy.focused().should('have.attr', 'type', 'submit');
  });

  it('La página de registro debe cumplir con los estándares de accesibilidad', () => {
    // Visitar la página de registro
    cy.visit('/register');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /registrarse/i }).should('be.visible');
    
    // Ejecutar análisis de accesibilidad
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
    
    // Verificar que los campos de formulario tienen etiquetas adecuadas
    cy.findByLabelText(/nombre completo/i).should('be.visible');
    cy.findByLabelText(/correo electrónico/i).should('be.visible');
    cy.findByLabelText(/contraseña/i).should('be.visible');
    cy.findByLabelText(/confirmar contraseña/i).should('be.visible');
    
    // Verificar que el formulario se puede navegar con teclado
    cy.findByLabelText(/nombre completo/i).focus().type('Juan Pérez');
    cy.realPress('Tab');
    cy.focused().should('have.attr', 'type', 'email');
    cy.realPress('Tab');
    cy.focused().should('have.attr', 'type', 'password');
    cy.realPress('Tab');
    cy.focused().should('have.attr', 'name', 'confirmPassword');
  });

  it('El dashboard del paciente debe cumplir con los estándares de accesibilidad', () => {
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
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /dashboard del paciente/i }).should('be.visible');
    
    // Ejecutar análisis de accesibilidad
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      },
      // Excluir elementos dinámicos que pueden causar falsos positivos
      exclude: [
        '[aria-busy="true"]',
        '[data-loading="true"]'
      ]
    });
    
    // Verificar que la navegación principal es accesible
    cy.findByRole('navigation').should('have.attr', 'aria-label');
    
    // Verificar que los botones tienen texto accesible
    cy.findAllByRole('button').each(($button) => {
      const hasText = $button.text().trim().length > 0;
      const hasAriaLabel = $button.attr('aria-label') !== undefined;
      
      // Cada botón debe tener texto visible o un aria-label
      expect(hasText || hasAriaLabel).to.be.true;
    });
  });

  it('El formulario de programación de citas debe cumplir con los estándares de accesibilidad', () => {
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
    
    // Visitamos la página de programación de citas
    cy.visit('/dashboard/citas/programar');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /programar cita/i }).should('be.visible');
    
    // Ejecutar análisis de accesibilidad
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
    
    // Verificar que los campos del formulario tienen etiquetas adecuadas
    cy.findByLabelText(/tipo de cita/i).should('be.visible');
    cy.findByLabelText(/especialidad/i).should('be.visible');
    
    // Verificar que el formulario proporciona retroalimentación adecuada
    cy.findByLabelText(/tipo de cita/i).select('presencial');
    cy.findByLabelText(/especialidad/i).select('Cardiología');
    cy.findByRole('button', { name: /buscar médicos disponibles/i }).click();
    
    // Verificar que los mensajes de error son accesibles
    cy.findByLabelText(/especialidad/i).select('');
    cy.findByRole('button', { name: /buscar médicos disponibles/i }).click();
    cy.findByText(/seleccione una especialidad/i).should('have.attr', 'role', 'alert');
  });

  it('La interfaz de telemedicina debe cumplir con los estándares de accesibilidad', () => {
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
    
    // Visitamos la página de consulta de telemedicina
    cy.visit('/telemedicina/consulta/apt-123');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de detalles de la cita
    cy.wait('@appointmentDetailsRequest');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /consulta de telemedicina/i }).should('be.visible');
    
    // Ejecutar análisis de accesibilidad
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      },
      // Excluir elementos de video que pueden causar falsos positivos
      exclude: [
        '[data-testid="video-container"]'
      ]
    });
    
    // Verificar que los controles de video tienen etiquetas accesibles
    cy.findByRole('button', { name: /iniciar consulta/i }).click();
    cy.findByRole('button', { name: /silenciar audio/i }).should('be.visible');
    cy.findByRole('button', { name: /desactivar video/i }).should('be.visible');
    
    // Verificar que los controles se pueden usar con teclado
    cy.findByRole('button', { name: /silenciar audio/i }).focus();
    cy.realPress('Enter');
    cy.findByRole('button', { name: /activar audio/i }).should('be.visible');
  });

  it('El panel de administración debe cumplir con los estándares de accesibilidad', () => {
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
    
    // Visitamos el panel de administración
    cy.visit('/dashboard/admin');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /panel de administración/i }).should('be.visible');
    
    // Ejecutar análisis de accesibilidad
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
    
    // Verificar que las tablas tienen encabezados adecuados
    cy.findAllByRole('table').each(($table) => {
      cy.wrap($table).find('th').should('have.length.at.least', 1);
    });
    
    // Verificar que los gráficos tienen descripciones alternativas
    cy.findAllByTestId(/chart/).each(($chart) => {
      const hasAriaLabel = $chart.attr('aria-label') !== undefined;
      const hasAriaDescribedby = $chart.attr('aria-describedby') !== undefined;
      
      // Cada gráfico debe tener una descripción accesible
      expect(hasAriaLabel || hasAriaDescribedby).to.be.true;
    });
  });

  it('La aplicación debe ser navegable con teclado', () => {
    // Visitar la página de inicio
    cy.visit('/');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /altamedica/i }).should('be.visible');
    
    // Verificar que se puede navegar con teclado
    cy.realPress('Tab');
    cy.focused().should('have.attr', 'href').and('include', '/');
    
    // Navegar al enlace de login
    let loginLink;
    cy.findByRole('link', { name: /iniciar sesión/i })
      .then(($link) => {
        loginLink = $link;
        // Contar cuántas veces hay que presionar Tab para llegar al enlace
        let tabCount = 0;
        let found = false;
        
        const checkFocus = () => {
          if (tabCount > 20) {
            // Límite para evitar bucles infinitos
            return;
          }
          
          if (cy.state('document').activeElement === loginLink[0]) {
            found = true;
            return;
          }
          
          tabCount++;
          cy.realPress('Tab').then(checkFocus);
        };
        
        checkFocus();
        
        // Verificar que se pudo llegar al enlace con Tab
        cy.wrap(found).should('be.true');
      });
    
    // Activar el enlace con Enter
    cy.realPress('Enter');
    
    // Verificar que se navegó a la página de login
    cy.url().should('include', '/login');
  });

  it('Los mensajes de error deben ser accesibles', () => {
    // Visitar la página de login
    cy.visit('/login');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /iniciar sesión/i }).should('be.visible');
    
    // Enviar el formulario sin completarlo
    cy.findByRole('button', { name: /iniciar sesión/i }).click();
    
    // Verificar que los mensajes de error son accesibles
    cy.findAllByRole('alert').each(($alert) => {
      // El mensaje de error debe estar asociado con el campo correspondiente
      const fieldId = $alert.attr('aria-describedby');
      if (fieldId) {
        cy.get(`#${fieldId}`).should('exist');
      }
    });
    
    // Verificar que los campos con error tienen el atributo aria-invalid
    cy.findByLabelText(/correo electrónico/i).should('have.attr', 'aria-invalid', 'true');
    cy.findByLabelText(/contraseña/i).should('have.attr', 'aria-invalid', 'true');
  });

  it('La aplicación debe tener suficiente contraste de color', () => {
    // Visitar la página de inicio
    cy.visit('/');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /altamedica/i }).should('be.visible');
    
    // Ejecutar análisis de accesibilidad específico para contraste
    cy.checkA11y(null, {
      runOnly: {
        type: 'rule',
        values: ['color-contrast']
      }
    });
    
    // Visitar la página de login
    cy.visit('/login');
    
    // Esperar a que la página se cargue completamente
    cy.findByRole('heading', { name: /iniciar sesión/i }).should('be.visible');
    
    // Ejecutar análisis de accesibilidad específico para contraste
    cy.checkA11y(null, {
      runOnly: {
        type: 'rule',
        values: ['color-contrast']
      }
    });
  });
});
