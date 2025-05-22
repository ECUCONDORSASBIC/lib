'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Firebase and Vertex AI imports
import { app } from '@/lib/firebase';
import { getGenerativeModel, getVertexAI } from 'firebase/vertexai';

// Servicios para datos reales
import { getAnamnesisDataSummary } from '@/app/services/anamnesisService';

// Health metrics services
import HealthMetricsForm from '@/app/components/HealthMetricsForm';
import { getBloodPressureReadings, getGlucoseReadings } from '../../../services/healthMetricsService';

// Format date for charts
const formatChartDate = (date) => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, 'MMM d', { locale: es });
};

// Helper to format blood pressure data for chart
const formatBloodPressureData = (readings) => {
  return readings.map(reading => ({
    name: formatChartDate(reading.timestamp),
    "Presión Arterial (Sistólica)": reading.systolic,
    "Presión Arterial (Diastólica)": reading.diastolic
  })).reverse(); // Reverse to show oldest first
};

// Helper to format glucose data for chart
const formatGlucoseData = (readings) => {
  return readings.map(reading => ({
    name: formatChartDate(reading.timestamp),
    "Glucemia (mg/dL)": reading.value
  })).reverse(); // Reverse to show oldest first
};

// Helper to determine blood pressure status
const getBpStatus = (systolic, diastolic) => {
  if (systolic >= 180 || diastolic >= 120) return { status: 'crisis', text: 'Crisis hipertensiva' };
  if (systolic >= 140 || diastolic >= 90) return { status: 'high', text: 'Alta' };
  if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) return { status: 'elevated', text: 'Elevada' };
  if (systolic < 130 && diastolic < 80) return { status: 'normal', text: 'Normal' };
  return { status: 'unknown', text: 'No determinado' };
};

// Helper to determine glucose status
const getGlucoseStatus = (value, isFasting) => {
  if (isFasting) {
    if (value < 70) return { status: 'low', text: 'Baja' };
    if (value >= 70 && value <= 99) return { status: 'normal', text: 'Normal' };
    if (value >= 100 && value <= 125) return { status: 'prediabetic', text: 'Prediabética' };
    if (value >= 126) return { status: 'diabetic', text: 'Diabética' };
  } else {
    if (value < 70) return { status: 'low', text: 'Baja' };
    if (value >= 70 && value <= 139) return { status: 'normal', text: 'Normal' };
    if (value >= 140 && value <= 199) return { status: 'prediabetic', text: 'Prediabética' };
    if (value >= 200) return { status: 'diabetic', text: 'Diabética' };
  }
  return { status: 'unknown', text: 'No determinado' };
};

