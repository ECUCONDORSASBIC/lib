const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Configuración para pruebas de accesibilidad
      on('task', {
        log(message) {
          // Permite registrar mensajes desde las pruebas
          console.log(message);
          return null;
        },
        table(message) {
          // Permite mostrar tablas en la consola
          console.table(message);
          return null;
        },
        saveA11yReport(violations) {
          // Guarda un reporte de violaciones de accesibilidad
          const reportDir = path.join(__dirname, 'cypress/reports/a11y');
          if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
          }
          const reportPath = path.join(reportDir, `a11y-report-${Date.now()}.json`);
          fs.writeFileSync(reportPath, JSON.stringify(violations, null, 2));
          return reportPath;
        }
      });
    },
    // Configuración para pruebas de accesibilidad
    env: {
      // Configuración para axe-core
      axe: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        },
        // Elementos a excluir de las pruebas de accesibilidad
        exclude: [
          // Elementos que pueden generar falsos positivos
          '[aria-busy="true"]',
          '[data-loading="true"]',
          '[data-testid="video-container"]'
        ]
      }
    },
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true,
  chromeWebSecurity: false,
  // Configuración adicional para mejorar la experiencia de pruebas
  retries: {
    runMode: 1,      // Reintentar pruebas fallidas una vez en modo de ejecución
    openMode: 0       // No reintentar pruebas fallidas en modo interactivo
  },
  // Configuración para mejorar el rendimiento
  numTestsKeptInMemory: 50,
  experimentalMemoryManagement: true,
  defaultCommandTimeout: 10000,  // Aumentar el tiempo de espera para comandos
});
