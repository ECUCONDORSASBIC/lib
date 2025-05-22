import { BriefcaseIcon, EnvelopeIcon, PlusCircleIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline';
import { MapIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import StatsCard from '../dashboard/shared/StatsCard';
import JobPostingCard from './JobPostingCard';
import ProfessionalCard from './ProfessionalCard';

const EmployerDashboard = ({ employer }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeJobPostings, setActiveJobPostings] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [savedProfessionals, setSavedProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data fetch - replace with actual API call
    const fetchDashboardData = async () => {
      try {
        // These would be actual API calls
        // const jobsResponse = await fetch('/api/employer/job-postings');
        // const applicationsResponse = await fetch('/api/employer/applications');
        // const savedResponse = await fetch('/api/employer/saved-professionals');

        // Simulated data
        setActiveJobPostings([
          { id: 1, title: 'Médico Cardiólogo', location: 'Buenos Aires', applications: 12, status: 'active', postedAt: '2023-05-01' },
          { id: 2, title: 'Enfermero/a UCI', location: 'Córdoba', applications: 5, status: 'active', postedAt: '2023-05-03' },
          { id: 3, title: 'Técnico Radiólogo', location: 'Rosario', applications: 3, status: 'active', postedAt: '2023-05-06' },
        ]);

        setRecentApplications([
          { id: 1, jobId: 1, professionalName: 'Dra. María González', specialty: 'Cardiología', appliedAt: '2023-05-07', status: 'pending' },
          { id: 2, jobId: 1, professionalName: 'Dr. Carlos Rodríguez', specialty: 'Cardiología', appliedAt: '2023-05-06', status: 'viewed' },
          { id: 3, jobId: 2, professionalName: 'Lic. Julia Méndez', specialty: 'Enfermería', appliedAt: '2023-05-05', status: 'contacted' },
        ]);

        setSavedProfessionals([
          { id: 1, name: 'Dr. Roberto Álvarez', specialty: 'Neurología', rating: 4.8, location: 'Buenos Aires' },
          { id: 2, name: 'Dra. Lucía Martínez', specialty: 'Pediatría', rating: 4.9, location: 'Buenos Aires' },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats for overview section
  const stats = [
    { id: 1, name: 'Ofertas Activas', value: activeJobPostings.length, icon: BriefcaseIcon, color: 'bg-blue-500' },
    { id: 2, name: 'Postulaciones Recibidas', value: recentApplications.length, icon: UsersIcon, color: 'bg-green-500' },
    { id: 3, name: 'Mensajes Sin Leer', value: 5, icon: EnvelopeIcon, color: 'bg-yellow-500' },
    { id: 4, name: 'Profesionales Guardados', value: savedProfessionals.length, icon: StarIcon, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Employer Header */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
              {employer.logo ? (
                <img src={employer.logo} alt={employer.name} className="object-contain w-12 h-12" />
              ) : (
                <div className="text-2xl font-bold text-gray-400">{employer.name.charAt(0)}</div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{employer.name}</h1>
              <p className="text-gray-600">{employer.type} · {employer.location}</p>
              <div className="flex items-center mt-1">
                <MapIcon className="w-4 h-4 mr-1 text-blue-500" />
                <span className="text-sm text-blue-500">Ver en el mapa</span>
              </div>
            </div>
          </div>
          <Link href="/dashboard/empresa/publicar-oferta">
            <button className="flex items-center px-4 py-2 space-x-1 text-white transition duration-150 bg-blue-600 rounded-lg hover:bg-blue-700">
              <PlusCircleIcon className="w-5 h-5" />
              <span>Publicar Nueva Oferta</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('jobpostings')}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'jobpostings'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Mis Ofertas
            </button>
            <button
              onClick={() => setActiveTab('applications')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'applications'
                ? 'border-b-2 border-sky-300 text-sky-500'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Postulaciones
            </button>
            <button
              onClick={() => setActiveTab('saved')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'saved'
                ? 'border-b-2 border-sky-300 text-sky-500'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Profesionales Guardados
            </button>
          </nav>
        </div>

        <div className="p-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <StatsCard key={stat.id} stat={stat} />
                ))}
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="mb-3 text-lg font-medium text-gray-800">Actividad Reciente</h3>
                <div className="p-4 space-y-3 rounded-lg bg-gray-50">
                  <div className="flex items-start p-3 space-x-3 bg-white rounded-md shadow-sm">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <UsersIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nueva postulación para <span className="text-blue-600">Médico Cardiólogo</span></p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start p-3 space-x-3 bg-white rounded-md shadow-sm">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                      <EnvelopeIcon className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Mensaje nuevo de <span className="text-blue-600">Dra. María González</span></p>
                      <p className="text-xs text-gray-500">Hace 5 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start p-3 space-x-3 bg-white rounded-md shadow-sm">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <BriefcaseIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Oferta publicada: <span className="text-blue-600">Técnico Radiólogo</span></p>
                      <p className="text-xs text-gray-500">Hace 2 días</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Job Postings Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-800">Ofertas Activas</h3>
                  <button onClick={() => setActiveTab('jobpostings')} className="text-sm text-blue-600 hover:underline">
                    Ver todas
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeJobPostings.slice(0, 3).map((job) => (
                    <JobPostingCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Job Postings Tab */}
          {activeTab === 'jobpostings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">Mis Ofertas</h3>
                <Link href="/dashboard/empresa/publicar-oferta">
                  <button className="px-3 py-2 text-sm text-white transition duration-150 bg-blue-600 rounded-lg hover:bg-blue-700">
                    + Nueva Oferta
                  </button>
                </Link>
              </div>
              <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Título</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ubicación</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Postulaciones</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeJobPostings.map((job) => (
                      <tr key={job.id}>
                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {job.title}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{job.location}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{job.applications}</td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Activa
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 whitespace-nowrap">{job.postedAt}</td>
                        <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap">
                          <button className="mr-3 text-blue-600 hover:text-blue-900">Editar</button>
                          <button className="text-gray-600 hover:text-gray-900">Ver</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Postulaciones Recibidas</h3>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">{application.professionalName}</h4>
                      <p className="text-sm text-gray-500">{application.specialty}</p>
                      <p className="text-xs text-gray-400">
                        Postulado para: <span className="text-blue-600">
                          {activeJobPostings.find(job => job.id === application.jobId)?.title}
                        </span> · {application.appliedAt}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                        Ver Perfil
                      </button>
                      <button className="px-3 py-1 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50">
                        Contactar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Professionals Tab */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Profesionales Guardados</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savedProfessionals.map((professional) => (
                  <ProfessionalCard key={professional.id} professional={professional} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
