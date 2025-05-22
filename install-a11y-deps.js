/**
 * Script para instalar las dependencias necesarias para las pruebas de accesibilidad
 * Este script debe ejecutarse con: node install-a11y-deps.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Instalando dependencias para pruebas de accesibilidad...');

// Lista de dependencias necesarias
const dependencies = [
  'cypress-axe',
  'axe-core',
  'pa11y-ci',
  '@testing-library/cypress',
  'cypress-real-events'
];

// Verificar si ya están instaladas
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const devDependencies = packageJson.devDependencies || {};
const allDependencies = { ...packageJson.dependencies, ...devDependencies };

const missingDependencies = dependencies.filter(dep => !allDependencies[dep]);

if (missingDependencies.length === 0) {
  console.log('Todas las dependencias ya están instaladas.');
} else {
  console.log(`Instalando las siguientes dependencias: ${missingDependencies.join(', ')}`);
  
  try {
    // Instalar dependencias faltantes
    execSync(`npm install --save-dev ${missingDependencies.join(' ')}`, { stdio: 'inherit' });
    console.log('Dependencias instaladas correctamente.');
  } catch (error) {
    console.error('Error al instalar dependencias:', error.message);
    process.exit(1);
  }
}

// Crear directorio para reportes de accesibilidad si no existe
const reportsDir = path.join(__dirname, 'cypress', 'reports', 'a11y');
if (!fs.existsSync(reportsDir)) {
  console.log('Creando directorio para reportes de accesibilidad...');
  fs.mkdirSync(reportsDir, { recursive: true });
  console.log(`Directorio creado: ${reportsDir}`);
}

// Crear archivo de configuración para pa11y-ci si no existe
const pa11yConfigPath = path.join(__dirname, '.pa11yci');
if (!fs.existsSync(pa11yConfigPath)) {
  console.log('Creando archivo de configuración para pa11y-ci...');
  
  const pa11yConfig = {
    defaults: {
      standard: 'WCAG2AA',
      timeout: 30000,
      wait: 1000,
      ignore: [
        'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail'
      ]
    },
    urls: [
      'http://localhost:3000/',
      'http://localhost:3000/login',
      'http://localhost:3000/register',
      'http://localhost:3000/dashboard'
    ]
  };
  
  fs.writeFileSync(pa11yConfigPath, JSON.stringify(pa11yConfig, null, 2));
  console.log(`Archivo de configuración creado: ${pa11yConfigPath}`);
}

console.log('\nConfiguración completada. Ahora puedes ejecutar las pruebas de accesibilidad con:');
console.log('  npm run test:a11y');
console.log('  npm run test:e2e:a11y');
console.log('\nPara ejecutar todas las pruebas end-to-end:');
console.log('  npm run test:e2e:all');
