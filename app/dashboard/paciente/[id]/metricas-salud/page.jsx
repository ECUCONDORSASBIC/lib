'use client';

import BloodPressureTrends from '@components/BloodPressureTrends';
import GlucoseTrends from '@components/GlucoseTrends';
import HealthMetricsForm from '@components/HealthMetricsForm';
import LipidProfileTrends from '@components/LipidProfileTrends';
import { getBloodPressureReadings, getGlucoseReadings, getLipidProfiles } from '../../../../services/healthMetricsService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';

const formatReadingsForChart = (readings) => {
  return readings.map(reading => ({
    date: format(reading.timestamp, 'd MMM', { locale: es }),
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    heartRate: reading.heartRate || null
  })).reverse(); // Show older readings first
};

const formatGlucoseReadingsForChart = (readings) => {
  return readings.map(reading => ({
    date: format(reading.timestamp, 'd MMM', { locale: es }),
    value: reading.value,
    state: reading.measuredState || 'normal'
  })).reverse();
};

const formatLipidProfileForChart = (readings) => {
  return readings.map(reading => ({
    date: format(reading.timestamp, 'd MMM', { locale: es }),
    total: reading.total,
    hdl: reading.hdl,
    ldl: reading.ldl,
    triglycerides: reading.triglycerides || null
  })).reverse();
};

export default function HealthMetricsPage({ params }) {
  const patientId = params.id;

  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [glucoseData, setGlucoseData] = useState([]);
  const [lipidProfileData, setLipidProfileData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMetricsForm, setShowMetricsForm] = useState(false);
  const [activeTab, setActiveTab] = useState('bloodPressure');

  useEffect(() => {
    const fetchMetricsData = async () => {
      if (!patientId) return;

      setLoading(true);
      try {
        // Get blood pressure readings
        const bpReadings = await getBloodPressureReadings(patientId, { limit: 20 });
        if (bpReadings.length > 0) {
          setBloodPressureData(formatReadingsForChart(bpReadings));
        }

        // Get glucose readings
        const glucoseReadings = await getGlucoseReadings(patientId, { limit: 20 });
        if (glucoseReadings.length > 0) {
          setGlucoseData(formatGlucoseReadingsForChart(glucoseReadings));
        }

        // Get lipid profile readings
        const lipidProfiles = await getLipidProfiles(patientId, { limit: 10 });
        if (lipidProfiles.length > 0) {
          setLipidProfileData(formatLipidProfileForChart(lipidProfiles));
        }
      } catch (err) {
        console.error('Error fetching health metrics:', err);
        setError('Error al cargar datos de salud. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetricsData();
  }, [patientId]);

  const handleMetricsSuccess = (metricType) => {
    // Refresh data based on the type of metric that was added
    const fetchUpdatedData = async () => {
      try {
        if (metricType === 'bloodPressure') {
          const bpReadings = await getBloodPressureReadings(patientId, { limit: 20 });
          if (bpReadings.length > 0) {
            setBloodPressureData(formatReadingsForChart(bpReadings));
          }
        } else if (metricType === 'glucose') {
          const glucoseReadings = await getGlucoseReadings(patientId, { limit: 20 });
          if (glucoseReadings.length > 0) {
            setGlucoseData(formatGlucoseReadingsForChart(glucoseReadings));
          }
        } else if (metricType === 'lipidProfile') {
          const lipidProfiles = await getLipidProfiles(patientId, { limit: 10 });
          if (lipidProfiles.length > 0) {
            setLipidProfileData(formatLipidProfileForChart(lipidProfiles));
          }
        }
      } catch (err) {
        console.error('Error refreshing health metrics:', err);
      }
    };

    fetchUpdatedData();
    setShowMetricsForm(false);
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Cargando datos de métricas de salud...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'bloodPressure':
        return bloodPressureData.length > 0 ? (
          <div className="mt-6">
            <BloodPressureTrends data={bloodPressureData} />
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-medium">Historial de Presión Arterial</h3>
              <div className="overflow-hidden bg-white rounded-md shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sistólica</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Diastólica</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Pulso</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bloodPressureData.map((reading, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{reading.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{reading.systolic} mmHg</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{reading.diastolic} mmHg</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{reading.heartRate ? `${reading.heartRate} lpm` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">No hay datos de presión arterial disponibles.</p>
            <button
              onClick={() => setShowMetricsForm(true)}
              className="px-4 py-2 mt-4 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Registrar Primera Lectura
            </button>
          </div>
        );

      case 'glucose':
        return glucoseData.length > 0 ? (
          <div className="mt-6">
            <GlucoseTrends data={glucoseData} />
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-medium">Historial de Glucemia</h3>
              <div className="overflow-hidden bg-white rounded-md shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Valor</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {glucoseData.map((reading, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{reading.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{reading.value} mg/dL</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {reading.state === 'fasting' ? 'En ayunas' :
                            reading.state === 'postMeal' ? 'Después de comer' :
                              reading.state === 'beforeMeal' ? 'Antes de comer' :
                                reading.state === 'bedtime' ? 'Antes de dormir' : 'Normal'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">No hay datos de glucemia disponibles.</p>
            <button
              onClick={() => setShowMetricsForm(true)}
              className="px-4 py-2 mt-4 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Registrar Primera Lectura
            </button>
          </div>
        );

      case 'lipidProfile':
        return lipidProfileData.length > 0 ? (
          <div className="mt-6">
            <LipidProfileTrends data={lipidProfileData} />
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-medium">Historial de Perfil Lipídico</h3>
              <div className="overflow-hidden bg-white rounded-md shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">HDL</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">LDL</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Triglicéridos</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lipidProfileData.map((profile, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{profile.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{profile.total} mg/dL</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{profile.hdl} mg/dL</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{profile.ldl} mg/dL</td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{profile.triglycerides ? `${profile.triglycerides} mg/dL` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">No hay datos de perfil lipídico disponibles.</p>
            <button
              onClick={() => setShowMetricsForm(true)}
              className="px-4 py-2 mt-4 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Registrar Primera Lectura
            </button>
          </div>
        );
    }
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Métricas de Salud</h1>
        <button
          onClick={() => setShowMetricsForm(true)}
          className="flex items-center px-4 py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Agregar Nueva Lectura
        </button>
      </header>

      <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'bloodPressure' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('bloodPressure')}
          >
            Presión Arterial
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'glucose' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('glucose')}
          >
            Glucemia
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'lipidProfile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('lipidProfile')}
          >
            Perfil Lipídico
          </button>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {showMetricsForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <HealthMetricsForm
            patientId={patientId}
            onSuccess={handleMetricsSuccess}
            onClose={() => setShowMetricsForm(false)}
          />
        </div>
      )}
    </div>
  );
}
