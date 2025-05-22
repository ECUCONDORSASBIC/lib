'use client';

import { usePatientData } from '@/app/hooks/usePatientData';
import { useTranslation } from '@/app/i18n';
import { useParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import ViewToggle from '@/app/components/dashboard/paciente/ViewToggle';
import DashboardCard from '@/app/components/dashboard/paciente/DashboardCard';
import HealthAlerts from '@/app/components/dashboard/paciente/HealthAlerts';

// Dashboard component imports
import AnamnesisLink from '@components/AnamnesisLink';
import AvatarButton from '@components/dashboard/paciente/AvatarButton';
import DocumentsHistory from '@components/dashboard/paciente/DocumentsHistory';
import HelpAndSupportSection from '@components/dashboard/paciente/HelpAndSupportSection';
import LogoutButton from '@components/dashboard/paciente/LogoutButton';
import MyConsultationsSection from '@components/dashboard/paciente/MyConsultationsSection';
import MyMedicalProfileSection from '@components/dashboard/paciente/MyMedicalProfileSection';
import MyPrescriptionsSection from '@components/dashboard/paciente/MyPrescriptionsSection';
import NotificationPreferences from '@components/dashboard/paciente/NotificationPreferences';
import NotificationsAndMessagesSection from '@components/dashboard/paciente/NotificationsAndMessagesSection';
import PersonalizedDashboardSections from '@components/dashboard/paciente/PersonalizedDashboardSections';
import ResultsAndDiagnosticsSection from '@components/dashboard/paciente/ResultsAndDiagnosticsSection';
import WelcomeSection from '@components/dashboard/paciente/WelcomeSection';
import PatientVitals from '@components/dashboard/shared/PatientVitals'; // Path corrected assuming it's a shared component
import RiskAssessmentPanel from '@components/dashboard/shared/RiskAssessmentPanel';

export default function PatientDashboardPage() {
  const { id: patientId } = useParams();
  const { t } = useTranslation();

  const {
    patientData,
    loading,
    hasAnamnesisData,
    isAnamnesisComplete
  } = usePatientData(patientId);

  const [profileUpdateNotification, setProfileUpdateNotification] = useState(null);
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [healthAlerts, setHealthAlerts] = useState([]);
  
  // Cargar alertas de salud reales desde Firebase
  useEffect(() => {
    if (!patientId) return;
    
    const loadPatientAlerts = async () => {
      try {
        // Importamos dinámicamente para evitar problemas de SSR
        const { db } = await import('@/lib/firebase/firebaseClient');
        const { collection, query, where, orderBy, limit, onSnapshot } = await import('firebase/firestore');
        
        // Consulta para obtener alertas activas del paciente
        const alertsRef = collection(db, 'patients', patientId, 'healthAlerts');
        const alertsQuery = query(
          alertsRef,
          where('active', '==', true),
          orderBy('severity', 'desc'), // Críticas primero
          orderBy('timestamp', 'desc'),
          limit(10) // Limitamos a 10 alertas más recientes
        );
        
        // Configurar escucha en tiempo real
        const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
          const alertsList = [];
          
          snapshot.forEach(doc => {
            const data = doc.data();
            alertsList.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              severity: data.severity,
              timestamp: data.timestamp?.toDate() || new Date(),
              actionLabel: data.actionLabel || 'Ver detalles',
              actionUrl: data.actionUrl || ''
            });
          });
          
          // Si hay datos de anamnesis incompletos, agregamos una alerta crítica
          if (hasAnamnesisData && !isAnamnesisComplete) {
            alertsList.unshift({
              id: 'alert-anamnesis',
              title: 'Anamnesis incompleta',
              description: 'Complete su historial médico para recibir recomendaciones más precisas.',
              severity: 'critical',
              timestamp: new Date(),
              actionLabel: 'Completar ahora'
            });
          }
          
          setHealthAlerts(alertsList);
        }, (error) => {
          console.error('Error al cargar alertas de salud:', error);
          // En caso de error, al menos mostramos la alerta de anamnesis si es necesaria
          if (hasAnamnesisData && !isAnamnesisComplete) {
            setHealthAlerts([{
              id: 'alert-anamnesis',
              title: 'Anamnesis incompleta',
              description: 'Complete su historial médico para recibir recomendaciones más precisas.',
              severity: 'critical',
              timestamp: new Date(),
              actionLabel: 'Completar ahora'
            }]);
          } else {
            setHealthAlerts([]);
          }
        });
        
        // Limpiar suscripción al desmontar
        return () => unsubscribe();
      } catch (error) {
        console.error('Error al configurar listener de alertas:', error);
      }
    };
    
    loadPatientAlerts();
  }, [patientId, hasAnamnesisData, isAnamnesisComplete]);
  
  // Manejar acciones de alertas
  const handleAlertAction = (alertId) => {
    if (alertId === 'alert-anamnesis') {
      // Redirigir a anamnesis (en una implementación real usaríamos router.push)
      window.location.href = `/dashboard/paciente/${patientId}/anamnesis`;
    }
    // Implementar otras acciones según el tipo de alerta
  };
  
  // Descartar alertas
  const handleDismissAlert = (alertId) => {
    setHealthAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };

  const handlePatientDataUpdate = useCallback((newData) => {
    if (patientData && newData) {
      const changedFields = [];
      const fieldsToCheck = [
        'name', 'nombreCompleto', 'documentoIdentidad', 'dni',
        'fechaNacimiento', 'birthDate', 'gender', 'sexo',
        'telefono', 'phone', 'email', 'correo'
      ];

      fieldsToCheck.forEach(field => {
        if (patientData[field] !== newData[field] && newData[field] !== undefined) {
          changedFields.push(field);
        }
      });

      if (changedFields.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PatientDashboardPage] Profile fields changed:', changedFields);
        }
        setProfileUpdateNotification({
          message: t('patient.profileUpdateMessage'),
          fields: changedFields,
          timestamp: new Date()
        });
        setTimeout(() => setProfileUpdateNotification(null), 5000);
      }
    }
  }, [patientData, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-semibold text-blue-600">Cargando dashboard del paciente...</p>
          <p className="mt-2 text-sm text-blue-400">Por favor espere mientras recuperamos su información</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-semibold text-red-600">No se pudieron cargar los datos del paciente.</p>
          <p className="mt-2 text-gray-600">Ha ocurrido un error al recuperar su información. Por favor, inténtelo nuevamente.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-screen p-3 mx-auto text-gray-800 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-sky-100">
      {/* Cabecera con control de vista y avatar */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-blue-100">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">
            <span className="mr-2">👋</span> 
            Hola, {patientData.name || patientData.nombreCompleto || 'Paciente'}
          </h1>
          <p className="mt-1 text-blue-600">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <ViewToggle onToggle={setIsDetailedView} />
          <AvatarButton patientData={patientData} />
        </div>
      </header>
      
      {/* Alertas de salud */}
      {healthAlerts.length > 0 && (
        <section className="mb-8">
          <DashboardCard 
            title="Alertas de Salud" 
            importance={healthAlerts.some(a => a.severity === 'critical') ? 'critical' : 'normal'}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            }
          >
            <HealthAlerts 
              alerts={healthAlerts} 
              onDismiss={handleDismissAlert} 
              onAction={handleAlertAction} 
            />
          </DashboardCard>
        </section>
      )}

      {profileUpdateNotification && (
        <div className="fixed z-50 max-w-xs p-4 transition-all duration-300 ease-in-out border-l-4 border-green-500 rounded-md shadow-lg top-4 right-4 sm:max-w-md bg-green-50 animate-slideInRight">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 break-words">
                {profileUpdateNotification.message}
              </p>
              {profileUpdateNotification.fields && profileUpdateNotification.fields.length > 0 && (
                <div className="text-xs text-green-700 mt-1.5">
                  <p className="mb-1 font-medium">{t('patient.updatedFields')}:</p>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    {profileUpdateNotification.fields.map((field, index) => {
                      const fieldMap = {
                        'name': t('patient.firstName'),
                        'nombreCompleto': t('patient.fullName'),
                        'documentoIdentidad': t('patient.idDocument'),
                        'dni': t('patient.dni'),
                        'fechaNacimiento': t('patient.dateOfBirth'),
                        'birthDate': t('patient.dateOfBirth'),
                        'gender': t('patient.gender'),
                        'sexo': t('patient.gender'),
                        'telefono': t('patient.phoneNumber'),
                        'phone': t('patient.phoneNumber'),
                        'email': t('patient.email'),
                        'correo': t('patient.email')
                      };
                      return (
                        <li key={`field-${index}`} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                          {fieldMap[field] || field}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <div className="mt-2 text-xs text-green-700 flex items-center border-t border-green-200 pt-1.5">
                <span className="inline-block w-2 h-2 mr-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-mono">
                  {profileUpdateNotification.timestamp.toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                </span>
                <button
                  className="ml-auto text-xs text-green-600 transition-colors hover:text-green-800"
                  onClick={() => setProfileUpdateNotification(null)}
                  aria-label={t('common.closeNotification')}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Contenido principal con grid adaptativo */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Columna principal */}
        <div className="space-y-6 md:col-span-2 lg:col-span-3">
          
          {/* Sección de Resumen Rápido - Siempre visible */}
          <DashboardCard
            title="Resumen de Salud"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
            importance="normal"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Estado de anamnesis */}
              <div className={`p-3 rounded-lg border ${!isAnamnesisComplete ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-start">
                  <div className={`mr-3 ${!isAnamnesisComplete ? 'text-yellow-500' : 'text-green-500'}`}>
                    {!isAnamnesisComplete ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className={`font-medium ${!isAnamnesisComplete ? 'text-yellow-800' : 'text-green-800'}`}>
                      Historial Médico
                    </h4>
                    <p className={`text-sm mt-1 ${!isAnamnesisComplete ? 'text-yellow-700' : 'text-green-700'}`}>
                      {!hasAnamnesisData ? 'No iniciado' : !isAnamnesisComplete ? 'Incompleto' : 'Completo'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <a 
                    href={`/dashboard/paciente/${patientId}/anamnesis`}
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-md ${!isAnamnesisComplete ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                  >
                    {!hasAnamnesisData ? 'Iniciar' : !isAnamnesisComplete ? 'Completar' : 'Revisar'}
                  </a>
                </div>
              </div>
              
              {/* Signos vitales */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-blue-800">Signos Vitales</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">Presión arterial:</span>
                    <span className="text-sm font-medium">120/80 mmHg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">Frecuencia cardíaca:</span>
                    <span className="text-sm font-medium">72 bpm</span>
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <a 
                    href={`/dashboard/paciente/${patientId}/metricas-salud`}
                    className="inline-block px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    Ver detalles
                  </a>
                </div>
              </div>
              
              {/* Próxima consulta */}
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                <h4 className="font-medium text-indigo-800">Próxima Consulta</h4>
                <div className="mt-2">
                  <p className="text-sm font-medium text-indigo-900">Dr. Martínez - Cardiología</p>
                  <p className="text-xs text-indigo-700 mt-1">Mayo 25, 2025 - 10:30 AM</p>
                </div>
                <div className="mt-3 text-right">
                  <a 
                    href={`/dashboard/paciente/${patientId}/consultas`}
                    className="inline-block px-3 py-1 text-xs font-medium rounded-md bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                  >
                    Ver agenda
                  </a>
                </div>
              </div>
            </div>
          </DashboardCard>
          
          {/* Secciones adaptativas que muestran más o menos detalle según la vista */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Métricas de Salud */}
            <DashboardCard
              title="Métricas de Salud"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              }
              expandable={true}
              isDetailed={isDetailedView}
              actionButton={
                <a 
                  href={`/dashboard/paciente/${patientId}/metricas-salud`}
                  className="p-1 rounded-full hover:bg-blue-200 text-blue-700"
                  title="Ver todas las métricas"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </a>
              }
            >
              <PatientVitals patientId={patientId} />
            </DashboardCard>
            
            {/* Medicamentos Actuales */}
            <DashboardCard
              title="Medicamentos Actuales"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              }
              expandable={true}
              isDetailed={isDetailedView}
              actionButton={
                <a 
                  href={`/dashboard/paciente/${patientId}/recetas`}
                  className="p-1 rounded-full hover:bg-blue-200 text-blue-700"
                  title="Ver todas las recetas"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </a>
              }
            >
              <MyPrescriptionsSection patientId={patientId} prescriptionsData={patientData?.prescriptionsData} />
            </DashboardCard>
          </div>
          
          {/* Consultas y Telemedicina */}
          <DashboardCard
            title="Mis Consultas"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            }
            expandable={true}
            isDetailed={isDetailedView}
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">Próximas citas</h4>
                <a 
                  href={`/dashboard/paciente/${patientId}/telemedicina`}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 hover:bg-green-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Telemedicina
                </a>
              </div>
              <MyConsultationsSection patientId={patientId} />
            </div>
          </DashboardCard>
          
          {/* Resultados y Diagnósticos */}
          <DashboardCard
            title="Resultados y Diagnósticos"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
              </svg>
            }
            expandable={true}
            isDetailed={isDetailedView}
          >
            <ResultsAndDiagnosticsSection patientId={patientId} />
          </DashboardCard>
          
          {/* Documentos y Mensajes - Solo visible en modo detallado */}
          {isDetailedView && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DashboardCard
                title="Historial de Documentos"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                }
              >
                <DocumentsHistory patientId={patientId} />
              </DashboardCard>
              
              <DashboardCard
                title="Notificaciones y Mensajes"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                }
                importance={patientData?.notifications?.some(n => n.important) ? 'warning' : 'normal'}
              >
                <NotificationsAndMessagesSection patientId={patientId} initialNotifications={patientData?.notifications} />
              </DashboardCard>
            </div>
          )}
        </div>
        
        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Panel de Evaluación de Riesgo */}
          <DashboardCard
            title="Evaluación de Riesgo"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            }
            importance="warning"
          >
            <RiskAssessmentPanel patientId={patientId} />
          </DashboardCard>
          
          {/* Perfil Médico - Mostrar completo solo en vista detallada */}
          <DashboardCard
            title="Mi Perfil Médico"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            }
            expandable={true}
            isDetailed={isDetailedView}
          >
            <MyMedicalProfileSection
              patientId={patientId}
              patientData={patientData}
              onUpdate={handlePatientDataUpdate}
            />
          </DashboardCard>
          
          {/* Solo visible en modo detallado */}
          {isDetailedView && (
            <DashboardCard
              title="Preferencias de Notificación"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
              }
            >
              <NotificationPreferences patientId={patientId} />
            </DashboardCard>
          )}
          
          {/* Ayuda y Soporte - Siempre visible */}
          <DashboardCard
            title="Ayuda y Soporte"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            }
            importance="low"
          >
            <HelpAndSupportSection />
          </DashboardCard>
        </div>
      </div>
      {/* Footer con acciones globales y créditos */}
      <footer className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <LogoutButton />
            <button 
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => window.location.reload()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Actualizar datos
            </button>
          </div>
          
          <div className="text-xs text-blue-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Última actualización: {new Date().toLocaleString()}
          </div>
        </div>
        
        <div className="text-center py-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">Altamedica Patient Dashboard &copy; {new Date().getFullYear()}</p>
          <p className="mt-1 text-xs text-gray-500">Versión 1.2.0 - Producción</p>
        </div>
      </footer>
    </div>
  );
}
