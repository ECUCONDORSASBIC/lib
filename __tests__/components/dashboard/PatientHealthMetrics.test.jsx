import { render, screen, fireEvent } from '@testing-library/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock de componentes y hooks necesarios
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock para el hook que obtiene los datos de métricas de salud
const mockHealthData = {
  glucose: [
    { date: '2025-04-01', value: 95 },
    { date: '2025-04-15', value: 98 },
    { date: '2025-05-01', value: 92 },
    { date: '2025-05-15', value: 90 }
  ],
  bloodPressure: [
    { date: '2025-04-01', systolic: 125, diastolic: 85 },
    { date: '2025-04-15', systolic: 120, diastolic: 80 },
    { date: '2025-05-01', systolic: 118, diastolic: 78 },
    { date: '2025-05-15', systolic: 115, diastolic: 75 }
  ],
  weight: [
    { date: '2025-04-01', value: 76 },
    { date: '2025-04-15', value: 75.5 },
    { date: '2025-05-01', value: 75 },
    { date: '2025-05-15', value: 74.5 }
  ],
  cholesterol: [
    { date: '2025-03-01', ldl: 110, hdl: 55, total: 180 },
    { date: '2025-05-01', ldl: 105, hdl: 60, total: 175 }
  ]
};

jest.mock('@/app/hooks/usePatientHealthMetrics', () => ({
  usePatientHealthMetrics: jest.fn().mockReturnValue({
    healthData: mockHealthData,
    loading: false,
    error: null
  })
}));

