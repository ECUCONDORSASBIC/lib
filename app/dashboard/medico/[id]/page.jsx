'use client';

import React, { useEffect, useState, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';
import DoctorHeader from '@/app/components/dashboard/medico/DoctorHeader';
import PatientList from '@/app/components/dashboard/medico/PatientList';
import NotificationsPanel from '@/app/components/dashboard/NotificationsPanel';
import VideoCallInterface from '@/app/components/telemedicine/VideoCallInterface';
import PatientHistory from '@/app/components/dashboard/shared/PatientHistory';
import PrescriptionForm from '@/app/components/dashboard/medico/PrescriptionForm';
import JobOffersList from '@/app/components/dashboard/medico/JobOffersList';
import JobApplicationsList from '@/app/components/dashboard/medico/JobApplicationsList';
import MedicalDashboardTabs from '@/app/components/dashboard/medico/MedicalDashboardTabs';
import { doctorDashboardReducer, initialState } from '@/app/reducers/doctorDashboardReducer';
import { fetchDoctorData, fetchPatients, fetchNotifications } from '@/app/services/doctorService';
import LoadingState from '@/app/components/ui/LoadingState';
import ErrorState from '@/app/components/ui/ErrorState';

export default function DoctorDashboardPage({ params }) {
    const router = useRouter();
    const { id } = params;
    const { user, userData } = useAuth();
    const [state, dispatch] = useReducer(doctorDashboardReducer, initialState);
    
    useEffect(() => {
        // Validación de acceso y redirecciones
        if (!user || !userData) {
            console.log('[Doctor Dashboard] No user or userData, redirecting to login');
            router.push('/auth/login');
            return;
        }
        
        if (userData.role !== 'medico' && userData.role !== 'admin') {
            console.log('[Doctor Dashboard] User is not a doctor, redirecting to dashboard');
            router.push('/dashboard');
            return;
        }
        
        if (userData.role === 'medico' && user.uid !== id) {
            console.log(`[Doctor Dashboard] Doctor trying to access another doctor's dashboard. Redirecting to their own.`);
            router.push(`/dashboard/medico/${user.uid}`);
            return;
        }
        
        // Iniciar carga de datos
        loadDashboardData();
    }, [user, userData, id, router]);
    
    const loadDashboardData = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            
            // Cargar datos en paralelo para mejorar rendimiento
            const [doctorData, patientsData, notificationsData] = await Promise.all([
                fetchDoctorData(id),
                fetchPatients(id),
                fetchNotifications(id)
            ]);
            
            dispatch({ type: 'LOAD_DOCTOR_DATA_SUCCESS', payload: doctorData });
            dispatch({ type: 'LOAD_PATIENTS_SUCCESS', payload: patientsData });
            dispatch({ type: 'LOAD_NOTIFICATIONS_SUCCESS', payload: notificationsData });
            dispatch({ type: 'SET_LOADING', payload: false });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    
    const handleStartVideoCall = (patient) => {
        dispatch({ type: 'SET_ACTIVE_PATIENT', payload: patient });
        dispatch({ type: 'SET_IN_CALL', payload: true });
    };
    
    const handleEndVideoCall = () => {
        dispatch({ type: 'SET_IN_CALL', payload: false });
    };
    
    const handleSelectPatient = (patient) => {
        dispatch({ type: 'SET_ACTIVE_PATIENT', payload: patient });
    };
    
    // Estados de UI
    if (state.loading) {
        return <LoadingState message="Cargando dashboard del médico..." />;
    }
    
    if (state.error) {
        return <ErrorState message={state.error} onRetry={loadDashboardData} />;
    }
    
    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <DoctorHeader 
                    doctor={state.doctor} 
                    unreadNotifications={state.notifications.filter(n => !n.read).length} 
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="col-span-1">
                        <PatientList
                            patients={state.patients}
                            onSelectPatient={handleSelectPatient}
                            onStartVideoCall={handleStartVideoCall}
                            doctorId={id}
                        />
                        
                        <NotificationsPanel 
                            notifications={state.notifications} 
                            onMarkAsRead={(notificationId) => dispatch({
                                type: 'MARK_NOTIFICATION_READ',
                                payload: notificationId
                            })}
                        />
                    </div>
                    
                    {/* Main content */}
                    <div className="col-span-1 lg:col-span-2">
                        {state.isInCall && state.activePatient ? (
                            <VideoCallInterface 
                                patient={state.activePatient}
                                doctorId={id}
                                onEndCall={handleEndVideoCall}
                            />
                        ) : state.activePatient ? (
                            <MedicalDashboardTabs
                                activePatient={state.activePatient}
                                doctorId={id}
                            />
                        ) : (
                            <div className="bg-white shadow rounded-lg p-8 text-center">
                                <h3 className="text-xl mb-4">Bienvenido a su dashboard médico</h3>
                                <p className="text-gray-600 mb-4">
                                    Seleccione un paciente para ver su historia clínica o iniciar una videollamada.
                                </p>
                                <div className="mt-6">
                                    <h4 className="font-medium text-lg mb-3">Estadísticas actuales</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 p-3 rounded">
                                            <div className="text-2xl font-bold">{state.patients.length}</div>
                                            <div className="text-sm text-gray-600">Pacientes</div>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded">
                                            <div className="text-2xl font-bold">{state.upcomingAppointments?.length || 0}</div>
                                            <div className="text-sm text-gray-600">Citas pendientes</div>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded">
                                            <div className="text-2xl font-bold">{state.notifications.filter(n => !n.read).length}</div>
                                            <div className="text-sm text-gray-600">Notificaciones</div>
                                        </div>
                                        <div className="bg-amber-50 p-3 rounded">
                                            <div className="text-2xl font-bold">{state.jobOffers?.length || 0}</div>
                                            <div className="text-sm text-gray-600">Ofertas</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Sección de empleo */}
                        <div className="bg-white shadow rounded-lg p-4 mt-6">
                            <JobOffersList 
                                offers={state.jobOffers} 
                                doctorId={id} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}