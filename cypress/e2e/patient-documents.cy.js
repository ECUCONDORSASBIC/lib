/// <reference types="cypress" />

describe('Flujo de Gestión de Documentos del Paciente', () => {
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

  it('debería mostrar el historial de documentos del paciente', () => {
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
    
    // Verificamos que se muestra el componente de historial de documentos
    cy.findByText('Historial de Documentos').should('be.visible');
    
    // Verificamos que se muestran los documentos
    cy.findByText('resultados_laboratorio_20250510.pdf').should('be.visible');
    cy.findByText('radiografia_torax_20250415.jpg').should('be.visible');
    cy.findByText('receta_medica_20250501.pdf').should('be.visible');
    
    // Verificamos que se muestran las descripciones
    cy.findByText('Resultados de análisis de sangre').should('be.visible');
    cy.findByText('Radiografía de tórax').should('be.visible');
    cy.findByText('Receta médica - Dra. Ana Martínez').should('be.visible');
  });

  it('debería permitir filtrar documentos por tipo y categoría', () => {
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
    
    // Verificamos que se muestran todos los documentos nuevamente
    cy.findByText('resultados_laboratorio_20250510.pdf').should('be.visible');
    cy.findByText('radiografia_torax_20250415.jpg').should('be.visible');
    cy.findByText('receta_medica_20250501.pdf').should('be.visible');
  });

  it('debería permitir ordenar documentos por fecha y nombre', () => {
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
    
    // Ordenamos por fecha (más reciente primero)
    cy.findByLabelText(/ordenar por/i).select('date_desc');
    
    // Verificamos el orden de los documentos
    cy.findAllByTestId('document-item').then(items => {
      expect(items[0]).to.contain.text('resultados_laboratorio_20250510.pdf');
      expect(items[1]).to.contain.text('receta_medica_20250501.pdf');
      expect(items[2]).to.contain.text('radiografia_torax_20250415.jpg');
    });
    
    // Ordenamos por fecha (más antiguo primero)
    cy.findByLabelText(/ordenar por/i).select('date_asc');
    
    // Verificamos el orden de los documentos
    cy.findAllByTestId('document-item').then(items => {
      expect(items[0]).to.contain.text('radiografia_torax_20250415.jpg');
      expect(items[1]).to.contain.text('receta_medica_20250501.pdf');
      expect(items[2]).to.contain.text('resultados_laboratorio_20250510.pdf');
    });
    
    // Ordenamos por nombre (A-Z)
    cy.findByLabelText(/ordenar por/i).select('name_asc');
    
    // Verificamos el orden de los documentos
    cy.findAllByTestId('document-item').then(items => {
      expect(items[0]).to.contain.text('radiografia_torax_20250415.jpg');
      expect(items[1]).to.contain.text('receta_medica_20250501.pdf');
      expect(items[2]).to.contain.text('resultados_laboratorio_20250510.pdf');
    });
  });

  it('debería permitir subir un nuevo documento', () => {
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
    
    // Esperamos a que se complete la solicitud de subida
    cy.wait('@uploadDocumentRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/documento subido con éxito/i).should('be.visible');
    
    // Verificamos que se muestra el nuevo documento en la lista
    cy.findByText('electrocardiograma_20250520.pdf').should('be.visible');
  });

  it('debería permitir descargar un documento', () => {
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
    
    // Interceptamos la llamada a la API para obtener la URL de descarga
    cy.intercept('GET', '/api/documents/*/download', {
      statusCode: 200,
      body: {
        downloadUrl: 'https://example.com/documents/resultados_laboratorio_20250510.pdf'
      }
    }).as('getDownloadUrlRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequest');
    
    // Hacemos clic en el botón de descargar
    cy.findByTestId('download-button-doc-1').click();
    
    // Esperamos a que se complete la solicitud de URL de descarga
    cy.wait('@getDownloadUrlRequest');
    
    // Verificamos que se inicia la descarga
    // Nota: Cypress no puede verificar descargas reales, pero podemos verificar que se llamó a la API
    cy.get('@getDownloadUrlRequest').its('response.statusCode').should('eq', 200);
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
    
    // Interceptamos la llamada a la API para eliminar un documento
    cy.intercept('DELETE', '/api/documents/*', {
      statusCode: 200,
      body: {
        success: true
      }
    }).as('deleteDocumentRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequest');
    
    // Hacemos clic en el botón de eliminar
    cy.findByTestId('delete-button-doc-1').click();
    
    // Confirmamos la eliminación
    cy.findByRole('button', { name: /confirmar/i }).click();
    
    // Esperamos a que se complete la solicitud de eliminación
    cy.wait('@deleteDocumentRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/documento eliminado con éxito/i).should('be.visible');
    
    // Verificamos que el documento ya no aparece en la lista
    cy.findByText('resultados_laboratorio_20250510.pdf').should('not.exist');
    cy.findByText('radiografia_torax_20250415.jpg').should('be.visible');
  });

  it('debería mostrar un mensaje cuando no hay documentos', () => {
    // Interceptamos la llamada a la API de documentos del paciente
    cy.intercept('GET', '/api/patients/*/documents', {
      statusCode: 200,
      body: {
        documents: []
      }
    }).as('documentsRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequest');
    
    // Verificamos que se muestra el mensaje de no hay documentos
    cy.findByText('No hay documentos disponibles').should('be.visible');
    
    // Verificamos que se muestra el botón para subir documentos
    cy.findByRole('button', { name: /subir documento/i }).should('be.visible');
  });

  it('debería mostrar un mensaje de error si falla la carga de documentos', () => {
    // Interceptamos la llamada a la API de documentos del paciente para simular un error
    cy.intercept('GET', '/api/patients/*/documents', {
      statusCode: 500,
      body: {
        error: 'Error al cargar los documentos'
      }
    }).as('documentsRequestError');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos con error
    cy.wait('@documentsRequestError');
    
    // Verificamos que se muestra el mensaje de error
    cy.findByText('Error al cargar los documentos. Intente nuevamente.').should('be.visible');
    
    // Verificamos que se muestra el botón para reintentar
    cy.findByRole('button', { name: /reintentar/i }).should('be.visible');
    
    // Simulamos que la API responde correctamente en el segundo intento
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
    }).as('documentsRequestRetry');
    
    // Hacemos clic en el botón de reintentar
    cy.findByRole('button', { name: /reintentar/i }).click();
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequestRetry');
    
    // Verificamos que se muestran los documentos
    cy.findByText('resultados_laboratorio_20250510.pdf').should('be.visible');
  });

  it('debería permitir ver un documento en el visor integrado', () => {
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
    
    // Interceptamos la llamada a la API para obtener la URL de visualización
    cy.intercept('GET', '/api/documents/*/view', {
      statusCode: 200,
      body: {
        viewUrl: 'https://example.com/documents/view/resultados_laboratorio_20250510.pdf'
      }
    }).as('getViewUrlRequest');
    
    // Visitamos el dashboard del paciente
    cy.visit('/dashboard/paciente/test-patient-id');
    
    // Esperamos a que se complete la solicitud de sesión
    cy.wait('@sessionRequest');
    
    // Esperamos a que se complete la solicitud de documentos
    cy.wait('@documentsRequest');
    
    // Hacemos clic en el botón de ver documento
    cy.findByTestId('view-button-doc-1').click();
    
    // Esperamos a que se complete la solicitud de URL de visualización
    cy.wait('@getViewUrlRequest');
    
    // Verificamos que se muestra el visor de documentos
    cy.findByText('Visor de Documentos').should('be.visible');
    cy.findByText('resultados_laboratorio_20250510.pdf').should('be.visible');
    
    // Verificamos que se muestra el iframe con el documento
    cy.get('iframe').should('be.visible');
    cy.get('iframe').should('have.attr', 'src').and('include', 'https://example.com/documents/view');
    
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
    
    // Interceptamos la llamada a la API de médicos
    cy.intercept('GET', '/api/doctors', {
      statusCode: 200,
      body: {
        doctors: [
          {
            id: 'doc-1',
            name: 'Dra. Ana Martínez',
            specialty: 'Cardiología'
          },
          {
            id: 'doc-2',
            name: 'Dr. Carlos Ramírez',
            specialty: 'Neurología'
          }
        ]
      }
    }).as('doctorsRequest');
    
    // Interceptamos la llamada a la API para compartir un documento
    cy.intercept('POST', '/api/documents/*/share', {
      statusCode: 200,
      body: {
        success: true,
        sharedWith: {
          doctorId: 'doc-1',
          doctorName: 'Dra. Ana Martínez',
          sharedAt: '2025-05-20T16:30:00Z'
        }
      }
    }).as('shareDocumentRequest');
    
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
    
    // Esperamos a que se complete la solicitud de médicos
    cy.wait('@doctorsRequest');
    
    // Seleccionamos un médico
    cy.findByLabelText(/seleccionar médico/i).select('doc-1');
    
    // Agregamos un mensaje
    cy.findByLabelText(/mensaje/i).type('Le comparto mis resultados de laboratorio recientes');
    
    // Hacemos clic en el botón de compartir
    cy.findByRole('button', { name: /compartir/i }).click();
    
    // Esperamos a que se complete la solicitud de compartir
    cy.wait('@shareDocumentRequest');
    
    // Verificamos que se muestra un mensaje de éxito
    cy.findByText(/documento compartido con éxito/i).should('be.visible');
    
    // Verificamos que se muestra con quién se compartió
    cy.findByText('Compartido con: Dra. Ana Martínez').should('be.visible');
  });
});
