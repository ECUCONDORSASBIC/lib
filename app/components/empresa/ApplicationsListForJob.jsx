"use client";

import { Toast } from '@/app/components/ui/Toast';
import { updateApplicationStatus } from '@/app/services/applicationService';
import { useState } from 'react';

const STATUS_LABELS = {
  pending: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  viewed: { text: 'Visto', color: 'bg-blue-100 text-blue-800' },
  shortlisted: { text: 'Preseleccionado', color: 'bg-green-100 text-green-800' },
  rejected: { text: 'Rechazado', color: 'bg-red-100 text-red-800' },
  contacted: { text: 'Contactado', color: 'bg-purple-100 text-purple-800' },
  interviewing: { text: 'En entrevista', color: 'bg-indigo-100 text-indigo-800' },
  hired: { text: 'Contratado', color: 'bg-emerald-100 text-emerald-800' },
};

const ApplicationsListForJob = ({ applications: initialApplications, jobPostingId }) => {
  const [applications, setApplications] = useState(initialApplications || []);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  if (!applications || applications.length === 0) {
    return <p className="mt-2 text-gray-500 bg-gray-50 p-4 rounded-md">Aún no hay postulaciones para esta oferta.</p>;
  }

  // Filtrar aplicaciones según el estado seleccionado
  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' ? true : app.status === filterStatus
  );

  // Ordenar aplicaciones según el criterio seleccionado
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.applicationDate || 0) - new Date(a.applicationDate || 0);
    } else if (sortBy === 'name') {
      return (a.professionalName || '').localeCompare(b.professionalName || '');
    } else if (sortBy === 'status') {
      return (a.status || '').localeCompare(b.status || '');
    }
    return 0;
  });

  // Manejar cambio de estado de una postulación
  const handleStatusChange = async (applicationId, newStatus) => {
    if (!applicationId || !newStatus) return;
    
    setUpdatingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      
      // Actualizar el estado local de las postulaciones
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      setToast({ 
        show: true, 
        message: `Estado actualizado a ${STATUS_LABELS[newStatus]?.text || newStatus}`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setToast({ 
        show: true, 
        message: 'Error al actualizar el estado de la postulación', 
        type: 'error' 
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToastClose = () => {
    setToast({ show: false, message: '', type: '' });
  };

  // Renderizar número de postulaciones filtradas vs. total
  const renderFilterCount = () => {
    const totalCount = applications.length;
    const filteredCount = filteredApplications.length;
    
    if (filterStatus === 'all') {
      return `${totalCount} postulación${totalCount !== 1 ? 'es' : ''}`;
    }
    
    return `${filteredCount} de ${totalCount} postulación${totalCount !== 1 ? 'es' : ''}`;
  };

  return (
    <div className="mt-4">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={handleToastClose} />}
      
      {/* Filtros y ordenamiento */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4 bg-gray-50 p-3 rounded-md">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Todos</option>
              {Object.entries(STATUS_LABELS).map(([value, { text }]) => (
                <option key={value} value={value}>{text}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="date">Fecha (más reciente)</option>
              <option value="name">Nombre</option>
              <option value="status">Estado</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-end">
          <p className="text-sm text-gray-600">{renderFilterCount()}</p>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay postulaciones con el filtro seleccionado</h3>
          {filterStatus !== 'all' && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ver todas las postulaciones
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesional
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Postulación
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedApplications.map((application) => (
                <tr key={application.id} className={updatingId === application.id ? 'bg-blue-50' : undefined}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.professionalName || 'Nombre no disponible'}</div>
                    <div className="text-sm text-gray-500">{application.professionalEmail || 'Email no disponible'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString('es-ES', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      }) : 'Fecha no disponible'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {updatingId === application.id ? (
                      <div className="flex items-center">
                        <svg className="animate-spin h-4 w-4 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-blue-700 text-sm">Actualizando...</span>
                      </div>
                    ) : (
                      <select
                        value={application.status || 'pending'}
                        onChange={(e) => handleStatusChange(application.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-md border-0 ${STATUS_LABELS[application.status]?.color || 'bg-gray-100 text-gray-800'}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, { text }]) => (
                          <option key={value} value={value}>{text}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <a 
                        href={`/dashboard/empresa/perfil-profesional/${application.professionalId}`} 
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver Perfil
                      </a>
                      
                      {application.status === 'shortlisted' && (
                        <a 
                          href={`mailto:${application.professionalEmail}`} 
                          className="text-green-600 hover:text-green-800 ml-3"
                        >
                          Contactar
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}      
    </div>
  );
};

export default ApplicationsListForJob;
