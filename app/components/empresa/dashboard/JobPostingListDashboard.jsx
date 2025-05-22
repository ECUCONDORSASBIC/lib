import { ArrowPathIcon, CheckIcon, EllipsisHorizontalIcon, EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useState } from 'react';

export default function JobPostingListDashboard({ jobPostings = [], loading = false, onDeleteJob, onChangeStatus }) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const formatDate = (date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'dd MMM yyyy', { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      active: 'Activa',
      inactive: 'Inactiva',
      pending: 'Pendiente',
      closed: 'Cerrada',
      draft: 'Borrador'
    };
    return statusMap[status] || 'Desconocido';
  };

  if (loading) {
    return (
      <div className="p-4 bg-white border rounded-lg shadow-sm text-gray-700 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/6"></div>
        </div>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border-b py-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-2/5"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!jobPostings || jobPostings.length === 0) {
    return (
      <div className="p-8 bg-white border rounded-lg shadow-sm text-center">
        <p className="text-gray-500 mb-4">Aún no has publicado ofertas de empleo.</p>
        <Link href="/dashboard/empresa/ofertas/crear" legacyBehavior>
          <a className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <PencilIcon className="w-5 h-5 mr-2" />
            Crear mi primera oferta
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Publicación
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aplicaciones
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobPostings.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {job.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClasses(job.status)}`}>
                    {getStatusLabel(job.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(job.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.applicationsCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <button
                    onClick={() => toggleDropdown(job.id)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                  
                  {activeDropdown === job.id && (
                    <div className="absolute right-8 top-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <Link href={`/dashboard/empresa/ofertas/${job.id}`} legacyBehavior>                          <a className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center">
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </a>
                        </Link>
                        <Link href={`/dashboard/empresa/ofertas/${job.id}/editar`} legacyBehavior>                          <a className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center">
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Editar
                          </a>
                        </Link>
                        
                        {job.status === 'active' ? (                          <button
                            onClick={() => {
                              onChangeStatus(job.id, 'inactive');
                              setActiveDropdown(null);
                            }}
                            className="flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                          >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            Desactivar
                          </button>
                        ) : (                          <button
                            onClick={() => {
                              onChangeStatus(job.id, 'active');
                              setActiveDropdown(null);
                            }}
                            className="flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                          >
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Activar
                          </button>
                        )}                          <button
                            onClick={() => {
                              onDeleteJob(job.id);
                              setActiveDropdown(null);
                            }}
                            className="flex w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 items-center"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Eliminar
                          </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
