import React from 'react';

const ComplementaryExams = ({ examsToRequest = [], examsReceived = [], onRequestExam }) => (
  <div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <h4 className="mb-2 font-medium text-gray-600">Solicitar Exámenes</h4>
        {examsToRequest.length === 0 ? (
          <p className="py-2 text-sm text-gray-500">No hay exámenes prioritarios para solicitar.</p>
        ) : (
          <ul className="overflow-y-auto divide-y divide-gray-200 max-h-40">
            {examsToRequest.map((exam, idx) => (
              <li key={idx} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-800">{exam.name}</span>
                <button
                  className="px-2.5 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  onClick={() => onRequestExam(exam)}
                >
                  Solicitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h4 className="mb-2 font-medium text-gray-600">Exámenes Recibidos Recientemente</h4>
        {examsReceived.length === 0 ? (
          <p className="py-2 text-sm text-gray-500">No hay resultados de exámenes recientes.</p>
        ) : (
          <ul className="overflow-y-auto divide-y divide-gray-200 max-h-40">
            {examsReceived.map((exam, idx) => (
              <li key={idx} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-800">{exam.name}</span>
                <span className="text-xs text-gray-400">{exam.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

export default ComplementaryExams;
