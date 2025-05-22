'use client';

import { useState } from 'react';
import { BellIcon, UserPlusIcon, ShareIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';

const FamilyNotifications = ({ patientId, notifications = [], familyContacts = [] }) => {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', relation: '' });
  const [contacts, setContacts] = useState(familyContacts);
  const [sharingModal, setSharingModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [sharingSettings, setSharingSettings] = useState({
    medications: true,
    appointments: true,
    examResults: true,
    alerts: true,
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Handler for adding a new contact
  const handleAddContact = () => {
    if (!newContact.name || (!newContact.email && !newContact.phone)) {
      return;
    }

    const updatedContacts = [...contacts, {
      id: `contact-${Date.now()}`,
      ...newContact,
      notificationSettings: {
        medications: true,
        appointments: true,
        examResults: true,
        alerts: true
      }
    }];

    setContacts(updatedContacts);
    setNewContact({ name: '', email: '', phone: '', relation: '' });
    setIsAddingContact(false);

    // In a real app, save this to your database
    // saveContactToDatabase(patientId, newContact);
  };

  // Handler for removing a contact
  const handleRemoveContact = (contactId) => {
    setContacts(contacts.filter(contact => contact.id !== contactId));
    // In a real app, remove from database
    // deleteContactFromDatabase(patientId, contactId);
  };

  // Handler for sharing a notification
  const handleShareNotification = (notification) => {
    setSelectedNotification(notification);
    setSharingModal(true);
  };

  // Handler for confirming notification sharing
  const handleConfirmSharing = (contactIds) => {
    setSuccessMessage('Notificación compartida correctamente con los contactos seleccionados.');
    setSharingModal(false);

    // Show success message then clear it after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    // In a real app, send the notifications
    // sendNotificationToContacts(selectedNotification, contactIds);
  };

  // Handler for updating notification settings
  const handleUpdateSettings = (contactId, settingKey, value) => {
    setContacts(contacts.map(contact =>
      contact.id === contactId
        ? {
          ...contact,
          notificationSettings: {
            ...contact.notificationSettings,
            [settingKey]: value
          }
        }
        : contact
    ));

    // In a real app, save this to your database
    // updateContactSettings(patientId, contactId, settingKey, value);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'medication':
        return <div className="p-1.5 bg-blue-100 rounded-full"><BellIcon className="h-4 w-4 text-blue-600" /></div>;
      case 'appointment':
        return <div className="p-1.5 bg-purple-100 rounded-full"><BellIcon className="h-4 w-4 text-purple-600" /></div>;
      case 'alert':
        return <div className="p-1.5 bg-red-100 rounded-full"><BellAlertIcon className="h-4 w-4 text-red-600" /></div>;
      case 'examResult':
        return <div className="p-1.5 bg-green-100 rounded-full"><BellIcon className="h-4 w-4 text-green-600" /></div>;
      default:
        return <div className="p-1.5 bg-gray-100 rounded-full"><BellIcon className="h-4 w-4 text-gray-600" /></div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <BellIcon className="h-5 w-5 mr-2" />
          Notificaciones Familiares
        </h3>
        <button
          onClick={() => setIsAddingContact(!isAddingContact)}
          className="text-white hover:bg-purple-700 rounded-full p-1.5"
          title="Agregar contacto familiar"
        >
          <UserPlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-500" />
            <p className="ml-3 text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Add contact form */}
      {isAddingContact && (
        <div className="p-4 bg-purple-50 border-b">
          <h4 className="font-medium text-purple-800 mb-2">Agregar Contacto Familiar</h4>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full px-3 py-2 border rounded-md"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Email"
                className="px-3 py-2 border rounded-md"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Teléfono"
                className="px-3 py-2 border rounded-md"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
            </div>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={newContact.relation}
              onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
            >
              <option value="">Relación familiar</option>
              <option value="spouse">Esposo/a</option>
              <option value="child">Hijo/a</option>
              <option value="parent">Padre/Madre</option>
              <option value="sibling">Hermano/a</option>
              <option value="other">Otro</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingContact(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddContact}
                className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Guardar Contacto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Family contacts list */}
      <div className="p-4 border-b">
        <h4 className="font-medium text-gray-800 mb-2">Contactos Familiares</h4>
        {contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-gray-500">
                    {contact.relation && `${contact.relation} • `}
                    {contact.phone || contact.email}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const updatedSettings = { ...contact.notificationSettings };
                      setSharingSettings(updatedSettings);
                      // In a more complex UI, you might show a modal to edit settings
                    }}
                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-full"
                    title="Configurar notificaciones"
                  >
                    <BellIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="text-red-600 hover:bg-red-50 p-1.5 rounded-full"
                    title="Eliminar contacto"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No hay contactos familiares registrados</p>
            <button
              onClick={() => setIsAddingContact(true)}
              className="mt-2 text-sm text-purple-600 hover:text-purple-800"
            >
              Agregar un contacto
            </button>
          </div>
        )}
      </div>

      {/* Recent notifications with share option */}
      <div>
        <h4 className="font-medium text-gray-800 p-4 pb-2">Notificaciones Recientes</h4>
        <div className="divide-y max-h-64 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div key={notification.id} className="p-3 hover:bg-gray-50 transition flex justify-between">
                <div className="flex items-start">
                  <div className="mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <h5 className="font-medium text-sm">{notification.title}</h5>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{notification.time}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleShareNotification(notification)}
                  className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-full"
                  title="Compartir con familiar"
                >
                  <ShareIcon className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No hay notificaciones recientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Configure automatic notifications */}
      <div className="p-4 bg-gray-50 border-t">
        <h4 className="font-medium text-gray-800 mb-3">Notificaciones Automáticas</h4>
        <div className="space-y-2">
          {Object.entries(sharingSettings).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {key === 'medications' && 'Recordatorio de medicamentos'}
                {key === 'appointments' && 'Próximas citas médicas'}
                {key === 'examResults' && 'Resultados de exámenes'}
                {key === 'alerts' && 'Alertas de salud'}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={() => setSharingSettings({
                  ...sharingSettings,
                  [key]: !value
                })}
                className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
            </label>
          ))}
        </div>
        <div className="mt-3 text-right">
          <button className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Guardar Configuración
          </button>
        </div>
      </div>

      {/* Sharing modal */}
      {sharingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ShareIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Compartir Notificación
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Selecciona los contactos familiares con los que quieres compartir esta notificación:
                      </p>
                      <div className="mt-3">
                        <strong className="block text-sm">{selectedNotification?.title}</strong>
                        <p className="text-xs text-gray-600">{selectedNotification?.message}</p>
                      </div>
                      <div className="mt-4 space-y-2">
                        {contacts.length > 0 ? (
                          contacts.map(contact => (
                            <label key={contact.id} className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{contact.name}</span>
                              <span className="ml-1 text-xs text-gray-500">({contact.relation})</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No hay contactos agregados</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleConfirmSharing([])}
                >
                  Compartir
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSharingModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyNotifications;
