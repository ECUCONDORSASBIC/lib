import { BellAlertIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const FamilyPanel = ({ patient, authorizedFamily = [] }) => {
  const [activeTab, setActiveTab] = useState('health');

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Panel Familiar Compartido</h2>
        <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
          <UserGroupIcon className="h-4 w-4 mr-1" />
          {authorizedFamily.length} familiar{authorizedFamily.length !== 1 ? 'es' : ''} autorizado{authorizedFamily.length !== 1 ? 's' : ''}
        </div>
      </div>

      {authorizedFamily.length > 0 ? (
        <>
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab('health')}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'health' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              Estado de Salud
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'schedule' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              Agenda
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'alerts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              Alertas
            </button>
          </div>

          {activeTab === 'health' && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Información de salud compartida con familiares:</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Medicación diaria
                </li>
                <li className="flex items-center text-sm">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Presión arterial
                </li>
                <li className="flex items-center text-sm">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Estudios pendientes
                </li>
              </ul>
              <div className="mt-4">
                <button className="text-xs text-blue-600 hover:underline">Administrar información compartida</button>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Próximas citas compartidas:</p>
              <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-md">
                <ClockIcon className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">Control mensual</p>
                  <p className="text-xs text-gray-500">22 de Mayo, 14:30</p>
                  <p className="text-xs text-gray-500">Dr. Martínez</p>
                </div>
              </div>
              <div className="mt-2">
                <button className="text-xs text-blue-600 hover:underline">Ver todas las citas compartidas</button>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Alertas recientes:</p>
                <span className="text-xs bg-red-50 text-red-600 py-1 px-2 rounded-full">3 nuevas</span>
              </div>
              <div className="flex items-start space-x-3 p-2 bg-red-50 rounded-md">
                <BellAlertIcon className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">Medicación omitida</p>
                  <p className="text-xs text-gray-500">Enalapril - Hoy, 8:00</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-2 bg-yellow-50 rounded-md">
                <BellAlertIcon className="h-5 w-5 text-yellow-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">Cita reprogramada</p>
                  <p className="text-xs text-gray-500">Control - Ayer</p>
                </div>
              </div>
              <div className="mt-2">
                <button className="text-xs text-blue-600 hover:underline">Ver todas las alertas</button>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100">
            <h3 className="text-sm font-medium mb-2">Familiares autorizados:</h3>
            <div className="space-y-2">
              {authorizedFamily.map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 mr-2">
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-sm">{member.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{member.relation}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No hay familiares autorizados</p>
          <button className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100">
            Autorizar familiar
          </button>
        </div>
      )}
    </div>
  );
};

export default FamilyPanel;
