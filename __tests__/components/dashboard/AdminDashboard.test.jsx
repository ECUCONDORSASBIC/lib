import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock de componentes y hooks necesarios
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/dashboard/admin',
}));

// Mock para el hook que obtiene las estadísticas del sistema
const mockSystemStats = {
  totalPatients: 1250,
  totalDoctors: 45,
  activeAppointments: 78,
  pendingAppointments: 23,
  completedAppointments: 3450,
  telemedicineAppointments: 42,
  newUsersThisMonth: 87,
  averageAppointmentDuration: 25, // minutos
  systemUptime: 99.8, // porcentaje
  activeUsers: 156
};

jest.mock('@/app/hooks/useSystemStats', () => ({
  useSystemStats: jest.fn().mockReturnValue({
    stats: mockSystemStats,
    loading: false,
    error: null
  })
}));

// Mock para el hook que obtiene los usuarios del sistema
const mockUsers = [
  {
    id: 'user-1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'paciente',
    status: 'active',
    createdAt: '2025-01-15T10:00:00Z',
    lastLogin: '2025-05-18T14:30:00Z'
  },
  {
    id: 'user-2',
    name: 'Dra. Ana Martínez',
    email: 'ana.martinez@altamedica.com',
    role: 'medico',
    specialty: 'Cardiología',
    status: 'active',
    createdAt: '2024-11-10T09:00:00Z',
    lastLogin: '2025-05-19T08:45:00Z'
  },
  {
    id: 'user-3',
    name: 'Carlos Rodríguez',
    email: 'carlos@example.com',
    role: 'paciente',
    status: 'inactive',
    createdAt: '2025-02-20T11:30:00Z',
    lastLogin: '2025-03-15T16:20:00Z'
  },
  {
    id: 'user-4',
    name: 'Admin Principal',
    email: 'admin@altamedica.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-10-01T08:00:00Z',
    lastLogin: '2025-05-19T07:30:00Z'
  }
];

jest.mock('@/app/hooks/useSystemUsers', () => ({
  useSystemUsers: jest.fn().mockReturnValue({
    users: mockUsers,
    loading: false,
    error: null
  })
}));

// Mock para el hook que obtiene los registros del sistema
const mockSystemLogs = [
  {
    id: 'log-1',
    timestamp: '2025-05-19T15:30:00Z',
    level: 'info',
    message: 'Usuario juan@example.com inició sesión',
    source: 'auth-service'
  },
  {
    id: 'log-2',
    timestamp: '2025-05-19T14:45:00Z',
    level: 'warning',
    message: 'Intento de acceso fallido para usuario desconocido',
    source: 'auth-service'
  },
  {
    id: 'log-3',
    timestamp: '2025-05-19T14:00:00Z',
    level: 'error',
    message: 'Error en la conexión con el servicio de telemedicina',
    source: 'telemedicine-service'
  },
  {
    id: 'log-4',
    timestamp: '2025-05-19T13:30:00Z',
    level: 'info',
    message: 'Cita ID apt-123 completada exitosamente',
    source: 'appointment-service'
  },
  {
    id: 'log-5',
    timestamp: '2025-05-19T13:00:00Z',
    level: 'info',
    message: 'Nuevo usuario registrado: carlos@example.com',
    source: 'user-service'
  }
];

jest.mock('@/app/hooks/useSystemLogs', () => ({
  useSystemLogs: jest.fn().mockReturnValue({
    logs: mockSystemLogs,
    loading: false,
    error: null
  })
}));

