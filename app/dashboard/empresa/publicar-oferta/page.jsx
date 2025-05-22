'use client';

import JobPostingForm from '@/app/components/empresa/JobPostingForm';
import { Toast } from '@/app/components/ui/Toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { createJobPosting } from '@/app/services/jobPostingService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PublishJobPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Manejar la publicación de una nueva oferta de empleo
  const handleSubmit = async (formData) => {
    if (!user?.uid) {
      setToast({ 
        show: true, 
        message: 'Debes iniciar sesión para publicar una oferta', 
        type: 'error' 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear la oferta en Firestore
      const jobPosting = await createJobPosting(formData, user.uid);
      
      setToast({ 
        show: true, 
        message: 'Oferta publicada correctamente!', 
        type: 'success' 
      });
      
      // Redireccionar a la página de ofertas después de 2 segundos
      setTimeout(() => {
        router.push(`/dashboard/empresa/ofertas/${jobPosting.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error al publicar oferta:', error);
      
      setToast({ 
        show: true, 
        message: error.message || 'Error al publicar la oferta. Por favor, inténtalo de nuevo.', 
        type: 'error' 
      });
      
      setIsSubmitting(false);
    }
  };

  const handleToastClose = () => {
    setToast({ show: false, message: '', type: '' });
  };

  if (authLoading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 py-6 text-center sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Debes iniciar sesión con una cuenta de empresa para publicar ofertas de empleo.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-center">
              Iniciar Sesión
            </Link>
            <Link href="/dashboard/empresa" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-center">
              Volver al Dashboard
            </Link>
          </div>
        </div>
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
          Volver a Mis Ofertas
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="text-2xl font-bold text-gray-900">Publicar Nueva Oferta de Empleo</h1>
          <p className="mt-1 text-gray-600">Completa el formulario para publicar una oferta y encontrar profesionales médicos para tu institución.</p>
        </div>
        
        <div className="p-6">
          <JobPostingForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            initialData={{
              companyName: user.companyName || '',
              contactEmail: user.email || ''
            }} 
          />
        </div>
      </div>
    </div>
  );
}
