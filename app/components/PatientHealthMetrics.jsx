'use client';

import { exportBloodPressureReadings, exportGlucoseReadings, exportLipidProfiles } from '@/app/utils/exportHealthData';
import BloodPressureTrends from '@/app/components/BloodPressureTrends';
import DateRangeSelector from '@/app/components/DateRangeSelector';
import GlucoseTrends from '@/app/components/GlucoseTrends';
import LipidProfileTrends from '@/app/components/LipidProfileTrends';
import { getBloodPressureReadings, getGlucoseReadings, getLipidProfiles } from '@/app/services/healthMetricsService';
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

const PatientHealthMetrics = ({ patientId }) => {
  const [activeTab, setActiveTab] = useState('bloodPressure');
  const [bloodPressureData, setBloodPressureData] = useState([]);
  const [glucoseData, setGlucoseData] = useState([]);
  const [lipidProfileData, setLipidProfileData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  useEffect(() => {
    const fetchHealthMetrics = async () => {
      if (!patientId) return;

      setLoading(true);
      try {
        // Prepare query options with date range (if provided)
        const queryOptions = {
          limit: dateRange.startDate && dateRange.endDate ? 1000 : 10, // If filtering by date, get more results
          ...(dateRange.startDate && { startDate: dateRange.startDate }),
          ...(dateRange.endDate && { endDate: dateRange.endDate })
        };

        // Fetch blood pressure readings
        const bpReadings = await getBloodPressureReadings(patientId, queryOptions);
        if (bpReadings.length > 0) {
          setBloodPressureData(formatReadingsForChart(bpReadings));
        } else {
          setBloodPressureData([]);
        }

        // Fetch glucose readings
        const glucoseReadings = await getGlucoseReadings(patientId, queryOptions);
        if (glucoseReadings.length > 0) {
          setGlucoseData(formatGlucoseReadingsForChart(glucoseReadings));
        } else {
          setGlucoseData([]);
        }

        // Fetch lipid profile readings
        const lipidProfiles = await getLipidProfiles(patientId, queryOptions);
        if (lipidProfiles.length > 0) {
          setLipidProfileData(formatLipidProfileForChart(lipidProfiles));
        } else {
          setLipidProfileData([]);
        }
      } catch (err) {
        console.error('Error fetching patient health metrics:', err);
        setError('Error al cargar métricas de salud del paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthMetrics();
  }, [patientId, dateRange.startDate, dateRange.endDate]);
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Cargando datos...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      );
    }

    // Date range info display
    const dateRangeInfo = () => {
      if (dateRange.startDate && dateRange.endDate) {
        return (
          <div className="mb-4 text-sm text-gray-500">
            Mostrando datos desde {format(dateRange.startDate, 'PP', { locale: es })} hasta {format(dateRange.endDate, 'PP', { locale: es })}
          </div>
        );
      }
      return null;
    }; switch (activeTab) {
      case 'bloodPressure':
        return bloodPressureData.length > 0 ? (
          <div className="space-y-4">
            {dateRangeInfo()}
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-800">Historial de Presión Arterial</h4>
              <button
                onClick={() => exportBloodPressureReadings(bloodPressureData)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar CSV
              </button>
            </div>
            <BloodPressureTrends data={bloodPressureData} />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sistólica</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diastólica</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pulso</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bloodPressureData.map((reading, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reading.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.systolic} mmHg</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.diastolic} mmHg</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reading.heartRate ? `${reading.heartRate} lpm` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos de presión arterial registrados para este paciente.</p>
        );

      case 'glucose':
        return glucoseData.length > 0 ? (
          <div className="space-y-4">
            {dateRangeInfo()}
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-800">Historial de Glucemia</h4>
              <button
                onClick={() => exportGlucoseReadings(glucoseData)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar CSV
              </button>
            </div>
            <GlucoseTrends data={glucoseData} />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {glucoseData.map((reading, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reading.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.value} mg/dL</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos de glucemia registrados para este paciente.</p>
        );

      case 'lipidProfile':
        return lipidProfileData.length > 0 ? (
          <div className="space-y-4">
            {dateRangeInfo()}
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-800">Historial de Perfil Lipídico</h4>
              <button
                onClick={() => exportLipidProfiles(lipidProfileData)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar CSV
              </button>
            </div>
            <LipidProfileTrends data={lipidProfileData} />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colesterol Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HDL</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LDL</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triglicéridos</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lipidProfileData.map((profile, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{profile.total} mg/dL</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{profile.hdl} mg/dL</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{profile.ldl} mg/dL</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profile.triglycerides ? `${profile.triglycerides} mg/dL` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos de perfil lipídico registrados para este paciente.</p>
        );

      default:
        return null;
    }
  };
  return (
    <div className="space-y-4">
      {/* Date Range Selector */}
      <DateRangeSelector onDateRangeChange={handleDateRangeChange} />

      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-4 py-4 text-center text-sm font-medium ${activeTab === 'bloodPressure'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('bloodPressure')}
            >
              Presión Arterial
            </button>
            <button
              className={`px-4 py-4 text-center text-sm font-medium ${activeTab === 'glucose'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('glucose')}
            >
              Glucemia
            </button>
            <button
              className={`px-4 py-4 text-center text-sm font-medium ${activeTab === 'lipidProfile'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('lipidProfile')}
            >
              Perfil Lipídico
            </button>
          </div>
        </div>
        <div className="p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PatientHealthMetrics;
