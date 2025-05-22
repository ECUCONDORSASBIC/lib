'use client';

import { BellAlertIcon, DocumentArrowDownIcon, ExclamationCircleIcon, InformationCircleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

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

const MyPrescriptionsSection = ({ patientId, prescriptionsData }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [familyContact, setFamilyContact] = useState('');
  const [showContactInput, setShowContactInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingContact, setSavingContact] = useState(false);

  // Cargar recetas y configuración de contacto desde Firebase
  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const loadPrescriptionsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Importamos dinámicamente para evitar problemas con SSR
        const { db } = await import('@/lib/firebase/firebaseClient');
        const { collection, query, orderBy, limit, getDocs, doc, getDoc } = await import('firebase/firestore');
        
        // Consulta para obtener recetas recientes
        const prescriptionsRef = collection(db, 'patients', patientId, 'prescriptions');
        const prescriptionsQuery = query(prescriptionsRef, orderBy('date', 'desc'), limit(5));
        const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
        
        const prescriptionsData = [];
        prescriptionsSnapshot.forEach(doc => {
          const data = doc.data();
          prescriptionsData.push({
            id: doc.id,
            medication: data.medication || 'Medicamento sin nombre',
            date: data.date?.toDate() || new Date(),
            dosage: data.dosage || 'Dosis no especificada',
            frequency: data.frequency || 'Frecuencia no especificada',
            duration: data.duration || 'Duración no especificada',
            downloadUrl: data.fileUrl || null,
            alertsEnabled: data.alertsEnabled || false,
            doctor: data.doctorName || 'Médico tratante'
          });
        });
        
        setPrescriptions(prescriptionsData);
        
        // Cargar contacto familiar
        const settingsRef = doc(db, 'patients', patientId, 'settings', 'notifications');
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const settingsData = settingsDoc.data();
          setFamilyContact(settingsData.familyContact || '');
        }
      } catch (error) {
        console.error('Error al cargar datos de prescripciones:', error);
        setError(`Error al cargar datos: ${error.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptionsData();
  }, [patientId]);

  // Manejar descarga de recetas
  const handleDownloadPrescription = async (url, medicationName) => {
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
      console.error('Error al descargar la receta:', error);
      alert(`Error al descargar: ${error.message || 'Error desconocido'}`);
    }
  };

  // Actualizar configuración de alertas
  const toggleAlerts = async (prescriptionId) => {
    if (!patientId || !prescriptionId) return;
    
    try {
      // Encontrar la prescripción actual
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) return;
      
      // Importamos dinámicamente para evitar problemas con SSR
      const { db } = await import('@/lib/firebase/firebaseClient');
      const { doc, updateDoc } = await import('firebase/firestore');
      
      const prescriptionRef = doc(db, 'patients', patientId, 'prescriptions', prescriptionId);
      await updateDoc(prescriptionRef, {
        alertsEnabled: !prescription.alertsEnabled
      });
      
      // Actualizar estado local para UI inmediata
      setPrescriptions(prevPrescriptions => 
        prevPrescriptions.map(p => 
          p.id === prescriptionId 
            ? {...p, alertsEnabled: !p.alertsEnabled} 
            : p
        )
      );
    } catch (error) {
      console.error('Error al actualizar alertas:', error);
      alert(`Error al actualizar configuración: ${error.message || 'Error desconocido'}`);
    }
  };

  // Guardar contacto familiar
  const handleSaveFamilyContact = async () => {
    if (!patientId || !familyContact.trim()) return;
    
    try {
      setSavingContact(true);
      
      // Importamos dinámicamente para evitar problemas con SSR
      const { db } = await import('@/lib/firebase/firebaseClient');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      const settingsRef = doc(db, 'patients', patientId, 'settings', 'notifications');
      await setDoc(settingsRef, {
        familyContact: familyContact.trim(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setShowContactInput(false);
    } catch (error) {
      console.error('Error al guardar contacto familiar:', error);
      alert(`Error al guardar contacto: ${error.message || 'Error desconocido'}`);
    } finally {
      setSavingContact(false);
    }
  };

  const commonButtonClasses = "inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm";
  const activeButtonClasses = "bg-green-100 text-green-700 hover:bg-green-200";
  const inactiveButtonClasses = "bg-red-100 text-red-700 hover:bg-red-200";

  // Generar mensaje de error
  if (error) {
    return (
      <section id="mis-recetas" className="p-6 bg-gray-50 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Mis Prescripciones
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
    <section id="mis-recetas" className="p-6 bg-gray-50 rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
        Mis Prescripciones
        {patientId && (
          <a
            href={`/dashboard/paciente/${patientId}/prescripciones`}
            className="text-blue-600 hover:underline text-base font-normal ml-4"
          >
            Ver todas
          </a>
        )}
      </h2>

      {/* Estado de carga */}
      {loading ? (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-24 bg-gray-100 rounded-md"></div>
              <div className="h-24 bg-gray-100 rounded-md"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Listado Cronológico de Recetas */}
          <InfoCard title="Recetas Emitidas" icon={<InformationCircleIcon />}>
            {prescriptions.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Mis Prescripciones</h3>
                {prescriptions.map(rx => (
                  <div key={rx.id} className="p-4 bg-gray-100 rounded-md mb-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-md text-blue-700">{rx.medication}</h4>
                        <p className="text-xs text-gray-500">
                          Emitida: {rx.date instanceof Date ? rx.date.toLocaleDateString() : new Date(rx.date).toLocaleDateString()}
                          {rx.doctor && <span className="ml-2">Doctor: {rx.doctor}</span>}
                        </p>
                      </div>
                      {rx.downloadUrl && (
                        <button
                          onClick={() => handleDownloadPrescription(rx.downloadUrl, rx.medication)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <DocumentArrowDownIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                          PDF
                        </button>
                      )}
                    </div>
                    <p><strong>Indicaciones:</strong> {rx.dosage}</p>
                    <p><strong>Frecuencia:</strong> {rx.frequency}</p>
                    <p><strong>Duración:</strong> {rx.duration}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recordatorios de toma:</span>
                      <button
                        onClick={() => toggleAlerts(rx.id)}
                        className={`${commonButtonClasses} ${rx.alertsEnabled ? activeButtonClasses : inactiveButtonClasses}`}
                      >
                        <BellAlertIcon
                          className={`mr-1.5 h-4 w-4 ${rx.alertsEnabled ? 'text-green-500' : 'text-red-500'}`}
                        />
                        {rx.alertsEnabled ? 'Activados' : 'Desactivados'}
                      </button>
                    </div>
                  </div>
                ))}
                {prescriptions.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <a
                      href={`/dashboard/paciente/${patientId}/prescripciones`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver todas las prescripciones
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center bg-white rounded-lg">
                <p className="text-gray-500">No hay recetas médicas disponibles.</p>
                <p className="text-xs text-gray-400 mt-1">Sus recetas aparecerán aquí cuando su médico las prescriba.</p>
              </div>
            )}
          </InfoCard>

          {/* Indicador de Familiar Colaborador */}
          <InfoCard title="Familiar Colaborador para Alertas" icon={<UserPlusIcon />}>
            {!showContactInput && familyContact && (
              <div className="flex justify-between items-center">
                <p>Contacto actual: <strong>{familyContact}</strong></p>
                <button onClick={() => setShowContactInput(true)} className="text-sm text-blue-500 hover:underline">Cambiar</button>
              </div>
            )}
            {showContactInput || !familyContact ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-600">Indica un contacto (email o teléfono) para que también reciba alertas sobre la toma de medicamentos.</p>
                <input
                  type="text"
                  value={familyContact}
                  onChange={(e) => setFamilyContact(e.target.value)}
                  placeholder="Email o teléfono del familiar"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <div className="flex justify-end space-x-2">
                  {familyContact && showContactInput && (
                    <button 
                      onClick={() => setShowContactInput(false)} 
                      className="text-sm text-gray-600 hover:underline"
                      disabled={savingContact}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={handleSaveFamilyContact}
                    disabled={!familyContact.trim() || savingContact}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow text-sm disabled:opacity-50"
                  >
                    {savingContact ? 'Guardando...' : 'Guardar Contacto'}
                  </button>
                </div>
              </div>
            ) : null}
          </InfoCard>
        </>
      )}
    </section>
  );
};

export default MyPrescriptionsSection;