// Componente simplificado para pruebas
const PatientHealthMetrics = ({ patientId, timeRange = 'month' }) => {
  // En un componente real, usaríamos usePatientHealthMetrics para obtener los datos
  const { healthData, loading, error } = require('@/app/hooks/usePatientHealthMetrics').usePatientHealthMetrics(patientId, timeRange);

  if (loading) return <div data-testid="loading">Cargando métricas...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  if (!healthData) return <div data-testid="no-data">No hay datos disponibles</div>;

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PP', { locale: es });
  };

  // Función para cambiar el rango de tiempo
  const handleTimeRangeChange = (newRange) => {
    console.log(`Cambiando rango a: ${newRange}`);
    // En un componente real, esto actualizaría el estado y recargaría los datos
  };

  return (
    <div data-testid="health-metrics">
      <div data-testid="time-range-selector">
        <button 
          data-testid="range-week" 
          onClick={() => handleTimeRangeChange('week')}
          className={timeRange === 'week' ? 'active' : ''}
        >
          Semana
        </button>
        <button 
          data-testid="range-month" 
          onClick={() => handleTimeRangeChange('month')}
          className={timeRange === 'month' ? 'active' : ''}
        >
          Mes
        </button>
        <button 
          data-testid="range-year" 
          onClick={() => handleTimeRangeChange('year')}
          className={timeRange === 'year' ? 'active' : ''}
        >
          Año
        </button>
      </div>

      <div data-testid="glucose-chart" className="metric-chart">
        <h3>Glucosa en Sangre</h3>
        <div className="chart-container">
          {/* Aquí iría el componente de gráfico real */}
          <div className="chart-placeholder">
            {healthData.glucose.map((reading, index) => (
              <div key={index} data-testid={`glucose-reading-${index}`}>
                {formatDate(reading.date)}: {reading.value} mg/dL
              </div>
            ))}
          </div>
        </div>
      </div>

      <div data-testid="blood-pressure-chart" className="metric-chart">
        <h3>Presión Arterial</h3>
        <div className="chart-container">
          {/* Aquí iría el componente de gráfico real */}
          <div className="chart-placeholder">
            {healthData.bloodPressure.map((reading, index) => (
              <div key={index} data-testid={`bp-reading-${index}`}>
                {formatDate(reading.date)}: {reading.systolic}/{reading.diastolic} mmHg
              </div>
            ))}
          </div>
        </div>
      </div>

      <div data-testid="weight-chart" className="metric-chart">
        <h3>Peso</h3>
        <div className="chart-container">
          {/* Aquí iría el componente de gráfico real */}
          <div className="chart-placeholder">
            {healthData.weight.map((reading, index) => (
              <div key={index} data-testid={`weight-reading-${index}`}>
                {formatDate(reading.date)}: {reading.value} kg
              </div>
            ))}
          </div>
        </div>
      </div>

      <div data-testid="cholesterol-chart" className="metric-chart">
        <h3>Colesterol</h3>
        <div className="chart-container">
          {/* Aquí iría el componente de gráfico real */}
          <div className="chart-placeholder">
            {healthData.cholesterol.map((reading, index) => (
              <div key={index} data-testid={`cholesterol-reading-${index}`}>
                {formatDate(reading.date)}: Total: {reading.total}, LDL: {reading.ldl}, HDL: {reading.hdl} mg/dL
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

describe('PatientHealthMetrics', () => {
  it('debe renderizar correctamente las métricas de salud del paciente', () => {
    render(<PatientHealthMetrics patientId="patient-123" />);
    
    // Verificar que el componente se renderiza correctamente
    expect(screen.getByTestId('health-metrics')).toBeInTheDocument();
    
    // Verificar que se muestran los selectores de rango de tiempo
    expect(screen.getByTestId('time-range-selector')).toBeInTheDocument();
    expect(screen.getByTestId('range-week')).toBeInTheDocument();
    expect(screen.getByTestId('range-month')).toBeInTheDocument();
    expect(screen.getByTestId('range-year')).toBeInTheDocument();
    
    // Verificar que se muestran las gráficas de métricas
    expect(screen.getByTestId('glucose-chart')).toBeInTheDocument();
    expect(screen.getByTestId('blood-pressure-chart')).toBeInTheDocument();
    expect(screen.getByTestId('weight-chart')).toBeInTheDocument();
    expect(screen.getByTestId('cholesterol-chart')).toBeInTheDocument();
    
    // Verificar que se muestran los datos de glucosa correctamente
    expect(screen.getByTestId('glucose-reading-0')).toHaveTextContent('95 mg/dL');
    expect(screen.getByTestId('glucose-reading-3')).toHaveTextContent('90 mg/dL');
    
    // Verificar que se muestran los datos de presión arterial correctamente
    expect(screen.getByTestId('bp-reading-0')).toHaveTextContent('125/85 mmHg');
    expect(screen.getByTestId('bp-reading-3')).toHaveTextContent('115/75 mmHg');
    
    // Verificar que se muestran los datos de peso correctamente
    expect(screen.getByTestId('weight-reading-0')).toHaveTextContent('76 kg');
    expect(screen.getByTestId('weight-reading-3')).toHaveTextContent('74.5 kg');
    
    // Verificar que se muestran los datos de colesterol correctamente
    expect(screen.getByTestId('cholesterol-reading-0')).toHaveTextContent('Total: 180, LDL: 110, HDL: 55 mg/dL');
    expect(screen.getByTestId('cholesterol-reading-1')).toHaveTextContent('Total: 175, LDL: 105, HDL: 60 mg/dL');
  });

  it('debe manejar correctamente el cambio de rango de tiempo', () => {
    // Espiar console.log para verificar que se llama con el rango correcto
    console.log = jest.fn();
    
    render(<PatientHealthMetrics patientId="patient-123" timeRange="month" />);
    
    // Hacer clic en el botón de rango semanal
    fireEvent.click(screen.getByTestId('range-week'));
    
    // Verificar que se llama a console.log con el rango correcto
    expect(console.log).toHaveBeenCalledWith('Cambiando rango a: week');
    
    // Hacer clic en el botón de rango anual
    fireEvent.click(screen.getByTestId('range-year'));
    
    // Verificar que se llama a console.log con el rango correcto
    expect(console.log).toHaveBeenCalledWith('Cambiando rango a: year');
  });

  it('debe manejar correctamente el estado de carga', () => {
    // Modificamos el mock para simular el estado de carga
    require('@/app/hooks/usePatientHealthMetrics').usePatientHealthMetrics.mockReturnValueOnce({
      healthData: null,
      loading: true,
      error: null
    });
    
    render(<PatientHealthMetrics patientId="patient-123" />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Cargando métricas...');
  });

  it('debe manejar correctamente los errores', () => {
    // Modificamos el mock para simular un error
    require('@/app/hooks/usePatientHealthMetrics').usePatientHealthMetrics.mockReturnValueOnce({
      healthData: null,
      loading: false,
      error: { message: 'Error al cargar las métricas de salud' }
    });
    
    render(<PatientHealthMetrics patientId="patient-123" />);
    
    expect(screen.getByTestId('error')).toHaveTextContent('Error: Error al cargar las métricas de salud');
  });

  it('debe manejar correctamente la ausencia de datos', () => {
    // Modificamos el mock para simular la ausencia de datos
    require('@/app/hooks/usePatientHealthMetrics').usePatientHealthMetrics.mockReturnValueOnce({
      healthData: null,
      loading: false,
      error: null
    });
    
    render(<PatientHealthMetrics patientId="patient-123" />);
    
    expect(screen.getByTestId('no-data')).toHaveTextContent('No hay datos disponibles');
  });
});
