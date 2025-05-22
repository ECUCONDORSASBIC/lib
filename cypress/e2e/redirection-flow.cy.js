/// <reference types="cypress" />

describe('Flujo de Redirecciones', () => {
    // Definir usuarios de prueba para diferentes roles
    const testUsers = {
        doctor: {
            email: Cypress.env('TEST_DOCTOR_EMAIL') || 'doctor@example.com',
            password: Cypress.env('TEST_DOCTOR_PASSWORD') || 'password123',
            dashboardUrl: '/dashboard/medico'
        },
        patient: {
            email: Cypress.env('TEST_PATIENT_EMAIL') || 'patient@example.com',
            password: Cypress.env('TEST_PATIENT_PASSWORD') || 'password123',
            dashboardUrl: '/dashboard/paciente'
        },
        company: {
            email: Cypress.env('TEST_COMPANY_EMAIL') || 'company@example.com',
            password: Cypress.env('TEST_COMPANY_PASSWORD') || 'password123',
            dashboardUrl: '/dashboard/empresa'
        }
    };

    // Función para iniciar sesión con un usuario específico
    const login = (userType) => {
        const user = testUsers[userType];
        cy.visit('/login');
        cy.get('[data-cy="email-input"]').type(user.email);
        cy.get('[data-cy="password-input"]').type(user.password);
        cy.get('[data-cy="login-button"]').click();
        // Esperar redirección al dashboard específico
        cy.url().should('include', user.dashboardUrl);
    };

    beforeEach(() => {
        // Interceptar las llamadas de autenticación y obtención de datos
        cy.intercept('POST', '**/identitytoolkit/v3/relyingparty/verifyPassword*').as('login');
        cy.intercept('GET', '**/v1/projects/*/databases/(default)/documents/users/**').as('getUserData');
    });

    it('debe redirigir a usuarios no autenticados a login al intentar acceder a rutas protegidas', () => {
        // Intentar acceder a rutas protegidas sin autenticación
        const protectedRoutes = [
            '/dashboard',
            '/dashboard/medico',
            '/dashboard/paciente',
            '/dashboard/empresa',
            '/dashboard/medico/pacientes',
            '/dashboard/medico/citas'
        ];

        // Probar cada ruta protegida
        protectedRoutes.forEach(route => {
            cy.visit(route, { failOnStatusCode: false });
            // Verificar redirección a login
            cy.url().should('include', '/login');
        });
    });

    it('debe redirigir al usuario médico a su dashboard específico después de iniciar sesión', () => {
        login('doctor');

        // Verificar que estamos en el dashboard médico
        cy.get('[data-cy="doctor-dashboard"]').should('be.visible');
        cy.url().should('include', '/dashboard/medico');

        // Intentar acceder al dashboard de paciente (acceso no permitido)
        cy.visit('/dashboard/paciente', { failOnStatusCode: false });

        // Verificar redirección de vuelta al dashboard médico
        cy.url().should('include', '/dashboard/medico');
    });

    it('debe redirigir al usuario paciente a su dashboard específico después de iniciar sesión', () => {
        login('patient');

        // Verificar que estamos en el dashboard de paciente
        cy.get('[data-cy="patient-dashboard"]').should('be.visible');
        cy.url().should('include', '/dashboard/paciente');

        // Intentar acceder al dashboard médico (acceso no permitido)
        cy.visit('/dashboard/medico', { failOnStatusCode: false });

        // Verificar redirección de vuelta al dashboard de paciente
        cy.url().should('include', '/dashboard/paciente');
    });

    it('debe gestionar correctamente la redirección después del cierre de sesión', () => {
        // Iniciar sesión como médico
        login('doctor');

        // Cerrar sesión
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="logout-button"]').click();

        // Verificar redirección a login
        cy.url().should('include', '/login');

        // Intentar acceder nuevamente a una ruta protegida
        cy.visit('/dashboard/medico', { failOnStatusCode: false });
        cy.url().should('include', '/login');
    });

    it('debe redirigir a la ruta que se intentaba acceder después del login', () => {
        // Intentar acceder a la página de pacientes sin autenticación
        cy.visit('/dashboard/medico/pacientes', { failOnStatusCode: false });

        // Verificar redirección a login con parámetro returnUrl
        cy.url().should('include', '/login');
        cy.url().should('include', 'returnUrl=');

        // Iniciar sesión como médico
        cy.get('[data-cy="email-input"]').type(testUsers.doctor.email);
        cy.get('[data-cy="password-input"]').type(testUsers.doctor.password);
        cy.get('[data-cy="login-button"]').click();
        cy.wait('@login');
        cy.wait('@getUserData');

        // Verificar redirección a la página que se intentaba acceder originalmente
        cy.url().should('include', '/dashboard/medico/pacientes');
    });

    it('debe gestionar correctamente el cambio de rol con rutas específicas', () => {
        // Este test simula un usuario con múltiples roles
        login('doctor');

        // Simular cambio de rol (normalmente disponible solo para usuarios con múltiples roles)
        // Primero, interceptar la llamada API que actualiza el rol
        cy.intercept('POST', '**/api/users/switch-role').as('switchRole');

        // Hacer clic en el selector de rol y cambiar
        cy.get('[data-cy="role-selector"]').click();
        cy.get('[data-cy="role-option-paciente"]').click();

        // Esperar por la actualización del rol
        cy.wait('@switchRole');

        // Verificar redirección al dashboard del nuevo rol
        cy.url().should('include', '/dashboard/paciente');
        cy.get('[data-cy="patient-dashboard"]').should('be.visible');
    });

    it('debe redireccionar a la página de onboarding para nuevos usuarios', () => {
        // Registrar un nuevo usuario
        const newEmail = `test${Date.now()}@example.com`;

        cy.visit('/signup');

        // Completar el formulario de registro
        cy.get('[data-cy="name-input"]').type('Nuevo Usuario');
        cy.get('[data-cy="email-input"]').type(newEmail);
        cy.get('[data-cy="password-input"]').type('Password123!');
        cy.get('[data-cy="confirm-password-input"]').type('Password123!');
        cy.get('[data-cy="signup-button"]').click();

        // Verificar redirección a la página de onboarding
        cy.url().should('include', '/onboarding');

        // Completar el onboarding seleccionando el rol de médico
        cy.get('[data-cy="role-option-medico"]').click();
        cy.get('[data-cy="continue-button"]').click();

        // Completar información específica del médico
        cy.get('[data-cy="specialty-select"]').select('Cardiología');
        cy.get('[data-cy="license-input"]').type('MED12345');
        cy.get('[data-cy="experience-input"]').type('5');
        cy.get('[data-cy="continue-button"]').click();

        // Verificar redirección al dashboard médico después del onboarding
        cy.url().should('include', '/dashboard/medico');
        cy.get('[data-cy="doctor-dashboard"]').should('be.visible');
    });
});
