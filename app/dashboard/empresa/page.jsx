'use client';

import { Toast } from '@/app/components/ui/Toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { ArrowPathIcon, BellAlertIcon, BriefcaseIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Dashboard Components
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardWelcomeHeader from '@/app/components/empresa/dashboard/DashboardWelcomeHeader';
import DataVisualizationPlaceholder from '@/app/components/empresa/dashboard/DataVisualizationPlaceholder';
import JobPostingListDashboard from '@/app/components/empresa/dashboard/JobPostingListDashboard';
import QuickActions from '@/app/components/empresa/dashboard/QuickActions';
import RecentActivityFeed from '@/app/components/empresa/dashboard/RecentActivityFeed';
import StatsOverview from '@/app/components/empresa/dashboard/StatsOverview';
import TipsAndUpdates from '@/app/components/empresa/dashboard/TipsAndUpdates';

// Services
import { getCompanyDashboardStats } from '@/app/services/companyService';
import { deleteJobPosting, getJobPostingsByCompany, updateJobPosting } from '@/app/services/jobPostingService';
// import { getRecentActivitiesForCompany } from '../../../services/activityService'; // TODO: Implement and use activityService

const EmpresaDashboardPage = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const [jobPostings, setJobPostings] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    newApplicationsToday: 0,
    profileViews: 0,
    avgApplicationReviewTime: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState('');
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: 'success' });

  const companyId = user?.uid;

  const fetchDashboardData = async () => {
    if (!companyId) return;

    setLoadingJobs(true);
    setLoadingStats(true);
    setLoadingActivities(true); // Keep true until real data or simulation is explicitly done
    setError('');

    try {
      // Fetch job postings
      const postingsData = await getJobPostingsByCompany(companyId);
      setJobPostings(postingsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      }));
      setLoadingJobs(false);

      // Fetch dashboard statistics
      const statsData = await getCompanyDashboardStats(companyId);
      setDashboardStats(statsData);
      setLoadingStats(false);

      // Simulate Recent Activities (or fetch from a service later)
      const simulatedActivities = [
        { id: '1', type: 'new_application', description: `Nueva postulación de ${['Juan Pérez', 'Ana Gómez', 'Carlos López'][Math.floor(Math.random() * 3)]} para '${postingsData[0]?.title || '-'}'.`, timestamp: new Date(Date.now() - (Math.random() * 3600000 * 5)).toISOString(), link: '#' },
        { id: '2', type: 'job_status_change', description: `La oferta '${postingsData[1]?.title || '-'}' ha sido actualizada.`, timestamp: new Date(Date.now() - (Math.random() * 7200000 * 3)).toISOString(), link: '#' },
      ].filter(act => postingsData.length > 0); // Ensure postings exist before creating activity related to them
      setRecentActivities(simulatedActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5));
      setLoadingActivities(false);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage = err.message || 'No se pudieron cargar los datos del dashboard. Inténtalo de nuevo.';
      setError(errorMessage);
      setToastInfo({ visible: true, message: `Error: ${errorMessage}`, type: 'error' });
      setLoadingJobs(false);
      setLoadingStats(false);
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleRefreshData = () => {
    fetchDashboardData();
  };

  const handleDeleteJob = async (jobId) => {
    if (!companyId) return;
    // TODO: Implement a confirmation modal (e.g., using the existing Modal component)
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar esta oferta de empleo?");
    if (!confirmDelete) return;

    setToastInfo({ visible: true, message: 'Eliminando oferta...', type: 'info' });
    try {
      await deleteJobPosting(jobId, companyId);
      setToastInfo({ visible: true, message: 'Oferta eliminada con éxito.', type: 'success' });
      fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error(`Error deleting job ${jobId}:`, err);
      setToastInfo({ visible: true, message: `Error al eliminar la oferta: ${err.message}`, type: 'error' });
    }
  };

  const handleChangeJobStatus = async (jobId, newStatus) => {
    if (!companyId) return;
    setToastInfo({ visible: true, message: 'Actualizando estado...', type: 'info' });
    try {
      await updateJobPosting(jobId, { status: newStatus });
      setToastInfo({ visible: true, message: 'Estado de la oferta actualizado.', type: 'success' });
      fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error(`Error updating status for job ${jobId}:`, err);
      setToastInfo({ visible: true, message: `Error al actualizar estado: ${err.message}`, type: 'error' });
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700">Cargando datos de autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['employer', 'superuser']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <DashboardWelcomeHeader
            userName={userData?.companyName || userData?.name || user?.displayName || 'Empresa'}
            onRefresh={handleRefreshData}
            loading={loadingJobs || loadingStats || loadingActivities}
          />

          <StatsOverview stats={dashboardStats} loading={loadingStats} />

          <QuickActions />

          {error && (
            <div className="my-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg shadow-md flex items-center">
              <BellAlertIcon className="w-6 h-6 mr-3 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <BriefcaseIcon className="w-7 h-7 mr-3 text-blue-600" />
                    Mis Ofertas de Empleo
                  </h2>
                  <Link href="/dashboard/empresa/ofertas/crear" legacyBehavior>
                    <a className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Crear Nueva Oferta
                    </a>
                  </Link>
                </div>
                <JobPostingListDashboard
                  jobPostings={jobPostings}
                  loading={loadingJobs}
                  onDeleteJob={handleDeleteJob}
                  onChangeStatus={handleChangeJobStatus}
                />
              </section>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <RecentActivityFeed activities={recentActivities} loading={loadingActivities} />
              <DataVisualizationPlaceholder />
              <TipsAndUpdates />
            </div>
          </div>

        </div>
      </div>
      {toastInfo.visible && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo({ ...toastInfo, visible: false })}
        />
      )}
    </ProtectedRoute>
  );
};

export default EmpresaDashboardPage;
