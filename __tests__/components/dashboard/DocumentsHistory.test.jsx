import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentsHistory from '@components/dashboard/paciente/DocumentsHistory';

// Mock de Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  getDownloadURL: jest.fn().mockResolvedValue('https://example.com/document.pdf'),
  uploadBytes: jest.fn().mockResolvedValue({ metadata: { name: 'document.pdf' } }),
  listAll: jest.fn().mockResolvedValue({
    items: [
      { name: 'resultados_laboratorio_20250510.pdf' },
      { name: 'radiografia_torax_20250415.jpg' },
      { name: 'receta_medica_20250501.pdf' }
    ]
  })
}));

// Mock de las funciones de autenticación
jest.mock('@app/lib/firebase/auth', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ uid: 'test-patient-id' })
}));

// Mock de useParams
jest.mock('next/navigation', () => ({
  useParams: jest.fn().mockReturnValue({ id: 'test-patient-id' }),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    back: jest.fn()
  })
}));

describe('DocumentsHistory Component', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('renderiza correctamente el componente', async () => {
    render(<DocumentsHistory patientId="test-patient-id" />);
    
    // Verificar que el título se muestra correctamente
    expect(screen.getByText('Historial de Documentos')).toBeInTheDocument();
    
    // Verificar que el botón para subir documentos está presente
    expect(screen.getByText('Subir Documento')).toBeInTheDocument();
    
    // Esperar a que se carguen los documentos
    await waitFor(() => {
      expect(screen.getByText('resultados_laboratorio_20250510.pdf')).toBeInTheDocument();
      expect(screen.getByText('radiografia_torax_20250415.jpg')).toBeInTheDocument();
      expect(screen.getByText('receta_medica_20250501.pdf')).toBeInTheDocument();
    });
  });

  it('muestra un mensaje cuando no hay documentos', async () => {
    // Sobrescribir el mock para simular que no hay documentos
    require('firebase/storage').listAll.mockResolvedValueOnce({
      items: []
    });
    
    render(<DocumentsHistory patientId="test-patient-id" />);
    
    // Esperar a que se muestre el mensaje de no hay documentos
    await waitFor(() => {
      expect(screen.getByText('No hay documentos disponibles')).toBeInTheDocument();
    });
  });

  it('permite subir un nuevo documento', async () => {
    render(<DocumentsHistory patientId="test-patient-id" />);
    
    // Simular clic en el botón de subir documento
    fireEvent.click(screen.getByText('Subir Documento'));
    
    // Verificar que se muestra el modal de subida
    expect(screen.getByText('Subir Nuevo Documento')).toBeInTheDocument();
    
    // Crear un archivo de prueba
    const file = new File(['test content'], 'test_document.pdf', { type: 'application/pdf' });
    
    // Simular la selección del archivo
    const fileInput = screen.getByLabelText(/seleccionar archivo/i);
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Ingresar una descripción
    const descriptionInput = screen.getByLabelText(/descripción/i);
    fireEvent.change(descriptionInput, { target: { value: 'Resultados de análisis de sangre' } });
    
    // Simular clic en el botón de subir
    fireEvent.click(screen.getByRole('button', { name: /subir/i }));
    
    // Verificar que se llama a la función de subida
    await waitFor(() => {
      expect(require('firebase/storage').uploadBytes).toHaveBeenCalled();
    });
    
    // Verificar que se muestra el mensaje de éxito
    await waitFor(() => {
      expect(screen.getByText('Documento subido con éxito')).toBeInTheDocument();
    });
  });

  it('permite descargar un documento', async () => {
    render(<DocumentsHistory patientId="test-patient-id" />);
    
    // Esperar a que se carguen los documentos
    await waitFor(() => {
      expect(screen.getByText('resultados_laboratorio_20250510.pdf')).toBeInTheDocument();
    });
    
    // Simular clic en el botón de descargar
    const downloadButtons = screen.getAllByRole('button', { name: /descargar/i });
    fireEvent.click(downloadButtons[0]);
    
    // Verificar que se llama a la función para obtener la URL de descarga
    await waitFor(() => {
      expect(require('firebase/storage').getDownloadURL).toHaveBeenCalled();
    });
  });

  it('muestra un mensaje de error si falla la carga de documentos', async () => {
    // Sobrescribir el mock para simular un error
    require('firebase/storage').listAll.mockRejectedValueOnce(new Error('Error al cargar documentos'));
    
    render(<DocumentsHistory patientId="test-patient-id" />);
    
    // Esperar a que se muestre el mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los documentos. Intente nuevamente.')).toBeInTheDocument();
    });
  });

  it('muestra un mensaje de error si falla la subida de un documento', async () => {
    // Sobrescribir el mock para simular un error en la subida
    require('firebase/storage').uploadBytes.mockRejectedValueOnce(new Error('Error al subir documento'));
    
    render(<DocumentsHistory patientId="test-patient-id" />);
    
    // Simular clic en el botón de subir documento
    fireEvent.click(screen.getByText('Subir Documento'));
    
    // Crear un archivo de prueba
    const file = new File(['test content'], 'test_document.pdf', { type: 'application/pdf' });
    
    // Simular la selección del archivo
    const fileInput = screen.getByLabelText(/seleccionar archivo/i);
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Ingresar una descripción
    const descriptionInput = screen.getByLabelText(/descripción/i);
    fireEvent.change(descriptionInput, { target: { value: 'Resultados de análisis de sangre' } });
    
    // Simular clic en el botón de subir
    fireEvent.click(screen.getByRole('button', { name: /subir/i }));
    
    // Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Error al subir el documento. Intente nuevamente.')).toBeInTheDocument();
    });
  });

  it('permite filtrar documentos por tipo', async () => {
    render(<DocumentsHistory patientId="test-patient-id" />);
    
    // Esperar a que se carguen los documentos
    await waitFor(() => {
      expect(screen.getByText('resultados_laboratorio_20250510.pdf')).toBeInTheDocument();
      expect(screen.getByText('radiografia_torax_20250415.jpg')).toBeInTheDocument();
    });
    
    // Seleccionar el filtro de tipo PDF
    const filterSelect = screen.getByLabelText(/filtrar por tipo/i);
    fireEvent.change(filterSelect, { target: { value: 'pdf' } });
    
    // Verificar que solo se muestran los documentos PDF
    await waitFor(() => {
      expect(screen.getByText('resultados_laboratorio_20250510.pdf')).toBeInTheDocument();
      expect(screen.getByText('receta_medica_20250501.pdf')).toBeInTheDocument();
      expect(screen.queryByText('radiografia_torax_20250415.jpg')).not.toBeInTheDocument();
    });
  });

  it('permite ordenar documentos por fecha', async () => {
    render(<DocumentsHistory patientId="test-patient-id" />);
    
    // Esperar a que se carguen los documentos
    await waitFor(() => {
      expect(screen.getByText('resultados_laboratorio_20250510.pdf')).toBeInTheDocument();
    });
    
    // Seleccionar el ordenamiento por fecha descendente
    const sortSelect = screen.getByLabelText(/ordenar por/i);
    fireEvent.change(sortSelect, { target: { value: 'date_desc' } });
    
    // Verificar el orden de los documentos (esto depende de la implementación)
    // En este caso, asumimos que el componente ordena los elementos en el DOM
    const documentItems = screen.getAllByTestId('document-item');
    expect(documentItems[0]).toHaveTextContent('resultados_laboratorio_20250510.pdf');
    expect(documentItems[1]).toHaveTextContent('receta_medica_20250501.pdf');
    expect(documentItems[2]).toHaveTextContent('radiografia_torax_20250415.jpg');
  });
});
