/* eslint-disable @next/next/no-img-element */
// Filepath: c:\\Users\\eduar\\OneDrive - 0378d\\Escritorio\\pr-quality\\app\\dashboard\\empresa\\ofertas\\page.jsx
'use client';

import { Toast } from '@/app/components/ui/Toast'; // Assuming you have a Toast component
import { useAuth } from '@/app/contexts/AuthContext';
import { getJobPostingsByCompany } from '@/app/services/jobPostingService';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ManageJobOffers from '@/app/components/dashboard/empresa/ManageJobOffers';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';

export default function CompanyJobPostingsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    if (!user?.uid || role !== 'empresa') {
      setLoading(false);
      router.push('/login');
      return;
    }

    const fetchPostings = async () => {
      setLoading(true);
      try {
        const postings = await getJobPostingsByCompany(user.uid);
        setJobPostings(postings);
      } catch (error) {
        console.error("Error fetching job postings:", error);
        setToast({ show: true, message: 'Error al cargar las ofertas.', type: 'error' });
      }
      setLoading(false);
    };

    fetchPostings();
  }, [user, authLoading, role, router]);

  const handleToastClose = () => {
    setToast({ show: false, message: '', type: '' });
  };

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Gestión de Ofertas Laborales</h1>

          <div className="mb-8">
            <p className="text-gray-600">
              Cree y gestione ofertas de empleo para médicos, revise aplicaciones,
              y contacte con candidatos interesados directamente desde su panel.
            </p>
          </div>

          <div className="space-y-6">
            <ManageJobOffers />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
