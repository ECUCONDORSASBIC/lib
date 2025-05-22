'use client';

import DocumentsHistory from '@/app/components/dashboard/paciente/DocumentsHistory';
import VideoCallHistory from '@/app/components/dashboard/paciente/VideoCallHistory';
import { useAuth } from '@/app/contexts/AuthContext';
import { Tab } from '@headlessui/react';
import { getPatientDetailsForDoctor } from '@/app/services/doctorService';
import { getRecentHealthMetrics } from '@/app/services/healthMetricsService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';

// Componentes adicionales
import MedicalNoteForm from '@/app/components/dashboard/medico/MedicalNoteForm';
import HealthMetricsAlerts from '@/app/components/dashboard/shared/HealthMetricsAlerts';
import PatientRiskAssessment from '@/app/components/dashboard/shared/PatientRiskAssessment';
import PatientVitals from '@/app/components/dashboard/shared/PatientVitals';
import PatientHealthMetrics from '@/app/components/PatientHealthMetrics';

// Componentes de UI y servicios
import { Toast } from '@/app/components/ui/Toast';
//import { retryOperation } from '@/lib/errorService'; // Commented until service is available

// Componente de esqueleto para carga progresiva
const SkeletonLoader = ({ height, className, count = 1 }) => (
  <>
    {Array(count).fill(0).map((_, index) => (
      <div 
        key={index} 
        className={`animate-pulse bg-gray-200 ${className}`} 
        style={{ height }}
      />
    ))}
  </>
);

