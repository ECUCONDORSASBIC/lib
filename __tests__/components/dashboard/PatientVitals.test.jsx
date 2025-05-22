import { render, screen } from '@testing-library/react';

// Mock de componentes y hooks necesarios
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/app/hooks/usePatientData', () => ({
  usePatientData: jest.fn().mockReturnValue({
    patientData: {
      name: 'Juan Pérez',
      age: 45,
      vitals: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 36.5,
        oxygenSaturation: 98,
        respiratoryRate: 16,
        weight: 75,
        height: 175,
        bmi: 24.5
      },
      lastUpdated: '2025-05-15T10:30:00Z'
    },
    loading: false,
    error: null
  })
}));

// Componente simplificado de PatientVitals para pruebas
const PatientVitals = ({ patientId }) => {
  // En un componente real, usaríamos usePatientData para obtener los datos
  const { patientData, loading, error } = require('@/app/hooks/usePatientData').usePatientData(patientId);

  if (loading) return <div data-testid="loading">Cargando...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  if (!patientData) return <div data-testid="no-data">No hay datos disponibles</div>;

  const { vitals, lastUpdated } = patientData;

  return (
    <div data-testid="patient-vitals">
      <h2 data-testid="section-title">Signos Vitales</h2>
      <p data-testid="last-updated">
        Última actualización: {new Date(lastUpdated).toLocaleString()}
      </p>
      <div data-testid="vitals-grid">
        <div data-testid="vital-bp">
          <span>Presión Arterial</span>
          <span>{vitals.bloodPressure} mmHg</span>
        </div>
        <div data-testid="vital-hr">
          <span>Frecuencia Cardíaca</span>
          <span>{vitals.heartRate} lpm</span>
        </div>
        <div data-testid="vital-temp">
          <span>Temperatura</span>
          <span>{vitals.temperature} °C</span>
        </div>
        <div data-testid="vital-spo2">
          <span>Saturación de Oxígeno</span>
          <span>{vitals.oxygenSaturation}%</span>
        </div>
        <div data-testid="vital-rr">
          <span>Frecuencia Respiratoria</span>
          <span>{vitals.respiratoryRate} rpm</span>
        </div>
        <div data-testid="vital-bmi">
          <span>IMC</span>
          <span>{vitals.bmi} kg/m²</span>
        </div>
      </div>
    </div>
  );
};

describe('PatientVitals', () => {
  it('debe renderizar correctamente los signos vitales del paciente', () => {
    render(<PatientVitals patientId="patient-123" />);
    
    // Verificar que el componente se renderiza correctamente
    expect(screen.getByTestId('patient-vitals')).toBeInTheDocument();
    expect(screen.getByTestId('section-title')).toHaveTextContent('Signos Vitales');
    
    // Verificar que se muestran los signos vitales correctos
    expect(screen.getByTestId('vital-bp')).toHaveTextContent('120/80 mmHg');
    expect(screen.getByTestId('vital-hr')).toHaveTextContent('72 lpm');
    expect(screen.getByTestId('vital-temp')).toHaveTextContent('36.5 °C');
    expect(screen.getByTestId('vital-spo2')).toHaveTextContent('98%');
    expect(screen.getByTestId('vital-rr')).toHaveTextContent('16 rpm');
    expect(screen.getByTestId('vital-bmi')).toHaveTextContent('24.5 kg/m²');
    
    // Verificar que se muestra la fecha de última actualización
    expect(screen.getByTestId('last-updated')).toHaveTextContent('Última actualización:');
  });

  it('debe manejar correctamente el estado de carga', () => {
    // Modificamos el mock para simular el estado de carga
    require('@/app/hooks/usePatientData').usePatientData.mockReturnValueOnce({
      patientData: null,
      loading: true,
      error: null
    });
    
    render(<PatientVitals patientId="patient-123" />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Cargando...');
  });

  it('debe manejar correctamente los errores', () => {
    // Modificamos el mock para simular un error
    require('@/app/hooks/usePatientData').usePatientData.mockReturnValueOnce({
      patientData: null,
      loading: false,
      error: { message: 'Error al cargar los datos del paciente' }
    });
    
    render(<PatientVitals patientId="patient-123" />);
    
    expect(screen.getByTestId('error')).toHaveTextContent('Error: Error al cargar los datos del paciente');
  });

  it('debe manejar correctamente la ausencia de datos', () => {
    // Modificamos el mock para simular la ausencia de datos
    require('@/app/hooks/usePatientData').usePatientData.mockReturnValueOnce({
      patientData: null,
      loading: false,
      error: null
    });
    
    render(<PatientVitals patientId="patient-123" />);
    
    expect(screen.getByTestId('no-data')).toHaveTextContent('No hay datos disponibles');
  });
});
