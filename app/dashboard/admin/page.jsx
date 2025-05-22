'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { toast } from 'react-toastify';
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pacientes: 0,
    medicos: 0,
    admins: 0
  });
  const router = useRouter();
  const db = getFirestore();
  
  // Verificar si el usuario tiene permisos de administrador
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (!session?.user?.role || session.user.role !== 'admin') {
          toast.error('No tienes permisos para acceder a esta sección');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error al verificar permisos:', err);
        toast.error('Error al verificar permisos de acceso');
        router.push('/dashboard');
      }
    };
    
    checkAdminAccess();
  }, [router]);

  // Cargar lista de usuarios
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersList);
        
        // Calcular estadísticas
        const stats = {
          totalUsers: usersList.length,
          pacientes: usersList.filter(user => user.role === 'paciente').length,
          medicos: usersList.filter(user => user.role === 'medico').length,
          admins: usersList.filter(user => user.role === 'admin').length
        };
        
        setStats(stats);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('Error al cargar la lista de usuarios');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [db]);

  // Manejar cambio de rol de usuario
  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole}?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      
      // Actualizar custom claims a través de la API
      const response = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          role: newRole 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el rol del usuario');
      }

      // Actualizar documento de usuario en Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      
      // Actualizar estado local
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      // Actualizar estadísticas
      setStats(prev => {
        const updatedUser = users.find(u => u.id === userId);
        if (updatedUser) {
          const oldRole = updatedUser.role;
          return {
            ...prev,
            [oldRole]: oldRole ? prev[oldRole] - 1 : prev[oldRole],
            [newRole]: prev[newRole] + 1
          };
        }
        return prev;
      });
      
      toast.success(`Rol actualizado a ${newRole}`);
    } catch (err) {
      console.error('Error al cambiar rol:', err);
      toast.error('Error al actualizar el rol del usuario');
    } finally {
      setIsProcessing(false);
    }
  };

  // Deshabilitar cuenta de usuario
  const handleDisableUser = async (userId, isDisabled) => {
    if (!confirm(`¿Estás seguro de ${isDisabled ? 'habilitar' : 'deshabilitar'} esta cuenta?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      
      // Actualizar documento de usuario en Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { disabled: !isDisabled });
      
      // Actualizar estado local
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, disabled: !isDisabled } : user
        )
      );
      
      toast.success(`Usuario ${isDisabled ? 'habilitado' : 'deshabilitado'} correctamente`);
    } catch (err) {
      console.error('Error al cambiar estado de usuario:', err);
      toast.error(`Error al ${isDisabled ? 'habilitar' : 'deshabilitar'} usuario`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Eliminar usuario (solo para fines administrativos bajo petición específica)
  const handleDeleteUser = async (userId) => {
    if (!confirm('ADVERTENCIA: Esta acción eliminará permanentemente al usuario y todos sus datos. ¿Estás completamente seguro?')) {
      return;
    }
    
    // Doble confirmación para evitar eliminaciones accidentales
    if (!confirm('Esta acción NO se puede deshacer. Confirma nuevamente para proceder.')) {
      return;
    }

    try {
      setIsProcessing(true);
      
      // Eliminar documento de usuario en Firestore
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      // Actualizar estado local
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      // Actualizar estadísticas
      const deletedUser = users.find(u => u.id === userId);
      if (deletedUser && deletedUser.role) {
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1,
          [deletedUser.role]: prev[deletedUser.role] - 1
        }));
      }
      
      toast.success('Usuario eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      toast.error('Error al eliminar el usuario');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtrar usuarios según búsqueda y filtro de rol
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout>
      <div data-testid="admin-dashboard" className="container mx-auto p-4">
        <h1 data-testid="dashboard-title" className="text-2xl font-bold mb-6">Panel de Administración</h1>
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Total Usuarios</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Pacientes</p>
            <p className="text-2xl font-bold text-blue-600">{stats.pacientes}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Médicos</p>
            <p className="text-2xl font-bold text-green-600">{stats.medicos}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Administradores</p>
            <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar usuarios</label>
              <input
                type="text"
                id="search"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Buscar por nombre o email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full sm:w-64">
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por rol</label>
              <select
                id="role-filter"
                data-testid="role-filter"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                <option value="paciente">Pacientes</option>
                <option value="medico">Médicos</option>
                <option value="admin">Administradores</option>
              </select>
            </div>
          </div>

          {isProcessing && (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'Sin nombre'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div data-testid={`user-role-${user.id}`} className="text-sm text-gray-900">
                            {user.role || 'Sin rol asignado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {user.disabled ? 'Deshabilitado' : 'Activo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            <select
                              className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                              value={user.role || ''}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={isProcessing}
                            >
                              <option value="" disabled>Cambiar rol</option>
                              <option value="paciente">Paciente</option>
                              <option value="medico">Médico</option>
                              <option value="admin">Administrador</option>
                            </select>
                            
                            <button
                              onClick={() => handleDisableUser(user.id, user.disabled)}
                              disabled={isProcessing}
                              className={`rounded-md px-3 py-1 text-sm text-white ${user.disabled ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                            >
                              {user.disabled ? 'Habilitar' : 'Deshabilitar'}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={isProcessing}
                              className="rounded-md px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron usuarios con los criterios de búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Sección de Errores y Notificaciones */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuración de Notificaciones</h2>
          <p className="text-gray-600 mb-4">Configure quién recibe alertas por errores críticos del sistema.</p>
          
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            toast.success('Configuración de notificaciones actualizada');
          }}>
            <div>
              <label htmlFor="error-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email para notificaciones de error
              </label>
              <input
                id="error-email"
                type="email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="soporte@altamedica.com"
              />
            </div>
            
            <div className="space-y-2">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="errors-critical"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="errors-critical" className="font-medium text-gray-700">Errores críticos</label>
                  <p className="text-gray-500">Notificar sobre errores que afectan la funcionalidad principal</p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="errors-auth"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="errors-auth" className="font-medium text-gray-700">Errores de autenticación</label>
                  <p className="text-gray-500">Notificar sobre problemas relacionados con logins o permisos</p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="errors-db"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="errors-db" className="font-medium text-gray-700">Errores de base de datos</label>
                  <p className="text-gray-500">Notificar sobre problemas con Firestore o transacciones</p>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar configuración
              </button>
            </div>
          </form>
        </div>
        
        {/* Gestión de Contenido */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Gestión de Contenido</h2>
          <p className="text-gray-600 mb-4">Administre el contenido visible para los usuarios de la plataforma.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-lg mb-2">Preguntas Frecuentes (FAQ)</h3>
              <p className="text-gray-600 mb-4">Actualizar las preguntas frecuentes mostradas a los usuarios.</p>
              <button 
                className="text-indigo-600 hover:text-indigo-800"
                onClick={() => router.push('/dashboard/admin/manage-faq')}
              >
                Administrar FAQ →
              </button>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-lg mb-2">Blog y Noticias</h3>
              <p className="text-gray-600 mb-4">Gestionar artículos y actualizaciones del blog.</p>
              <button 
                className="text-indigo-600 hover:text-indigo-800"
                onClick={() => router.push('/dashboard/admin/manage-blog')}
              >
                Administrar Blog →
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
