'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';

export default function NotificationsConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    recipients: [''],
    enabledTypes: ['critical', 'auth', 'database', 'telemedicine'],
  });
  const [recentErrors, setRecentErrors] = useState([]);
  const router = useRouter();
  const db = getFirestore();

  // Cargar configuración actual
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        // Verificar permisos
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        if (!session?.user?.role || session.user.role !== 'admin') {
          toast.error('No tienes permisos para acceder a esta sección');
          router.push('/dashboard');
          return;
        }
        
        // Cargar configuración
        const configRef = doc(db, 'system_config', 'error_notifications');
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists()) {
          setConfig(configSnap.data());
        }
        
        // Cargar errores recientes
        const errorsQuery = query(
          collection(db, 'system_errors'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        
        const errorsSnap = await getDocs(errorsQuery);
        const errorsList = errorsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate ? 
                    doc.data().timestamp.toDate().toLocaleString('es-ES') : 
                    'Fecha desconocida'
        }));
        
        setRecentErrors(errorsList);
      } catch (err) {
        console.error('Error al cargar configuración:', err);
        toast.error('Error al cargar la configuración de notificaciones');
      } finally {
        setLoading(false);
      }
    }
    
    loadConfig();
  }, [db, router]);

  // Manejar cambio en los destinatarios
  const handleRecipientsChange = (index, value) => {
    const newRecipients = [...config.recipients];
    newRecipients[index] = value;
    setConfig({ ...config, recipients: newRecipients });
  };

  // Añadir nuevo destinatario
  const addRecipient = () => {
    setConfig({
      ...config,
      recipients: [...config.recipients, '']
    });
  };

  // Eliminar destinatario
  const removeRecipient = (index) => {
    const newRecipients = [...config.recipients];
    newRecipients.splice(index, 1);
    setConfig({ ...config, recipients: newRecipients });
  };

  // Cambiar tipos de error habilitados
  const toggleErrorType = (type) => {
    const enabledTypes = [...config.enabledTypes];
    const index = enabledTypes.indexOf(type);
    
    if (index >= 0) {
      enabledTypes.splice(index, 1);
    } else {
      enabledTypes.push(type);
    }
    
    setConfig({ ...config, enabledTypes });
  };

  // Guardar configuración
  const saveConfig = async () => {
    // Validar que los emails sean válidos
    const validEmails = config.recipients.filter(email => 
      email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
    
    if (validEmails.length === 0) {
      toast.error('Debes agregar al menos un email válido');
      return;
    }
    
    try {
      setSaving(true);
      
      // Guardar configuración en Firestore
      const configRef = doc(db, 'system_config', 'error_notifications');
      await setDoc(configRef, {
        recipients: validEmails,
        enabledTypes: config.enabledTypes,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin-dashboard'
      });
      
      toast.success('Configuración guardada correctamente');
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Configuración de Notificaciones</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuración de Alertas</h2>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Destinatarios</h3>
                <p className="text-gray-600 mb-4">Emails que recibirán notificaciones de errores críticos</p>
                
                {config.recipients.map((email, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="email"
                      className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="ejemplo@altamedica.com"
                      value={email}
                      onChange={(e) => handleRecipientsChange(index, e.target.value)}
                    />
                    {config.recipients.length > 1 && (
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={() => removeRecipient(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={addRecipient}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Añadir destinatario
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Tipos de error a notificar</h3>
                <p className="text-gray-600 mb-4">Selecciona qué tipos de errores generarán notificaciones</p>
                
                <div className="space-y-2">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="critical"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={config.enabledTypes.includes('critical')}
                        onChange={() => toggleErrorType('critical')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="critical" className="font-medium text-gray-700">Errores críticos</label>
                      <p className="text-gray-500">Errores que afectan funcionalidad principal del sistema</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="auth"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={config.enabledTypes.includes('auth')}
                        onChange={() => toggleErrorType('auth')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="auth" className="font-medium text-gray-700">Autenticación</label>
                      <p className="text-gray-500">Errores relacionados con login, tokens y permisos</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="database"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={config.enabledTypes.includes('database')}
                        onChange={() => toggleErrorType('database')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="database" className="font-medium text-gray-700">Base de datos</label>
                      <p className="text-gray-500">Errores con Firestore, transacciones o consultas</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="api"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={config.enabledTypes.includes('api')}
                        onChange={() => toggleErrorType('api')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="api" className="font-medium text-gray-700">API</label>
                      <p className="text-gray-500">Errores en endpoints de API y servicios externos</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="telemedicine"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={config.enabledTypes.includes('telemedicine')}
                        onChange={() => toggleErrorType('telemedicine')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="telemedicine" className="font-medium text-gray-700">Telemedicina</label>
                      <p className="text-gray-500">Problemas con videollamadas y chat</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={saveConfig}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : 'Guardar configuración'}
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Errores Recientes</h2>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : recentErrors.length === 0 ? (
            <div className="bg-gray-50 p-4 text-center text-gray-500 rounded-md">
              No se han registrado errores recientemente.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severidad</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentErrors.map((error) => (
                    <tr key={error.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {error.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {error.type || 'General'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${error.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                            error.severity === 'error' ? 'bg-orange-100 text-orange-800' :
                            error.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {error.severity || 'info'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {error.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {error.notificationSent 
                          ? <span className="text-green-600">Notificado</span> 
                          : error.notificationError 
                            ? <span className="text-red-600" title={error.notificationError}>Error al notificar</span>
                            : <span className="text-gray-500">Pendiente</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
