// ***********************************************
// Este archivo puede ser utilizado para definir comandos personalizados
// y sobreescribir comandos existentes.
//
// Para más detalles, visita:
// https://on.cypress.io/custom-commands
// ***********************************************

// Importamos Testing Library commands
import '@testing-library/cypress/add-commands';
// Importamos cypress-axe para pruebas de accesibilidad
import 'cypress-axe';

// -- Comandos personalizados para autenticación --

// Comando para simular el inicio de sesión
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  // Interceptamos la llamada a la API de autenticación
  cy.intercept('POST', '/api/auth/login').as('loginRequest');
  
  // Visitamos la página de login
  cy.visit('/auth/login');
  
  // Completamos el formulario
  cy.findByLabelText(/correo electrónico/i).type(email);
  cy.findByLabelText(/contraseña/i).type(password);
  
  // Enviamos el formulario
  cy.findByRole('button', { name: /iniciar sesión/i }).click();
  
  // Esperamos a que se complete la solicitud
  cy.wait('@loginRequest');
  
  // Verificamos que se redirige al dashboard
  cy.url().should('include', '/dashboard');
});

// Comando para simular el cierre de sesión
Cypress.Commands.add('logout', () => {
  // Interceptamos la llamada a la API de cierre de sesión
  cy.intercept('POST', '/api/auth/logout').as('logoutRequest');
  
  // Hacemos clic en el botón de cerrar sesión
  cy.findByRole('button', { name: /cerrar sesión/i }).click();
  
  // Esperamos a que se complete la solicitud
  cy.wait('@logoutRequest');
  
  // Verificamos que se redirige a la página de inicio
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

// -- Comandos personalizados para accesibilidad --

// Comando para verificar accesibilidad y generar un reporte detallado
Cypress.Commands.add('checkA11yAndReport', (context, options) => {
  cy.checkA11y(context, options, violations => {
    // Crear un reporte detallado de las violaciones
    cy.task('log', `${violations.length} violaciones de accesibilidad encontradas`);
    
    // Detallar cada violación
    violations.forEach(violation => {
      const nodes = Cypress.$(violation.nodes.map(node => node.target).join(','));
      
      cy.task('log', {
        message: `${violation.id} - ${violation.impact}: ${violation.help}`,
        consoleProps: () => violation
      });
      
      // Resaltar los elementos con violaciones
      nodes.each((i, node) => {
        Cypress.$(node).css('border', '3px solid #f00');
      });
    });
  });
});

// Comando para simular la navegación con teclado
Cypress.Commands.add('tabUntilVisible', (selector) => {
  const checkIfVisible = () => {
    const el = Cypress.$(selector);
    if (el.is(':visible') && el.is(':focus')) {
      return;
    }
    cy.realPress('Tab').then(checkIfVisible);
  };
  
  checkIfVisible();
});

// Comando para verificar el contraste de color
Cypress.Commands.add('checkColorContrast', () => {
  cy.checkA11y(null, {
    runOnly: {
      type: 'rule',
      values: ['color-contrast']
    }
  });
});

// Comando para verificar la navegabilidad con teclado
Cypress.Commands.add('checkKeyboardNavigation', (elements) => {
  cy.get('body').focus();
  cy.realPress('Tab');
  
  elements.forEach(selector => {
    cy.tabUntilVisible(selector);
    cy.get(selector).should('be.focused');
  });
});

// Comando para navegar al dashboard del paciente
Cypress.Commands.add('navigateToPatientDashboard', (patientId = 'test-patient-id') => {
  cy.visit(`/dashboard/paciente/${patientId}`);
  cy.findByRole('heading', { name: /perfil de/i }).should('be.visible');
});

// Comando para verificar elementos comunes en todas las páginas
Cypress.Commands.add('checkCommonElements', () => {
  // Verificar que el logo está presente
  cy.findByAltText(/altamedica logo/i).should('be.visible');
  
  // Verificar que el footer está presente
  cy.findByText(/todos los derechos reservados/i).should('be.visible');
});
