/// <reference types="cypress" />

describe('Flujo de Documentos del Paciente', () => {
  beforeEach(() => {
    // Limpiar cookies y almacenamiento local antes de cada prueba
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Interceptamos la llamada a la API de sesión para simular un paciente autenticado
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: {
          uid: 'test-patient-id',
          email: 'paciente@example.com',
          role: 'paciente',
          name: 'Juan Pérez'
        }
      }
    }).as('sessionRequest');
  });

  it('debería mostrar el componente de historial de documentos en el dashboard del paciente', () => {
    // Interceptamos la llamada a la API de documentos del paciente
    cy.intercept('GET', '/api/patients/*/documents', {
      statusCode: 200,
      body: {
        documents: [
          {
            id: 'doc-1',
            name: 'resultados_laboratorio_20250510.pdf',
            type: 'pdf',
            size: 1024000,
            uploadDate: '2025-05-10T10:30:00Z',
            description: 'Resultados de análisis de sangre',
            category: 'laboratory'
          },
          {
            id: 'doc-2',
            name: 'radiografia_torax_20250415.jpg',
            type: 'image',
            size: 2048000,
            uploadDate: '2025-04-15T14:45:00Z',
            description: 'Radiografía de tórax',
            category: 'radiology'
          }
        ]
      }
    }).as('documentsRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Verificamos que el componente de historial de documentos está visible
    cy.findByText('Historial de Documentos').should('be.visible');
    
    // Verificamos que se muestran los documentos
    cy.findByText('resultados_laboratorio_20250510.pdf').should('be.visible');
    cy.findByText('radiografia_torax_20250415.jpg').should('be.visible');
  });

  it('debería permitir subir un nuevo documento desde el dashboard', () => {
    // Interceptamos la llamada a la API de documentos del paciente
    cy.intercept('GET', '/api/patients/*/documents', {
      statusCode: 200,
      body: {
        documents: []
      }
    }).as('documentsRequest');
    
    // Interceptamos la llamada a la API para subir un documento
    cy.intercept('POST', '/api/patients/*/documents', {
      statusCode: 200,
      body: {
        success: true,
        document: {
          id: 'doc-new',
          name: 'electrocardiograma_20250520.pdf',
          type: 'pdf',
          size: 1536000,
          uploadDate: '2025-05-20T15:45:00Z',
          description: 'Electrocardiograma de control',
          category: 'cardiology'
        }
      }
    }).as('uploadDocumentRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequest');
    
    // Verificamos que se muestra el mensaje de no hay documentos
    cy.findByText('No hay documentos disponibles').should('be.visible');
    
    // Hacemos clic en el botón de subir documento
    cy.findByRole('button', { name: /subir documento/i }).click();
    
    // Verificamos que se muestra el modal de subida
    cy.findByText('Subir Nuevo Documento').should('be.visible');
    
    // Adjuntamos un archivo
    cy.get('input[type=file]').selectFile({
      contents: Cypress.Buffer.from('file contents'),
      fileName: 'electrocardiograma_20250520.pdf',
      mimeType: 'application/pdf',
      lastModified: Date.now()
    }, { force: true });
    
    // Ingresamos una descripción
    cy.findByLabelText(/descripción/i).type('Electrocardiograma de control');
    
    // Seleccionamos una categoría
    cy.findByLabelText(/categoría/i).select('cardiology');
    
    // Hacemos clic en el botón de subir
    cy.findByRole('button', { name: /subir/i }).click();
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/documento subido con éxito/i).should('be.visible');
  });

  it('debería permitir filtrar y ordenar documentos', () => {
    // Interceptamos la llamada a la API de documentos del paciente
    cy.intercept('GET', '/api/patients/*/documents', {
      statusCode: 200,
      body: {
        documents: [
          {
            id: 'doc-1',
            name: 'resultados_laboratorio_20250510.pdf',
            type: 'pdf',
            size: 1024000,
            uploadDate: '2025-05-10T10:30:00Z',
            description: 'Resultados de análisis de sangre',
            category: 'laboratory'
          },
          {
            id: 'doc-2',
            name: 'radiografia_torax_20250415.jpg',
            type: 'image',
            size: 2048000,
            uploadDate: '2025-04-15T14:45:00Z',
            description: 'Radiografía de tórax',
            category: 'radiology'
          },
          {
            id: 'doc-3',
            name: 'receta_medica_20250501.pdf',
            type: 'pdf',
            size: 512000,
            uploadDate: '2025-05-01T09:15:00Z',
            description: 'Receta médica - Dra. Ana Martínez',
            category: 'prescription'
          }
        ]
      }
    }).as('documentsRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequest');
    
    // Filtramos por tipo de documento PDF
    cy.findByLabelText(/filtrar por tipo/i).select('pdf');
    
    // Verificamos que solo se muestran los documentos PDF
    cy.findByText('resultados_laboratorio_20250510.pdf').should('be.visible');
    cy.findByText('receta_medica_20250501.pdf').should('be.visible');
    cy.findByText('radiografia_torax_20250415.jpg').should('not.exist');
    
    // Filtramos por categoría de documento (recetas)
    cy.findByLabelText(/filtrar por categoría/i).select('prescription');
    
    // Verificamos que solo se muestran los documentos de recetas
    cy.findByText('receta_medica_20250501.pdf').should('be.visible');
    cy.findByText('resultados_laboratorio_20250510.pdf').should('not.exist');
    
    // Quitamos los filtros
    cy.findByLabelText(/filtrar por tipo/i).select('');
    cy.findByLabelText(/filtrar por categoría/i).select('');
    
    // Ordenamos por fecha (más antiguo primero)
    cy.findByLabelText(/ordenar por/i).select('date_asc');
    
    // Verificamos el orden de los documentos
    cy.findAllByTestId('document-item').then(items => {
      expect(items[0]).to.contain.text('radiografia_torax_20250415.jpg');
      expect(items[1]).to.contain.text('receta_medica_20250501.pdf');
      expect(items[2]).to.contain.text('resultados_laboratorio_20250510.pdf');
    });
  });

  it('debería permitir buscar documentos por nombre o descripción', () => {
    // Interceptamos la llamada a la API de documentos del paciente
    cy.intercept('GET', '/api/patients/*/documents', {
      statusCode: 200,
      body: {
        documents: [
          {
            id: 'doc-1',
            name: 'resultados_laboratorio_20250510.pdf',
            type: 'pdf',
            size: 1024000,
            uploadDate: '2025-05-10T10:30:00Z',
            description: 'Resultados de análisis de sangre',
            category: 'laboratory'
          },
          {
            id: 'doc-2',
            name: 'radiografia_torax_20250415.jpg',
            type: 'image',
            size: 2048000,
            uploadDate: '2025-04-15T14:45:00Z',
            description: 'Radiografía de tórax',
            category: 'radiology'
          },
          {
            id: 'doc-3',
            name: 'receta_medica_20250501.pdf',
            type: 'pdf',
            size: 512000,
            uploadDate: '2025-05-01T09:15:00Z',
            description: 'Receta médica - Dra. Ana Martínez',
            category: 'prescription'
          }
        ]
      }
    }).as('documentsRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequest');
    
    // Buscamos por término "radiografía"
    cy.get('input[placeholder="Buscar documentos..."]').type('radiografía');
    
    // Verificamos que solo se muestra el documento que contiene ese término
    cy.findByText('radiografia_torax_20250415.jpg').should('be.visible');
    cy.findByText('resultados_laboratorio_20250510.pdf').should('not.exist');
    cy.findByText('receta_medica_20250501.pdf').should('not.exist');
    
    // Limpiamos la búsqueda
    cy.get('input[placeholder="Buscar documentos..."]').clear();
    
    // Buscamos por término "Martínez" (que está en la descripción)
    cy.get('input[placeholder="Buscar documentos..."]').type('Martínez');
    
    // Verificamos que solo se muestra el documento que contiene ese término en la descripción
    cy.findByText('receta_medica_20250501.pdf').should('be.visible');
    cy.findByText('resultados_laboratorio_20250510.pdf').should('not.exist');
    cy.findByText('radiografia_torax_20250415.jpg').should('not.exist');
  });

  it('debería permitir visualizar un documento en el visor integrado', () => {
    // Interceptamos la llamada a la API de documentos del paciente
    cy.intercept('GET', '/api/patients/*/documents', {
      statusCode: 200,
      body: {
        documents: [
          {
            id: 'doc-1',
            name: 'resultados_laboratorio_20250510.pdf',
            type: 'pdf',
            size: 1024000,
            uploadDate: '2025-05-10T10:30:00Z',
            description: 'Resultados de análisis de sangre',
            category: 'laboratory',
            url: 'https://example.com/documents/resultados_laboratorio_20250510.pdf'
          }
        ]
      }
    }).as('documentsRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequest');
    
    // Hacemos clic en el botón de ver documento
    cy.findByTestId('view-button-doc-1').click();
    
    // Verificamos que se muestra el visor de documentos
    cy.findByText('Visor de Documentos').should('be.visible');
    
    // Verificamos que se muestra el iframe con el documento
    cy.get('iframe').should('be.visible');
    cy.get('iframe').should('have.attr', 'src').and('include', 'https://example.com/documents');
    
    // Cerramos el visor
    cy.findByRole('button', { name: /cerrar/i }).click();
    
    // Verificamos que se cierra el visor
    cy.findByText('Visor de Documentos').should('not.exist');
  });

  it('debería permitir compartir un documento con un médico', () => {
    // Interceptamos la llamada a la API de documentos del paciente
    cy.intercept('GET', '/api/patients/*/documents', {
      statusCode: 200,
      body: {
        documents: [
          {
            id: 'doc-1',
            name: 'resultados_laboratorio_20250510.pdf',
            type: 'pdf',
            size: 1024000,
            uploadDate: '2025-05-10T10:30:00Z',
            description: 'Resultados de análisis de sangre',
            category: 'laboratory'
          }
        ]
      }
    }).as('documentsRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequest');
    
    // Hacemos clic en el botón de compartir documento
    cy.findByTestId('share-button-doc-1').click();
    
    // Verificamos que se muestra el modal de compartir
    cy.findByText('Compartir Documento').should('be.visible');
    
    // Seleccionamos un médico
    cy.findByLabelText(/seleccionar médico/i).select('doc-1');
    
    // Agregamos un mensaje
    cy.findByLabelText(/mensaje/i).type('Le comparto mis resultados de laboratorio recientes');
    
    // Hacemos clic en el botón de compartir
    cy.findByRole('button', { name: /compartir/i }).click();
    
    // Verificamos que se cierra el modal
    cy.findByText('Compartir Documento').should('not.exist');
    
    // Verificamos que se muestra con quién se compartió
    cy.findByText('Compartido con: Dra. Ana Martínez').should('be.visible');
  });

  it('debería permitir eliminar un documento', () => {
    // Interceptamos la llamada a la API de documentos del paciente
    cy.intercept('GET', '/api/patients/*/documents', {
      statusCode: 200,
      body: {
        documents: [
          {
            id: 'doc-1',
            name: 'resultados_laboratorio_20250510.pdf',
            type: 'pdf',
            size: 1024000,
            uploadDate: '2025-05-10T10:30:00Z',
            description: 'Resultados de análisis de sangre',
            category: 'laboratory'
          },
          {
            id: 'doc-2',
            name: 'radiografia_torax_20250415.jpg',
            type: 'image',
            size: 2048000,
            uploadDate: '2025-04-15T14:45:00Z',
            description: 'Radiografía de tórax',
            category: 'radiology'
          }
        ]
      }
    }).as('documentsRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequest');
    
    // Hacemos clic en el botón de eliminar
    cy.findByTestId('delete-button-doc-1').click();
    
    // Verificamos que se muestra el diálogo de confirmación
    cy.findByText('Confirmar eliminación').should('be.visible');
    
    // Confirmamos la eliminación
    cy.findByRole('button', { name: /confirmar/i }).click();
    
    // Verificamos que el documento ya no aparece en la lista
    cy.findByText('resultados_laboratorio_20250510.pdf').should('not.exist');
    cy.findByText('radiografia_torax_20250415.jpg').should('be.visible');
  });
});
