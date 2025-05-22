# Pruebas de Altamedica

Este directorio contiene las pruebas automatizadas para el proyecto Altamedica. Las pruebas están organizadas en tres categorías principales:

- **components**: Pruebas para componentes React individuales
- **pages**: Pruebas para páginas completas
- **utils**: Pruebas para utilidades y funciones auxiliares

## Configuración

El proyecto utiliza Jest como framework de pruebas y React Testing Library para probar componentes React. La configuración se encuentra en los archivos:

- `jest.config.js`: Configuración principal de Jest
- `jest.setup.js`: Configuración adicional y mocks globales

## Ejecutar las pruebas

Para ejecutar las pruebas, asegúrate de tener instaladas las dependencias necesarias:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom identity-obj-proxy babel-jest
```

Luego, puedes ejecutar las pruebas con los siguientes comandos:

- `npm test`: Ejecuta todas las pruebas una vez
- `npm run test:watch`: Ejecuta las pruebas en modo watch (útil durante el desarrollo)
- `npm run test:coverage`: Ejecuta las pruebas y genera un informe de cobertura

## Pruebas de accesibilidad

El proyecto también incluye pruebas de accesibilidad utilizando Pa11y:

- `npm run test:a11y`: Ejecuta pruebas de accesibilidad en todos los componentes
- `npm run test:a11y:dashboard`: Ejecuta pruebas de accesibilidad solo en los componentes del dashboard
- `npm run test:a11y:auth`: Ejecuta pruebas de accesibilidad solo en los componentes de autenticación

## Añadir nuevas pruebas

Para añadir una nueva prueba:

1. Crea un archivo con el nombre `[ComponentName].test.jsx` en el directorio correspondiente
2. Importa el componente a probar y las utilidades necesarias
3. Escribe las pruebas utilizando la sintaxis de Jest y React Testing Library

Ejemplo:

```jsx
import { render, screen } from '@testing-library/react';
import MiComponente from '../../app/components/MiComponente';

describe('MiComponente', () => {
  it('renderiza correctamente', () => {
    render(<MiComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });
});
```

## Mocks

Para componentes que dependen de contextos, hooks o módulos externos, es recomendable crear mocks para aislar el componente que se está probando. Los mocks globales se encuentran en `jest.setup.js`, pero también puedes crear mocks específicos para cada prueba.

Ejemplo:

```jsx
// Mock de un contexto
jest.mock('../../app/contexts/MiContexto', () => ({
  useMiContexto: () => ({
    valor: 'valor de prueba',
    funcion: jest.fn(),
  }),
}));
```

## Cobertura de código

El objetivo es mantener una cobertura mínima del 30% en todas las métricas (líneas, funciones, ramas y declaraciones). Puedes ver el informe de cobertura ejecutando `npm run test:coverage`.

## Prioridades para futuras pruebas

Para mejorar la calidad del código, se recomienda priorizar las pruebas en las siguientes áreas:

1. **Autenticación**: Flujos de inicio de sesión, registro y recuperación de contraseña
2. **Dashboard del paciente**: Componentes críticos y flujos de usuario
3. **Formularios**: Validación de datos y manejo de errores
4. **API Routes**: Endpoints y manejo de datos
5. **Integración con Firebase**: Operaciones de lectura/escritura en la base de datos
