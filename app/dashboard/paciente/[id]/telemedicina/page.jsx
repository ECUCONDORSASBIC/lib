'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardCard from '@/app/components/dashboard/paciente/DashboardCard';

export default function TelemedicinePage() {
  const { id: patientId } = useParams();
  const [activeCall, setActiveCall] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [showCallControls, setShowCallControls] = useState(true);
  const [notes, setNotes] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('waiting'); // 'waiting', 'connecting', 'connected', 'ended'
  
  // Cargar citas y historial de llamadas desde la API
  useEffect(() => {
    const fetchAppointmentsData = async () => {
      try {
        // En producción, estas serían llamadas reales a la API
        // const appointmentsResponse = await fetch(`/api/patients/${patientId}/appointments`);
        // const callHistoryResponse = await fetch(`/api/patients/${patientId}/call-history`);
        
        // Para el MVP, usamos datos estáticos pero estructurados como vendrían de la API
        setUpcomingAppointments([]);
        setCallHistory([]);
        
        // Agregar indicador de carga completada
        console.log('[Telemedicina] Datos cargados correctamente');
      } catch (error) {
        console.error('[Telemedicina] Error al cargar datos:', error);
        // En producción, manejo de errores adecuado
        // setError('No se pudieron cargar sus citas. Por favor, intente nuevamente más tarde.');
      }
    };
    
    fetchAppointmentsData();
  }, [patientId]);
  
  const startCall = (appointment) => {
    setActiveCall(appointment);
    setConnectionStatus('connecting');
    setDoctorInfo({
      ...appointment,
      specialty: appointment.specialty,
      status: 'En línea'
    });
    
    // Simular conexión (después de 2 segundos cambia a conectado)
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };
  
  const endCall = () => {
    setConnectionStatus('ended');
    
    // Simular finalización de llamada (después de 3 segundos vuelve al estado inicial)
    setTimeout(() => {
      setActiveCall(null);
      setConnectionStatus('waiting');
      setNotes('');
    }, 3000);
  };
  
  // Componente para la video llamada activa
  const ActiveVideoCall = () => {
    if (!activeCall) return null;
    
    return (
      <div className="relative h-[calc(100vh-100px)] bg-gray-900 rounded-lg overflow-hidden">
        {/* Video principal (doctor) */}
        <div className="absolute inset-0">
          {connectionStatus === 'connecting' ? (
            <div className="flex items-center justify-center h-full bg-gray-800">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-white animate-pulse">Conectando con {doctorInfo.doctorName}...</p>
                <p className="mt-2 text-sm text-gray-400">Por favor espere mientras se establece la conexión</p>
              </div>
            </div>
          ) : connectionStatus === 'connected' ? (
            <div className="h-full">
              <img 
                src={doctorInfo.imageUrl} 
                alt={doctorInfo.doctorName}
                className="object-cover w-full h-full opacity-0 animate-fadeIn"
                style={{ animationDelay: '0.5s', animationDuration: '1s', animationFillMode: 'forwards' }}
              />
              
              {/* Overlay con degradado para mejorar visibilidad de controles */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>
          ) : connectionStatus === 'ended' ? (
            <div className="flex items-center justify-center h-full bg-gray-800">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-white">Llamada finalizada</p>
                <p className="mt-2 text-sm text-gray-400">Gracias por utilizar el servicio de telemedicina de Altamédica</p>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Video secundario (paciente) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden shadow-lg border-2 border-white z-10">
          {connectionStatus === 'connected' && (
            <div className="h-full bg-black flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Información del doctor */}
        {doctorInfo && connectionStatus === 'connected' && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg z-10">
            <div className="flex items-center">
              <div className="w-10 h-10 mr-3 rounded-full overflow-hidden border-2 border-white">
                <img src={doctorInfo.imageUrl} alt={doctorInfo.doctorName} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium">{doctorInfo.doctorName}</p>
                <p className="text-sm text-gray-300">{doctorInfo.specialty}</p>
              </div>
              <div className="ml-4 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
                <span className="text-xs text-green-300">{doctorInfo.status}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Controles de llamada mejorados */}
        {connectionStatus === 'connected' && showCallControls && (
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center z-10">
            {/* Tiempo de llamada */}
            <div className="mb-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-mono">
              <span>12:05</span>
            </div>
            
            {/* Barra de controles principal */}
            <div className="flex items-center space-x-3 md:space-x-4 p-2 bg-black/30 backdrop-blur-md rounded-xl">
              <button className="p-3 md:p-4 rounded-full bg-gray-700/90 text-white hover:bg-gray-600 transition-colors group relative" title="Ajustar audio">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0l-2.828 2.828" />
                </svg>
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Ajustar audio</span>
              </button>
              
              <button className="p-3 md:p-4 rounded-full bg-gray-700/90 text-white hover:bg-gray-600 transition-colors group relative" title="Silenciar micrófono">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Silenciar micrófono</span>
              </button>
              
              <button className="p-3 md:p-4 rounded-full bg-gray-700/90 text-white hover:bg-gray-600 transition-colors group relative" title="Apagar cámara">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Apagar cámara</span>
              </button>
              
              <button 
                className="p-4 md:p-5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors group relative" 
                onClick={endCall}
                title="Finalizar llamada"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Finalizar llamada</span>
              </button>
              
              <button className="p-3 md:p-4 rounded-full bg-gray-700/90 text-white hover:bg-gray-600 transition-colors group relative" title="Pantalla completa">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Pantalla completa</span>
              </button>
              
              <button className="p-3 md:p-4 rounded-full bg-blue-600/90 text-white hover:bg-blue-700 transition-colors group relative" title="Compartir pantalla">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Compartir pantalla</span>
              </button>
            </div>
            
            {/* Indicador de calidad de conexión */}
            <div className="mt-3 flex items-center space-x-2 text-white text-xs">
              <div className="flex space-x-0.5">
                <div className="h-2 w-1 bg-green-500 rounded-sm"></div>
                <div className="h-3 w-1 bg-green-500 rounded-sm"></div>
                <div className="h-4 w-1 bg-green-500 rounded-sm"></div>
                <div className="h-5 w-1 bg-green-500 rounded-sm"></div>
              </div>
              <span className="text-green-300">Conexión estable</span>
            </div>
          </div>
        )}
        
        {/* Panel lateral para notas */}
        {connectionStatus === 'connected' && (
          <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg z-20 transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">Notas de consulta</h3>
              <p className="text-sm text-gray-500">Estas notas serán compartidas con su médico</p>
            </div>
            <div className="p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-md text-sm"
                placeholder="Escriba sus notas, preguntas o síntomas aquí..."
              />
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Datos recientes relevantes:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center p-2 bg-blue-50 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Presión arterial: 128/82 mmHg (hace 2 días)</span>
                  </li>
                  <li className="flex items-center p-2 bg-green-50 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Glucemia: 102 mg/dL (hace 1 semana)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="container p-4 mx-auto">
      {!activeCall ? (
        <div className="space-y-6">
          <div className="pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Telemedicina</h1>
            <p className="mt-1 text-gray-600">Consultas médicas en línea desde la comodidad de su hogar</p>
          </div>
          
          {/* Próximas citas */}
          <DashboardCard
            title="Próximas Citas de Telemedicina"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            }
          >
            {upcomingAppointments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="py-4">
                    <div className="flex items-start sm:items-center flex-col sm:flex-row">
                      <div className="flex-shrink-0 mb-3 sm:mb-0">
                        <div className="relative">
                          <img
                            src={appointment.imageUrl}
                            alt={appointment.doctorName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                          />
                          <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                        </div>
                      </div>
                      <div className="ml-0 sm:ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{appointment.doctorName}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{appointment.specialty}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {appointment.date.toLocaleDateString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric'
                            })}
                          </div>
                          <div>
                            {appointment.date.getTime() - Date.now() < 15 * 60 * 1000 && appointment.status === 'confirmed' ? (
                              <button
                                onClick={() => startCall(appointment)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Iniciar consulta
                              </button>
                            ) : (
                              <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors">
                                Detalles
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-gray-500">No tiene citas programadas</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                  Programar una consulta
                </button>
              </div>
            )}
          </DashboardCard>
          
          {/* Historial de llamadas */}
          <DashboardCard
            title="Historial de Consultas"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            }
            expandable={true}
          >
            {callHistory.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {callHistory.map((call) => (
                  <li key={call.id} className="py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          src={call.imageUrl}
                          alt={call.doctorName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{call.doctorName}</h3>
                          <span className="text-sm text-gray-500">Duración: {call.duration}</span>
                        </div>
                        <p className="text-sm text-gray-500">{call.specialty}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {call.date.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="ml-4">
                        {call.hasRecording && (
                          <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Reproducir
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No hay consultas previas</p>
              </div>
            )}
          </DashboardCard>
          
          {/* Instrucciones para telemedicina */}
          <DashboardCard
            title="Preparación para su Consulta Virtual"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            }
          >
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Verifique su conexión a internet</h4>
                  <p className="mt-1 text-sm text-gray-500">Asegúrese de tener una conexión estable. Recomendamos una velocidad mínima de 1 Mbps.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Prepare un espacio adecuado</h4>
                  <p className="mt-1 text-sm text-gray-500">Busque un lugar tranquilo, bien iluminado y privado para su consulta.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">3</div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Tenga a mano información importante</h4>
                  <p className="mt-1 text-sm text-gray-500">Lista de medicamentos actuales, síntomas, preguntas que desee hacer al médico.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">4</div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Únase 5 minutos antes</h4>
                  <p className="mt-1 text-sm text-gray-500">Para verificar que su cámara y micrófono funcionen correctamente.</p>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      ) : (
        <ActiveVideoCall />
      )}
    </div>
  );
}
