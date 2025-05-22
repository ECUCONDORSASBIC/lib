'use client';

import { Toast } from '@/app/components/ui/Toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { getCompanyProfile, updateCompanyProfile } from '@/app/services/companyService';
import { useEffect, useState } from 'react';

export default function CompanySettingsPage() {
  const { user, userData, updateUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    industry: '',
    website: '',
    phone: '',
    address: '',
    logo: null,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    notificationPreferences: {
      newApplications: true,
      messages: true,
      marketingEmails: false
    }
  });

  useEffect(() => {
    if (!user?.uid) return;

    const fetchCompanyProfile = async () => {
      try {
        const profile = await getCompanyProfile(user.uid);
        if (profile) {
          setFormData({
            ...formData,
            ...profile,
            // Make sure we keep the structure
            notificationPreferences: {
              ...formData.notificationPreferences,
              ...(profile.notificationPreferences || {})
            }
          });
        }
      } catch (error) {
        console.error("Error fetching company profile:", error);
        setToast({ show: true, message: "Error al cargar el perfil", type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('notification_')) {
      const prefName = name.replace('notification_', '');
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [prefName]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateCompanyProfile(user.uid, formData);
      // Update local Auth context if needed
      if (updateUserData) {
        updateUserData({
          ...userData,
          displayName: formData.companyName
        });
      }
      setToast({ show: true, message: "Perfil actualizado con éxito", type: 'success' });
    } catch (error) {
      console.error("Error updating company profile:", error);
      setToast({ show: true, message: "Error al actualizar el perfil", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Configuración de Empresa</h1>
        <p className="text-gray-600">Administra la información de tu empresa y preferencias</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'profile'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                }`}
            >
              Perfil de Empresa
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'notifications'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                }`}
            >
              Notificaciones
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'security'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                }`}
            >
              Seguridad
            </button>
          </nav>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Información de la Empresa</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Esta información se mostrará en tu perfil público y en las ofertas laborales.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Nombre de la Empresa
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="companyName"
                        id="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Breve descripción de tu empresa.</p>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                      Industria/Sector
                    </label>
                    <div className="mt-1">
                      <select
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Seleccionar sector</option>
                        <option value="hospital">Hospital</option>
                        <option value="clinic">Clínica</option>
                        <option value="medical_center">Centro Médico</option>
                        <option value="laboratory">Laboratorio</option>
                        <option value="pharmaceutical">Farmacéutica</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Sitio Web
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        name="website"
                        id="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Dirección
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="address"
                        name="address"
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Logo de la Empresa</label>
                    <div className="mt-1 flex items-center">
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                        {formData.logo ? (
                          <img
                            src={typeof formData.logo === 'string' ? formData.logo : URL.createObjectURL(formData.logo)}
                            alt="Company logo"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            Sin logo
                          </div>
                        )}
                      </div>
                      <div className="ml-5">
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Cambiar
                        </label>
                        <input
                          id="logo-upload"
                          name="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mt-10">Información de Contacto</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Información de la persona de contacto para comunicaciones.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                      Nombre de Contacto
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="contactName"
                        id="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                      Email de Contacto
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="contactEmail"
                        id="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                      Teléfono de Contacto
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="contactPhone"
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Preferencias de Notificaciones</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configura qué tipos de notificaciones deseas recibir.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notification_newApplications"
                        name="notification_newApplications"
                        type="checkbox"
                        checked={formData.notificationPreferences.newApplications}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notification_newApplications" className="font-medium text-gray-700">
                        Nuevas Postulaciones
                      </label>
                      <p className="text-gray-500">Recibir notificaciones cuando alguien se postule a tus ofertas.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notification_messages"
                        name="notification_messages"
                        type="checkbox"
                        checked={formData.notificationPreferences.messages}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notification_messages" className="font-medium text-gray-700">
                        Mensajes
                      </label>
                      <p className="text-gray-500">Recibir notificaciones de nuevos mensajes.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notification_marketingEmails"
                        name="notification_marketingEmails"
                        type="checkbox"
                        checked={formData.notificationPreferences.marketingEmails}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notification_marketingEmails" className="font-medium text-gray-700">
                        Correos de Marketing
                      </label>
                      <p className="text-gray-500">Recibir correos con noticias y ofertas especiales.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Seguridad de la Cuenta</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Administra las opciones de seguridad de tu cuenta.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">Cambiar Contraseña</h4>
                    <div className="mt-2 space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                          Contraseña Actual
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="currentPassword"
                            id="current-password"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                          Nueva Contraseña
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="newPassword"
                            id="new-password"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirmar Contraseña
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="confirmPassword"
                            id="confirm-password"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <button
                          type="button" // We'd handle this separately from the main form
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cambiar Contraseña
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-base font-medium text-gray-900">Sesiones Activas</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Estos son los dispositivos que actualmente tienen iniciada sesión en tu cuenta.
                    </p>
                    <div className="mt-4">
                      <div className="border rounded-md divide-y divide-gray-200">
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Este dispositivo</p>
                            <p className="text-xs text-gray-500">Windows · Chrome · Buenos Aires, Argentina</p>
                            <p className="text-xs text-gray-500">Activo ahora</p>
                          </div>
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Actual
                            </span>
                          </div>
                        </div>
                        {/* Example of another session */}
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Dispositivo desconocido</p>
                            <p className="text-xs text-gray-500">Mac · Safari · Córdoba, Argentina</p>
                            <p className="text-xs text-gray-500">Activo hace 2 días</p>
                          </div>
                          <div>
                            <button type="button" className="text-sm text-red-600 hover:text-red-500">
                              Cerrar Sesión
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-base font-medium text-red-600">Zona de Peligro</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, sé cuidadoso.
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Eliminar Cuenta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save buttons - only show for profile and notifications tabs */}
            {(activeTab === 'profile' || activeTab === 'notifications') && (
              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {/* Logic to reset form */ }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="ml-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
