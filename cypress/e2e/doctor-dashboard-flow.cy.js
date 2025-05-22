/// <reference types="cypress" />

describe('Flujo del Dashboard Médico', () => {
    // Función para iniciar sesión como médico
    const loginAsDoctor = () => {
        cy.visit('/login');
        cy.get('[data-cy="email-input"]').type(Cypress.env('TEST_DOCTOR_EMAIL') || 'doctor@example.com');
        cy.get('[data-cy="password-input"]').type(Cypress.env('TEST_DOCTOR_PASSWORD') || 'password123');
        cy.get('[data-cy="login-button"]').click();
        cy.url().should('include', '/dashboard/medico');
    };

    beforeEach(() => {
        // Interceptar llamadas API relevantes
        cy.intercept('GET', '**/api/doctor/appointments*').as('getAppointments');
        cy.intercept('GET', '**/api/doctor/patients*').as('getPatients');
        cy.intercept('GET', '**/api/doctor/alerts*').as('getAlerts');

        // Iniciar sesión como médico antes de cada prueba
        loginAsDoctor();
    });

    it('debe mostrar correctamente el panel principal con las métricas del médico', () => {
        // Verificar elementos clave del dashboard
        cy.get('[data-cy="doctor-dashboard"]').should('be.visible');
        cy.get('[data-cy="appointments-summary"]').should('be.visible');
        cy.get('[data-cy="patients-summary"]').should('be.visible');
        cy.get('[data-cy="alerts-summary"]').should('be.visible');

        // Verificar que se cargaron los datos correctamente
        cy.wait('@getAppointments');
        cy.wait('@getPatients');
        cy.wait('@getAlerts');

        // Verificar que muestra datos reales
        cy.get('[data-cy="upcoming-appointments"]').should('not.be.empty');
        cy.get('[data-cy="recent-patients"]').should('not.be.empty');
    });

    it('debe permitir navegar a la lista de pacientes y ver detalles de un paciente', () => {
        // Navegar a la lista de pacientes
        cy.get('[data-cy="nav-patients"]').click();
        cy.url().should('include', '/dashboard/medico/pacientes');
        cy.wait('@getPatients');

        // Verificar que la lista de pacientes está visible
        cy.get('[data-cy="patient-list-table"]').should('be.visible');

        // Seleccionar un paciente de la lista
        cy.get('[data-cy="patient-row"]').first().click();

        // Verificar navegación a detalles del paciente
        cy.url().should('match', /\/dashboard\/medico\/pacientes\/[\w-]+/);

        // Verificar que muestra información del paciente
        cy.get('[data-cy="patient-profile"]').should('be.visible');
        cy.get('[data-cy="patient-history"]').should('be.visible');
        cy.get('[data-cy="patient-metrics"]').should('be.visible');
    });

    it('debe permitir gestionar citas médicas', () => {
        // Navegar a la sección de citas
        cy.get('[data-cy="nav-appointments"]').click();
        cy.url().should('include', '/dashboard/medico/citas');
        cy.wait('@getAppointments');

        // Verificar que se muestran las citas programadas
        cy.get('[data-cy="appointments-calendar"]').should('be.visible');

        // Crear una nueva cita
        cy.get('[data-cy="create-appointment-button"]').click();

        // Verificar que se abre el modal de creación de citas
        cy.get('[data-cy="appointment-modal"]').should('be.visible');

        // Seleccionar un paciente
        cy.get('[data-cy="patient-select"]').click();
        cy.get('[data-cy="patient-option"]').first().click();

        // Seleccionar fecha y hora
        cy.get('[data-cy="date-picker"]').type('2023-12-30');
        cy.get('[data-cy="time-picker"]').select('14:00');

        // Seleccionar tipo de cita
        cy.get('[data-cy="appointment-type"]').select('Consulta general');

        // Agregar notas
        cy.get('[data-cy="appointment-notes"]').type('Cita de seguimiento');

        // Guardar la cita
        cy.get('[data-cy="save-appointment-button"]').click();

        // Verificar que la cita se ha creado correctamente
        cy.get('[data-cy="success-message"]').should('be.visible');

        // Verificar que la cita aparece en el calendario
        cy.get('[data-cy="appointment-item"]').contains('Consulta general').should('be.visible');
    });

    it('debe permitir iniciar una consulta de telemedicina', () => {
        // Interceptar llamadas de telemedicina
        cy.intercept('GET', '**/api/telemedicine/session/**').as('getTeleSession');

        // Navegar a la sección de citas
        cy.get('[data-cy="nav-appointments"]').click();
        cy.url().should('include', '/dashboard/medico/citas');

        // Buscar y seleccionar una cita de telemedicina
        cy.get('[data-cy="appointment-item"]').contains('Telemedicina').first().click();

        // Iniciar la sesión de telemedicina
        cy.get('[data-cy="start-telemedicine-button"]').click();

        // Verificar que se carga la sesión de telemedicina
        cy.wait('@getTeleSession');
        cy.url().should('include', '/dashboard/medico/consulta');

        // Verificar que los elementos de la sesión están visibles
        cy.get('[data-cy="video-container"]').should('be.visible');
        cy.get('[data-cy="chat-container"]').should('be.visible');
        cy.get('[data-cy="patient-info-panel"]').should('be.visible');

        // Finalizar la sesión
        cy.get('[data-cy="end-call-button"]').click();

        // Verificar redirección a la página de resumen
        cy.url().should('include', '/finalizar');

        // Completar notas médicas
        cy.get('[data-cy="medical-notes"]').type('El paciente muestra mejoría');
        cy.get('[data-cy="save-notes-button"]').click();

        // Verificar redirección al dashboard después de guardar
        cy.url().should('include', '/dashboard/medico');
    });

    it('debe mostrar y permitir gestionar alertas médicas', () => {
        // Navegar a la sección de alertas
        cy.get('[data-cy="nav-alerts"]').click();
        cy.url().should('include', '/dashboard/medico/alertas');
        cy.wait('@getAlerts');

        // Verificar que se muestran las alertas
        cy.get('[data-cy="alert-list"]').should('be.visible');

        // Marcar una alerta como revisada
        cy.get('[data-cy="alert-item"]').first().find('[data-cy="mark-reviewed-button"]').click();

        // Verificar que la alerta se marca como revisada
        cy.get('[data-cy="alert-item"]').first().should('have.class', 'reviewed');

        // Verificar que se puede filtrar por tipo de alerta
        cy.get('[data-cy="filter-dropdown"]').select('Alta prioridad');
        cy.get('[data-cy="alert-item"]').should('have.length.greaterThan', 0);

        // Verificar que se puede acceder a detalles de un paciente desde una alerta
        cy.get('[data-cy="alert-item"]').first().find('[data-cy="view-patient-button"]').click();
        cy.url().should('match', /\/dashboard\/medico\/pacientes\/[\w-]+/);
    });

    after(() => {
        // Cerrar sesión al finalizar
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="logout-button"]').click();
        cy.url().should('include', '/login');
    });
});
