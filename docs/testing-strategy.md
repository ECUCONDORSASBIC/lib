# Estrategia de Pruebas para el Dashboard Médico

Este documento describe la estrategia de pruebas implementada para garantizar el correcto funcionamiento del Dashboard Médico y sus flujos de redirección.

## Niveles de Pruebas

### 1. Pruebas Unitarias
- **Objetivo**: Verificar el funcionamiento correcto de componentes individuales.
- **Herramientas**: Jest, React Testing Library
- **Ubicación**: `__tests__/components/`, `__tests__/utils/`
- **Cobertura**: Componentes UI, utilidades, hooks personalizados

### 2. Pruebas de Integración
- **Objetivo**: Verificar la interacción entre múltiples componentes y servicios.
- **Herramientas**: Jest, React Testing Library, MSW (Mock Service Worker)
- **Ubicación**: `__tests__/integration/`
- **Cobertura**:
  - Flujos de autenticación completos
  - Proceso de redirección del dashboard
  - Interacción entre componentes y contextos

### 3. Pruebas End-to-End (E2E)
- **Objetivo**: Validar flujos completos desde la perspectiva del usuario final.
- **Herramientas**: Cypress
- **Ubicación**: `cypress/e2e/`
- **Cobertura**:
  - Flujo de autenticación
  - Navegación por el dashboard médico
  - Redirecciones basadas en roles
  - Flujos de consulta médica y telemedicina

## Pruebas de Redirección

Las pruebas de redirección se han implementado para cubrir los siguientes escenarios:

1. **Redirección basada en rol**:
   - Verificar que los usuarios son redirigidos al dashboard correspondiente a su rol
   - Probar la normalización de roles para manejar inconsistencias en la nomenclatura

2. **Protección de rutas**:
   - Verificar que los usuarios no autenticados son redirigidos a login
   - Verificar que los usuarios no pueden acceder a dashboards de otros roles

3. **Persistencia de la ruta intentada**:
   - Verificar que después de iniciar sesión, el usuario es redirigido a la ruta que intentaba acceder inicialmente

4. **Redirección post-autenticación**:
   - Verificar el comportamiento después del registro
   - Verificar el flujo de onboarding para nuevos usuarios

## Ejecución de Pruebas

### Pruebas Unitarias y de Integración
```bash
# Ejecutar todas las pruebas
npm run test:all

# Ejecutar solo pruebas de integración
npm run test:integration

# Ejecutar pruebas en modo observador (útil durante desarrollo)
npm run test:watch
```

### Pruebas E2E
```bash
# Ejecutar todas las pruebas E2E
npm run test:e2e

# Ejecutar pruebas específicas
npm run test:e2e:dashboard
npm run test:e2e:auth
npm run test:e2e:redirect

# Abrir Cypress para ejecución interactiva
npm run cypress:open
```

## Buenas Prácticas

1. **Aislamiento de pruebas**: Cada prueba debe ser independiente y no depender del resultado de otras pruebas.

2. **Mocking de servicios externos**: Utilizar interceptores para servicios externos como Firebase o API calls.

3. **Organización de selectores**: Utilizar atributos `data-cy` para seleccionar elementos en las pruebas E2E.

4. **Variables de entorno**: Usar variables de entorno de Cypress para credenciales y configuración específica de pruebas.

5. **Pruebas parametrizadas**: Utilizar tests con diferentes parámetros para probar múltiples casos con el mismo código de prueba.
