import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock de componentes y hooks necesarios
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/dashboard/medico',
}));

// Mock para el hook que obtiene los datos del médico
const mockDoctorData = {
  id: 'doc-123',
  name: 'Dra. Ana Martínez',
  specialty: 'Cardiología',
  email: 'ana.martinez@altamedica.com',
  phone: '+593987654321',
  licenseNumber: 'MED-12345',
  hospital: 'Hospital Metropolitano',
  consultingRoom: 'Consultorio 305',
  schedule: [
    { day: 'Lunes', startTime: '09:00', endTime: '17:00' },
    { day: 'Miércoles', startTime: '09:00', endTime: '17:00' },
    { day: 'Viernes', startTime: '09:00', endTime: '13:00' }
  ],
  patientCount: 42,
  upcomingAppointments: 5
};

jest.mock('@/app/hooks/useDoctorData', () => ({
  useDoctorData: jest.fn().mockReturnValue({
    doctorData: mockDoctorData,
    loading: false,
    error: null
  })
}));

// Mock para el hook que obtiene las citas del médico
const mockAppointments = [
  {
    id: 'apt-1',
    date: '2025-05-20T10:00:00Z',
    patient: {
      id: 'patient-1',
      name: 'Juan Pérez',
      age: 45,
      gender: 'male'
    },
    status: 'confirmed',
    type: 'presencial',
    reason: 'Control cardíaco'
  },
  {
    id: 'apt-2',
    date: '2025-05-20T11:00:00Z',
    patient: {
      id: 'patient-2',
      name: 'María López',
      age: 62,
      gender: 'female'
    },
    status: 'confirmed',
    type: 'presencial',
    reason: 'Evaluación inicial'
  },
  {
    id: 'apt-3',
    date: '2025-05-20T15:30:00Z',
    patient: {
      id: 'patient-3',
      name: 'Carlos Rodríguez',
      age: 38,
      gender: 'male'
    },
    status: 'pending',
    type: 'telemedicina',
    reason: 'Seguimiento de tratamiento'
  }
];

jest.mock('@/app/hooks/useDoctorAppointments', () => ({
  useDoctorAppointments: jest.fn().mockReturnValue({
    appointments: mockAppointments,
    loading: false,
    error: null
  })
}));

// Mock para el hook que obtiene los pacientes del médico
const mockPatients = [
  {
    id: 'patient-1',
    name: 'Juan Pérez',
    age: 45,
    gender: 'male',
    lastVisit: '2025-04-15T10:00:00Z',
    nextAppointment: '2025-05-20T10:00:00Z',
    conditions: ['Hipertensión', 'Diabetes tipo 2']
  },
  {
    id: 'patient-2',
    name: 'María López',
    age: 62,
    gender: 'female',
    lastVisit: '2025-04-10T11:00:00Z',
    nextAppointment: '2025-05-20T11:00:00Z',
    conditions: ['Arritmia cardíaca']
  },
  {
    id: 'patient-3',
    name: 'Carlos Rodríguez',
    age: 38,
    gender: 'male',
    lastVisit: '2025-04-05T15:30:00Z',
    nextAppointment: '2025-05-20T15:30:00Z',
    conditions: ['Hipertensión']
  }
];

jest.mock('@/app/hooks/useDoctorPatients', () => ({
  useDoctorPatients: jest.fn().mockReturnValue({
    patients: mockPatients,
    loading: false,
    error: null
  })
}));

