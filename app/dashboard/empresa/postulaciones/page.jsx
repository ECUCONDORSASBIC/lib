'use client';

import { Toast } from '@/app/components/ui/Toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { getCompanyApplications } from '@/app/services/applicationService';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [filters, setFilters] = useState({
    jobPosting: 'all',
    status: 'all',
    date: 'all'
  });

  useEffect(() => {
    if (!user?.uid) return;

    const fetchApplications = async () => {
      try {
        const data = await getCompanyApplications(user.uid);
        setApplications(data);
        setFilteredApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setToast({ show: true, message: "Error al cargar las postulaciones", type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  useEffect(() => {
    // Filter applications based on selected filters
    let result = [...applications];

    if (filters.jobPosting !== 'all') {
      result = result.filter(app => app.jobPostingId === filters.jobPosting);
    }

    if (filters.status !== 'all') {
      result = result.filter(app => app.status === filters.status);
    }

    if (filters.date !== 'all') {
      // Filter by date logic here
    }

    setFilteredApplications(result);
  }, [filters, applications]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      // await updateApplicationStatus(applicationId, newStatus);
      // Update local state
      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
      );
      setToast({ show: true, message: "Estado actualizado", type: 'success' });
    } catch (error) {
      console.error("Error updating application status:", error);
      setToast({ show: true, message: "Error al actualizar el estado", type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      <div className="mb-6 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Postulaciones Recibidas</h1>

        <div className="mt-3 sm:mt-0 sm:flex space-y-2 sm:space-y-0 sm:space-x-2">
          <select
            name="jobPosting"
            value={filters.jobPosting}
            onChange={handleFilterChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">Todas las ofertas</option>
            {/* Map unique job posting options */}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="new">Nuevas</option>
            <option value="reviewed">Revisadas</option>
            <option value="interview">Para entrevista</option>
            <option value="selected">Seleccionadas</option>
            <option value="rejected">Rechazadas</option>
          </select>

          <select
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">Cualquier fecha</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="p-6 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">No se encontraron postulaciones con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredApplications.map((application) => (
              <li key={application.id}>
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {application.professionalName}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Postulación para: <span className="font-medium">{application.jobTitle}</span>
                      </p>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Fecha: {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${application.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                            application.status === 'selected' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                        }`}>
                        {application.status === 'new' ? 'Nueva' :
                          application.status === 'reviewed' ? 'Revisada' :
                            application.status === 'interview' ? 'Entrevista' :
                              application.status === 'selected' ? 'Seleccionada' : 'Rechazada'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <Link href={`/dashboard/empresa/perfiles/${application.professionalId}`}>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Ver Perfil
                      </button>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {/* Lógica para contactar */ }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Contactar
                    </button>

                    <select
                      className="block pl-3 pr-10 py-1.5 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      value={application.status}
                      onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                    >
                      <option value="new">Nueva</option>
                      <option value="reviewed">Revisada</option>
                      <option value="interview">Para entrevista</option>
                      <option value="selected">Seleccionada</option>
                      <option value="rejected">Rechazada</option>
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