const HealthMetricCard = ({ title, value, unit, status }) => {
  const isNA = value === 'N/A';

  const getStatusColor = (status) => {
    if (!status) return 'var(--primary)';
    switch (status) {
      case 'normal':
        return 'var(--success)';
      case 'elevated':
        return 'var(--warning)';
      case 'high':
      case 'crisis':
      case 'diabetic':
        return 'var(--error)';
      case 'prediabetic':
        return 'var(--warning)';
      case 'low':
        return 'var(--secondary)';
      default:
        return 'var(--primary)';
    }
  };

  return (
    <div className="p-4 transition-shadow rounded-lg shadow hover:shadow-md" style={{ backgroundColor: 'var(--background)' }}>
      <h3 className="text-sm font-medium" style={{ color: 'var(--foreground-light)' }}>{title}</h3>
      {isNA ? (
        <div className="mt-1">
          <p style={{ color: 'var(--foreground-light)' }}>Sin registros</p>
          <button
            onClick={() => alert('Esta función estará disponible próximamente.')}
            className="mt-1 text-sm underline" 
            style={{ color: 'var(--primary)', ':hover': { color: 'var(--primary-dark)' } }}
          >
            Registrar
          </button>
        </div>
      ) : (
        <div>
          <p className={`text-2xl font-semibold`} style={{ color: getStatusColor(status) }}>
            {value} <span className="text-sm text-gray-500">{unit}</span>
          </p>
          {status && (
            <p className="text-xs font-medium" style={{ color: getStatusColor(status) }}>
              {status.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const QuickActionButton = ({ children, onClick, icon }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-full px-4 py-2 space-x-2 font-semibold text-white transition-colors rounded-lg shadow sm:w-auto"
    style={{
      backgroundColor: 'var(--primary)',
      ':hover': { backgroundColor: 'var(--primary-dark)' }
    }}
    aria-label={children}
  >
    {icon}
    <span>{children}</span>
  </button>
);

const WelcomeSection = ({ patientData }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [glucoseData, setGlucoseData] = useState([]);
  const [latestBp, setLatestBp] = useState(null);
  const [latestGlucose, setLatestGlucose] = useState(null);
  const [showHealthMetricsForm, setShowHealthMetricsForm] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [greeting, setGreeting] = useState(''); // Added for time-based greeting
  const [anamnesisData, setAnamnesisData] = useState(null); // Para datos reales de anamnesis
  const [isLoadingAnamnesis, setIsLoadingAnamnesis] = useState(false); // Estado de carga

  // Initialize Vertex AI and model
  const model = useMemo(() => {
    if (!app) {
      console.error("Firebase app is not initialized. Vertex AI services will be unavailable.");
      return null;
    }
    try {
      const vertexAI = getVertexAI(app);
      return getGenerativeModel(vertexAI, { model: "gemini-2.0-flash" });
    } catch (error) {
      console.error("Error initializing Vertex AI model:", error);
      return null;
    }
  }, []);

  // Cargar datos de anamnesis para el dashboard
  useEffect(() => {
    const fetchAnamnesisData = async () => {
      if (!patientData || !patientData.id) return;
      
      setIsLoadingAnamnesis(true);
      try {
        const summaryData = await getAnamnesisDataSummary(patientData.id);
        setAnamnesisData(summaryData);
      } catch (error) {
        console.error('Error al cargar datos de anamnesis:', error);
      } finally {
        setIsLoadingAnamnesis(false);
      }
    };
    
    fetchAnamnesisData();
  }, [patientData]);

  // Fetch health metrics data
  useEffect(() => {
    const fetchHealthMetrics = async () => {
      if (!patientData || !patientData.id) return;

      setLoadingMetrics(true);
      try {
        // Fetch blood pressure readings
        const bpReadings = await getBloodPressureReadings(patientData.id, { limit: 6 });
        if (bpReadings && bpReadings.length > 0) {
          setBloodPressureData(formatBloodPressureData(bpReadings));
          setLatestBp(bpReadings[0]); // Most recent reading
        }

        // Fetch glucose readings
        const glucoseReadings = await getGlucoseReadings(patientData.id, { limit: 6 });
        if (glucoseReadings && glucoseReadings.length > 0) {
          setGlucoseData(formatGlucoseData(glucoseReadings));
          setLatestGlucose(glucoseReadings[0]); // Most recent reading
        }
      } catch (error) {
        console.error('Error fetching health metrics:', error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchHealthMetrics();
  }, [patientData]);

  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Buenos días');
    } else if (hour < 18) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }
  }, []);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !model || isAiResponding) return;

    const newHumanMessage = { sender: 'user', text: chatMessage };
    setChatHistory(prev => [...prev, newHumanMessage]);
    const currentMessage = chatMessage;
    setChatMessage('');
    setIsAiResponding(true);

    try {
      console.log(`Sending prompt to Gemini: "${currentMessage}"`);
      const result = await model.generateContent(currentMessage);
      const response = result.response;
      const text = response.text();

      const aiResponse = { sender: 'ai', text: text || "No se pudo obtener una respuesta." };
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating content with Vertex AI Gemini:', error);
      const errorResponse = { sender: 'ai', text: 'Lo siento, no pude procesar tu solicitud en este momento.' };
      setChatHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleMetricsSuccess = (metricType) => {
    // Refresh data after adding new metrics
    const fetchUpdatedMetrics = async () => {
      if (!patientData || !patientData.id) return;

      try {
        if (metricType === 'bloodPressure') {
          const bpReadings = await getBloodPressureReadings(patientData.id, { limit: 6 });
          if (bpReadings && bpReadings.length > 0) {
            setBloodPressureData(formatBloodPressureData(bpReadings));
            setLatestBp(bpReadings[0]); // Update latest reading
          }
        } else if (metricType === 'glucose') {
          const glucoseReadings = await getGlucoseReadings(patientData.id, { limit: 6 });
          if (glucoseReadings && glucoseReadings.length > 0) {
            setGlucoseData(formatGlucoseData(glucoseReadings));
            setLatestGlucose(glucoseReadings[0]); // Update latest reading
          }
        }
      } catch (error) {
        console.error('Error refreshing health metrics:', error);
      }
    };

    fetchUpdatedMetrics();
    setShowHealthMetricsForm(false);
  };

  // Get BP status
  const bpStatus = latestBp
    ? getBpStatus(latestBp.systolic, latestBp.diastolic)
    : null;

  // Get glucose status
  const glucoseStatus = latestGlucose
    ? getGlucoseStatus(latestGlucose.value, latestGlucose.fasting)
    : null;

  // Format BP for display
  const bpDisplay = latestBp
    ? `${latestBp.systolic}/${latestBp.diastolic}`
    : (patientData.vitalSigns?.bloodPressure || 'N/A');

  // Format glucose for display
  const glucoseDisplay = latestGlucose
    ? `${latestGlucose.value}`
    : (patientData.vitalSigns?.glucose || 'N/A');

  return (
    <section id="inicio" className="p-6 space-y-6 shadow-lg rounded-xl" style={{ backgroundColor: 'var(--background-alt)' }}>
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
        <div className="relative w-24 h-24 overflow-hidden rounded-full shadow-md sm:w-32 sm:h-32" style={{ borderColor: 'var(--primary)', borderWidth: '2px' }}>
          <Image
            src={patientData.avatarUrl || '/default-avatar.png'}
            alt={`Foto de ${patientData.nombre || patientData.name}`}
            layout="fill"
            objectFit="cover"
            className="rounded-full"
            priority
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--primary-dark)' }}>
            {greeting}, {anamnesisData?.personalInfo?.nombre || patientData.nombre || patientData.name}
          </h2>
          <p style={{ color: 'var(--foreground-light)' }}>Tu salud es nuestra prioridad.</p>
          {anamnesisData?.personalInfo && (
            <div className="mt-2 text-sm" style={{ color: 'var(--foreground-light)' }}>
              <span className="mr-2">{anamnesisData.personalInfo.edad} años</span>•
              <span className="mx-2">{anamnesisData.personalInfo.sexo}</span>•
              <span className="mx-2">{anamnesisData.personalInfo.ocupacion || 'Ocupación no especificada'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HealthMetricCard
          title="Presión Arterial"
          value={bpDisplay}
          status={bpStatus}
        />
        <HealthMetricCard
          title="Ritmo Cardíaco"
          value={patientData.vitalSigns?.heartRate || 'N/A'}
          unit="lpm"
        />
        <HealthMetricCard
          title="Glucemia"
          value={glucoseDisplay}
          unit="mg/dL"
          status={glucoseStatus}
        />
        <div className="col-span-1 p-4 transition-shadow bg-white rounded-lg shadow hover:shadow-md sm:col-span-2 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-500">Resultados Último Check-up</h3>
        </div>
        <div className="flex space-x-2">
          <QuickActionButton 
            onClick={() => setShowHealthMetricsForm(true)}
            icon={<span className="mr-1.5">📊</span>}
          >
            Registrar métricas
          </QuickActionButton>
        </div>
        <div className="flex space-x-2">
          <QuickActionButton 
            onClick={() => {
              alert('Funcionalidad en desarrollo: Ver próximas consultas');
              console.log('Ver próximas consultas');
            }}
            icon={<span role="img" aria-label="eye">👁️</span>}
          >
            Ver Próximas Consultas
          </QuickActionButton>
        </div>
      </div>

      {/* Health metrics form modal */}
      {showHealthMetricsForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <HealthMetricsForm
            patientId={patientData.id}
            onSuccess={handleMetricsSuccess}
            onClose={() => setShowHealthMetricsForm(false)}
          />
        </div>
      )}

      <div className="space-y-6">        <div className="p-4 rounded-lg shadow" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-700">Presión Arterial (Últimos Meses)</h3>
          <a
            href={`/dashboard/paciente/${patientData.id}/metricas-salud`}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Ver más →
          </a>
        </div>
        {loadingMetrics ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : bloodPressureData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bloodPressureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Presión Arterial (Sistólica)" stroke="#3B82F6" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Presión Arterial (Diastólica)" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No hay datos de presión arterial disponibles</p>
          </div>
        )}
      </div>
        <div className="p-4 rounded-lg shadow" style={{ backgroundColor: 'var(--background)' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Niveles de Glucemia (Últimos Meses)</h3>
            <a
              href={`/dashboard/paciente/${patientData.id}/metricas-salud`}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Ver más →
            </a>
          </div>
          {loadingMetrics ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Cargando datos...</p>
            </div>
          ) : glucoseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Glucemia (mg/dL)" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No hay datos de glucemia disponibles</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 rounded-lg shadow" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Asistente Virtual Altamedica IA</h3>
          <a
            href={`/dashboard/paciente/${patientData.id}/entrena-ia`}
            className="flex items-center px-3 py-1 text-sm font-medium transition-colors rounded-md"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', ':hover': { backgroundColor: 'var(--primary-light)' } }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Entrenar IA
          </a>
        </div>
        <div className="h-64 p-4 mb-4 space-y-3 overflow-y-auto rounded-md" style={{ backgroundColor: 'var(--background-alt)', borderColor: 'var(--primary-light)', borderWidth: '1px' }}>
          {chatHistory.length === 0 && !isAiResponding && <p className="text-center" style={{ color: 'var(--foreground-light)' }}>Pregúntame sobre tus consultas, tratamientos o resultados.</p>}
          {isAiResponding && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].sender === 'user' && (
            <div className="flex justify-start">
              <div className="max-w-xs px-4 py-2 rounded-lg shadow lg:max-w-md" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
                <p className="italic">Altamedica IA está pensando...</p>
              </div>
            </div>
          )}
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow" 
                style={{ 
                  backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--background)', 
                  color: msg.sender === 'user' ? 'white' : 'var(--foreground)' 
                }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>        <form onSubmit={handleChatSubmit} className="flex space-x-2">
          <input
            type="text"
            id="chatMessage"
            name="chatMessage"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Escribe tu pregunta aquí..."
            className="flex-grow p-2 border rounded-lg outline-none"
            style={{ 
              borderColor: 'var(--primary-light)', 
              color: 'var(--foreground)',
              backgroundColor: 'var(--background)',
              ':focus': { borderColor: 'var(--primary)', outlineColor: 'var(--focus-ring)' } 
            }}
            disabled={isAiResponding || !model}
          />
          <button
            type="submit"
            className="px-4 py-2 font-semibold text-white transition-colors rounded-lg shadow disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--success)', 
              ':hover': { backgroundColor: 'var(--success)', filter: 'brightness(0.95)' } 
            }}
            disabled={isAiResponding || !chatMessage.trim() || !model}
          >
            {isAiResponding ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>

      <div className="p-6 rounded-lg shadow" style={{ backgroundColor: 'var(--background)' }}>
        <h3 className="mb-3 text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Plan de Facturación</h3>
        <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--background-alt)', borderColor: 'var(--primary-light)', borderWidth: '1px' }}>
          <p style={{ color: 'var(--foreground)' }}><span className="font-semibold">Plan Actual:</span> {patientData.billingPlan?.name || 'No especificado'}</p>
          <p style={{ color: 'var(--foreground)' }}><span className="font-semibold">Estado:</span> <span className="font-medium" style={{ color: patientData.billingPlan?.status === 'Activo' ? 'var(--success)' : 'var(--error)' }}>{patientData.billingPlan?.status || 'N/A'}</span></p>
          <button className="px-4 py-2 mt-3 text-sm font-semibold text-white transition-colors rounded-lg shadow"
            style={{ backgroundColor: 'var(--primary)', ':hover': { backgroundColor: 'var(--primary-dark)' } }}>
            Gestionar Plan
          </button>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