// Componente simplificado para pruebas
const DoctorDashboard = ({ doctorId }) => {
  // En un componente real, usaríamos los hooks para obtener los datos
  const { doctorData, loading: doctorLoading, error: doctorError } = require('@/app/hooks/useDoctorData').useDoctorData(doctorId);
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = require('@/app/hooks/useDoctorAppointments').useDoctorAppointments(doctorId);
  const { patients, loading: patientsLoading, error: patientsError } = require('@/app/hooks/useDoctorPatients').useDoctorPatients(doctorId);

  const loading = doctorLoading || appointmentsLoading || patientsLoading;
  const error = doctorError || appointmentsError || patientsError;

  if (loading) return <div data-testid="loading">Cargando datos del médico...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  if (!doctorData) return <div data-testid="no-data">No hay datos disponibles</div>;

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para ver detalles del paciente
  const handleViewPatient = (patientId) => {
    console.log(`Ver detalles del paciente: ${patientId}`);
    // En un componente real, esto navegaría a la página del paciente
  };

  // Función para iniciar una consulta de telemedicina
  const handleStartTelemedicine = (appointmentId) => {
    console.log(`Iniciar consulta de telemedicina: ${appointmentId}`);
    // En un componente real, esto iniciaría la sesión de telemedicina
  };

  return (
    <div data-testid="doctor-dashboard">
      <div data-testid="doctor-profile" className="profile-section">
        <h1 data-testid="doctor-name">{doctorData.name}</h1>
        <p data-testid="doctor-specialty">{doctorData.specialty}</p>
        <div data-testid="doctor-stats" className="stats-container">
          <div data-testid="patient-count" className="stat-item">
            <span>Pacientes</span>
            <span>{doctorData.patientCount}</span>
          </div>
          <div data-testid="appointment-count" className="stat-item">
            <span>Citas Próximas</span>
            <span>{doctorData.upcomingAppointments}</span>
          </div>
        </div>
      </div>

      <div data-testid="todays-appointments" className="appointments-section">
        <h2>Citas de Hoy</h2>
        <div data-testid="appointments-list" className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} data-testid={`appointment-${appointment.id}`} className="appointment-item">
              <div data-testid={`appointment-time-${appointment.id}`}>
                {formatDate(appointment.date)}
              </div>
              <div data-testid={`appointment-patient-${appointment.id}`}>
                {appointment.patient.name} ({appointment.patient.age} años)
              </div>
              <div data-testid={`appointment-reason-${appointment.id}`}>
                {appointment.reason}
              </div>
              <div data-testid={`appointment-type-${appointment.id}`}>
                Tipo: {appointment.type}
              </div>
              <div data-testid={`appointment-status-${appointment.id}`}>
                Estado: {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
              </div>
              <div className="appointment-actions">
                <button
                  data-testid={`view-patient-button-${appointment.id}`}
                  onClick={() => handleViewPatient(appointment.patient.id)}
                >
                  Ver Paciente
                </button>
                {appointment.type === 'telemedicina' && (
                  <button
                    data-testid={`telemedicine-button-${appointment.id}`}
                    onClick={() => handleStartTelemedicine(appointment.id)}
                  >
                    Iniciar Telemedicina
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div data-testid="patients-list" className="patients-section">
        <h2>Mis Pacientes</h2>
        <div className="patients-list">
          {patients.map((patient) => (
            <div key={patient.id} data-testid={`patient-${patient.id}`} className="patient-item">
              <div data-testid={`patient-name-${patient.id}`}>
                {patient.name}
              </div>
              <div data-testid={`patient-info-${patient.id}`}>
                {patient.age} años, {patient.gender === 'male' ? 'Masculino' : 'Femenino'}
              </div>
              <div data-testid={`patient-conditions-${patient.id}`}>
                {patient.conditions.join(', ')}
              </div>
              <div data-testid={`patient-last-visit-${patient.id}`}>
                Última visita: {formatDate(patient.lastVisit)}
              </div>
              <button
                data-testid={`view-patient-details-${patient.id}`}
                onClick={() => handleViewPatient(patient.id)}
              >
                Ver Detalles
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

describe('DoctorDashboard', () => {
  it('debe renderizar correctamente el dashboard del médico', () => {
    render(<DoctorDashboard doctorId="doc-123" />);
    
    // Verificar que el componente se renderiza correctamente
    expect(screen.getByTestId('doctor-dashboard')).toBeInTheDocument();
    
    // Verificar que se muestra el perfil del médico
    expect(screen.getByTestId('doctor-profile')).toBeInTheDocument();
    expect(screen.getByTestId('doctor-name')).toHaveTextContent('Dra. Ana Martínez');
    expect(screen.getByTestId('doctor-specialty')).toHaveTextContent('Cardiología');
    
    // Verificar que se muestran las estadísticas del médico
    expect(screen.getByTestId('patient-count')).toHaveTextContent('42');
    expect(screen.getByTestId('appointment-count')).toHaveTextContent('5');
    
    // Verificar que se muestran las citas de hoy
    expect(screen.getByTestId('todays-appointments')).toBeInTheDocument();
    expect(screen.getByTestId('appointment-apt-1')).toBeInTheDocument();
    expect(screen.getByTestId('appointment-apt-2')).toBeInTheDocument();
    expect(screen.getByTestId('appointment-apt-3')).toBeInTheDocument();
    
    // Verificar detalles de la primera cita
    expect(screen.getByTestId('appointment-patient-apt-1')).toHaveTextContent('Juan Pérez (45 años)');
    expect(screen.getByTestId('appointment-reason-apt-1')).toHaveTextContent('Control cardíaco');
    expect(screen.getByTestId('appointment-type-apt-1')).toHaveTextContent('Tipo: presencial');
    
    // Verificar que se muestra el botón de telemedicina solo para citas de telemedicina
    expect(screen.queryByTestId('telemedicine-button-apt-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('telemedicine-button-apt-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('telemedicine-button-apt-3')).toBeInTheDocument();
    
    // Verificar que se muestra la lista de pacientes
    expect(screen.getByTestId('patients-list')).toBeInTheDocument();
    expect(screen.getByTestId('patient-patient-1')).toBeInTheDocument();
    expect(screen.getByTestId('patient-patient-2')).toBeInTheDocument();
    expect(screen.getByTestId('patient-patient-3')).toBeInTheDocument();
    
    // Verificar detalles del primer paciente
    expect(screen.getByTestId('patient-name-patient-1')).toHaveTextContent('Juan Pérez');
    expect(screen.getByTestId('patient-info-patient-1')).toHaveTextContent('45 años, Masculino');
    expect(screen.getByTestId('patient-conditions-patient-1')).toHaveTextContent('Hipertensión, Diabetes tipo 2');
  });

  it('debe permitir ver detalles de un paciente', () => {
    // Espiar console.log para verificar que se llama con el ID correcto
    console.log = jest.fn();
    
    render(<DoctorDashboard doctorId="doc-123" />);
    
    // Hacer clic en el botón de ver detalles del paciente
    fireEvent.click(screen.getByTestId('view-patient-details-patient-1'));
    
    // Verificar que se llama a console.log con el ID correcto
    expect(console.log).toHaveBeenCalledWith('Ver detalles del paciente: patient-1');
  });

  it('debe permitir iniciar una consulta de telemedicina', () => {
    // Espiar console.log para verificar que se llama con el ID correcto
    console.log = jest.fn();
    
    render(<DoctorDashboard doctorId="doc-123" />);
    
    // Hacer clic en el botón de iniciar telemedicina
    fireEvent.click(screen.getByTestId('telemedicine-button-apt-3'));
    
    // Verificar que se llama a console.log con el ID correcto
    expect(console.log).toHaveBeenCalledWith('Iniciar consulta de telemedicina: apt-3');
  });

  it('debe manejar correctamente el estado de carga', () => {
    // Modificamos el mock para simular el estado de carga
    require('@/app/hooks/useDoctorData').useDoctorData.mockReturnValueOnce({
      doctorData: null,
      loading: true,
      error: null
    });
    
    render(<DoctorDashboard doctorId="doc-123" />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Cargando datos del médico...');
  });

  it('debe manejar correctamente los errores', () => {
    // Modificamos el mock para simular un error
    require('@/app/hooks/useDoctorData').useDoctorData.mockReturnValueOnce({
      doctorData: null,
      loading: false,
      error: { message: 'Error al cargar los datos del médico' }
    });
    
    render(<DoctorDashboard doctorId="doc-123" />);
    
    expect(screen.getByTestId('error')).toHaveTextContent('Error: Error al cargar los datos del médico');
  });
});
