/// <reference types="cypress" />

describe('Flujo de autenticación', () => {
    // Funciones de utilidad
    const generateUniqueEmail = () => `test${Date.now()}@example.com`;

    beforeEach(() => {
        // Interceptar llamadas a la API de Firebase Auth
        cy.intercept('POST', '**/identitytoolkit/v3/relyingparty/verifyPassword*').as('login');
        cy.intercept('POST', '**/identitytoolkit/v3/relyingparty/signupNewUser*').as('signUp');
        cy.intercept('GET', '**/v1/projects/*/databases/(default)/documents/users/**').as('getUserData');

        // Visitar la página de inicio
        cy.visit('/');
    });

    it('debe permitir a los usuarios iniciar sesión y redirigir al dashboard según su rol', () => {
        const testCredentials = {
            email: Cypress.env('TEST_DOCTOR_EMAIL') || 'doctor@example.com',
            password: Cypress.env('TEST_DOCTOR_PASSWORD') || 'password123',
            role: 'medico'
        };

        // Navegar a la página de inicio de sesión
        cy.get('[data-cy="nav-login"]').click();
        cy.url().should('include', '/login');

        // Completar el formulario de inicio de sesión
        cy.get('[data-cy="email-input"]').type(testCredentials.email);
        cy.get('[data-cy="password-input"]').type(testCredentials.password);
        cy.get('[data-cy="login-button"]').click();

        // Esperar a que se complete el inicio de sesión
        cy.wait('@login');
        cy.wait('@getUserData');

        // Verificar redirección al dashboard médico
        cy.url().should('include', '/dashboard/medico');

        // Verificar elementos específicos del dashboard médico
        cy.get('[data-cy="welcome-message"]').should('contain', 'Bienvenido');
        cy.get('[data-cy="patient-list"]').should('be.visible');

        // Cerrar sesión
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="logout-button"]').click();

        // Verificar redirección después del cierre de sesión
        cy.url().should('include', '/login');
    });

    it('debe mostrar mensaje de error con credenciales incorrectas', () => {
        // Navegar a la página de inicio de sesión
        cy.visit('/login');

        // Intentar iniciar sesión con credenciales incorrectas
        cy.get('[data-cy="email-input"]').type('wrong@example.com');
        cy.get('[data-cy="password-input"]').type('wrongpassword');
        cy.get('[data-cy="login-button"]').click();

        // Esperar respuesta fallida
        cy.wait('@login');

        // Verificar que aparece mensaje de error
        cy.get('[data-cy="error-message"]').should('be.visible');
        cy.url().should('include', '/login'); // Debería permanecer en la página de login
    });

    it('debe permitir a los usuarios registrarse con un nuevo correo', () => {
        const newUser = {
            email: generateUniqueEmail(),
            password: 'StrongPassword123!',
            name: 'New Test User'
        };

        // Navegar a la página de registro
        cy.visit('/signup');

        // Completar el formulario de registro
        cy.get('[data-cy="name-input"]').type(newUser.name);
        cy.get('[data-cy="email-input"]').type(newUser.email);
        cy.get('[data-cy="password-input"]').type(newUser.password);
        cy.get('[data-cy="confirm-password-input"]').type(newUser.password);
        cy.get('[data-cy="signup-button"]').click();

        // Esperar a que se complete el registro
        cy.wait('@signUp');

        // Verificar redirección a la página de selección de rol/onboarding
        cy.url().should('include', '/onboarding');

        // Seleccionar rol de médico
        cy.get('[data-cy="role-option-medico"]').click();
        cy.get('[data-cy="continue-button"]').click();

        // Verificar redirección al dashboard correspondiente después de onboarding
        cy.url().should('include', '/dashboard/medico');
    });

    it('debe permitir recuperar la contraseña', () => {
        // Interceptar llamada al reseteo de contraseña
        cy.intercept('POST', '**/identitytoolkit/v3/relyingparty/getOobConfirmationCode*').as('resetPassword');

        // Navegar a la página de inicio de sesión
        cy.visit('/login');

        // Hacer clic en el enlace "Olvidé mi contraseña"
        cy.get('[data-cy="forgot-password-link"]').click();

        // Verificar redirección a la página de recuperación de contraseña
        cy.url().should('include', '/reset-password');

        // Ingresar correo electrónico
        cy.get('[data-cy="email-input"]').type('test@example.com');
        cy.get('[data-cy="reset-button"]').click();

        // Esperar respuesta de la API
        cy.wait('@resetPassword');

        // Verificar mensaje de confirmación
        cy.get('[data-cy="success-message"]').should('be.visible');
    });
});
