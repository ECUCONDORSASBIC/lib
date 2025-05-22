'use client';

import { db } from '@/lib/firebase/firebaseClient'; // Asegúrate que la ruta a tu config de Firebase sea correcta
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

/**
 * Componente para mostrar la lista de alertas del médico
 */
const PhysicianAlertList = ({ alerts = [], limit = null }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAlerts, setFetchedAlerts] = useState([]);

  useEffect(() => {
    setLoading(true);
    const alertsRef = collection(db, 'physicianAlerts');
    const q = query(alertsRef, orderBy('createdAt', 'desc')); // Ordenar por más recientes primero

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAlerts = [];
      querySnapshot.forEach((doc) => {
        fetchedAlerts.push({ id: doc.id, ...doc.data() });
      });
      setFetchedAlerts(fetchedAlerts);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching physician alerts:", err);
      setError('Error al cargar las alertas para médicos.');
      setLoading(false);
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar el componente
  }, []);

  const markAlertAsRead = async (alertId) => {
    try {
      const alertRef = doc(db, 'physicianAlerts', alertId);
      await updateDoc(alertRef, {
        status: 'read',
        updatedAt: new Date().toISOString(), // O serverTimestamp()
      });
      console.log(`Alerta ${alertId} marcada como leída`);
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
    }
  };

  const getAlertSeverityClass = (riskLevel = 3) => {
    switch (riskLevel) {
      case 5: return 'bg-red-50 border-l-4 border-red-500';
      case 4: return 'bg-orange-50 border-l-4 border-orange-500';
      case 3: return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 2: return 'bg-blue-50 border-l-4 border-blue-500';
      case 1: return 'bg-green-50 border-l-4 border-green-500';
      default: return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
        <p className="ml-3 text-gray-600">Cargando alertas...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-700 bg-red-100 rounded-md">{error}</div>;
  }

  const displayAlerts = limit ? fetchedAlerts.slice(0, limit) : fetchedAlerts;

  if (!displayAlerts.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No hay alertas activas
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {displayAlerts.map((alert) => (
        <li key={alert.id} className="py-3">
          <div className={`p-3 rounded-md ${getAlertSeverityClass(alert.riskLevel)}`}>
            <div className="flex justify-between">
              <div className="flex-grow">
                <p className="text-sm font-medium">
                  Paciente: {alert.patientName || alert.patientId}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {alert.message}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <span className="text-xs text-gray-500">
                  {alert.timestamp
                    ? formatDistanceToNow(new Date(alert.timestamp), { locale: es, addSuffix: true })
                    : 'Fecha desconocida'
                  }
                </span>
              </div>
            </div>

            <div className="mt-2 flex justify-end space-x-2">
              <button
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                onClick={() => window.location.href = `/dashboard/medico/pacientes/${alert.patientId}`}
              >
                Ver paciente
              </button>
              <button
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => markAlertAsRead(alert.id)}
              >
                Marcar como leída
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PhysicianAlertList;