// Componente simplificado para pruebas
const AdminDashboard = () => {
  // En un componente real, usaríamos los hooks para obtener los datos
  const { stats, loading: statsLoading, error: statsError } = require('@/app/hooks/useSystemStats').useSystemStats();
  const { users, loading: usersLoading, error: usersError } = require('@/app/hooks/useSystemUsers').useSystemUsers();
  const { logs, loading: logsLoading, error: logsError } = require('@/app/hooks/useSystemLogs').useSystemLogs();

  const loading = statsLoading || usersLoading || logsLoading;
  const error = statsError || usersError || logsError;

  if (loading) return <div data-testid="loading">Cargando datos del sistema...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para manejar la activación/desactivación de usuarios
  const handleToggleUserStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    console.log(`Cambiar estado del usuario ${userId} a ${newStatus}`);
    // En un componente real, esto llamaría a una API para actualizar el estado
  };

  // Función para ver detalles de un usuario
  const handleViewUserDetails = (userId) => {
    console.log(`Ver detalles del usuario: ${userId}`);
    // En un componente real, esto navegaría a la página de detalles del usuario
  };

  return (
    <div data-testid="admin-dashboard">
      <h1 data-testid="dashboard-title">Panel de Administración</h1>
      
      <div data-testid="system-stats" className="stats-section">
        <h2>Estadísticas del Sistema</h2>
        <div className="stats-grid">
          <div data-testid="stat-patients" className="stat-item">
            <span>Pacientes Totales</span>
            <span>{stats.totalPatients}</span>
          </div>
          <div data-testid="stat-doctors" className="stat-item">
            <span>Médicos</span>
            <span>{stats.totalDoctors}</span>
          </div>
          <div data-testid="stat-active-appointments" className="stat-item">
            <span>Citas Activas</span>
            <span>{stats.activeAppointments}</span>
          </div>
          <div data-testid="stat-pending-appointments" className="stat-item">
            <span>Citas Pendientes</span>
            <span>{stats.pendingAppointments}</span>
          </div>
          <div data-testid="stat-telemedicine" className="stat-item">
            <span>Citas de Telemedicina</span>
            <span>{stats.telemedicineAppointments}</span>
          </div>
          <div data-testid="stat-new-users" className="stat-item">
            <span>Nuevos Usuarios (Mes)</span>
            <span>{stats.newUsersThisMonth}</span>
          </div>
          <div data-testid="stat-uptime" className="stat-item">
            <span>Tiempo de Actividad</span>
            <span>{stats.systemUptime}%</span>
          </div>
          <div data-testid="stat-active-users" className="stat-item">
            <span>Usuarios Activos</span>
            <span>{stats.activeUsers}</span>
          </div>
        </div>
      </div>
      
      <div data-testid="users-management" className="users-section">
        <h2>Gestión de Usuarios</h2>
        <div className="filters">
          <select data-testid="role-filter">
            <option value="all">Todos los roles</option>
            <option value="paciente">Pacientes</option>
            <option value="medico">Médicos</option>
            <option value="admin">Administradores</option>
          </select>
          <select data-testid="status-filter">
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button data-testid="add-user-button">Añadir Usuario</button>
        </div>
        <div data-testid="users-table" className="users-table">
          <div className="table-header">
            <div>Nombre</div>
            <div>Email</div>
            <div>Rol</div>
            <div>Estado</div>
            <div>Último Acceso</div>
            <div>Acciones</div>
          </div>
          {users.map((user) => (
            <div key={user.id} data-testid={`user-${user.id}`} className="table-row">
              <div data-testid={`user-name-${user.id}`}>{user.name}</div>
              <div data-testid={`user-email-${user.id}`}>{user.email}</div>
              <div data-testid={`user-role-${user.id}`}>{user.role}</div>
              <div data-testid={`user-status-${user.id}`}>{user.status}</div>
              <div data-testid={`user-last-login-${user.id}`}>{formatDate(user.lastLogin)}</div>
              <div className="actions">
                <button
                  data-testid={`view-user-button-${user.id}`}
                  onClick={() => handleViewUserDetails(user.id)}
                >
                  Ver
                </button>
                <button
                  data-testid={`toggle-status-button-${user.id}`}
                  onClick={() => handleToggleUserStatus(user.id, user.status)}
                >
                  {user.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div data-testid="system-logs" className="logs-section">
        <h2>Registros del Sistema</h2>
        <div className="filters">
          <select data-testid="log-level-filter">
            <option value="all">Todos los niveles</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <select data-testid="log-source-filter">
            <option value="all">Todas las fuentes</option>
            <option value="auth-service">Servicio de Autenticación</option>
            <option value="appointment-service">Servicio de Citas</option>
            <option value="user-service">Servicio de Usuarios</option>
            <option value="telemedicine-service">Servicio de Telemedicina</option>
          </select>
        </div>
        <div data-testid="logs-table" className="logs-table">
          {logs.map((log) => (
            <div key={log.id} data-testid={`log-${log.id}`} className={`log-item log-${log.level}`}>
              <div data-testid={`log-timestamp-${log.id}`}>{formatDate(log.timestamp)}</div>
              <div data-testid={`log-level-${log.id}`}>{log.level}</div>
              <div data-testid={`log-source-${log.id}`}>{log.source}</div>
              <div data-testid={`log-message-${log.id}`}>{log.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

describe('AdminDashboard', () => {
  it('debe renderizar correctamente el dashboard de administrador', () => {
    render(<AdminDashboard />);
    
    // Verificar que el componente se renderiza correctamente
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Panel de Administración');
    
    // Verificar que se muestran las estadísticas del sistema
    expect(screen.getByTestId('system-stats')).toBeInTheDocument();
    expect(screen.getByTestId('stat-patients')).toHaveTextContent('1250');
    expect(screen.getByTestId('stat-doctors')).toHaveTextContent('45');
    expect(screen.getByTestId('stat-active-appointments')).toHaveTextContent('78');
    expect(screen.getByTestId('stat-telemedicine')).toHaveTextContent('42');
    expect(screen.getByTestId('stat-uptime')).toHaveTextContent('99.8%');
    
    // Verificar que se muestra la gestión de usuarios
    expect(screen.getByTestId('users-management')).toBeInTheDocument();
    expect(screen.getByTestId('role-filter')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter')).toBeInTheDocument();
    expect(screen.getByTestId('add-user-button')).toBeInTheDocument();
    
    // Verificar que se muestran los usuarios
    expect(screen.getByTestId('users-table')).toBeInTheDocument();
    expect(screen.getByTestId('user-user-1')).toBeInTheDocument();
    expect(screen.getByTestId('user-user-2')).toBeInTheDocument();
    expect(screen.getByTestId('user-user-3')).toBeInTheDocument();
    expect(screen.getByTestId('user-user-4')).toBeInTheDocument();
    
    // Verificar detalles del primer usuario
    expect(screen.getByTestId('user-name-user-1')).toHaveTextContent('Juan Pérez');
    expect(screen.getByTestId('user-email-user-1')).toHaveTextContent('juan@example.com');
    expect(screen.getByTestId('user-role-user-1')).toHaveTextContent('paciente');
    expect(screen.getByTestId('user-status-user-1')).toHaveTextContent('active');
    
    // Verificar que se muestran los registros del sistema
    expect(screen.getByTestId('system-logs')).toBeInTheDocument();
    expect(screen.getByTestId('log-level-filter')).toBeInTheDocument();
    expect(screen.getByTestId('log-source-filter')).toBeInTheDocument();
    
    // Verificar que se muestran los logs
    expect(screen.getByTestId('logs-table')).toBeInTheDocument();
    expect(screen.getByTestId('log-log-1')).toBeInTheDocument();
    expect(screen.getByTestId('log-log-2')).toBeInTheDocument();
    expect(screen.getByTestId('log-log-3')).toBeInTheDocument();
    
    // Verificar detalles del primer log
    expect(screen.getByTestId('log-level-log-1')).toHaveTextContent('info');
    expect(screen.getByTestId('log-source-log-1')).toHaveTextContent('auth-service');
    expect(screen.getByTestId('log-message-log-1')).toHaveTextContent('Usuario juan@example.com inició sesión');
  });

  it('debe permitir cambiar el estado de un usuario', () => {
    // Espiar console.log para verificar que se llama con los parámetros correctos
    console.log = jest.fn();
    
    render(<AdminDashboard />);
    
    // Hacer clic en el botón de cambiar estado para un usuario activo
    fireEvent.click(screen.getByTestId('toggle-status-button-user-1'));
    
    // Verificar que se llama a console.log con los parámetros correctos
    expect(console.log).toHaveBeenCalledWith('Cambiar estado del usuario user-1 a inactive');
    
    // Hacer clic en el botón de cambiar estado para un usuario inactivo
    fireEvent.click(screen.getByTestId('toggle-status-button-user-3'));
    
    // Verificar que se llama a console.log con los parámetros correctos
    expect(console.log).toHaveBeenCalledWith('Cambiar estado del usuario user-3 a active');
  });

  it('debe permitir ver detalles de un usuario', () => {
    // Espiar console.log para verificar que se llama con el ID correcto
    console.log = jest.fn();
    
    render(<AdminDashboard />);
    
    // Hacer clic en el botón de ver detalles
    fireEvent.click(screen.getByTestId('view-user-button-user-2'));
    
    // Verificar que se llama a console.log con el ID correcto
    expect(console.log).toHaveBeenCalledWith('Ver detalles del usuario: user-2');
  });

  it('debe manejar correctamente el estado de carga', () => {
    // Modificamos el mock para simular el estado de carga
    require('@/app/hooks/useSystemStats').useSystemStats.mockReturnValueOnce({
      stats: null,
      loading: true,
      error: null
    });
    
    render(<AdminDashboard />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Cargando datos del sistema...');
  });

  it('debe manejar correctamente los errores', () => {
    // Modificamos el mock para simular un error
    require('@/app/hooks/useSystemStats').useSystemStats.mockReturnValueOnce({
      stats: null,
      loading: false,
      error: { message: 'Error al cargar las estadísticas del sistema' }
    });
    
    render(<AdminDashboard />);
    
    expect(screen.getByTestId('error')).toHaveTextContent('Error: Error al cargar las estadísticas del sistema');
  });
});
