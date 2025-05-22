import {
  BellAlertIcon,
  BellIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const AlertTypeIcon = ({ type }) => {
  switch (type) {
    case 'medication':
      return <BellIcon className="w-5 h-5 text-red-500" />;
    case 'appointment':
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    case 'emergency':
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
    default:
      return <BellIcon className="w-5 h-5 text-blue-500" />;
  }
};

const AlertTypeColor = ({ type }) => {
  switch (type) {
    case 'medication':
      return 'bg-red-50';
    case 'appointment':
      return 'bg-yellow-50';
    case 'emergency':
      return 'bg-red-100';
    default:
      return 'bg-blue-50';
  }
};

const FamilyAlerts = ({ alerts = [], onAcknowledge }) => {
  const [filter, setFilter] = useState('all');

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(alert => alert.type === filter);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Alertas Conjuntas</h2>
        {alerts.length > 0 && (
          <div className="flex items-center px-2 py-1 text-xs text-red-700 rounded-full bg-red-50">
            <BellAlertIcon className="w-4 h-4 mr-1" />
            {alerts.filter(a => !a.acknowledged).length} sin revisar
          </div>
        )}
      </div>

      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-3 py-1 rounded-full ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('medication')}
          className={`text-xs px-3 py-1 rounded-full ${filter === 'medication' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Medicación
        </button>
        <button
          onClick={() => setFilter('appointment')}
          className={`text-xs px-3 py-1 rounded-full ${filter === 'appointment' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Citas
        </button>
      </div>

      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert, index) => (
            <div key={index} className={`flex items-start space-x-3 p-3 ${AlertTypeColor({ type: alert.type })} rounded-md relative`}>
              <AlertTypeIcon type={alert.type} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
                <p className="mt-1 text-xs text-gray-600">{alert.description}</p>
                {alert.actionRequired && (
                  <div className="mt-2">
                    <button
                      onClick={() => onAcknowledge && onAcknowledge(alert.id)}
                      className="px-2 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50"
                    >
                      Marcar como revisado
                    </button>
                  </div>
                )}
                {alert.notifiedTo && (
                  <p className="mt-2 text-xs text-gray-500">
                    Notificado a: {alert.notifiedTo.join(', ')}
                  </p>
                )}
              </div>
              {alert.urgent && (
                <div className="absolute top-2 right-2">
                  <span className="flex w-2 h-2">
                    <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                    <span className="relative inline-flex w-2 h-2 bg-red-500 rounded-full"></span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No hay alertas {filter !== 'all' ? `de ${filter}` : ''}</p>
        </div>
      )}

      <div className="pt-3 mt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Configuración de alertas</h3>
          <button className="text-xs text-blue-600 hover:underline">
            Editar preferencias
          </button>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1 text-sm text-gray-600">
            <span>Medicación</span>
            <span className="text-xs text-green-500">Activado</span>
          </div>
          <div className="flex items-center justify-between mb-1 text-sm text-gray-600">
            <span>Citas médicas</span>
            <span className="text-xs text-green-500">Activado</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Signos vitales</span>
            <span className="text-xs text-red-500">Desactivado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyAlerts;
