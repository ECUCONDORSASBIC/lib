// ***********************************************************
// Este archivo se carga automáticamente antes de que se ejecuten
// las pruebas. Este es un buen lugar para poner la configuración global
// que afecta a todas las pruebas en la suite.
// ***********************************************************

// Importamos los comandos personalizados
import './commands';

// Importamos cypress-axe para pruebas de accesibilidad
import 'cypress-axe';

// Configuración para pruebas de accesibilidad
beforeEach(() => {
  // Configuramos las opciones de log para las violaciones de accesibilidad
  cy.window().then((win) => {
    win.axe.configure({
      reporter: 'v2',
      // Configuramos reglas específicas para nuestra aplicación
      rules: [
        // Desactivamos reglas que puedan generar falsos positivos en nuestra aplicación
        { id: 'color-contrast', enabled: true, reviewOnFail: true },
        // Personalizamos el nivel de impacto para algunas reglas
        { id: 'aria-required-attr', impact: 'serious' },
        { id: 'aria-valid-attr', impact: 'serious' },
      ]
    });
  });
});

// Configuramos tareas personalizadas para el reporte de accesibilidad
Cypress.Commands.overwrite('checkA11y', (originalFn, context, options, violationCallback) => {
  // Llamamos a la función original
  originalFn(context, options, violationCallback);
  
  // Agregamos funcionalidad adicional para el reporte
  if (violationCallback) return;
  
  cy.on('test:after:run', (attributes) => {
    if (attributes.state === 'failed') {
      // Guardamos información sobre las violaciones de accesibilidad
      const violationData = Cypress.env('a11yViolations') || [];
      Cypress.env('a11yViolations', violationData);
    }
  });
});

// Deshabilitamos las capturas de pantalla para los comandos de tipo
// para mejorar el rendimiento de las pruebas
Cypress.Screenshot.defaults({
  screenshotOnRunFailure: true,
});

// Ocultar los errores de fetch de XHR en la consola de Cypress
const origLog = Cypress.log;
Cypress.log = function (opts, ...other) {
  if (opts.displayName === 'xhr' && opts.url.includes('/__cypress/xhrs/')) {
    return;
  }
  return origLog(opts, ...other);
};
