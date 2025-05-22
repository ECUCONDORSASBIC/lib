/// <reference types="cypress" />

describe('Autenticación', () => {
  beforeEach(() => {
    // Limpiar cookies y almacenamiento local antes de cada prueba
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('debería mostrar la página de inicio de sesión', () => {
    cy.visit('/auth/login');
    cy.findByRole('heading', { name: /iniciar sesión/i }).should('be.visible');
    cy.findByLabelText(/correo electrónico/i).should('be.visible');
    cy.findByLabelText(/contraseña/i).should('be.visible');
    cy.findByRole('button', { name: /iniciar sesión/i }).should('be.visible');
    cy.findByText(/¿no tienes una cuenta/i).should('be.visible');
    cy.findByRole('link', { name: /regístrate/i }).should('be.visible');
  });

  it('debería mostrar la página de registro', () => {
    cy.visit('/auth/register');
    cy.findByRole('heading', { name: /regístrate/i }).should('be.visible');
    cy.findByLabelText(/nombre completo/i).should('be.visible');
    cy.findByLabelText(/correo electrónico/i).should('be.visible');
    cy.findByLabelText(/contraseña/i).should('be.visible');
    cy.findByLabelText(/confirmar contraseña/i).should('be.visible');
    cy.findByRole('button', { name: /registrarse/i }).should('be.visible');
    cy.findByText(/¿ya tienes una cuenta/i).should('be.visible');
    cy.findByRole('link', { name: /inicia sesión/i }).should('be.visible');
  });

  it('debería mostrar un error cuando las credenciales son inválidas', () => {
    cy.visit('/auth/login');
    
    // Interceptamos la llamada a la API de autenticación para simular un error
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { error: 'Credenciales inválidas' }
    }).as('loginRequest');
    
    // Completamos el formulario con credenciales inválidas
    cy.findByLabelText(/correo electrónico/i).type('usuario@example.com');
    cy.findByLabelText(/contraseña/i).type('contraseña-incorrecta');
    
    // Enviamos el formulario
    cy.findByRole('button', { name: /iniciar sesión/i }).click();
    
    // Esperamos a que se complete la solicitud
    cy.wait('@loginRequest');
    
    // Verificamos que se muestra un mensaje de error
    cy.findByText(/credenciales inválidas/i).should('be.visible');
    
    // Verificamos que seguimos en la página de login
    cy.url().should('include', '/auth/login');
  });

  it('debería redirigir al dashboard después de iniciar sesión correctamente', () => {
    cy.visit('/auth/login');
    
    // Interceptamos la llamada a la API de autenticación para simular un inicio de sesión exitoso
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { success: true }
    }).as('loginRequest');
    
    // Interceptamos la llamada a la API de sesión para simular un usuario autenticado
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          uid: 'test-user-id',
          email: 'usuario@example.com',
          role: 'paciente'
        }
      }
    }).as('sessionRequest');
    
    // Completamos el formulario con credenciales válidas
    cy.findByLabelText(/correo electrónico/i).type('usuario@example.com');
    cy.findByLabelText(/contraseña/i).type('contraseña123');
    
    // Enviamos el formulario
    cy.findByRole('button', { name: /iniciar sesión/i }).click();
    
    // Esperamos a que se completen las solicitudes
    cy.wait('@loginRequest');
    cy.wait('@sessionRequest');
    
    // Verificamos que se redirige al dashboard
    cy.url().should('include', '/dashboard');
  });

  it('debería redirigir a la página de inicio después de cerrar sesión', () => {
    // Simulamos un usuario autenticado
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          uid: 'test-user-id',
          email: 'usuario@example.com',
          role: 'paciente'
        }
      }
    }).as('sessionRequest');
    
    // Visitamos el dashboard
    cy.visit('/dashboard');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Interceptamos la llamada a la API de cierre de sesión
    cy.intercept('POST', '/api/auth/logout', {
      statusCode: 200,
      body: { success: true }
    }).as('logoutRequest');
    
    // Hacemos clic en el botón de cerrar sesión
    cy.findByRole('button', { name: /cerrar sesión/i }).click();
    
    // Esperamos a que se complete la solicitud
    cy.wait('@logoutRequest');
    
    // Verificamos que se redirige a la página de inicio
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