export default function PatientDetail() {
  const params = useParams();
  const router = useRouter();
  // Handle both 'pacienteId' and 'id' parameters for compatibility
  const patientId = params.pacienteId || params.id;
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState({
    patient: true,
    metrics: true
  });
  const [error, setError] = useState(null);
  const [recentHealthMetrics, setRecentHealthMetrics] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Logger para auditar accesos a datos de pacientes
  const logPatientAccess = useCallback((action, details = {}) => {
    // Enviar a un servicio de logging (simulado por ahora)
    console.log(`[AUDIT] Doctor ${user?.uid} ${action} patient ${patientId}`, details);
    // En una implementación real, esto se enviaría a un servicio de registro de auditoría
  }, [user?.uid, patientId]);

  useEffect(() => {
    async function fetchPatientDetails() {
      if (!user?.uid || !patientId) return;      try {
        setLoading(prev => ({ ...prev, patient: true }));
        
        // Fetch patient details directly without retry operation
        const data = await getPatientDetailsForDoctor(user.uid, patientId);
        
        // Verificar permisos - El médico solo debe ver sus pacientes asignados
        if (!data) {
          setError('Paciente no encontrado o no tienes permisos para ver este paciente');
          setLoading(prev => ({ ...prev, patient: false }));
          return;
        }
        
        setPatient(data);
        
        // Registrar acceso en log de auditoría
        logPatientAccess('viewed', { timestamp: new Date().toISOString() });

        // También cargar métricas de salud recientes
        try {
          setLoading(prev => ({ ...prev, metrics: true }));
          const metrics = await getRecentHealthMetrics(patientId);
          setRecentHealthMetrics(metrics);
        } catch (metricErr) {
          console.error('Error fetching health metrics:', metricErr);
          // Mostrar toast en lugar de error bloqueante
          setToast({
            show: true,
            message: 'No se pudieron cargar las métricas de salud. Los datos pueden estar incompletos.',
            type: 'warning'
          });
        } finally {
          setLoading(prev => ({ ...prev, metrics: false }));
        }      } catch (err) {
        console.error('Error fetching patient details:', err);
        // Mensaje de error más descriptivo
        if (err.code === 'permission-denied') {
          setError('No tienes permiso para ver este paciente');
        } else if (!navigator.onLine) {
          setError('Error de conexión. Verifica tu conexión a internet.');
        } else {
          setError('No se pudo cargar la información del paciente. Intente nuevamente.');
        }
      } finally {
        setLoading(prev => ({ ...prev, patient: false }));
      }
    } fetchPatientDetails();  }, [patientId, user]);

  if (loading.patient || loading.metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-2 text-red-700">{error || 'No se encontró la información del paciente'}</p>
          <Link href="/dashboard/medico" className="mt-4 inline-block text-blue-600 hover:underline">
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/medico" className="text-blue-600 hover:underline text-sm">
          ← Volver al dashboard
        </Link>
      </div>      {/* Alertas de métricas de salud */}      {recentHealthMetrics && (
        <HealthMetricsAlerts
          metrics={recentHealthMetrics}
          patientId={patientId}
          patientName={patient.name || 'Paciente'}
        />
      )}

      {/* Cabecera del paciente */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold mr-4">
              {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{patient.name || 'Paciente'}</h1>
              <p className="text-gray-600">{patient.age ? `${patient.age} años` : 'Edad no disponible'} • {patient.gender || 'Género no especificado'}</p>              <div className="mt-1 text-sm text-gray-500">
                ID: {patientId} • Última actualización: {patient.lastUpdate ? format(new Date(patient.lastUpdate), 'PPP', { locale: es }) : 'No disponible'}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Iniciar videollamada
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Agendar cita
            </button>
          </div>
        </div>

        {/* Resumen de signos vitales */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <PatientVitals
            title="Presión Arterial"
            value={patient.vitals?.bloodPressure || 'N/A'}
            unit="mmHg"
            status={getVitalStatus(patient.vitals?.bloodPressure)}
          />
          <PatientVitals
            title="Frecuencia Cardíaca"
            value={patient.vitals?.heartRate || 'N/A'}
            unit="bpm"
            status={getVitalStatus(patient.vitals?.heartRate)}
          />
          <PatientVitals
            title="Glucosa"
            value={patient.vitals?.glucose || 'N/A'}
            unit="mg/dL"
            status={getVitalStatus(patient.vitals?.glucose)}
          />
          <PatientVitals
            title="IMC"
            value={patient.vitals?.bmi || 'N/A'}
            unit="kg/m²"
            status={getVitalStatus(patient.vitals?.bmi)}
          />
        </div>
      </div>      {/* Pestañas con información del paciente */}
      <Tab.Group>
        <Tab.List className="flex p-1 space-x-1 bg-white rounded-lg shadow-md">
          <Tab className={({ selected }) => `w-full py-3 text-sm font-medium rounded-md ${selected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}>
            Anamnesis
          </Tab>
          <Tab className={({ selected }) => `w-full py-3 text-sm font-medium rounded-md ${selected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}>
            Evaluación de Riesgo
          </Tab>          <Tab className={({ selected }) => `w-full py-3 text-sm font-medium rounded-md ${selected ? 'bg-sky-100 text-sky-600' : 'text-gray-700 hover:bg-gray-100'
            }`}>
            Métricas de Salud
          </Tab>
          <Tab className={({ selected }) => `w-full py-3 text-sm font-medium rounded-md ${selected ? 'bg-sky-100 text-sky-600' : 'text-gray-700 hover:bg-gray-100'
            }`}>
            Historial
          </Tab>
          <Tab className={({ selected }) => `w-full py-3 text-sm font-medium rounded-md ${selected ? 'bg-sky-100 text-sky-600' : 'text-gray-700 hover:bg-gray-100'
            }`}>
            Notas Médicas
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-4">
          {/* Panel de Anamnesis */}
          <Tab.Panel className="bg-white rounded-lg shadow-md p-6">
            {patient.anamnesis ? (
              <div className="space-y-6">
                {/* Motivo de consulta */}
                {patient.anamnesis.motivo_consulta && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Motivo de Consulta</h3>
                    <p className="text-gray-700">{patient.anamnesis.motivo_consulta.descripcion}</p>
                    {patient.anamnesis.motivo_consulta.duracion && (
                      <p className="text-sm text-gray-600 mt-1">Duración: {patient.anamnesis.motivo_consulta.duracion}</p>
                    )}
                  </div>
                )}

                {/* Antecedentes */}
                {patient.anamnesis.antecedentes_personales && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Antecedentes Personales</h3>
                    {patient.anamnesis.antecedentes_personales.enfermedades_cronicas?.length > 0 && (
                      <div className="mb-2">
                        <h4 className="text-md font-medium text-gray-700">Enfermedades crónicas:</h4>
                        <ul className="list-disc pl-5">
                          {patient.anamnesis.antecedentes_personales.enfermedades_cronicas.map((enfermedad, idx) => (
                            <li key={idx} className="text-gray-700">{enfermedad}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Más secciones de antecedentes... */}
                  </div>
                )}

                {/* Más secciones de la anamnesis... */}
              </div>
            ) : (
              <p className="text-gray-500">Este paciente no tiene una anamnesis registrada.</p>
            )}
          </Tab.Panel>          {/* Panel de Evaluación de Riesgo */}
          <Tab.Panel className="bg-white rounded-lg shadow-md p-6">
            {patient.riskAssessment ? (
              <PatientRiskAssessment data={patient.riskAssessment} />
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No hay evaluaciones de riesgo disponibles para este paciente.</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Realizar nueva evaluación de riesgo
                </button>
              </div>
            )}
          </Tab.Panel>

          {/* Panel de Métricas de Salud */}
          <Tab.Panel className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Métricas de Salud del Paciente</h3>
            <PatientHealthMetrics patientId={pacienteId} />
          </Tab.Panel>

          {/* Panel de Historial */}
          <Tab.Panel className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Videollamadas</h3>
                <VideoCallHistory calls={patient.videoCalls || []} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Documentos</h3>
                <DocumentsHistory documents={patient.documents || []} />
              </div>
            </div>
          </Tab.Panel>

          {/* Panel de Notas Médicas */}
          <Tab.Panel className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Nueva Nota Médica</h3>
              <MedicalNoteForm patientId={pacienteId} doctorId={user?.uid} />
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Historial de Notas</h3>
              {patient.medicalNotes && patient.medicalNotes.length > 0 ? (
                <div className="space-y-4">
                  {patient.medicalNotes.map(note => (
                    <div key={note.id} className="p-4 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">{note.doctorName}</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(note.timestamp), 'PPp', { locale: es })}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
                      {note.diagnosis && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Diagnóstico:</span>{' '}
                          <span className="text-gray-700">{note.diagnosis}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay notas médicas registradas.</p>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

// Helper para determinar el estado de un signo vital
function getVitalStatus(value) {
  if (!value) return 'neutral';

  // Aquí iría la lógica para determinar si un valor está en rango normal, alto o bajo
  // Esta es una implementación simple de ejemplo
  const num = parseFloat(value.toString().split('/')[0]);
  if (isNaN(num)) return 'neutral';

  if (num > 140) return 'high';
  if (num < 90) return 'low';
  return 'normal';
}
