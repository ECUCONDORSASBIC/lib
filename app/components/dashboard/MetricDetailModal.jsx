'use client';

import { Dialog, Transition } from '@headlessui/react';
import { ChartBarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

// Placeholder for a charting library if you integrate one later
// import { Line } from 'react-chartjs-2'; // Example

const MetricDetailModal = ({ isOpen, onClose, metricDetails }) => {
  if (!isOpen || !metricDetails) {
    return null;
  }

  const {
    name,
    currentValue,
    unit,
    status,
    trend,
    history = [],
    referenceRange,
    description,
  } = metricDetails;

  // Placeholder for chart data and options if using a library
  // const chartData = { ... };
  // const chartOptions = { ... };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-700 sm:mx-0 sm:h-10 sm:w-10">
                      <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-slate-100">
                        Detalles de {name}
                      </Dialog.Title>
                      <div className="mt-3 space-y-3">
                        <p className="text-sm text-gray-700 dark:text-slate-300">
                          <span className="font-medium">Valor Actual:</span> {currentValue} {unit || ''}
                          {status && <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${status === 'normal' ? 'bg-green-100 text-green-700' : status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{status}</span>}
                          {trend && <span className="ml-2 text-xs"> (Tendencia: {trend})</span>}
                        </p>

                        {referenceRange && (
                          <p className="text-sm text-gray-700 dark:text-slate-300">
                            <span className="font-medium">Rango de Referencia:</span> {referenceRange}
                          </p>
                        )}

                        {description && (
                          <div className="text-sm text-gray-700 dark:text-slate-300 p-2 bg-gray-50 dark:bg-slate-700 rounded">
                            <InformationCircleIcon className="h-5 w-5 inline mr-1 text-blue-500" />
                            {description}
                          </div>
                        )}

                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-800 dark:text-slate-200 mb-2">Historial Reciente:</h4>
                          {history && history.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto rounded border border-gray-200 dark:border-slate-700">
                              <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                                {history.map((entry, index) => (
                                  <li key={index} className="px-3 py-2 text-sm">
                                    {entry.date ? `${new Date(entry.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}: ` : ''}
                                    {/* Adjust based on history data structure */}
                                    {entry.systolic && entry.diastolic ? `${entry.systolic}/${entry.diastolic} mmHg` : entry.value ? `${entry.value} ${unit || ''}` : 'Dato no disponible'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-slate-400">No hay historial disponible.</p>
                          )}
                          {/* Placeholder for chart */}
                          {/* <div className="mt-4"> <Line data={chartData} options={chartOptions} /> </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                  {/* Optional: Button to add new reading */}
                  {/* <button
                    type="button"
                    className="ml-3 inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
                    onClick={() => alert('Funcionalidad para añadir nueva lectura pendiente.')}
                  >
                    Registrar Nueva Lectura
                  </button> */}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default MetricDetailModal;
