'use client';

import ApplicationsListForJob from '@/app/components/empresa/ApplicationsListForJob';
import JobPostingForm from '@/app/components/empresa/JobPostingForm';
import { Toast } from '@/app/components/ui/Toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { getApplicationsByJobPostingId } from '@/app/services/applicationService';
import { getJobPostingById, updateJobPosting } from '@/app/services/jobPostingService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function JobPostingDetailPage({ params }) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [jobPosting, setJobPosting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isClosingOffer, setIsClosingOffer] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  useEffect(() => {
    if (!user?.uid || !id) {
      setLoading(false);
      return;
    }

    const fetchJobAndApplications = async () => {
      setLoading(true);
      try {
        const jobData = await getJobPostingById(id);
        if (!jobData) {
          setToast({ show: true, message: "Oferta no encontrada.", type: 'error' });
          router.push('/dashboard/empresa/ofertas');
          return;
        }
        if (jobData.companyId !== user.uid) {
          setToast({ show: true, message: "No tienes permiso para ver esta oferta.", type: 'error' });
          router.push('/dashboard/empresa/ofertas');
          return;
        }
        setJobPosting(jobData);
        setLoading(false);

        setLoadingApplications(true);
        try {
          const appsData = await getApplicationsByJobPostingId(id);
          setApplications(appsData);
        } catch (appsError) {
          console.error("Error fetching applications:", appsError);
          setToast({ show: true, message: "Error al cargar las postulaciones.", type: 'error' });
        } finally {
          setLoadingApplications(false);
        }

      } catch (error) {
        console.error("Error fetching job posting:", error);
        setToast({ show: true, message: "Error al cargar la oferta.", type: 'error' });
        setLoading(false);
      }
    };

    fetchJobAndApplications();
  }, [id, user, router]);

  const handleUpdate = async (formData) => {
    if (!jobPosting || jobPosting.status === 'closed') {
      setToast({ show: true, message: "Esta oferta está cerrada y no se puede modificar.", type: 'warning' });
      return;
    }
    setIsSaving(true);
    try {
      await updateJobPosting(id, formData);
      setJobPosting(prev => ({ ...prev, ...formData }));
      setToast({ show: true, message: "Oferta actualizada exitosamente", type: 'success' });
    } catch (error) {
      console.error("Error updating job posting:", error);
      setToast({ show: true, message: "Error al actualizar la oferta.", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseOffer = async () => {
    if (!jobPosting) return;
    if (jobPosting.status === 'closed') {
      setToast({ show: true, message: "Esta oferta ya está cerrada.", type: 'info' });
      return;
    }

    const confirmClose = window.confirm("¿Estás seguro de que quieres cerrar esta oferta? No podrás reabrirla ni recibir nuevas postulaciones.");
    if (confirmClose) {
      setIsClosingOffer(true);
      try {
        await updateJobPosting(id, { status: 'closed' });
        setJobPosting(prev => ({ ...prev, status: 'closed' }));
        setToast({ show: true, message: "Oferta cerrada exitosamente.", type: 'success' });
      } catch (error) {
        console.error("Error closing job posting:", error);
        setToast({ show: true, message: "Error al cerrar la oferta.", type: 'error' });
      } finally {
        setIsClosingOffer(false);
      }
    }
  };

  const handleToastClose = () => {
    setToast({ show: false, message: '', type: '' });
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
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={handleToastClose} />}

      <div className="mb-6">
        <Link href="/dashboard/empresa/ofertas" className="flex items-center text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a Ofertas
        </Link>
      </div>

      <div className="mb-6 flex items-center">
        <h1 className="text-2xl font-bold text-gray-800">Editar Oferta</h1>
        {jobPosting?.status === 'closed' && (
          <span className="ml-3 px-2.5 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
            CERRADA
          </span>
        )}
      </div>

      {jobPosting && (
        <JobPostingForm
          initialData={jobPosting}
          onSubmit={handleUpdate}
          mode="edit"
          isSaving={isSaving}
          disabled={jobPosting.status === 'closed'}
        />
      )}

      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Postulaciones Recibidas ({applications.length})</h2>
          {loadingApplications ? (
            <div className="mt-2 text-center py-4">
              <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando postulaciones...</p>
            </div>
          ) : applications.length > 0 ? (
            <ApplicationsListForJob applications={applications} jobPostingId={id} />
          ) : (
            <p className="mt-2 text-gray-500 bg-gray-50 p-4 rounded-md">Aún no hay postulaciones para esta oferta.</p>
          )}
        </div>

        {jobPosting && jobPosting.status !== 'closed' && (
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60"
              onClick={handleCloseOffer}
              disabled={isClosingOffer || isSaving}
            >
              {isClosingOffer ? 'Cerrando...' : 'Cerrar Oferta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
