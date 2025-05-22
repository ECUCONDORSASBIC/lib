'use client';

import { ClockIcon, DocumentArrowDownIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const InfoCard = ({ title, children, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center text-blue-600 mb-3">
      {icon && <span className="mr-2 h-6 w-6">{icon}</span>}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="text-gray-700 space-y-2 text-sm">
      {children}
    </div>
  </div>
);

const ResultsAndDiagnosticsSection = ({ patientId, resultsData }) => {
  const [recentResults, setRecentResults] = useState([]);
  const [diagnosisHistory, setDiagnosisHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar resultados y diagnósticos desde Firebase
  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const loadPatientMedicalData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Importamos dinámicamente para evitar problemas con SSR
        const { db } = await import('@/lib/firebase/firebaseClient');
        const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
        
        // Consulta para obtener resultados recientes
        const resultsRef = collection(db, 'patients', patientId, 'medicalReports');
        const resultsQuery = query(resultsRef, orderBy('date', 'desc'), limit(5));
        const resultsSnapshot = await getDocs(resultsQuery);
        
        const resultsData = [];
        resultsSnapshot.forEach(doc => {
          const data = doc.data();
          resultsData.push({
            id: doc.id,
            reportName: data.reportName || 'Informe médico',
            date: data.date?.toDate() || new Date(),
            summary: data.summary || 'No hay resumen disponible',
            downloadUrl: data.fileUrl || null,
            status: data.status || 'completed'
          });
        });
        
        setRecentResults(resultsData);
        
        // Consulta para obtener historial de diagnósticos
        const diagnosisRef = collection(db, 'patients', patientId, 'diagnoses');
        const diagnosisQuery = query(diagnosisRef, orderBy('date', 'desc'), limit(10));
        const diagnosisSnapshot = await getDocs(diagnosisQuery);
        
        const diagnosisData = [];
        diagnosisSnapshot.forEach(doc => {
          const data = doc.data();
          diagnosisData.push({
            id: doc.id,
            diagnosis: data.diagnosisName || 'Diagnóstico sin especificar',
            date: data.date?.toDate() || new Date(),
            doctorId: data.doctorId || null,
            doctorName: data.doctorName || 'Médico tratante'
          });
        });
        
        setDiagnosisHistory(diagnosisData);
      } catch (error) {
        console.error('Error al cargar datos médicos:', error);
        setError(`Error al cargar datos: ${error.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    loadPatientMedicalData();
  }, [patientId]);

  const handleDownloadReport = async (url, reportName) => {
    if (!url) {
      alert('No hay documento disponible para descargar');
      return;
    }
    
    try {
      // Importar dinámicamente para evitar problemas con SSR
      const { storage } = await import('@/lib/firebase/firebaseClient');
      const { ref, getDownloadURL } = await import('firebase/storage');

      // Si es una ruta de almacenamiento, obtener la URL descargable
      if (url.startsWith('gs://') || url.startsWith('/')) {
        const storageRef = ref(storage, url);
        url = await getDownloadURL(storageRef);
      }

      // Abrir la URL en una nueva pestaña o iniciar la descarga
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al descargar el informe:', error);
      alert(`Error al descargar: ${error.message || 'Error desconocido'}`);
    }
  };

  // Generar mensaje de error
  if (error) {
    return (
      <section id="resultados-diagnosticos" className="p-6 bg-gray-50 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Resultados y Diagnósticos
        </h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center mb-2">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Error al cargar los datos</h3>
          </div>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="resultados-diagnosticos" className="p-6 bg-gray-50 rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
        Resultados y Diagnósticos
        {patientId && (
          <a
            href={`/dashboard/paciente/${patientId}/resultados`}
            className="text-blue-600 hover:underline text-base font-normal ml-4"
          >
            Ver todos
          </a>
        )}
      </h2>

      {/* Estado de carga */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-100 rounded-md"></div>
              <div className="h-20 bg-gray-100 rounded-md"></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 rounded-md"></div>
              <div className="h-10 bg-gray-100 rounded-md"></div>
              <div className="h-10 bg-gray-100 rounded-md"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resultados Recientes */}
          <InfoCard title="Resultados Recientes" icon={<DocumentTextIcon />}>
            {recentResults.length > 0 ? (
              recentResults.map(result => (
                <div key={result.id} className="p-3 bg-gray-100 rounded-md mb-3">
                  <h4 className="font-semibold text-gray-800">{result.reportName}</h4>
                  <p className="text-xs text-gray-500 mb-1">
                    Fecha: {result.date instanceof Date ? result.date.toLocaleDateString() : new Date(result.date).toLocaleDateString()}
                  </p>
                  <p className="mb-2">{result.summary}</p>
                  {result.downloadUrl ? (
                    <button
                      onClick={() => handleDownloadReport(result.downloadUrl, result.reportName)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <DocumentArrowDownIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      Descargar Informe
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 italic">Documento no disponible para descarga</span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500">No hay resultados recientes disponibles.</p>
                <p className="text-xs text-gray-400 mt-1">Los resultados aparecerán aquí cuando estén disponibles.</p>
              </div>
            )}
          </InfoCard>

          {/* Historial de Diagnósticos */}
          <InfoCard title="Historial de Diagnósticos" icon={<ClockIcon />}>
            {diagnosisHistory.length > 0 ? (
              <ul className="space-y-2">
                {diagnosisHistory.map(diag => (
                  <li key={diag.id} className="p-3 bg-gray-100 rounded-md">
                    <p className="font-medium text-gray-800">{diag.diagnosis}</p>
                    <p className="text-xs text-gray-500">
                      Fecha: {diag.date instanceof Date ? diag.date.toLocaleDateString() : new Date(diag.date).toLocaleDateString()}
                      {diag.doctorName && <span className="ml-2">Médico: {diag.doctorName}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500">No hay historial de diagnósticos.</p>
                <p className="text-xs text-gray-400 mt-1">Su historial médico aparecerá aquí cuando esté disponible.</p>
              </div>
            )}
          </InfoCard>
        </div>
      )}
    </section>
  );
};

export default ResultsAndDiagnosticsSection;
