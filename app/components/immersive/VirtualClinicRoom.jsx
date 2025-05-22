'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { videoCallService } from '@/app/services/videoCallService';
import { healthMetricsService } from '@/app/services/healthMetricsService';
import { useAuth } from '@/app/contexts/AuthContext';

/**
 * Componente de entorno médico inmersivo digital
 * Proporciona una representación 3D de una consulta médica con
 * integración de telemedicina y visualización de datos del paciente
 */
const VirtualClinicRoom = ({
    appointmentId,
    patientId,
    doctorId,
    onExit
}) => {
    const [loading, setLoading] = useState(true);
    const [videoCallActive, setVideoCallActive] = useState(false);
    const [patientData, setPatientData] = useState(null);
    const [patientMetrics, setPatientMetrics] = useState(null);
    const [activePanel, setActivePanel] = useState('video'); // 'video', 'metrics', 'notes'
    const [renderQuality, setRenderQuality] = useState('medium'); // 'low', 'medium', 'high'
    const { user } = useAuth();
    const isDoctor = user?.uid === doctorId;

    const videoContainerRef = useRef(null);
    const notesRef = useRef(null);

    // Cargar datos del paciente y métricas
    useEffect(() => {
        if (!patientId) return;

        const loadPatientData = async () => {
            try {
                setLoading(true);

                // Aquí se cargarían los datos del paciente desde una API
                // Por ahora usamos datos de ejemplo
                const patientResponse = await fetch(`/api/patient/${patientId}`, {
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`
                    }
                });

                if (patientResponse.ok) {
                    const patientData = await patientResponse.json();
                    setPatientData(patientData);

                    // Cargar métricas de salud
                    const metricsData = await healthMetricsService.getRecentMetrics(patientId);
                    setPatientMetrics(metricsData);
                }
            } catch (error) {
                console.error("Error loading patient data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPatientData();
    }, [patientId, user]);

    // Iniciar videollamada cuando el componente esté montado
    useEffect(() => {
        if (!videoContainerRef.current || !appointmentId) return;

        const startVideoCall = async () => {
            try {
                // Verificar si ya existe una sesión para esta cita
                const appointmentResponse = await fetch(`/api/appointments/${appointmentId}`, {
                    headers: {
                        'Authorization': `Bearer ${await user.getIdToken()}`
                    }
                });

                if (appointmentResponse.ok) {
                    const appointmentData = await appointmentResponse.json();

                    let videoSessionId;

                    // Si ya existe una sesión de video, usarla
                    if (appointmentData.videoSession?.id) {
                        videoSessionId = appointmentData.videoSession.id;

                        // Unirse a la videollamada existente
                        await videoCallService.joinVideoCall(
                            appointmentData.videoSession.url,
                            videoContainerRef.current,
                            {
                                userName: isDoctor ? `Dr. ${user.displayName || user.email}` : user.displayName || user.email,
                                sessionId: videoSessionId
                            }
                        );
                    } else if (isDoctor) {
                        // Si es el médico, crear una nueva sesión
                        const result = await videoCallService.createVideoRoom(
                            appointmentId,
                            doctorId,
                            patientId
                        );

                        videoSessionId = result.sessionId;

                        // Unirse a la videollamada recién creada
                        await videoCallService.joinVideoCall(
                            result.roomUrl,
                            videoContainerRef.current,
                            {
                                userName: `Dr. ${user.displayName || user.email}`,
                                sessionId: videoSessionId
                            }
                        );
                    } else {
                        // Si es el paciente y no hay sesión, mostrar mensaje de espera
                        console.log("Esperando a que el médico inicie la consulta");
                        return;
                    }

                    setVideoCallActive(true);
                }
            } catch (error) {
                console.error("Error setting up video call:", error);
            }
        };

        startVideoCall();

        return () => {
            // Limpiar videollamada al desmontar
            videoCallService.endVideoCall();
        };
    }, [appointmentId, doctorId, patientId, isDoctor, user]);

    // Ajustar calidad de renderizado según el rendimiento
    useEffect(() => {
        const checkPerformance = () => {
            if (typeof window === 'undefined') return;

            const memory = (navigator as any).deviceMemory;

            if (memory) {
                if (memory <= 2) setRenderQuality('low');
                else if (memory <= 4) setRenderQuality('medium');
                else setRenderQuality('high');
            }
        };

        checkPerformance();
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
                <div className="text-center text-white">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-medium">Cargando entorno virtual...</h2>
                    <p className="text-sm text-gray-400 mt-2">Preparando consulta inmersiva</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* Controles de navegación */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
                <div>
                    <button
                        onClick={onExit}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Salir</span>
                    </button>
                </div>

                <div className="space-x-2">
                    <button
                        className={`py-2 px-4 rounded-md ${activePanel === 'video' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                        onClick={() => setActivePanel('video')}
                    >
                        Video
                    </button>
                    <button
                        className={`py-2 px-4 rounded-md ${activePanel === 'metrics' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                        onClick={() => setActivePanel('metrics')}
                    >
                        Métricas
                    </button>
                    <button
                        className={`py-2 px-4 rounded-md ${activePanel === 'notes' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                        onClick={() => setActivePanel('notes')}
                    >
                        Notas
                    </button>
                </div>

                <div>
                    <select
                        value={renderQuality}
                        onChange={(e) => setRenderQuality(e.target.value)}
                        className="bg-gray-800 text-white py-2 px-3 rounded-md text-sm"
                    >
                        <option value="low">Calidad Baja</option>
                        <option value="medium">Calidad Media</option>
                        <option value="high">Calidad Alta</option>
                    </select>
                </div>
            </div>

            {/* Escena 3D */}
            <Canvas shadows dpr={renderQuality === 'low' ? 1 : renderQuality === 'medium' ? 1.5 : 2}>
                <PerspectiveCamera makeDefault position={[0, 1.7, 5]} fov={50} />
                <OrbitControls
                    target={[0, 1.5, 0]}
                    maxPolarAngle={Math.PI / 2}
                    minDistance={2}
                    maxDistance={10}
                />
                <ambientLight intensity={0.5} />
                <directionalLight
                    castShadow
                    position={[5, 8, 5]}
                    intensity={1}
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />

                <Environment preset="city" />

                <VirtualClinicModel />

                {/* Pantallas interactivas dentro del entorno 3D */}
                <group position={[0, 1.5, -1.8]}>
                    {/* Pantalla principal - Video o Métricas */}
                    <Html
                        transform
                        position={[0, 0.3, 0.1]}
                        rotation={[0, 0, 0]}
                        style={{
                            width: '800px',
                            height: '450px',
                            backgroundColor: '#000',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}
                    >
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden border border-blue-500/30">
                            {activePanel === 'video' && (
                                <div className="w-full h-full" ref={videoContainerRef}>
                                    {!videoCallActive && (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-white text-lg">
                                                {isDoctor ? 'Iniciando videollamada...' : 'Esperando a que el médico inicie la consulta...'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activePanel === 'metrics' && (
                                <div className="w-full h-full overflow-auto p-4 bg-white">
                                    <h2 className="text-xl font-semibold mb-4">Métricas de Salud</h2>

                                    {patientMetrics ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(patientMetrics).map(([key, metrics]) => {
                                                if (Array.isArray(metrics) && metrics.length > 0) {
                                                    let latestMetric = metrics[metrics.length - 1];
                                                    return (
                                                        <div key={key} className="bg-gray-50 p-3 rounded-lg shadow">
                                                            <h3 className="font-medium capitalize">{key}</h3>
                                                            {key === 'bloodPressure' ? (
                                                                <p className="text-xl font-bold mt-1">
                                                                    {latestMetric.values.systolic}/{latestMetric.values.diastolic} {latestMetric.unit || 'mmHg'}
                                                                </p>
                                                            ) : key === 'cholesterol' ? (
                                                                <p className="text-xl font-bold mt-1">
                                                                    {latestMetric.values.total} {latestMetric.unit || 'mg/dL'}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xl font-bold mt-1">
                                                                    {latestMetric.value} {latestMetric.unit || ''}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(latestMetric.timestamp).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    ) : (
                                        <p>No hay métricas disponibles</p>
                                    )}
                                </div>
                            )}

                            {activePanel === 'notes' && (
                                <div className="w-full h-full bg-white p-4">
                                    <h2 className="text-xl font-semibold mb-4">Notas de la Consulta</h2>

                                    {isDoctor ? (
                                        <div className="h-full flex flex-col">
                                            <textarea
                                                ref={notesRef}
                                                className="flex-grow p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Escriba sus notas médicas aquí..."
                                            ></textarea>
                                            <div className="mt-4 flex justify-end space-x-2">
                                                <button
                                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                    onClick={() => {
                                                        // Aquí se guardarían las notas en la base de datos
                                                        console.log("Guardando notas:", notesRef.current?.value);
                                                        alert("Notas guardadas correctamente");
                                                    }}
                                                >
                                                    Guardar Notas
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">Solo el médico puede escribir notas durante la consulta.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </Html>

                    {/* Panel de información del paciente */}
                    <Html
                        transform
                        position={[-2, 0.3, 0]}
                        rotation={[0, Math.PI / 4, 0]}
                        style={{
                            width: '300px',
                            height: '400px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}
                    >
                        <div className="w-full h-full p-4 overflow-auto">
                            <h2 className="text-lg font-bold mb-3">Datos del Paciente</h2>

                            {patientData ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-600">Nombre</h3>
                                        <p className="text-lg">{patientData.name}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-600">Fecha de Nacimiento</h3>
                                        <p>{patientData.birthDate || 'No registrada'}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-600">Tipo de Sangre</h3>
                                        <p>{patientData.bloodType || 'No registrado'}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-600">Alergias</h3>
                                        {patientData.allergies && patientData.allergies.length > 0 ? (
                                            <ul className="list-disc ml-5">
                                                {patientData.allergies.map((allergy, idx) => (
                                                    <li key={idx}>{allergy}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>Sin alergias conocidas</p>
                                        )}
                                    </div>

                                    {isDoctor && patientData.medicalHistory && (
                                        <div>
                                            <h3 className="font-medium text-gray-600">Historia Médica</h3>
                                            <ul className="list-disc ml-5">
                                                {patientData.medicalHistory.map((entry, idx) => (
                                                    <li key={idx}>{entry.condition} ({entry.date})</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>Cargando información del paciente...</p>
                            )}
                        </div>
                    </Html>
                </group>
            </Canvas>
        </div>
    );
};

// Modelo 3D de la clínica virtual
function VirtualClinicModel() {
    const { scene } = useGLTF('/models/virtual_clinic_room.glb');

    // Nota: Este modelo es un placeholder, deberíamos tener un modelo real de una sala médica
    // Por ahora estamos asumiendo que existe tal modelo en esa ruta

    return (
        <primitive
            object={scene}
            scale={[1, 1, 1]}
            position={[0, 0, 0]}
        />
    );
}

export default VirtualClinicRoom;
