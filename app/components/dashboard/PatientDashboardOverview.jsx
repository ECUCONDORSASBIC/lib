'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { db, auth } from '../../lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import ProfileCompletionBar from './ProfileCompletionBar';
import HealthDataReminders from './HealthDataReminders';

/**
 * Componente principal para el dashboard del paciente
 * Integra los componentes de barra de progreso, recordatorios y resumen de anamnesis
 */
const PatientDashboardOverview = () => {
  const [userData, setUserData] = useState(null);
  const [medicalData, setMedicalData] = useState(null);
  const [anamnesisData, setAnamnesisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeUrl, setResumeUrl] = useState('');

  // Obtener datos del usuario y médicos al cargar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const user = auth.currentUser;
        if (!user) {
          console.error('Usuario no autenticado');
          return;
        }
        
        // Obtener datos del perfil
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
        
        // Obtener datos médicos
        const medicalDocRef = doc(db, 'medicalData', user.uid);
        const medicalDoc = await getDoc(medicalDocRef);
        
        if (medicalDoc.exists()) {
          setMedicalData(medicalDoc.data());
        }
        
        // Obtener datos de anamnesis
        const anamnesisDocRef = doc(db, 'anamnesis', user.uid);
        const anamnesisDoc = await getDoc(anamnesisDocRef);
        
        if (anamnesisDoc.exists()) {
          setAnamnesisData(anamnesisDoc.data());
          
          // Determinar URL para continuar/iniciar anamnesis
          if (anamnesisDoc.data().status === 'in_progress') {
            setResumeUrl('/dashboard/anamnesis?resume=true');
          } else {
            setResumeUrl('/dashboard/anamnesis/new');
          }
        } else {
          setResumeUrl('/dashboard/anamnesis/new');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar tus datos médicos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Función para manejar clics en secciones del perfil
  const handleSectionClick = (sectionId) => {
    toast.success(`Navegando a la sección: ${sectionId}`);
  };

  // Animación de entrada
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Si está cargando, mostrar skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 h-32 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 h-40 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Recordatorios de salud */}
      {userData && medicalData && (
        <motion.div variants={itemVariants}>
          <HealthDataReminders 
            userData={userData} 
            medicalData={medicalData} 
          />
        </motion.div>
      )}
      
      {/* Barra de completitud del perfil */}
      {userData && (
        <motion.div variants={itemVariants}>
          <ProfileCompletionBar 
            userData={userData} 
            onSectionClick={handleSectionClick} 
          />
        </motion.div>
      )}
      
      {/* Tarjeta de anamnesis */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-800">
              {anamnesisData?.status === 'in_progress' 
                ? 'Continúa tu anamnesis' 
                : anamnesisData?.status === 'completed'
                ? 'Anamnesis completada'
                : 'Inicia tu anamnesis médica'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {anamnesisData?.status === 'in_progress' 
                ? 'Tienes una sesión de anamnesis en progreso. Continúa donde lo dejaste.'
                : anamnesisData?.status === 'completed'
                ? `Última actualización: ${new Date(anamnesisData.lastUpdated?.toDate()).toLocaleDateString()}`
                : 'Proporciona información detallada sobre tu historial médico y síntomas actuales.'}
            </p>
            
            {anamnesisData?.status === 'in_progress' && (
              <div className="mt-2">
                <p className="text-xs text-blue-600">
                  Progreso: {anamnesisData.progress || 0}% completado
                </p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${anamnesisData.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <Link 
            href={resumeUrl}
            className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary-dark transition-colors"
          >
            {anamnesisData?.status === 'in_progress' 
              ? 'Continuar' 
              : anamnesisData?.status === 'completed'
              ? 'Actualizar'
              : 'Iniciar'}
          </Link>
        </div>
        
        {anamnesisData?.status === 'completed' && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <h4 className="text-xs font-medium text-gray-500 mb-2">
              Resumen de tus datos principales:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {anamnesisData.summaryPoints?.slice(0, 4).map((point, index) => (
                <li key={index} className="flex items-start text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
            {(anamnesisData.summaryPoints?.length > 4) && (
              <button className="text-xs text-indigo-600 hover:text-indigo-800 mt-2">
                Ver todos ({anamnesisData.summaryPoints.length})
              </button>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Citas próximas */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
      >
        <h3 className="text-base font-medium text-gray-800 mb-2">
          Próximas citas médicas
        </h3>
        
        {userData?.appointments?.length > 0 ? (
          <div className="space-y-3">
            {userData.appointments.slice(0, 2).map((appointment, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="mr-3 bg-primary/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {appointment.doctorName} - {appointment.specialty}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(appointment.date?.toDate()).toLocaleDateString()} a las {appointment.time}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {appointment.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 mt-2">No tienes citas programadas</p>
            <Link 
              href="/dashboard/appointments/new"
              className="inline-block mt-2 px-4 py-2 bg-blue-50 text-blue-700 text-xs rounded-md hover:bg-blue-100 transition-colors"
            >
              Agendar cita
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PatientDashboardOverview;
